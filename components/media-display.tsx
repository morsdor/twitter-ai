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

  // Create a map of URLs to prevent duplicates
  const urlMap = new Map<string, { url: string; type: string }>();
  
  // Create URLs only for new files and track them
  tweetMedia.forEach((item) => {
    if (item.file) {
      const url = URL.createObjectURL(item.file);
      urlMap.set(url, { url, type: item.type });
    }
  });

  // Cleanup function to revoke URLs when component unmounts or media changes
  useEffect(() => {
    return () => {
      urlMap.forEach((item) => {
        if (item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);

  if (tweetMedia.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {Array.from(urlMap.values()).map((item, index) => (
        <div key={index} className="relative group">
          <div className="rounded-md overflow-hidden">
            {item.type.startsWith('image/') ? (
              <img
                src={item.url}
                alt={`Tweet media ${index + 1}`}
                className="w-full h-auto max-h-[200px] object-cover"
              />
            ) : item.type.startsWith('video/') ? (
              <video
                src={item.url}
                className="w-full h-auto max-h-[200px] object-cover"
                controls
              />
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
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
