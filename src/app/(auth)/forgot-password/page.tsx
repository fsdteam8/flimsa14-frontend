import React from "react";
import ForgotPasswordForm from "./_components/forgot-password-form";

const ForgotPasswordPage = () => {
  return (
    <div
      className={`h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat bg-[url('/assets/auth/auth_bg_img.png')]`}
    >
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;
