"use client";

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";

export default function OtpForm() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const decodedEmail = decodeURIComponent(email || "");
    const router = useRouter();

  // Focus the first input on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take the first character

    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // otp api integration
    const { mutate, isPending } = useMutation({
      mutationKey: ["verify-otp"],
      mutationFn: (values: { otp: string; email: string }) =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/verify-otp`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(values),
        }).then((res) => res.json()),
      onSuccess: (data, otp) => {
        if (!data?.success) {
          toast.error(data?.message || "Something went wrong");
          return;
        } else {
          toast.success(data?.message || "OTP verified successfully!");
          router.push(
            `/forgot-password/otp/reset-password?email=${encodeURIComponent(decodedEmail)}&otp=${encodeURIComponent(otp?.otp)}`
          );
        }
      },
    });

  // reset otp api integrattion
      const { mutate:resentOtp, isPending: resentOtpPending } = useMutation({
      mutationKey: ["fotgot-password"],
      mutationFn: (email: string) =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/forget`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        ).then((res) => res.json()),
      onSuccess: (data, email) => {
        if (!data?.success) {
          toast.error(data?.message || "Something went wrong");
          return;
        } else {
          toast.success(data?.message || "Email sent successfully!");
          router.push(`/forgot-password/otp?email=${encodeURIComponent(email)}`);
        }
      },
    });

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is a valid 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);

      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  // handle resend otp
    const handleResendOtp = async () => {
      resentOtp(decodedEmail);
    };

  // handle verify otp
  const handleVerify = async () => {
    const otpValue = otp.join("");

    // Check if OTP is complete
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP.");
      return;
    }
    mutate({ otp: otpValue, email: decodedEmail });

    console.log("OTP Verified:", otpValue);
  };

  return (
   <div className="px-3 md:px-0">
      <div className="w-full md:w-[570px] py-6 md:py-7 lg:py-8 px-4 md:px-5 lg:px-6 rounded-[16px] bg-white/10 backdrop-blur-[10px] ">
        <div className="flex flex-col items-center">
          <Link href="/">
            <Image
              src="/assets/images/logo.svg"
              alt="Logo"
              width={113}
              height={40}
              className="w-[1480px] h-[80px] object-contain cursor-pointer"
            />
          </Link>
          <h3 className="text-3xl md:text-[35px] lg:text-[40px] font-semibold text-white leading-[120%] text-center pb-2 pt-6 md:pt-8 lg:pt-10">
           Verify OTP
          </h3>
          <p className="text-base font-normal text-white leading-[120%] text-center pb-4">
            Please check your Email for a message with your code. <br /> Your code is 6 numbers long.
          </p>
        </div>
      <div className="pt-3 md:pt-4">
        {/* OTP Input Fields */}
        <div className="flex gap-[18px] w-full justify-center">
          {otp.map((digit, index) => (
            <Input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className={`w-[52px] h-[58px] bg-white text-black placeholder:text-[#999999] text-center text-2xl font-medium leading-[120%] border-[1px] rounded-md focus:outline-none ${
                digit ? "border-black" : "border-[#BFBFBF]"
              }`}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Resend OTP */}
        <div className="text-center my-6">
          <span className="text-base font-medium leading-[120%] text-white tracking-[0%]">
            Didn&apos;t Receive OTP ?{" "}
          </span>
          <button
            onClick={handleResendOtp}
            disabled={resentOtpPending}
            className="text-base font-medium leading-[120%] text-white tracking-[0%] hover:underline"
          >
            {resentOtpPending ? "Resending..." : "RESEND OTP"}
          </button>
        </div>

        {/* Verify Button */}
        <Button
            disabled={isPending}
          onClick={handleVerify}
          className="text-lg font-bold text-[#F8FAF9] leading-[120%] rounded-[32px] w-full h-[52px] bg-secondary shadow-[0px_4px_4px_0px_rgba(0, 0, 0, 0.15)]"
          type="submit"
        >
          {isPending ? "Sending..." : "Verify OTP"}
        </Button>
      </div>
    </div>
    </div>
  );
}
