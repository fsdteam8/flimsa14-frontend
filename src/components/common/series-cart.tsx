"use client"
import { useState } from "react"
import type { Series } from "@/app/_components/series-movies"
import SeriesModal from "./series-modal"

const SeriesCart = ({ blog }: { blog: Series }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <div
        onClick={() => {
          setIsOpen(true)
        }}
        className="relative"
      >
        <div
          style={{ backgroundImage: `url(${blog?.thumbnailUrl || "/assets/images/no-img-available.jpg"})` }}
          className="bg-cover bg-center bg-no-repeat h-[350px] w-full object-cover rounded-[14px] cursor-pointer"
        ></div>
        <div className="absolute bottom-3 right-0 left-0">
          <h5 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white text-center ">
            {blog?.title}
          </h5>
          <p className="text-base md:text-lg font-medium leading-[120%] text-white text-center pt-1">
            {blog?.genre[0]?.title || "Genre Not Available"}
          </p>
        </div>
      </div>
      <SeriesModal series={blog} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

export default SeriesCart
