"use client";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";

const AccountTopBar = () => {
  const router = useRouter();
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  const pathName = usePathname();
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

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

  const { mutate: deleteMutate, isPending } = useMutation({
    mutationKey: ["delete-account"],
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.json();
    },
  });

  const handleDeleteAccount = () => {
    deleteMutate();
    router.push("/login");
  };

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

          <div>
            <button
              onClick={() => {
                setDeleteAccountModal(true);
              }}
              className="text-white"
            >
              Delete Account
            </button>
          </div>

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
                <button
                  onClick={() => setDeleteAccountModal(true)}
                  className="mb-3 w-full rounded-lg border border-red-500/40 px-4 py-3 text-center text-red-400 hover:bg-red-500/10 transition"
                >
                  Delete account
                </button>
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

      {/* delete account modal here  */}
      <div>
        {deleteAccountModal && (
          <>
            <Dialog
              open={deleteAccountModal}
              onOpenChange={setDeleteAccountModal}
            >
              <DialogContent className="max-w-[400px] bg-black/80">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-semibold leading-[120%] text-white">
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-xm md:text-sm lg:text-base font-normal text-white leading-[120%] pt-2">
                    Are you sure you want to delete your <br /> account? This
                    action cannot be undone
                    <div className="pt-6 w-full flex items-center justify-end gap-8">
                      <button
                        onClick={() => setDeleteAccountModal(false)}
                        className="text-sm md:text-base lg:text-lg font-medium text-white leading-[120%] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isPending}
                        onClick={handleDeleteAccount}
                        className="text-sm md:text-base lg:text-lg font-medium text-red-500 leading-[120%] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountTopBar;
