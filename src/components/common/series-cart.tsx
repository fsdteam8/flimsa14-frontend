"use client"

import type { Series } from "@/types/series"

const getGenreLabel = (genre?: { title?: string; name?: string }) =>
  genre?.title || genre?.name || "Genre"

const SeriesCart = ({
  blog,
  onSelect,
}: {
  blog: Series
  onSelect?: (series: Series) => void
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(blog)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect?.(blog)
        }
      }}
      className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-[14px]"
    >
      <div
        style={{ backgroundImage: `url(${blog?.thumbnailUrl || "/assets/images/no-img-available.jpg"})` }}
        className="bg-cover bg-center bg-no-repeat h-[350px] w-full object-cover rounded-[14px]"
      ></div>
      <div className="absolute bottom-3 right-0 left-0 pointer-events-none">
        <h5 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white text-center ">
          {blog?.title}
        </h5>
        <p className="text-base md:text-lg font-medium leading-[120%] text-white text-center pt-1">
          {getGenreLabel(blog?.genre?.[0])}
        </p>
      </div>
    </div>
  )
}

export default SeriesCart
