"use client";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const AccountTopBar = () => {
  const pathName = usePathname();

  const topBarLinks = [
    {
      label: "My Profile",
      path: "/my-account",
    },
    {
      label: "Settings",
      path: "/my-account/settings",
    },
    {
      label: "Wishlist",
      path: "/my-account/wishlist",
    },
    {
      label: "Privacy Policy",
      path: "/my-account/privacy-policy",
    },
    {
      label: "Terms & Conditions",
      path: "/my-account/terms-conditions",
    },
  ];

  return (
    <div className="mt-8 mb-8 container">
      <h1 className="text-center text-3xl md:text-5xl font-medium text-white mb-6 md:mb-10">
        Accounts
      </h1>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <ul className="flex items-center justify-between border-b border-[#707070] pb-1">
          {topBarLinks.map((item, index) => {
            const isActive = pathName === item.path;

            return (
              <li key={index}>
                <Link
                  className={`text-[#707070] transition-all duration-500 pb-1 hover:text-white hover:border-b-2 hover:border-white ${
                    isActive && "text-white border-b-2 border-white"
                  }`}
                  href={item.path}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-red-500"
          >
            <LogOut className="h-5 w-5" /> Log out
          </button>
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-transparent border-[#707070] text-white"
            >
              Menu
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="bg-[#1a1a1a] border-t border-[#707070]"
          >
            <div className="flex flex-col space-y-4 mt-6">
              {topBarLinks.map((item, index) => {
                const isActive = pathName === item.path;

                return (
                  <SheetClose asChild key={index}>
                    <Link
                      className={`text-lg py-3 px-4 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "text-white bg-white/10 border-l-4 border-white"
                          : "text-[#707070] hover:text-white hover:bg-white/5"
                      }`}
                      href={item.path}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}

              <div className="border-t border-[#707070] pt-4 mt-2">
                <SheetClose asChild>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center justify-center gap-2 text-red-500 w-full py-3 px-4 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default AccountTopBar;
