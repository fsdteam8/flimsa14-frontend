import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Player } from "video-react";
import { DialogDescription } from "@radix-ui/react-dialog";

const ViewDetails = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white p-5">
          <div className="p-5">
            <Player
              playsInline
              poster="/assets/images/movie1.jpg"
              src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
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
