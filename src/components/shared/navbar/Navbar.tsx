"use client";
import {
  AlignJustify,
  // BellRing,
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
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { NavbarSkeleton } from "./NavbarSkeleton";

export interface GenreResponse {
  success: boolean;
  message: string;
  data: Genre[];
}

export interface Genre {
  _id: string;
  user: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Navbar = () => {
  const session = useSession();
  const router = useRouter();

  const handleSearchClick = () => {
    router.push("/search");
  };
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  const user = session?.data?.user;

  const { data, isLoading, isError, error } = useQuery<GenreResponse>({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/genres`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // console.log(data?.data)

  const menuItemsData = [
    { id: "home", title: "Home", link: "/" },
    ...(data?.data?.map((genre) => ({
      id: genre._id,
      title: genre.title.trim(),
      link: `/#${genre._id}`,
    })) ?? []),
  ];

  if (isLoading) return <NavbarSkeleton />;
  if (isError)
    return (
      <div className="py-4 text-center text-white font-semibold leading-[120%]">
        Error: {error?.message}
      </div>
    );
  return (
    <div className="bg-black/40 backdrop-blur-[10px] sticky top-0 z-50">
      <div className="container w-full flex items-center justify-between py-2 lg:py-2 px-6 md:px-8 lg:px-10 ">
        {/* logo  */}
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <Link href={"/"} className="">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={113}
              height={400}
              className="w-full h-[80px] object-contain cursor-pointer"
            />
          </Link>
          <nav className="hidden md:block">
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8">
              {menuItemsData?.map((item) => {
                return (
                  <li key={item.id} className=" text-white text-lg font-medium">
                    <Link
                      className="whitespace-nowrap text-base md:text-[17px] lg:text-lg font-medium text-white/80 leading-[120%] hover:underline hover:text-white"
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
        {/* search and profile */}
        <div className="hidden items-center gap-3 md:flex">
          <Search
            className="h-6 w-6 cursor-pointer text-white"
            onClick={handleSearchClick}
          />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <CircleUserRound className="h-7 w-7 cursor-pointer text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white mt-3">
                <Link href={"/my-account"}>
                  <DropdownMenuItem className="cursor-pointer text-black text-base font-semibold leading-[120%]">
                    My Account
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-red-500 text-base font-semibold leading-[120%]"
                >
                  <LogOut /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <button className="rounded-full bg-white px-4 py-1 text-base font-semibold text-black">
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <Search
            className="h-6 w-6 cursor-pointer text-white"
            onClick={handleSearchClick}
          />
          <button
            onClick={() => (user ? router.push("/my-account") : router.push("/login"))}
            className="rounded-full border border-white/30 p-2 text-white"
          >
            <CircleUserRound className="h-5 w-5" />
          </button>
          <Sheet>
            <SheetTrigger>
              <AlignJustify className="h-9 w-9 text-white" />
            </SheetTrigger>
            <SheetContent className="bg-[#111111] text-white">
              <div className="flex flex-col gap-6 pt-6">
                <Image
                  src="/assets/images/logo.png"
                  alt="Logo"
                  width={180}
                  height={60}
                  className="mx-auto h-12 w-auto"
                />
                <ul className="flex flex-col gap-4">
                  {menuItemsData?.map((item) => (
                    <li key={item.id}>
                      <Link
                        className="block text-lg font-medium text-white hover:text-white/70"
                        href={`${item.link}`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-white/10 pt-4">
                  {user ? (
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-red-400"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  ) : (
                    <Link href="/login">
                      <button className="w-full rounded-full bg-white px-4 py-2 text-base font-semibold text-black">
                        Sign In
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
