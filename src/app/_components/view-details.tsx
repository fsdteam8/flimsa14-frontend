import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { SingleMovieResponse } from "@/components/types/view-details-page-data-type";
import VideoPlayer from "@/components/video/VideoPlayer";

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

  const { data, isLoading, isError, error } = useQuery<SingleMovieResponse>({
    queryKey: ["single-movie", videoId],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movies/${videoId}`).then(
        (res) => res.json()
      ),
  });

  console.log(data?.data);

  if (isError) {
    console.error(error);
    return <div>Error loading popular movies</div>;
  }
  if (isLoading) {
    return <div>Loading popular movies...</div>;
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white p-2">
          <div className="p-2 ">
            <VideoPlayer
              src={data?.data?.videoUrl || ""}
              poster={data?.data?.thumbnailUrl || ""}
              title={data?.data?.title || "Movie Video"}
              className="mx-auto"
            />
          </div>
          <DialogDescription className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 h-[200px] overflow-y-auto">
            <div className="md:col-span-1">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-black">
                {data?.data?.title || ""}
              </h3>
              <p className="text-base md:text-lg font-normal leading-[120%] text-black py-2">
                {data?.data?.description || ""}
              </p>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-[120%] text-black">
                <strong>Director Name :</strong>{" "}
                {data?.data?.directors.join(", ") || ""}
              </h4>
              <p className="text-base md:text-lg font-normal leading-[120%] text-black py-2">
                <strong>Duration :</strong> {data?.data?.duration || ""}
              </p>
              <p className="text-base md:text-lg font-normal leading-[120%] text-black">
                <strong>Language :</strong> {data?.data?.language || ""}
              </p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDetails;
