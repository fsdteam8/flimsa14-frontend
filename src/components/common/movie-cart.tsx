import { movieDataType } from "@/app/_components/movie-data-type";
import React from "react";

const MovieCart = ({ blog }: { blog: movieDataType }) => {
  
  return (
    <div className="relative">
      <div
        style={{ backgroundImage: `url(${blog?.img})` }}
        className="bg-cover bg-center bg-no-repeat h-[350px] w-full object-cover rounded-[14px] cursor-pointer"
      ></div>
      <div className="absolute bottom-3 right-0 left-0">
        <h5 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[120%] text-white text-center ">
          {blog?.title}
        </h5>
        <p className="text-lg font-medium leading-[120%] text-white text-center pt-1">
          {blog?.type}
        </p>
      </div>
    </div>
  );
};

export default MovieCart;
