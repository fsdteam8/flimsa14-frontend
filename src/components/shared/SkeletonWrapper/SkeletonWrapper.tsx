import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface SkeletonWrapperProps {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  width = "100%",
  height = "250px",
  className = "",
  count = 1,
}) => {
  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[...Array(count)].map((_, index) => (
        <Skeleton
          key={index}
          className={`rounded-lg bg-white ${className}`}
          style={{ width, height }}
        />
      ))}
    </div>
  );
};

export default SkeletonWrapper;
