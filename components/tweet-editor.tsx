"use client"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageIcon, FileVideo, Smile, X, Plus, Trash2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface TweetEditorProps {
  tweets: string[]
  media: {
    tweetIndex: number
    url: string
    type: "image" | "video" | "gif"
    file?: File
  }[]
  onTweetChange: (index: number, text: string) => void
  onMediaAdd: (type: "video" | "image" | "gif", tweetIndex: number, media: {
    tweetIndex: number
    url: string
    type: "image" | "video" | "gif"
    file?: File
  }[]) => void
  onMediaRemove: (index: number) => void
  onAddTweet: () => void
  onRemoveTweet: (index: number) => void
}

export default function TweetEditor({
  tweets,
  media,
  onTweetChange,
  onMediaAdd,
  onMediaRemove,
  onAddTweet,
  onRemoveTweet,
}: TweetEditorProps) {
  const mediaRef = useRef<Array<{ url: string; file?: File }>>([]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupObjectUrls(mediaRef.current);
    };
  }, []);

  const cleanupObjectUrls = (mediaItems: Array<{ url: string; file?: File }>) => {
    mediaItems.forEach(item => {
      if (item.file) {
        URL.revokeObjectURL(item.url);
      }
    });
  };

  const handleFileSelect = (tweetIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Clean up existing object URLs for this tweet
    const existingMedia = media.filter(m => m.tweetIndex === tweetIndex);
    cleanupObjectUrls(existingMedia);

    const newMedia: Array<{
      tweetIndex: number;
      url: string;
      type: "image" | "video" | "gif";
      file?: File;
    }> = Array.from(files).map(file => ({
      tweetIndex: tweetIndex,
      url: URL.createObjectURL(file),
      type: file.type.includes('image/') ? 'image' : file.type.includes('video/') ? 'video' : 'gif',
      file
    }));

    // Update the media ref
    mediaRef.current = newMedia;

    // Get existing media for other tweets
    const otherMedia = media.filter(m => m.tweetIndex !== tweetIndex);
    
    // Update the media array
    const allMedia = [...otherMedia, ...newMedia];
    
    // Call onMediaAdd with the entire updated media array
    onMediaAdd('image', tweetIndex, allMedia);
  }

  const MediaDisplay = ({ tweetIndex }: { tweetIndex: number }) => {
    const tweetMedia = media.filter(m => m.tweetIndex === tweetIndex);

    // Cleanup old URLs when media changes
    useEffect(() => {
      const oldUrls = mediaRef.current.map(item => item.url);
      return () => {
        cleanupObjectUrls(mediaRef.current);
        // Create new object URLs for the new media
        mediaRef.current = tweetMedia.map(item => ({
          ...item,
          url: URL.createObjectURL(item.file!)
        }));
      };
    }, [tweetMedia]);

    if (tweetMedia.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {tweetMedia.map((item, index) => (
          <div key={index} className="relative group">
            <div className="rounded-md overflow-hidden">
              {item.type === 'video' ? (
                <video
                  src={mediaRef.current[index].url}
                  className="w-full h-auto object-cover"
                  controls
                />
              ) : (
                <img
                  src={mediaRef.current[index].url}
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
              {tweets.length > 1 ? `Tweet ${tweetIndex + 1} of ${tweets.length}` : "Your Tweet"}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{280 - tweet.length} characters left</Badge>
              {tweets.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => onRemoveTweet(tweetIndex)} aria-label="Remove tweet">
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
              <label htmlFor={`media-upload-${tweetIndex}`} className="relative w-full">
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
            <MediaDisplay tweetIndex={tweetIndex} />
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={onAddTweet} className="w-full" data-testid="add-tweet-button">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Tweet
      </Button>
    </div>
  )
}
