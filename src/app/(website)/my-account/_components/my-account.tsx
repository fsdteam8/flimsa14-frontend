"use client";

import { useQuery } from "@tanstack/react-query";
import { SquareArrowOutUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MyAccount = () => {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;

  const { data: accountInfo = {}, isLoading } = useQuery({
    queryKey: ["account-info", token],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch account info");

      const data = await res.json();
      return data?.data;
    },
    enabled: !!token && status === "authenticated",
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="bg-black/35 w-full p-5 rounded-lg flex gap-5 items-center">
        <Skeleton className="h-28 w-28 rounded-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-9 w-44 mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/35 w-full p-5 rounded-lg flex gap-5 items-center">
      <div>
        <Image
          src={accountInfo?.avatar?.url || "/placeholder.png"}
          alt="Profile"
          width={1000}
          height={1000}
          className="h-28 w-28 rounded-full object-cover"
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white/75">
          {accountInfo?.name}
        </h1>
        <p className="text-white/75">{accountInfo?.email}</p>

        <Link href={"/"}>
          <button className="flex items-center gap-2 py-2 px-4 rounded-md bg-gray-700 mt-2 hover:bg-gray-600 transition">
            <SquareArrowOutUpRight className="h-5 w-5" /> Go to Website
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MyAccount;
