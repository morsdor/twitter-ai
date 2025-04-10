"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MediaDisplay from "./media-display";

interface TweetEditorProps {
  tweets: string[];
  media: {
    tweetIndex: number;
    url: string;
    type: string;
    file?: File;
  }[];
  onTweetChange: (index: number, text: string) => void;
  onMediaAdd: (media: NewMedia[]) => void;
  onMediaRemove: (index: number) => void;
  onAddTweet: () => void;
  onRemoveTweet: (index: number) => void;
}

type NewMedia = {
  tweetIndex: number;
  url: string;
  type: string;
  file?: File;
};

export default function TweetEditor({
  tweets,
  media,
  onTweetChange,
  onMediaAdd,
  onMediaRemove,
  onAddTweet,
  onRemoveTweet,
}: TweetEditorProps) {
  const [mediaRef, setMediaRef] = useState<NewMedia[]>([]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupObjectUrls(mediaRef);
    };
  }, []);

  const cleanupObjectUrls = (
    mediaItems: Array<{ url: string; file?: File }>
  ) => {
    mediaItems.forEach((item) => {
      if (item.file) {
        URL.revokeObjectURL(item.url);
      }
    });
  };

  const handleFileSelect = (
    tweetIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newMedia: Array<NewMedia> = Array.from(files).map((file) => ({
      tweetIndex: tweetIndex,
      url: URL.createObjectURL(file),
      type: file.type,
      file,
    }));

    const updatedCurrentMedia = [...mediaRef, ...newMedia];

    setMediaRef(updatedCurrentMedia);

    onMediaAdd(newMedia);
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = [...media];
    const removedItem = newMedia.splice(index, 1)[0];
    if (removedItem?.file) {
      URL.revokeObjectURL(removedItem.url);
    }
    onMediaRemove(index);
  };

  return (
    <div className="space-y-6">
      {tweets.map((tweet, tweetIndex) => (
        <div key={tweetIndex} className="space-y-2 border p-4 rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              {tweets.length > 1
                ? `Tweet ${tweetIndex + 1} of ${tweets.length}`
                : "Your Tweet"}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {280 - tweet.length} characters left
              </Badge>
              {tweets.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveTweet(tweetIndex)}
                  aria-label="Remove tweet"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={tweet}
            onChange={(e) => onTweetChange(tweetIndex, e.target.value)}
            maxLength={280}
            className="min-h-[100px]"
          />

          {/* Media section for this tweet */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Add Media</h3>
            <div className="flex gap-2">
              <label
                htmlFor={`media-upload-${tweetIndex}`}
                className="relative w-full"
              >
                <input
                  type="file"
                  id={`media-upload-${tweetIndex}`}
                  accept="image/*,video/*,.gif"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileSelect(tweetIndex, e)}
                />
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media
                </Button>
              </label>
            </div>
            <MediaDisplay
              tweetIndex={tweetIndex}
              media={mediaRef}
              handleRemoveMedia={handleRemoveMedia}
            />
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={onAddTweet}
        className="w-full"
        data-testid="add-tweet-button"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Tweet
      </Button>
    </div>
  );
}
