// import React from "react";

// const SubscriptionModal = () => {
//   return (
//     <div className="px-3 md:px-0">
//       <div className="w-full md:w-[570px] py-6 md:py-7 lg:py-8 px-4 md:px-5 lg:px-6 rounded-[16px] bg-white/10 backdrop-blur-[10px] ">
//        <h2 className="text-2xl md:text-3xl lg:text-[40px] text-white font-semibold leading-[120%] text-center">Subscription</h2>
//        <p className="text-base md:text-lg lg:text-xl font-normal text-white leading-[120%] text-center pt-1">Enjoy watching Full-HD anime, without <br />
// restrictions and without ads</p>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionModal;


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
console.log(stripePromise)

const plans = [
  {
    id: "basic",
    price: 2.99,
    title: "$2.99 / month",
    features: [
      "Watch all you want",
      "Allows streaming of 4K",
      "Better video & audio quality",
    ],
  },
  {
    id: "premium",
    price: 4.99,
    title: "$4.99 / month",
    features: [
      "Watch all you want, ad-free",
      "Allows streaming of 4K",
      "Best video & audio quality",
    ],
  },
];

export default function SubscriptionModal() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  const handleCheckout = async () => {
    // const stripe = await stripePromise;
    // // Call your backend to create Stripe Checkout session
    // const res = await fetch("/api/stripe/checkout", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ planId: selectedPlan.id }),
    // });
    // const session = await res.json();
    // await stripe?.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 text-white rounded-2xl shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Subscription</h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enjoy watching Full-HD anime without restrictions and ads.
        </p>

        <div className="space-y-3 mb-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`cursor-pointer transition-all ${
                selectedPlan.id === plan.id
                  ? "border border-blue-500 bg-blue-950/30"
                  : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-center">{plan.title}</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-neutral-700 pt-3 text-sm text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${selectedPlan.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between font-semibold text-white">
            <span>Total</span>
            <span>${selectedPlan.price.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700"
        >
          Pay With Stripe
        </Button>

        <Button variant="secondary" className="w-full mt-2" onClick={() => alert("Continue clicked")}>
          Continue
        </Button>
      </motion.div>
    </div>
  );
}

