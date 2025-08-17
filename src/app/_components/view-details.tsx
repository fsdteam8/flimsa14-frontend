import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Player } from "video-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { ViewVideoDetailResponse } from "@/components/types/view-details-page-data-type";

const ViewDetails = ({
  open,
  onOpenChange,
  videoId,
}: {
  open: boolean;
  onOpenChange: () => void;
  videoId?: number | null;
}) => {
  console.log(`Video ID 4: ${videoId}`);

  function convertToCDNUrl(s3Url?: string): string {
    const s3BaseUrl = "https://flimsabucket.s3.us-east-2.amazonaws.com";
    const cdnBaseUrl = "https://d21phq2m56xwn6.cloudfront.net";

    if (typeof s3Url === "string" && s3Url.startsWith(s3BaseUrl)) {
      return s3Url.replace(s3BaseUrl, cdnBaseUrl);
    }

    return s3Url || "";
  }

  const { data, isLoading, isError, error } = useQuery<ViewVideoDetailResponse>(
    {
      queryKey: ["single-propular-movie", videoId],
      queryFn: () =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getByContentId/${videoId}`
        ).then((res) => res.json()),
    }
  );

  // console.log(data?.data);
  const filterVideo = data?.data;
  console.log("Filter Video:", filterVideo);

  const videoUrl = JSON.parse(filterVideo?.video1 || "{}") || "";

  const cdnUrl = convertToCDNUrl(videoUrl.s3Url);

  console.log(cdnUrl);

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
        <DialogContent className="bg-white p-5">
          <div className="p-5">
            <Player
              playsInline
              poster={filterVideo?.image || ""}
              src={cdnUrl || ""}
            />
          </div>
          <DialogDescription className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            <div className="md:col-span-1">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-black">{filterVideo?.title || ""}</h3>
              <p className="text-base md:text-lg font-normal leading-[120%] text-black py-2">{filterVideo?.description || ""}</p>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-[120%] text-black"><strong>Director Name :</strong> {filterVideo?.director_name || ""}</h4>
              <p className="text-base md:text-lg font-normal leading-[120%] text-black py-2"><strong>Duration :</strong> {filterVideo?.duration || ""}</p>
              <p className="text-base md:text-lg font-normal leading-[120%] text-black"><strong>View Count :</strong> {filterVideo?.view_count || ""}</p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDetails;
