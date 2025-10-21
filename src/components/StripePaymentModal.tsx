import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { toast } from "react-toastify";
import { Button } from "./ui/button";
// ---------- Stripe Modal Component ----------
interface StripePaymentModalProps {
  open: boolean;
  onClose: () => void;
  clientSecret: string;
  onConfirm: (paymentIntentId: string) => void;
  amount: number;
}

export const StripePaymentModal = ({
  open,
  onClose,
  onConfirm,
  amount,
}: StripePaymentModalProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleConfirm = async () => {
    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      toast.error(result.error.message || "Payment failed");
    } else if (result.paymentIntent) {
      toast.success("Payment successful!");
      const paymentIntentId = result.paymentIntent.id;
      onConfirm(paymentIntentId);
      // onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] mx-auto">
        <p className="text-2xl md:text-[28px] lg:text-[32px] font-semibold text-black leading-[150%] text-center">
          Payment Details
        </p>
        <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-black leading-[150%] text-center -mt-2">
          Total Amount : ${amount}
        </p>
        <div className="max-h-[500px] overflow-y-auto p-4 rounded-lg ">
          <PaymentElement />
        </div>
        <Button
          className="w-full mt-6 bg-[#499FC0] text-white font-semibold"
          onClick={handleConfirm}
        >
          Confirm Payment
        </Button>
      </DialogContent>
    </Dialog>
  );
};
