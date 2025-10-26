// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Check } from "lucide-react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";
// import { toast } from "react-toastify";
// import { Elements } from "@stripe/react-stripe-js";
// import { StripePaymentModal } from "@/components/StripePaymentModal";
// import { loadStripe } from "@stripe/stripe-js";
// import { useRouter } from "next/navigation";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// export interface Plan {
//   _id: string;
//   name: string;
//   price: number;
//   features: string[];
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface PlansResponse {
//   success: boolean;
//   message: string;
//   data: Plan[];
// }

// export default function SubscriptionModal() {
//   const router = useRouter();
//   const { data: session, update } = useSession(); // ✅ use update() for session refresh
//   const token = session?.user?.accessToken;
//   console.log(token);
//   const { data, isLoading, error, isError } = useQuery<PlansResponse>({
//     queryKey: ["plans"],
//     queryFn: async () => {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/plans`);
//       if (!res.ok) throw new Error("Network response was not ok");
//       return res.json();
//     },
//   });

//   const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
//   const [payWithStripe, setPayWithStripe] = useState(false);
//   const [paymentIntentClientSecret, setPaymentIntentClientSecret] =
//     useState("");
//   const [showStripeModal, setShowStripeModal] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   // console.log(showStripeModal);

//   // console.log(paymentIntentClientSecret);

//   // Set the default plan when data is loaded
//   useEffect(() => {
//     if (data?.data?.length) {
//       setSelectedPlanId(data.data[0]._id);
//       setSelectedPlan(data.data[0]);
//     }
//   }, [data]);

//   const handlePlanChange = (planId: string) => {
//     setSelectedPlanId(planId);
//     const plan = data?.data.find((p) => p._id === planId);
//     setSelectedPlan(plan || null);
//   };

//   // payment create api integration
//   const { mutate: createPayment, isPending } = useMutation({
//     mutationKey: ["create-payment"],
//     mutationFn: async (data: { planId: string }) => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API}/subscription/create-payment-intent`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(data),
//         }
//       );
//       if (!res.ok) throw new Error("Network response was not ok");
//       return res.json();
//     },
//     onSuccess: (data) => {
//       console.log("create payment", data);
//       if (!data?.success) {
//         toast.error(data?.message || "Failed to create payment intent");
//         return;
//       }
//       toast.success(data?.message || "Payment intent created successfully");
//       setPaymentIntentClientSecret(data?.data?.clientSecret || "");
//       setShowStripeModal(true);
//     },

//     onError: (data) => {
//       toast.error(data.message || "Something went wrong");
//     },
//   });

//   // ---------- Confirm Payment ----------
//   const confirmPaymentMutation = useMutation({
//     mutationKey: ["confirm-payment"],
//     mutationFn: async ({
//       paymentIntentId,
//       paymentMethodId,
//     }: {
//       paymentIntentId: string;
//       paymentMethodId: string;
//     }) => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API}/subscription/confirm-payment`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ paymentIntentId, paymentMethodId }),
//         }
//       );
//       if (!res.ok) throw new Error("Failed to confirm payment");
//       return res.json();
//     },
//     onSuccess: async (data) => {
//       if (data.success) {
//         toast.success(data?.message || "Subscription payment successful!");
//         await update();
//         setPaymentSuccess(true);
//         setShowStripeModal(false);

//       } else {
//         toast.error(data.message || "Payment confirmation failed");
//       }
//     },
//     onError: () => {
//       toast.error("Something went wrong while confirming payment");
//     },
//   });

//   useEffect(() => {
//     if (paymentSuccess && !session?.user?.isPaid) {
//       router.push("/login");
//     }
//   }, [paymentSuccess, router, session?.user?.isPaid]);
//   const handlePayment = () => {
//     if (!selectedPlanId) return toast.error("Please select a plan first");
//     createPayment({ planId: selectedPlanId });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen text-white">
//         Loading plans...
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex justify-center items-center min-h-screen text-red-400">
//         Failed to load plans: {error.message}
//       </div>
//     );
//   }

//   const subtotal = selectedPlan?.price || 0;
//   const tax = 0;
//   const total = subtotal + tax;

//   return (
//     <div className="flex justify-center items-center h-screen bg-cover bg-center relative">
//       {/* Background Overlay */}
//       {/* <div className="absolute inset-0 bg-[url('/your-background.jpg')] bg-cover bg-center opacity-30 -z-10" /> */}

//       <div className="w-full max-w-md bg-black/60 backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-6 border border-white/20">
//         {/* Header */}
//         <div className="text-center space-y-2">
//           <h2 className="text-2xl font-semibold text-white">Subscription</h2>
//           <p className="text-sm text-gray-300">
//             Enjoy watching Full-HD anime, without restrictions and without ads
//           </p>
//         </div>

//         {/* Plans */}
//         <div className="space-y-4">
//           {data?.data?.map((plan) => (
//             <div
//               key={plan._id}
//               onClick={() => handlePlanChange(plan._id)}
//               className={`cursor-pointer rounded-xl border p-5 transition-all ${
//                 selectedPlanId === plan._id
//                   ? "border-white bg-white/10"
//                   : "border-gray-600 hover:border-white/50"
//               }`}
//             >
//               <p className="text-3xl font-semibold text-white">
//                 ${plan.price}
//                 <span className="text-base font-normal text-gray-300">
//                   /month
//                 </span>
//               </p>
//               <ul className="mt-3 space-y-2 text-gray-300 text-sm">
//                 {plan.features.map((feature, i) => (
//                   <li key={i} className="flex items-start gap-2">
//                     <Check className="w-4 h-4 text-green-400 mt-[2px]" />
//                     {feature}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         {/* Subtotal */}
//         <div className="space-y-2 text-gray-200 text-sm">
//           <div className="flex justify-between">
//             <span>Subtotal</span>
//             <span>${subtotal.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Tax</span>
//             <span>${tax.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between text-white font-semibold">
//             <span>Total</span>
//             <span>${total.toFixed(2)}</span>
//           </div>
//         </div>

//         {/* Pay with Stripe button */}
//         <button
//           onClick={() => setPayWithStripe(!payWithStripe)}
//           className={`w-full flex justify-between items-center px-5 py-3 rounded-xl border text-white transition-all ${
//             payWithStripe
//               ? "border-[#635bff] bg-[#635bff]/20"
//               : "border-gray-600 bg-transparent hover:border-[#635bff]"
//           }`}
//         >
//           <span className="font-medium">Pay With Stripe</span>
//           <span className="text-sm text-[#635bff] font-semibold">stripe</span>
//         </button>

//         {/* Continue Button */}
//         <Button
//           onClick={handlePayment}
//           disabled={isPending || !selectedPlan}
//           className="w-full mt-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200"
//         >
//           {isPending ? "Processing..." : "Continue to Payment"}
//         </Button>
//       </div>

//       {/* ---------- Stripe Modal ---------- */}
//       {showStripeModal && paymentIntentClientSecret && (
//         <Elements
//           stripe={stripePromise}
//           options={{ clientSecret: paymentIntentClientSecret }}
//         >
//           <StripePaymentModal
//             open={showStripeModal}
//             onClose={() => setShowStripeModal(false)}
//             clientSecret={paymentIntentClientSecret}
//             // onConfirm={confirmPaymentMutation.mutate}
//             onConfirm={(paymentIntentId, paymentMethodId) =>
//               confirmPaymentMutation.mutate({
//                 paymentIntentId,
//                 paymentMethodId,
//               })
//             }
//             amount={total}
//           />
//         </Elements>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StripePaymentModal } from "@/components/StripePaymentModal";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** extra field used only for UI – true for the “Without Ads” plan */
  isPremium?: boolean;
}

export interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

/* --------------------------------------------------------------- */
export default function SubscriptionModal() {
  const router = useRouter();
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
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] =
    useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  /* ----- create payment intent -------------------------------------- */
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
      if (!data?.success) {
        toast.error(data?.message || "Failed to create payment intent");
        return;
      }
      // toast.success(data?.message || "Payment intent created");
      setPaymentIntentClientSecret(data?.data?.clientSecret || "");
      setShowStripeModal(true);
    },
    onError: () => toast.error("Something went wrong"),
  });

  /* ----- confirm payment -------------------------------------------- */
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
    onSuccess: async (data) => {
      if (data.success) {
        toast.success(data?.message || "Subscription payment successful!");
        await update();
        setPaymentSuccess(true);
        setShowStripeModal(false);
      } else {
        toast.error(data.message || "Payment confirmation failed");
      }
    },
    onError: () => toast.error("Confirm payment error"),
  });

  useEffect(() => {
    if (paymentSuccess && !session?.user?.isPaid) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000); // 3-second delay

      // Cleanup timeout if component unmounts or deps change
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, router, session?.user?.isPaid]);

  const handlePayment = () => {
    if (!selectedPlanId) return toast.error("Please select a plan first");
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

  const total = selectedPlan?.price || 0;

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <header className="border-b border-gray-800 mb-8 mb:mb-14 lg:mb-14 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/more" className="hover:underline">
                <button className="flex items-center text-white hover:bg-gray-800 mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Signup
                </button>
              </Link>
              <div className="text-white text-lg font-semibold">StreamApp</div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">
                Welcome, {session?.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* cart part  */}
      <div className=" flex items-start justify-center  p-4">
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

          {/* Plan Cards – side-by-side */}
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
                    {plan.features.map((feat, i) => {
                      // const isCrossed = !isPremium && feat.toLowerCase().includes("ad-free");
                      return (
                        <li key={i} className="flex items-center gap-2">
                          {/* {isCrossed ? (
                          <X className="h-5 w-5 text-red-500" />
                        ) : (
                          <Check className="h-5 w-5 text-green-400" />
                        )} */}
                          <Check className="h-5 w-5 text-green-400" />
                          <span className="text-black">{feat}</span>
                        </li>
                      );
                    })}
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
                    {isPending ? "Processing…" : `Get ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Total line (optional – matches screenshot) */}
          {/* <div className="mt-8 text-center text-lg font-medium text-black">
          Total: <span className="text-2xl">${total.toFixed(2)}</span>
        </div> */}
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
              onConfirm={(pi, pm) =>
                confirmPaymentMutation.mutate({
                  paymentIntentId: pi,
                  paymentMethodId: pm,
                })
              }
              amount={total}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
