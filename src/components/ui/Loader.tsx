"use client";

import React from "react";
import { ClipLoader } from "react-spinners";

interface LoaderProps {
  loading?: boolean;
  fullscreen?: boolean;
  size?: number;
  color?: string;
}

export default function Loader({
  loading = true,
  fullscreen = true,
  size = 60,
  color = "#499FC0",
}: LoaderProps) {
  if (!loading) return null;

  return (
    <div
      className={`flex items-center justify-center ${
        fullscreen
          ? "fixed inset-0 bg-white/70 backdrop-blur-sm z-[9999]"
          : "py-10"
      }`}
    >
      <ClipLoader color={color} loading={loading} size={size} />
    </div>
  );
}
