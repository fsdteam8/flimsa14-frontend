import { Instagram, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";
import React from "react";
import { GoDotFill } from "react-icons/go";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-black">
      <div className="">
        {/* footer top  */}
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-10 md:pt-20 lg:pt-[120px] pb-6 md:pb-8 lg:pb-10">
          <div className="md:col-span-1 w-full flex flex-col items-center md:items-start">
           <div className="">
             <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={113}
              height={400}
              className="w-full h-[100px] object-contain cursor-pointer"
            />
           </div>
            <p className="text-base font-normal text-white leading-[120%] pt-3">
              Lorem ipsum dolor sit amet orci aliquam.
            </p>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-lg md:text-xl lg:text-[22px] font-semibold text-white leading-[120%] text-center">
              FOLLOW US ON
            </h3>
            <div className="w-full flex items-center justify-center gap-4 md:gap-6 lg:gap-8 pt-3 md:pt-4">
              <Youtube className="w-8 h-8 text-white cursor-pointer" />
              <Linkedin className="w-8 h-8 text-white cursor-pointer" />
              <FaFacebook className="w-8 h-8 text-white cursor-pointer" />
              <Instagram className="w-8 h-8 text-white cursor-pointer" />
              <FaXTwitter className="w-8 h-8 text-white cursor-pointer" />
            </div>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-lg md:text-xl lg:text-[22px] font-semibold text-white leading-[120%] text-center">
              DOWNLOAD APP
            </h3>
            <div className="flex items-center justify-center gap-3 pt-3 md:pt-4">
              <Image
                src="/assets/images/app-store.svg"
                alt="app store"
                width={120}
                height={40}
                quality={100}
                className="w-[120px] h-full object-cover cursor-pointer"
              />
              <Image
                src="/assets/images/google-play.png"
                alt="app store"
                width={120}
                height={40}
                quality={100}
                className="w-[120px] h-full object-cover cursor-pointer"
              />
            </div>
          </div>
        </div>
        {/* footer middle  */}
        <div className="py-6 md:py-8 lg:py-10 border-y border-[#272727]">
          <ul className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-5">
            <Link href="/my-account/privacy-policy">
              <li className="flex items-center gap-4 md:gap-5 text-base md:text-lg lg:text-xl font-medium text-[#999] leading-[120%] hover:underline hover:text-white hover:cursor-pointer">
                <GoDotFill /> Privacy Policy
              </li>
            </Link>
            <Link href="/my-account/privacy-policy">
              <li className="flex items-center gap-4 md:gap-5 text-base md:text-lg lg:text-xl font-medium text-[#999] leading-[120%] hover:underline hover:text-white hover:cursor-pointer">
                <GoDotFill /> Term & Condition
              </li>
            </Link>
          </ul>
        </div>
        {/* footer bottom  */}
        <p className="text-base font-normal text-[#595959] leading-[120%] py-3 md:py-4 lg:py-5 text-center">
          © 2025 All Rights Reserved by azlo.
        </p>
      </div>
    </div>
  );
};

export default Footer;
