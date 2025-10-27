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
import { useRouter } from "next/navigation";

export const formSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." })
      .max(30, { message: "Name must be less than 30 characters." }),

    email: z.string().email({ message: "Please enter a valid email address." }),

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

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  //   sign up api integration
  const { mutate, isPending } = useMutation({
    mutationKey: ["signUp"],
    mutationFn: async (formData: z.infer<typeof formSchema>) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      return response.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong!");
        return;
      }
      toast.success(data?.message || "Registration successful!");
      router.push("/login");
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    mutate(values);
  }
  return (
    <div className="px-3 md:px-0">
      <div className="w-full md:w-[570px] py-6 md:py-7 lg:py-8 px-4 md:px-5 lg:px-6 rounded-[16px] bg-white/10 backdrop-blur-[10px] ">
        <div className="flex flex-col items-center">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={113}
              height={40}
              className="w-[1480px] h-[80px] object-contain cursor-pointer"
            />
          </Link>
          <h3 className="text-3xl md:text-[35px] lg:text-[40px] font-semibold text-white leading-[120%] text-center pb-4 md:pb-5 pt-6 md:pt-8 lg:pt-10">
            Create Your Account
          </h3>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="w-full md:w-[522px] h-[59px] border border-[#BFBFBF] rounded-[6px] placeholder:text-[#BFBFBF] text-white text-base font-medium leading-[120%] "
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="w-full md:w-[522px] h-[59px] border border-[#BFBFBF] rounded-[6px] placeholder:text-[#BFBFBF] text-white text-base font-medium leading-[120%] "
                        placeholder="Password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-5 top-5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Eye className="text-white"/> : <EyeOff className="text-white"/>}
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
                        className="w-full md:w-[522px] h-[59px] border border-[#BFBFBF] rounded-[6px] placeholder:text-[#BFBFBF] text-white text-base font-medium leading-[120%] "
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
                        {showConfirmPassword ? <Eye className="text-white"/> : <EyeOff className="text-white"/>}
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
                className={`w-full h-[52px] bg-white rounded-full py-4 px-8 text-base md:text-lg font-semibold text-[#111] leading-[120%] ${
                  isPending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#111] hover:text-white hover:border hover:border-white"
                } `}
                type="submit"
              >
                {isPending ? "Creating Account..." : "Sign Up"}
              </Button>
            </div>
            <p className="text-base font-normal text-white leading-[120%] text-center pt-4 md:pt-5 lg:pt-6">
              Already have an account ?{" "}
              <Link className="hover:underline pl-1" href="/login">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUpForm;
