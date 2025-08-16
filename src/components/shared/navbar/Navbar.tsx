import { BellRing, CircleUserRound, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const menuItemsData = [
    { id: 1, title: "Home", link: "/" },
    { id: 2, title: "About", link: "/about" },
    { id: 3, title: "Services", link: "/services" },
    { id: 4, title: "Contact", link: "/contact" },
  ];
  return (
    <div className="bg-black/40 backdrop-blur-[10px]">
      <div className="flex items-center justify-between py-6 md:py-7 lg:py-8 px-6 md:px-8 lg:px-10 ">
        {/* logo  */}
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <Image
            src="/assets/images/logo.svg"
            alt="Logo"
            width={113}
            height={40}
            className="w-full h-[40px] object-cover"
          />
          <ul className="flex items-center gap-4 md:gap-6 lg:gap-8">
            {menuItemsData?.map((item) => {
              return (
                <li key={item.id} className="text-white text-lg font-medium">
                  <Link
                    className="text-lg md:text-xl lg:text-2xl font-medium text-[#707070] leading-[120%]"
                    href={`${item.link}`}
                  >
                    {" "}
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        {/* search and profile  */}
        <div className="flex items-center gap-3">
            <Search className="w-10 h-10 text-white"/>
            <BellRing className="w-10 h-10 text-white"/>
            <CircleUserRound className="w-10 h-10 text-white"/>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
