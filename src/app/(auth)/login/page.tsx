import React from "react";
import LoginForm from "./_components/login-form";

const LogingPage = () => {
  return (
    <div
      className={`h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat bg-[url('/assets/auth/auth_bg_img.png')]`}
    >
      <LoginForm/>
    </div>
  );
};

export default LogingPage;
