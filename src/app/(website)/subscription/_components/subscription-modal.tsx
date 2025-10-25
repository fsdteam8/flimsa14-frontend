"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentModal } from "@/components/StripePaymentModal";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

export default function SubscriptionModal() {
  const session = useSession();
  const token = session.data?.user?.accessToken;
  console.log(token);
  const { data, isLoading, error, isError } = useQuery<PlansResponse>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/plans`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [payWithStripe, setPayWithStripe] = useState(false);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] =
    useState("");
  const [showStripeModal, setShowStripeModal] = useState(false);
  // console.log(showStripeModal);

  // console.log(paymentIntentClientSecret);

  // Set the default plan when data is loaded
  useEffect(() => {
    if (data?.data?.length) {
      setSelectedPlanId(data.data[0]._id);
      setSelectedPlan(data.data[0]);
    }
  }, [data]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = data?.data.find((p) => p._id === planId);
    setSelectedPlan(plan || null);
  };

  // payment create api integration
  const { mutate: createPayment, isPending } = useMutation({
    mutationKey: ["create-payment"],
    mutationFn: async (data: { planId: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/subscription/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    onSuccess: (data) => {
      console.log("create payment", data);
      if (!data?.success) {
        toast.error(data?.message || "Failed to create payment intent");
        return;
      }
      toast.success(data?.message || "Payment intent created successfully");
      setPaymentIntentClientSecret(data?.data?.clientSecret || "");
      setShowStripeModal(true);
    },

    onError: (data) => {
      toast.error(data.message || "Something went wrong");
    },
  });

  // ---------- Confirm Payment ----------
  const confirmPaymentMutation = useMutation({
    mutationKey: ["confirm-payment"],
    mutationFn: async ({
      paymentIntentId,
      paymentMethodId,
    }: {
      paymentIntentId: string;
      paymentMethodId: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/subscription/confirm-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentIntentId, paymentMethodId }),
        }
      );
      if (!res.ok) throw new Error("Failed to confirm payment");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Subscription payment successful!");
        setShowStripeModal(false);
      } else {
        toast.error(data.message || "Payment confirmation failed");
      }
    },
    onError: () => {
      toast.error("Something went wrong while confirming payment");
    },
  });

  const handlePayment = () => {
    if (!selectedPlanId) return toast.error("Please select a plan first");
    createPayment({ planId: selectedPlanId });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading plans...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-400">
        Failed to load plans: {error.message}
      </div>
    );
  }

  const subtotal = selectedPlan?.price || 0;
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-center relative">
      {/* Background Overlay */}
      {/* <div className="absolute inset-0 bg-[url('/your-background.jpg')] bg-cover bg-center opacity-30 -z-10" /> */}

      <div className="w-full max-w-md bg-black/60 backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-6 border border-white/20">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-white">Subscription</h2>
          <p className="text-sm text-gray-300">
            Enjoy watching Full-HD anime, without restrictions and without ads
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {data?.data?.map((plan) => (
            <div
              key={plan._id}
              onClick={() => handlePlanChange(plan._id)}
              className={`cursor-pointer rounded-xl border p-5 transition-all ${
                selectedPlanId === plan._id
                  ? "border-white bg-white/10"
                  : "border-gray-600 hover:border-white/50"
              }`}
            >
              <p className="text-3xl font-semibold text-white">
                ${plan.price}
                <span className="text-base font-normal text-gray-300">
                  /month
                </span>
              </p>
              <ul className="mt-3 space-y-2 text-gray-300 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-[2px]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="space-y-2 text-gray-200 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pay with Stripe button */}
        <button
          onClick={() => setPayWithStripe(!payWithStripe)}
          className={`w-full flex justify-between items-center px-5 py-3 rounded-xl border text-white transition-all ${
            payWithStripe
              ? "border-[#635bff] bg-[#635bff]/20"
              : "border-gray-600 bg-transparent hover:border-[#635bff]"
          }`}
        >
          <span className="font-medium">Pay With Stripe</span>
          <span className="text-sm text-[#635bff] font-semibold">stripe</span>
        </button>

        {/* Continue Button */}
        <Button
          onClick={handlePayment}
          disabled={isPending || !selectedPlan}
          className="w-full mt-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200"
        >
          {isPending ? "Processing..." : "Continue to Payment"}
        </Button>
      </div>

      {/* ---------- Stripe Modal ---------- */}
      {showStripeModal && paymentIntentClientSecret && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: paymentIntentClientSecret }}
        >
          <StripePaymentModal
            open={showStripeModal}
            onClose={() => setShowStripeModal(false)}
            clientSecret={paymentIntentClientSecret}
            // onConfirm={confirmPaymentMutation.mutate}
            onConfirm={(paymentIntentId, paymentMethodId) =>
              confirmPaymentMutation.mutate({
                paymentIntentId,
                paymentMethodId,
              })
            }
            amount={total}
          />
        </Elements>
      )}
    </div>
  );
}
