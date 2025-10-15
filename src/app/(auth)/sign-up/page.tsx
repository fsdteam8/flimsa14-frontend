import React from "react";
import SignUpForm from "./_components/sign-up-form";

const SignUpPage = () => {
  return (
    <div
      className={`h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat bg-[url('/assets/auth/auth_bg_img.png')]`}
    >
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
