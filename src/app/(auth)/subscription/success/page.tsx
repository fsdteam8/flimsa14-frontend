import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const SubscriptionSuccessPage = () => {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-xl text-center bg-white/5 border border-white/10 rounded-3xl p-10 space-y-8">
       
        <div className="space-y-4">
          <p className="uppercase tracking-[0.4em] text-sm text-gray-400">
            welcome to
          </p>
           <div className="flex justify-center">
          <Image
            src="/assets/images/logo.png"
            alt="AzloTV logo"
            width={200}
            height={200}
            priority
            className="h-28 w-auto object-contain"
          />
        </div>
        </div>
        <p className="text-lg text-gray-300">
          Your payment was successful. You may now log in to the mobile app or
          click the Watch streaming Here button to jump straight into streaming.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
         
        <Button
          asChild
          className="flex-1 bg-white text-black hover:bg-white/90"
        >
          <Link href="/">Watch streaming here</Link>
        </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
