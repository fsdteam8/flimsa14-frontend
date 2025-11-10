import React, { Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SingleMovieResponse } from "@/components/types/view-details-page-data-type";
import VideoPlayer from "@/components/video/VideoPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";
import moment from "moment";

const ViewDetails = ({
  open,
  onOpenChange,
  videoId,
}: {
  open: boolean;
  onOpenChange: () => void;
  videoId?: string | null;
}) => {

  const { data, isLoading, isError, error } =
    useSuspenseQuery<SingleMovieResponse>({
      queryKey: ["single-movie", videoId],
      queryFn: () =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movies/${videoId}`).then(
          (res) => res.json()
        ),
      retry: 3,
    });


  if (isError) {
    console.error(error);
    return <div>Error loading movie details</div>;
  }
  if (isLoading) {
    return <div>Loading movie details...</div>;
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#111111] p-2 text-white border-0 shadow-xl rounded-lg h-full flex items-center">
          <ScrollArea className="h-[96%]  rounded-md p-2 border-2">
            <div className="p-2">
              <Suspense fallback={<div>Loading...</div>}>
                <VideoPlayer
                  src={data?.data?.videoUrl || ""}
                  poster={data?.data?.thumbnailUrl || ""}
                  title={data?.data?.title || "Movie Video"}
                  className="mx-auto"
                  movieId={data?.data?._id || ""}
                />
              </Suspense>
            </div>

            <DialogDescription className="pb-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white">
                {data?.data?.title || ""}
              </h3>
              <p className="text-sm md:text-base lg:text-lg font-normal leading-[120%] text-gray-300 py-2">
                {data?.data?.description || ""}
              </p>
              <p>
                Release Date :{" "}
                {data?.data?.releaseDate
                  ? moment(data.data.releaseDate).format("YYYY MM DD")
                  : ""}
              </p>
              <p className="text-sm md:text-base lg:text-lg font-normal leading-[120%] text-gray-300 py-2">
                <strong>Language :</strong> {data?.data?.language || ""}
              </p>
              <p className="text-sm md:text-base lg:text-lg font-normal leading-[120%] text-gray-300">
                <strong>Duration :</strong> {data?.data?.duration || ""}
              </p>
              <p className="text-sm md:text-base lg:text-lg font-normal leading-[120%] text-gray-300 py-2">
                <strong>Cast :</strong> {data?.data?.cast.join(", ") || ""}
              </p>
              <p className="text-sm md:text-base lg:text-lg font-normal leading-[120%] text-gray-300">
                <strong>Directors :</strong>{" "}
                {data?.data?.directors.join(", ") || ""}
              </p>
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDetails;
