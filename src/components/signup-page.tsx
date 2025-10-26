// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useMutation } from "@tanstack/react-query";
// import {
//   ArrowLeft,
//   Eye,
//   Loader2,
//   Mail,
//   User,
//   CheckCircle,
//   EyeOff,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { toast } from "react-toastify";

// // Zod Schemas
// const step1Schema = z.object({
//   email: z.string().email("Please enter a valid email address"),
// });

// const step2Schema = z
//   .object({
//     firstName: z.string().min(1, "First name is required"),
//     gender: z.enum(["male", "female", "other"], {
//       error: "Invalid gender selected",
//     }),
//     password: z.string().min(6, "Password must be at least 6 characters long"),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// type Step1Data = z.infer<typeof step1Schema>;
// type Step2Data = z.infer<typeof step2Schema>;

// export default function SignupPage() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // Step 1 Form
//   const step1Form = useForm<Step1Data>({
//     resolver: zodResolver(step1Schema),
//     defaultValues: { email: "" },
//   });

//   // Step 2 Form
//   const step2Form = useForm<Step2Data>({
//     resolver: zodResolver(step2Schema),
//     defaultValues: {
//       firstName: "",
//       gender: undefined,
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   // API Mutation
//   const { mutate, isPending } = useMutation({
//     mutationKey: ["signUp"],
//     mutationFn: async (data: {
//       email: string;
//       password: string;
//       confirmPassword: string;
//       firstName: string;
//       gender: string;
//     }) => {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/register`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(data),
//         }
//       );
//       return response.json();
//     },

//     onSuccess: (data) => {
//       if (!data?.success) {
//         toast.error(data?.message || "Something went wrong!");

//         return;
//       } else {
//         toast.success(data?.message || "Registration successful!");
//         router.push("/login");
//       }
//     },
//   });

//   // Step 1 Submit
//   const onStep1Submit = (data: Step1Data) => {
//     setStep1Data(data);
//     setCurrentStep(2);
//   };

//   // Step 2 Submit
//   const onStep2Submit = (data: Step2Data) => {
//     if (!step1Data) return;

//     mutate({
//       email: step1Data.email,
//       password: data.password,
//       confirmPassword: data.confirmPassword,
//       firstName: data.firstName,
//       gender: data.gender,
//     });
//   };

//   const handleBack = () => {
//     setCurrentStep(1);
//   };

//   return (
//     <div className="min-h-screen  flex items-center justify-center p-4">
//       <Card className="w-full md:w-[570px] shadow-xl bg-white border-0">
//         <CardHeader className="space-y-2 pb-6">
//           {/* Progress Indicator */}
//           <div className="flex items-center justify-center">
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <div
//                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
//                     currentStep >= 1
//                       ? "bg-black text-white"
//                       : "bg-gray-200 text-gray-500"
//                   }`}
//                 >
//                   {currentStep > 1 ? (
//                     <CheckCircle className="w-5 h-5" />
//                   ) : (
//                     <Mail className="w-5 h-5" />
//                   )}
//                 </div>
//               </div>

//               <div
//                 className={`w-16 h-1 transition-all duration-300 ${
//                   currentStep >= 2 ? "bg-black" : "bg-gray-200"
//                 }`}
//               />

//               <div className="relative">
//                 <div
//                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
//                     currentStep >= 2
//                       ? "bg-black text-white"
//                       : "bg-gray-200 text-gray-500"
//                   }`}
//                 >
//                   <User className="w-5 h-5" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="text-center space-y-1">
//             <CardTitle className="text-2xl font-bold text-gray-900">
//               {currentStep === 1
//                 ? "Let's get started"
//                 : "Complete your profile"}
//             </CardTitle>
//             <CardDescription className="text-gray-600 text-sm md:text-base font-medium">
//               {currentStep === 1
//                 ? "Enter your email to create an account"
//                 : "Just a few more details"}
//             </CardDescription>
//           </div>
//         </CardHeader>

//         <CardContent className="px-6 pb-8">
//           {/* Step 1: Email */}
//           {currentStep === 1 && (
//             <Form {...step1Form}>
//               <form
//                 onSubmit={step1Form.handleSubmit(onStep1Submit)}
//                 className="space-y-6"
//               >
//                 <FormField
//                   control={step1Form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
//                         Email Address
//                       </FormLabel>
//                       <FormControl>
//                         <Input
//                           {...field}
//                           type="email"
//                           placeholder="you@example.com"
//                           className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%] "
//                           autoFocus
//                         />
//                       </FormControl>
//                       <FormMessage className="text-red-500" />
//                     </FormItem>
//                   )}
//                 />

//                 <Button
//                   type="submit"
//                   className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium"
//                 >
//                   Continue
//                 </Button>
//               </form>
//             </Form>
//           )}

//           {/* Step 2: Profile Details */}
//           {currentStep === 2 && (
//             <Form {...step2Form}>
//               <form
//                 onSubmit={step2Form.handleSubmit(onStep2Submit)}
//                 className="space-y-3"
//               >
//                 {/* Back Button + Email Preview */}
//                 <div className="flex items-center justify-between">
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     onClick={handleBack}
//                     className="flex items-center text-gray-600 hover:text-black text-sm md:text-base font-medium"
//                   >
//                     <ArrowLeft className="w-4 h-4 mr-1" />
//                     Back
//                   </Button>
//                   <p className="text-sm md:text-base font-medium text-gray-600">
//                     <span className="font-medium">{step1Data?.email}</span>
//                   </p>
//                 </div>

