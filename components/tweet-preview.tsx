import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <div className="space-y-6">
      {tweets.map((tweet, index) => (
        <Card key={index} className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://github.com/shadcn.png" alt="Shadcn" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">AI Tweet Generator</h3>
                <p className="text-sm text-muted-foreground">@ai_tweets</p>
              </div>
            </div>

            <p className="text-lg leading-relaxed mb-4">{tweet}</p>

            {/* Show media specific to this tweet */}
            {media
              .filter((m) => m.tweetIndex === index)
              .map((mediaItem, mediaIndex) => (
                <div key={mediaIndex} className="mb-4">
                  {mediaItem.type.startsWith('image/') ? (
                    <img
                      src={mediaItem.url}
                      alt={`Tweet media ${mediaIndex + 1}`}
                      className="w-full max-h-[400px] object-contain rounded-lg"
                    />
                  ) : mediaItem.type.startsWith('video/') ? (
                    <video
                      src={mediaItem.url}
                      className="w-full max-h-[400px] object-contain rounded-lg"
                      controls
                    />
                  ) : null}
                </div>
              ))}

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </button>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </button>
              </div>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M20 15v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="16 8 12 4 8 8"></polyline>
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
