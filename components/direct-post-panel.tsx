"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import TweetEditor from "@/components/tweet-editor"
import TweetPreview from "@/components/tweet-preview"

export default function DirectPostPanel() {
  const [tweets, setTweets] = useState<string[]>([""])
  const [media, setMedia] = useState<{ tweetIndex: number; url: string; type: "image" | "video" | "gif"; file?: File }[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [view, setView] = useState<"edit" | "preview">("edit")

  const handleTweetEdit = (index: number, newText: string) => {
    const newTweets = [...tweets]
    newTweets[index] = newText
    setTweets(newTweets)
  }

  const handleAddTweet = () => {
    setTweets([...tweets, ""])
  }

  const handleRemoveTweet = (index: number) => {
    if (tweets.length <= 1) return
    const newTweets = [...tweets]
    newTweets.splice(index, 1)
    setTweets(newTweets)
  }

  const handleMediaUpload = (type: "image" | "video" | "gif", tweetIndex: number, newMedia: Array<{
    tweetIndex: number;
    url: string;
    type: "image" | "video" | "gif";
    file?: File;
  }>) => {
    setMedia(prevMedia => {
      // Remove existing media for this tweet
      const existingMedia = prevMedia.filter(m => m.tweetIndex !== tweetIndex);
      
      // Add new media
      const updatedMedia = [...existingMedia, ...newMedia];
      
      // Clean up any previous object URLs
      newMedia.forEach(item => {
        if (item.file) {
          URL.revokeObjectURL(item.url);
        }
      });
      
      return updatedMedia;
    });
  }

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
  }

  const handlePostTweets = async () => {
    if (tweets.some((tweet) => !tweet.trim())) {
      alert("Please fill in all tweets before posting")
      return
    }

    setIsPosting(true)

    try {
      // In a real app, this would call the API
      const response = await fetch("/api/post-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets, media }),
      })

      if (!response.ok) throw new Error("Failed to post tweets")

      alert("Tweets posted successfully!")

      // Reset the form
      setTweets([""])
      setMedia([])
      setView("edit")
    } catch (error) {
      console.error("Error posting tweets:", error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Directly to X</CardTitle>
      </CardHeader>
      <CardContent>
        {view === "edit" ? (
          <TweetEditor
            tweets={tweets}
            media={media}
            onTweetChange={handleTweetEdit}
            onMediaAdd={handleMediaUpload}
            onMediaRemove={removeMedia}
            onAddTweet={handleAddTweet}
            onRemoveTweet={handleRemoveTweet}
          />
        ) : (
          <TweetPreview tweets={tweets} media={media} />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setView(view === "edit" ? "preview" : "edit")}>
          {view === "edit" ? "Preview" : "Edit"}
        </Button>
        <Button
          onClick={handlePostTweets}
          disabled={isPosting || tweets.some((tweet) => !tweet.trim())}
          data-testid="post-button"
        >
          {isPosting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Post to X
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
