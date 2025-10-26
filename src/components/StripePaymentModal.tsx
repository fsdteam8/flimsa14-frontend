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
  onConfirm: (paymentIntentId: string, paymentMethodId: string) => void;
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
      const paymentIntentId = result.paymentIntent.id;
      const paymentMethodId = result.paymentIntent.payment_method as string;
      onConfirm(paymentIntentId, paymentMethodId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] mx-auto bg-white">
        <p className="text-center text-2xl font-semibold text-black">
          Payment Details
        </p>
        <p className="mt-2 text-center text-xl font-semibold text-black">
          Total Amount : ${amount}
        </p>

        <div className="mt-6 max-h-[500px] overflow-y-auto rounded-lg p-4">
          <PaymentElement />
        </div>

        <Button
          className="mt-6 w-full bg-[#499FC0] text-white font-semibold"
          onClick={handleConfirm}
        >
          Confirm Payment
        </Button>
      </DialogContent>
    </Dialog>
  );
};