//                 {/* First Name */}
//                 <FormField
//                   control={step2Form.control}
//                   name="firstName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
//                         First Name
//                       </FormLabel>
//                       <FormControl>
//                         <Input
//                           className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%] "
//                           {...field}
//                           placeholder="John"
//                           autoFocus
//                         />
//                       </FormControl>
//                       <FormMessage className="text-red-500" />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Gender */}
//                 <FormField
//                   control={step2Form.control}
//                   name="gender"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
//                         Gender
//                       </FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%] ">
//                             <SelectValue placeholder="Select your gender" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent className="bg-white">
//                           <SelectItem value="male">Male</SelectItem>
//                           <SelectItem value="female">Female</SelectItem>
//                           <SelectItem value="other">Other</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage className="text-red-500" />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Password */}
//                 <FormField
//                   control={step2Form.control}
//                   name="password"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
//                         Password
//                       </FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Input
//                             type={showPassword ? "text" : "password"}
//                             className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%] "
//                             placeholder="Password"
//                             {...field}
//                           />
//                           <button
//                             type="button"
//                             className="absolute right-5 top-4"
//                             onClick={() => setShowPassword(!showPassword)}
//                           >
//                             {showPassword ? (
//                               <Eye className="text-black" />
//                             ) : (
//                               <EyeOff className="text-black" />
//                             )}
//                           </button>
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-red-500" />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Confirm Password */}
//                 <FormField
//                   control={step2Form.control}
//                   name="confirmPassword"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
//                         Confirm Password
//                       </FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Input
//                             type={showConfirmPassword ? "text" : "password"}
//                             className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%] "
//                             placeholder="Confirm Password"
//                             {...field}
//                           />
//                           <button
//                             type="button"
//                             className="absolute right-5 top-4"
//                             onClick={() =>
//                               setShowConfirmPassword(!showConfirmPassword)
//                             }
//                           >
//                             {showConfirmPassword ? (
//                               <Eye className="text-black" />
//                             ) : (
//                               <EyeOff className="text-black" />
//                             )}
//                           </button>
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-red-500" />
//                     </FormItem>
//                   )}
//                 />

//                 <div className="pt-2">
//                   <Button
//                     type="submit"
//                     disabled={isPending}
//                     className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium"
//                   >
//                     {isPending ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Creating account...
//                       </>
//                     ) : (
//                       "Create Account"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           )}

//           {/* Sign In Link */}
//           <div className="mt-6 text-center font-medium text-base md:text-lg text-gray-600">
//             Already have an account?{" "}
//             <Button
//               variant="link"
//               className="p-0 h-auto text-base md:text-lg font-semibold text-black hover:underline"
//               onClick={() => router.push("/login")}
//             >
//               Sign in
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  Loader2,
  Mail,
  User,
  CheckCircle,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-toastify";

// Zod Schemas
const step1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const step2Schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    gender: z.enum(["male", "female", "other"], {
      error: "Invalid gender selected",
    }),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "" },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      firstName: "",
      gender: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  // API Mutation
  const { mutate, isPending } = useMutation({
    mutationKey: ["signUp"],
    mutationFn: async (data: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      gender: string;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
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
    onError: () => {
      toast.error("Failed to create account.");
    },
  });

  // Step 1 Submit
  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  // Step 2 Submit
  const onStep2Submit = (data: Step2Data) => {
    if (!step1Data) return;

    mutate({
      email: step1Data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.firstName,
      gender: data.gender,
    });
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full md:w-[570px] shadow-xl bg-white border-0">
        <CardHeader className="space-y-2 pb-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 1
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > 1 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                </div>
              </div>

              <div
                className={`w-16 h-1 transition-all duration-300 ${
                  currentStep >= 2 ? "bg-black" : "bg-gray-200"
                }`}
              />

              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 2
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {currentStep === 1
                ? "Let's get started"
                : "Complete your profile"}
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm md:text-base font-medium">
              {currentStep === 1
                ? "Enter your email to create an account"
                : "Just a few more details"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8">
          {/* Step 1: Email */}
          {currentStep === 1 && (
            <Form {...step1Form}>
              <form
                onSubmit={step1Form.handleSubmit(onStep1Submit)}
                className="space-y-6"
              >
                <FormField
                  control={step1Form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@example.com"
                          className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%]"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium"
                >
                  Continue
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: Profile Details */}
          {currentStep === 2 && (
            <Form {...step2Form}>
              <form
                onSubmit={step2Form.handleSubmit(onStep2Submit)}
                className="space-y-3"
              >
                {/* Back Button */}
                <div className="flex items-center justify-start">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-black text-sm md:text-base font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                </div>

                {/* Read-only Email Field */}
                <div className="space-y-1">
                  <label className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold block">
                    Email Address
                  </label>
                  <Input
                    value={step1Data?.email ?? ""}
                    disabled
                    className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] bg-gray-50 text-gray-800 text-base font-medium leading-[120%] cursor-not-allowed"
                  />
                </div>

                {/* First Name */}
                <FormField
                  control={step2Form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%]"
                          {...field}
                          placeholder="John"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={step2Form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
                        Gender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%]">
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={step2Form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%]"
                            placeholder="Password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-5 top-4"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <Eye className="text-black w-5 h-5" />
                            ) : (
                              <EyeOff className="text-black w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={step2Form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 text-base md:text-lg leading-[120%] font-semibold">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full md:w-[522px] h-[52px] border border-[#BFBFBF] rounded-[6px] text-gray-800 text-base font-medium leading-[120%]"
                            placeholder="Confirm Password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-5 top-4"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <Eye className="text-black w-5 h-5" />
                            ) : (
                              <EyeOff className="text-black w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center font-medium text-base md:text-lg text-gray-600">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-base md:text-lg font-semibold text-black hover:underline"
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}