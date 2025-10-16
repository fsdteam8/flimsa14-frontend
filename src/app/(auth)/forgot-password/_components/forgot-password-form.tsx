"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const ForgotPasswordForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  //   forgot password api integration
  const { mutate, isPending } = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: async (email: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/forget`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      return response.json();
    },
    onSuccess: (data, email) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong!");
        return;
      }
      toast.success(data?.message || "Password reset email sent!");
      router.push(`/forgot-password/otp?email=${encodeURIComponent(email)}`);
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    mutate(values?.email);
  }
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
            Forgot Password
          </h3>
          <p className="text-base font-normal text-white leading-[120%] text-center pb-4">
            Enter your email address to reset your password
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="w-full md:w-[522px] h-[59px] border border-[#BFBFBF] rounded-[6px] placeholder:text-[#BFBFBF] text-white text-base font-medium leading-[120%] "
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="pt-1">
              <Button
                disabled={isPending}
                className={`w-full h-[52px] bg-white rounded-full py-4 px-8 text-base md:text-lg font-semibold text-[#111] leading-[120%] ${
                  isPending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#111] hover:text-white hover:border hover:border-white"
                }
                  `}
                type="submit"
              >
                {isPending ? "Submitting..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
