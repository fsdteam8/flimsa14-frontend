import { AlignJustify, BellRing, CircleUserRound, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const menuItemsData = [
    { id: 1, title: "Comedy", link: "/" },
    { id: 2, title: "Action", link: "/" },
    { id: 3, title: "Mystery", link: "/" },
    { id: 4, title: "Drama", link: "/" },
    { id: 5, title: `TV Shows`, link: "/" },
  ];
  return (
    <div className="bg-black/40 backdrop-blur-[10px]">
      <div className="container w-full flex items-center justify-between py-6 md:py-7 lg:py-8 px-6 md:px-8 lg:px-10 ">
        {/* logo  */}
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8 ">
          <Image
            src="/assets/images/logo.svg"
            alt="Logo"
            width={113}
            height={40}
            className="w-full h-auto object-cover"
          />
          <nav className="hidden md:block">
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8">
              {menuItemsData?.map((item) => {
                return (
                  <li key={item.id} className=" text-white text-lg font-medium">
                    <Link
                      className="whitespace-nowrap text-lg md:text-xl lg:text-2xl font-medium text-[#707070] leading-[120%] hover:underline hover:text-white"
                      href={`${item.link}`}
                    >
                      {" "}
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        {/* search and profile  */}
        <div className="hidden md:block">
          <div className=" flex items-center gap-3">
            <Search className="w-10 h-10 text-white" />
            <BellRing className="w-10 h-10 text-white" />
            <CircleUserRound className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* small device  */}
        {/* hamburger menu  */}
        <div className="block md:hidden">
          <Sheet>
            <SheetTrigger>
              <AlignJustify className="w-10 h-10 text-[#707070]" />
            </SheetTrigger>
            <SheetContent className="bg-white">
              <div className="w-full flex items-center justify-center pt-6">
                <Image
                  src="/assets/images/logo.svg"
                  alt="Logo"
                  width={113}
                  height={40}
                  className="w-[113px] h-auto object-cover"
                />
              </div>
              <ul className="flex flex-col items-center gap-4 md:gap-6 lg:gap-8 pt-6">
                {menuItemsData?.map((item) => {
                  return (
                    <li
                      key={item.id}
                      className="text-white text-lg font-medium"
                    >
                      <Link
                        className="text-lg md:text-xl lg:text-2xl font-medium text-[#707070] leading-[120%] hover:underline hover:text-black"
                        href={`${item.link}`}
                      >
                        {" "}
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className=" flex items-center justify-center gap-5 pt-7">
                <Search className="w-10 h-10 text-[#707070]" />
                <BellRing className="w-10 h-10 text-[#707070]" />
                <CircleUserRound className="w-10 h-10 text-[#707070]" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
