import { Skeleton } from "@/components/ui/skeleton";
import { SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Avatar {
  url: string;
}

interface AccountInfo {
  avatar: Avatar;
  name: string;
  email: string;
}

interface Props {
  accountInfo: AccountInfo;
  isLoading: boolean;
}

const AccountInfo = ({ accountInfo, isLoading }: Props) => {
  if (isLoading) {
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

export default AccountInfo;
