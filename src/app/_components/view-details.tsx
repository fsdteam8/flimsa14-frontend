import React, { Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SingleMovieResponse } from "@/components/types/view-details-page-data-type";
import VideoPlayer from "@/components/video/VideoPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";

const ViewDetails = ({
  open,
  onOpenChange,
  videoId,
}: {
  open: boolean;
  onOpenChange: () => void;
  videoId?: string | null;
}) => {
  console.log(`Video ID 4: ${videoId}`);

  const { data, isLoading, isError, error } = useSuspenseQuery<SingleMovieResponse>({
    queryKey: ["single-movie", videoId],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movies/${videoId}`).then(
        (res) => res.json()
      ),
    retry: 3,
  });

  console.log(data?.data);

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
        <DialogContent
          className="bg-[#111827] p-2 text-white border-0 shadow-xl rounded-lg"
        >
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

          <ScrollArea className="h-[210px] rounded-md p-2">
            <DialogDescription className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              <div className="md:col-span-1">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white">
                  {data?.data?.title || ""}
                </h3>
                <p className="text-base md:text-lg font-normal leading-[120%] text-gray-300 py-2">
                  {data?.data?.description || ""}
                </p>
              </div>
              <div className="md:col-span-1">
                <h4 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-[120%] text-white">
                  <strong>Director Name :</strong>{" "}
                  {data?.data?.directors.join(", ") || ""}
                </h4>
                <p className="text-base md:text-lg font-normal leading-[120%] text-gray-300 py-2">
                  <strong>Duration :</strong> {data?.data?.duration || ""}
                </p>
                <p className="text-base md:text-lg font-normal leading-[120%] text-gray-300">
                  <strong>Language :</strong> {data?.data?.language || ""}
                </p>
              </div>
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDetails;
