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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(20, { message: "Password must be less than 20 characters." }),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoadig, setIsLoading] = useState(false);
  const session = useSession();
  const isPaid = session?.data?.user?.isPaid ?? false;
  console.log(isPaid);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);
    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        toast.error(res.error || "Invalid email or password.");
        return;
      }

      toast.success("Signed in successfully!");
      if (isPaid) {
        router.push("/");
      } else {
        router.push("/subscription");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="px-3 md:px-0">
      <div className="w-screen md:w-[570px] py-6 md:py-7 lg:py-8 px-4 md:px-5 lg:px-6 rounded-[16px] bg-white border-0">
        <div className="flex flex-col items-center">
          <Link href="/">
            {/* <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={113}
              height={40}
              className="w-[1480px] h-[80px] object-contain cursor-pointer"
            /> */}
            <Image
              src="/assets/images/azlo-logo.svg"
              alt="Logo"
              width={113}
              height={400}
              className="w-full h-[80px] object-cover cursor-pointer"
            />
          </Link>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-black leading-[120%] text-center pb-4 md:pb-5 pt-1">
            Login To Your Account
          </h3>
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
                      className="w-full md:w-[522px] h-[59px] border border-[#BFBFBF] rounded-[6px] placeholder:text-[#BFBFBF] text-black text-base font-medium leading-[120%] "
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
            <div className="w-full flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-base font-medium text-black leading-[120%] hover:underline "
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-1">
              <Button
                disabled={isLoadig}
                className={`w-full h-[52px] bg-black hover:bg-gray-800 rounded-full py-4 px-8 text-base md:text-lg font-semibold text-white leading-[120%] ${
                  isLoadig
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#111] hover:text-white hover:border hover:border-white"
                } `}
                type="submit"
              >
                {isLoadig ? "Logging in..." : "Login"}
              </Button>
            </div>
            <p className="text-base font-medium text-black leading-[120%] text-center pt-2 md:pt-3 lg:pt-4">
              Don’t have an account ?
              <Link className="hover:underline pl-1" href="/email">
                Sign Up
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
