"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import AccountInfo from "./account-info";

const MyAccount = () => {
  const { data: session } = useSession();
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
  });

  return (
    <div>
      <AccountInfo accountInfo={accountInfo} isLoading={isLoading} />
    </div>
  );
};

export default MyAccount;
