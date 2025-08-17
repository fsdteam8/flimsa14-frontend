import { TextAnimate } from "@/components/magicui/text-animate";
import Image from "next/image";
import React from "react";

interface Props {
  message: string;
}

const NotFound = ({ message }: Props) => {
  return (
    <div className="container w-full h-[350px] flex flex-col items-center justify-center bg-white rounded-[16px]">
      {/* Image */}
      <Image
        src="/assets/images/404.png"
        alt="404 Not Found Illustration"
        width={300}
        height={300}
        className="mb-4 w-[250px] h-[250px]"
      />

      {/* Text Animation applied to message string only */}
      <p className="text-lg font-bold text-gradient text-center w-1/3">
        <TextAnimate animation="slideUp" by="word">
          {message}
        </TextAnimate>
      </p>
    </div>
  );
};

export default NotFound;
