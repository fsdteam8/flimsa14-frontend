import React, { Suspense } from "react";
import OtpForm from "./_components/otp-form";

const OtpPage = () => {
  return (
    <div
      className={`h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat bg-[url('/assets/auth/auth_bg_img.png')]`}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <OtpForm />
      </Suspense>
    </div>
  );
};

export default OtpPage;
