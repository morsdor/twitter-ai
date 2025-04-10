import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from "react";

type NewMedia = {
  tweetIndex: number;
  url: string;
  type: string;
  file?: File;
};

interface TweetPreviewProps {
  tweets: string[];
  media: NewMedia[];
}

export default function TweetPreview({ tweets, media }: TweetPreviewProps) {
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = media.map((mediaItem) => {
      if (mediaItem.file) {
        return URL.createObjectURL(mediaItem.file);
      }
      return mediaItem.url;
    });

    setMediaUrls(urls);

    return () => {
      // Cleanup object URLs
      urls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [media]);

  return (
    <div className="space-y-8">
      {tweets.map((tweet, index) => (
        <Card key={index} className="border-0 bg-card/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://github.com/shadcn.png" alt="Shadcn" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">AI Tweet Generator</h3>
                <p className="text-sm text-muted-foreground">@ai_tweets</p>
              </div>
            </div>

            <p className="text-lg leading-relaxed mb-6">{tweet}</p>

            {/* Show media specific to this tweet */}
            {media
              .filter((m) => m.tweetIndex === index)
              .map((mediaItem, mediaIndex) => (
                <div key={mediaIndex} className="mb-6">
                  {mediaItem.type.startsWith("image/") ? (
                    <img
                      src={mediaUrls[mediaIndex]}
                      alt={`Tweet media ${mediaIndex + 1}`}
                      className="w-full max-h-[400px] object-contain rounded-xl shadow-xl"
                    />
                  ) : mediaItem.type.startsWith("video/") ? (
                    <video
                      src={mediaUrls[mediaIndex]}
                      className="w-full max-h-[400px] object-contain rounded-xl shadow-xl"
                      controls
                      controlsList="nodownload"
                    />
                  ) : null}
                </div>
              ))}

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-4 text-muted-foreground">
                <button className="group hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <span className="group-hover:text-primary transition-colors">Reply</span>
                  </div>
                </button>
                <button className="group hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="group-hover:text-primary transition-colors">Retweet</span>
                  </div>
                </button>
                <button className="group hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span className="group-hover:text-primary transition-colors">Like</span>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">{formatDistanceToNow(new Date())}</span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">{formatDistanceToNow(new Date())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
