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
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

export const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .max(20, { message: "Password must be less than 20 characters." }),
    //       password: z
    //   .string()
    //   .min(8, { message: "Password must be at least 8 characters." })
    //   .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    //   .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    //   .regex(/[0-9]/, "Password must contain at least one number.")
    //   .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),

    confirmPassword: z.string().min(6, {
      message: "Confirm Password must be at least 6 characters long.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParama = useSearchParams();
  const email = searchParama?.get("email");
  const otp = searchParama?.get("otp");
  const decodedEmail = decodeURIComponent(email || "");
  const decodedOtp = decodeURIComponent(otp || "");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  //   sign up api integration
  const { mutate, isPending } = useMutation({
    mutationKey: ["reset-password"],
    mutationFn: async (values: {
      email: string;
      password: string;
      otp: string;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      return response.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong!");
        return;
      }
      toast.success(data?.message || "Password Reset successful!");
      router.push("/login");
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    mutate({
      email: decodedEmail,
      password: values?.password,
      otp: decodedOtp,
    });
  }
  return (
    <div className="px-3 md:px-0">
      <div className="w-screen md:w-[570px] py-6 md:py-7 lg:py-8 px-4 md:px-5 lg:px-6 rounded-[16px] bg-white border-0 ">
        <div className="flex flex-col items-center">
          <Link href="/">
               <Image
                          src="/assets/images/azlo-logo.svg"
                          alt="Logo"
                          width={113}
                          height={400}
                          className="w-auto h-[80px] object-cover cursor-pointer"
                        />
          </Link>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-black leading-[120%] text-center pb-2 md:pb-5 pt-2 lg:pt-3">
            Create new password
          </h3>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="w-full md:w-[522px] h-[59px] border border-[#BFBFBF] rounded-[6px] placeholder:text-[#BFBFBF] text-black text-base font-medium leading-[120%] "
                        placeholder="Password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-5 top-5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Eye className="text-black" />
                        ) : (
                          <EyeOff className="text-black" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full md:w-[522px] h-[59px] border border-[#BFBFBF] rounded-[6px] placeholder:text-[#BFBFBF] text-black text-base font-medium leading-[120%] "
                        placeholder="Confirm Password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-5 top-5"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <Eye className="text-black" />
                        ) : (
                          <EyeOff className="text-black" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="pt-1">
              <Button
                disabled={isPending}
                className={`w-full h-[52px] bg-black hover:bg-gray-800 rounded-full py-4 px-8 text-base md:text-lg font-semibold text-white leading-[120%] ${
                  isPending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#111] hover:text-white hover:border hover:border-white"
                } `}
                type="submit"
              >
                {isPending ? "Loading..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
