import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface TweetPreviewProps {
  tweets: string[]
  media: { url: string; type: string }[]
}

export default function TweetPreview({ tweets, media }: TweetPreviewProps) {
  return (
    <div className="space-y-6">
      {tweets.map((tweet, index) => (
        <Card key={index} className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Your Name</span>
                  <span className="text-muted-foreground">@yourusername</span>
                </div>
                <p className="whitespace-pre-wrap">{tweet}</p>

                {index === 0 && media.length > 0 && (
                  <div className={`grid ${media.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-3`}>
                    {media.map((item, mediaIndex) => (
                      <img
                        key={mediaIndex}
                        src={item.url || "/placeholder.svg"}
                        alt={`Media ${mediaIndex + 1}`}
                        className="rounded-md w-full h-auto object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                  <span>4:20 PM · Apr 9, 2025</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
