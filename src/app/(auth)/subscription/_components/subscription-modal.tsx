"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-toastify";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { StripePaymentModal } from "@/components/StripePaymentModal";

export interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** extra field used only for UI - true for the "Without Ads" plan */
  isPremium?: boolean;
}

export interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  "";
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

const stripeAppearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#499FC0",
    borderRadius: "12px",
    fontSizeBase: "16px",
  },
  rules: {
    ".Input": {
      padding: "14px 16px",
    },
    ".Tab": {
      borderRadius: "8px",
    },
  },
} as const;

type ConfirmPaymentPayload = {
  paymentIntentId: string;
  paymentMethodId: string;
  invoiceId: string;
};

/* --------------------------------------------------------------- */
export default function SubscriptionModal() {
  const { data: session, update } = useSession();
  const token = session?.user?.accessToken;

  const { data, isLoading, isError, error } = useQuery<PlansResponse>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/plans`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  /* ----- default plan ------------------------------------------------ */
  useEffect(() => {
    if (data?.data?.length) {
      const first = data.data[0];
      setSelectedPlanId(first._id);
      setSelectedPlan(first);
    }
  }, [data]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = data?.data.find((p) => p._id === planId);
    setSelectedPlan(plan || null);
  };

  const stripeElementsOptions = useMemo(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: stripeAppearance,
      loader: "auto",
    };
  }, [clientSecret]);

  /* ----- create payment intent -------------------------------------- */
  const { mutate: createPayment, isPending } = useMutation({
    mutationKey: ["create-payment"],
    mutationFn: async (payload: { planId: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/subscription/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    onSuccess: (resp) => {
      if (!resp?.success) {
        toast.error(resp?.message || "Failed to create payment intent");
        return;
      }

      const invoice = resp?.data?.invoiceId;
      const paymentIntentId = resp?.data?.paymentIntentId;
      const secret = resp?.data?.clientSecret;

      if (!invoice || !paymentIntentId || !secret) {
        toast.error("Unable to initialize Stripe payment session.");
        return;
      }

      setInvoiceId(invoice);
      setClientSecret(secret);
      setStripeModalOpen(true);
      toast.info("Complete your payment in the secure Stripe window.");
    },
    onError: () => toast.error("Something went wrong"),
  });

  /* ----- confirm payment -------------------------------------------- */
  const confirmPaymentMutation = useMutation({
    mutationKey: ["confirm-payment"],
    mutationFn: async ({
      paymentIntentId,
      paymentMethodId,
      invoiceId: invoiceRef,
    }: ConfirmPaymentPayload) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/subscription/confirm-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId,
            paymentMethodId,
            invoiceId: invoiceRef,
          }),
        }
      );

      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        // ignore json parse errors
      }

      if (!res.ok) {
        const errorMessage =
          payload?.message || "Failed to confirm payment with Stripe.";
        throw new Error(errorMessage);
      }

      return payload;
    },
  });

  const handleStripeModalClose = () => {
    setStripeModalOpen(false);
    setClientSecret("");
    setInvoiceId(null);
    confirmPaymentMutation.reset();
  };

  const handleStripeConfirm = async (
    paymentIntentId: string,
    paymentMethodId: string
  ) => {
    if (!invoiceId) {
      toast.error("Missing invoice reference. Please try again.");
      return;
    }

    try {
      const response = await confirmPaymentMutation.mutateAsync({
        paymentIntentId,
        paymentMethodId,
        invoiceId,
      });

      if (response?.success) {
        toast.success(
          response?.message || "Subscription payment successful!"
        );
        handleStripeModalClose();
        try {
          await update();
        } catch (err) {
          console.error("Failed to refresh session", err);
        }
        await signOut({
          callbackUrl: "/subscription/success",
          redirect: true,
        });
      } else {
        toast.error(response?.message || "Payment confirmation failed");
      }
    } catch (err: any) {
      const message =
        err?.message || "Payment confirmation failed. Please try again.";
      toast.error(message);
    }
  };

  const handlePayment = () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan first");
      return;
    }

    if (!stripePromise) {
      toast.error("Stripe is not configured. Please contact support.");
      return;
    }

    createPayment({ planId: selectedPlanId });
  };

  /* ------------------------------------------------------------------ */
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-black">
        Loading plans...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center text-red-400">
        Failed to load plans: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <header className="w-full bg-black border-b border-gray-800 mb-8 mb:mb-14 lg:mb-14 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-6">
            <div className="w-full md:w-auto flex justify-between items-center gap-4">
              <Link href="/more" className="hover:underline">
                <button className="flex items-center text-white hover:bg-gray-800 mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Signup
                </button>
              </Link>
            </div>
            <div className="flex items-center space-x-4 pt-2 md:pt-0">
              <span className="text-white">
                Welcome, {session?.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* cart part  */}
      <div className="container mx-auto px-4 flex items-start justify-center  p-4">
        <div className="  space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Choose Your Plan
            </h1>
            <p className="mt-2 md:mt-3 lg:mt-4 text-white text-sm md:text-base">
              Select the perfect plan for your streaming needs
            </p>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-white">
              Account : {session?.user?.email}
            </p>
          </div>

          {/* Plan Cards - side-by-side */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data?.data?.map((plan) => {
              const isSelected = selectedPlanId === plan._id;
              const isPremium = plan.isPremium ?? false;

              return (
                <div
                  key={plan._id}
                  onClick={() => handlePlanChange(plan._id)}
                  className={` bg-white
                  relative cursor-pointer rounded-2xl border p-6 transition-all
                  ${
                    isSelected
                      ? "border-4 border-gray-700  shadow-lg"
                      : "border-gray-700 hover:border-gray-500"
                  }
                `}
                >
                  {/* Most Popular badge */}
                  {isPremium && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-black">
                      Most Popular
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl font-semibold text-black text-center">
                    {plan.name}
                  </h2>

                  {/* Price */}
                  <p className="mt-2 text-4xl font-bold text-black text-center">
                    ${plan.price}
                    <span className="text-lg font-normal text-black">
                      {" "}
                      /month
                    </span>
                  </p>

                  {/* Short description */}
                  <p className="mt-1 text-sm text-black text-center">
                    {isPremium
                      ? "Premium ad-free experience"
                      : "Great entertainment with ads"}
                  </p>

                  {/* Features list */}
                  <ul className="mt-6 space-y-3 text-gray-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-400" />
                        <span className="text-black">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePayment();
                    }}
                    disabled={isPending || !isSelected}
                    className={`
                    mt-8 w-full rounded-full font-semibold transition-all
                    ${
                      isPremium
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }
                  `}
                  >
                    {isPending ? "Processing..." : `Get ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Total line (optional - matches screenshot) */}
          {/* <div className="mt-8 text-center text-lg font-medium text-black">
          Total: <span className="text-2xl">${total.toFixed(2)}</span>
        </div> */}
        </div>
      </div>

      {clientSecret && stripeElementsOptions && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={stripeElementsOptions}
          key={clientSecret}
        >
          <StripePaymentModal
            open={stripeModalOpen}
            onClose={handleStripeModalClose}
            clientSecret={clientSecret}
            amount={selectedPlan?.price || 0}
            onConfirm={handleStripeConfirm}
          />
        </Elements>
      )}
    </div>
  );
}
