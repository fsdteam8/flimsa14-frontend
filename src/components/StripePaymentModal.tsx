// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import {
//   PaymentElement,
//   useElements,
//   useStripe,
// } from "@stripe/react-stripe-js";

// import { toast } from "react-toastify";
// import { Button } from "./ui/button";
// // ---------- Stripe Modal Component ----------
// interface StripePaymentModalProps {
//   open: boolean;
//   onClose: () => void;
//   clientSecret: string;
//   onConfirm: (paymentIntentId: string, paymentMethodId: string) => void;
//   amount: number;
// }

// export const StripePaymentModal = ({
//   open,
//   onClose,
//   onConfirm,
//   amount,
// }: StripePaymentModalProps) => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleConfirm = async () => {
//     if (!stripe || !elements) return;

//     const result = await stripe.confirmPayment({
//       elements,
//       redirect: "if_required",
//     });

//     if (result.error) {
//       toast.error(result.error.message || "Payment failed");
//     } else if (result.paymentIntent) {
//       // toast.success("Payment successful!");
//       console.log(result, "result")
//       const paymentIntentId = result.paymentIntent.id;
//       const paymentMethodId = result.paymentIntent.payment_method as string;
//       // const paymentMethodId = "pm_card_visa";
//       onConfirm(paymentIntentId, paymentMethodId);
//       // onClose();
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-[800px] mx-auto bg-white">
//         <p className="text-2xl md:text-[28px] lg:text-[32px] font-semibold text-black leading-[150%] text-center">
//           Payment Details
//         </p>
//         <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-black leading-[150%] text-center -mt-2">
//           Total Amount : ${amount}
//         </p>
//         <div className="max-h-[500px] overflow-y-auto p-4 rounded-lg ">
//           <PaymentElement />
//         </div>
//         <Button
//           className="w-full mt-6 bg-[#499FC0] text-white font-semibold"
//           onClick={handleConfirm}
//         >
//           Confirm Payment
//         </Button>
//       </DialogContent>
//     </Dialog>
//   );
// };
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { Button } from "./ui/button";

interface StripePaymentModalProps {
  open: boolean;
  onClose: () => void;
  clientSecret: string;
  onConfirm: (paymentIntentId: string, paymentMethodId: string) => Promise<void> | void;
  amount: number;
}

export const StripePaymentModal = ({
  open,
  onClose,
  onConfirm,
  amount,
  clientSecret,
}: StripePaymentModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements || !clientSecret || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
        return;
      }

      if (result.paymentIntent) {
        const paymentIntentId = result.paymentIntent.id;
        const paymentMethodId = result.paymentIntent.payment_method as string;
        await onConfirm(paymentIntentId, paymentMethodId);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogContent className="mx-auto w-full max-w-lg bg-white p-0 sm:max-w-xl sm:rounded-2xl">
        <div className="flex h-[100dvh] flex-col gap-6 overflow-y-auto p-6 sm:h-auto">
          <div className="space-y-2 text-center">
            <p className="text-2xl font-semibold text-black">Payment Details</p>
            <p className="text-lg font-medium text-black">
              Total Amount : ${amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Your card information is securely handled by Stripe.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
            <PaymentElement options={{ layout: "tabs" }} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="w-full bg-[#499FC0] text-white font-semibold hover:bg-[#3d89a5]"
              onClick={handleConfirm}
              disabled={!clientSecret || isSubmitting || !stripe || !elements}
            >
              {isSubmitting ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
