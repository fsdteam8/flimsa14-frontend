import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import VideoPlayer from "@/components/video/VideoPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";


export interface Episode {
  _id: string;
  title: string;
  description: string;
  episodeNumber: number;
  videoUrl: string;
  duration: number;
  thumbnailUrl: string;
  releaseDate: string; // ISO date string
}

export interface Season {
  _id: string;
  seasonNumber: number;
  name: string;
  trailerUrl: string;
  thumbnailUrl: string;
  episodes: Episode[];
}

export interface Series {
  _id: string;
  title: string;
  description: string;
  genre: string[]; // genre IDs
  cast: string[]; // appears to contain stringified arrays like ["[\"sdad\"]"]
  thumbnailUrl: string;
  trailerUrl: string;
  status: string; // e.g., "ongoing"
  seasons: Season[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SeriesResponse {
  success: boolean;
  message: string;
  data: Series;
}


const SeriesViewDetails = ({
  open,
  onOpenChange,
  videoId,
}: {
  open: boolean;
  onOpenChange: () => void;
  videoId?: string | null;
}) => {
  console.log(`Video ID 4: ${videoId}`);

  const { data, isLoading, isError, error } = useQuery<SeriesResponse>({
    queryKey: ["single-series", videoId],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/series/${videoId}`).then(
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
          <div className="p-2">
            <VideoPlayer
              src={data?.data?.trailerUrl || ""}
              poster={data?.data?.thumbnailUrl || ""}
              title={data?.data?.title || "Movie Video"}
              className="mx-auto"
            />
          </div>

          <ScrollArea className="h-[210px] rounded-md border p-2">
            <DialogDescription className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              <div className="md:col-span-1">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-black">
                  {data?.data?.title || ""}
                </h3>
                <p className="text-base md:text-lg font-normal leading-[120%] text-black py-2">
                  {data?.data?.description || ""}
                </p>
              </div>
              {/* <div className="md:col-span-1">
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
              </div> */}
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeriesViewDetails;
