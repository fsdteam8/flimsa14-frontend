import React, { Suspense } from "react";
import OtpForm from "./_components/otp-form";

const OtpPage = () => {
  return (
    <div
      className={`h-screen w-full flex items-center justify-center`}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <OtpForm />
      </Suspense>
    </div>
  );
};

export default OtpPage;
