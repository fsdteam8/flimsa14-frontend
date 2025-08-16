import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Player } from "video-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ContentResponse } from "./popular-data-type";
import { useQuery } from "@tanstack/react-query";

const ViewDetails = ({
  open,
  onOpenChange,
  videoId,
}: {
  open: boolean;
  onOpenChange: () => void;
  videoId?: number | null;
}) => {
  console.log(`Video ID: ${videoId}`);

  function convertToCDNUrl(s3Url?: string): string {
    const s3BaseUrl = "https://flimsabucket.s3.us-east-2.amazonaws.com";
    const cdnBaseUrl = "https://d21phq2m56xwn6.cloudfront.net";

    if (typeof s3Url === "string" && s3Url.startsWith(s3BaseUrl)) {
      return s3Url.replace(s3BaseUrl, cdnBaseUrl);
    }

    return s3Url || "";
  }
  

  const { data, isLoading, isError, error } = useQuery<ContentResponse>({
    queryKey: ["single-propular-movie"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contents`).then((res) =>
        res.json()
      ),
  });

  console.log(data?.data?.data);

  const filterVideo = data?.data?.data?.find((video) => video.id === videoId);
  console.log(filterVideo)

  const videoUrl = JSON.parse(filterVideo?.video1 || "{}") || "";

  const cdnUrl = convertToCDNUrl(videoUrl.s3Url);

  console.log(cdnUrl)


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
          <DialogDescription className="pb-10">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDetails;
