"use client";
import {
  AlignJustify,
  BellRing,
  CircleUserRound,
  LogOut,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const session = useSession();
  // const token = (session?.data?.user as { accessToken: string })?.accessToken;
  const user = session?.data?.user;
  const menuItemsData = [
    { id: 1, title: "Comedy", link: "/" },
    { id: 2, title: "Action", link: "/" },
    { id: 3, title: "Mystery", link: "/" },
    { id: 4, title: "Drama", link: "/" },
    { id: 5, title: `TV Shows`, link: "/" },
    { id: 5, title: `Reels`, link: "/reels" },
  ];
  return (
    <div className="bg-black/40 backdrop-blur-[10px] sticky top-0 z-50">
      <div className="container w-full flex items-center justify-between py-2 lg:py-3 px-6 md:px-8 lg:px-10 ">
        {/* logo  */}
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <Link href={"/"}>
            <Image
              src="/assets/images/logo.svg"
              alt="Logo"
              width={113}
              height={40}
              className="w-full h-auto object-cover cursor-pointer"
            />
          </Link>
          <nav className="hidden md:block">
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8">
              {menuItemsData?.map((item) => {
                return (
                  <li key={item.id} className=" text-white text-lg font-medium">
                    <Link
                      className="whitespace-nowrap text-base md:text-[17px] lg:text-lg font-medium text-[#707070] leading-[120%] hover:underline hover:text-white"
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
            <Search className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-white cursor-pointer" />
            <BellRing className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-white cursor-pointer" />

            <div>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    {" "}
                    <CircleUserRound className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-white cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white mt-3">
                    <Link href={"/my-account"}>
                      <DropdownMenuItem className="cursor-pointer text-black text-base md:text-lg font-semibold leading-[120%]">
                        My Account
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="cursor-pointer text-red-500 text-base md:text-lg font-semibold leading-[120%]"
                    >
                      <LogOut /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login">
                    <button className="bg-white py-1 px-4 rounded-[10px] text-base md:text-lg font-semibold text-black leading-normal">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>
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
                  className="w-[113px] h-auto object-cover cursor-pointer"
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
                <Search className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-[#707070] cursor-pointer" />
                <BellRing className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-[#707070] cursor-pointer" />
                <CircleUserRound className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-[#707070] cursor-pointer" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
