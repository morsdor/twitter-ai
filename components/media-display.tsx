import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./ui/button";

type NewMedia = {
  tweetIndex: number;
  url: string;
  type: string;
  file?: File;
};

const MediaDisplay = ({
  tweetIndex,
  media,
  handleRemoveMedia,
}: {
  tweetIndex: number;
  media: NewMedia[];
  handleRemoveMedia: (index: number) => void;
}) => {
  const tweetMedia = media.filter((m) => m.tweetIndex === tweetIndex);

  const newMediaUrls = tweetMedia.map((item) => ({
    url: URL.createObjectURL(item.file!),
    type: item.type,
  }));

  // Create URLs when media changes
  useEffect(() => {
    // Create object URLs for the media

    // Cleanup function to revoke URLs when component unmounts or media changes
    return () => {
      newMediaUrls.forEach((item) => {
        if (item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);

  if (tweetMedia.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {newMediaUrls.map((item, index) => (
        <div key={index} className="relative group">
          <div className="rounded-md overflow-hidden">
            {item.type === "video" ? (
              <video
                src={item.url}
                className="w-full h-auto object-cover"
                controls
              />
            ) : (
              <img
                src={item.url}
                alt={`Media ${index + 1}`}
                className="w-full h-auto object-cover"
              />
            )}
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemoveMedia(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default MediaDisplay;
