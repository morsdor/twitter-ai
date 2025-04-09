"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import TweetEditor from "@/components/tweet-editor";
import TweetPreview from "@/components/tweet-preview";

type NewMedia = {
  tweetIndex: number;
  url: string;
  type: string;
  file?: File;
};

export default function DirectPostPanel() {
  const [tweets, setTweets] = useState<string[]>([""]);
  const [media, setMedia] = useState<NewMedia[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [view, setView] = useState<"edit" | "preview">("edit");

  const handleTweetEdit = (index: number, newText: string) => {
    const newTweets = [...tweets];
    newTweets[index] = newText;
    setTweets(newTweets);
  };

  const handleAddTweet = () => {
    setTweets([...tweets, ""]);
  };

  const handleRemoveTweet = (index: number) => {
    if (tweets.length <= 1) return;
    const newTweets = [...tweets];
    newTweets.splice(index, 1);
    setTweets(newTweets);
  };

  const handleMediaUpload = (tweetIndex: number, newMedia: Array<NewMedia>) => {
    setMedia((prevMedia) => {
      // Remove existing media for this tweet
      const existingMedia = prevMedia.filter(
        (m) => m.tweetIndex !== tweetIndex
      );

      // Add new media
      const updatedMedia = [...existingMedia, ...newMedia];

      // Clean up any previous object URLs
      newMedia.forEach((item) => {
        if (item.file) {
          URL.revokeObjectURL(item.url);
        }
      });

      return updatedMedia;
    });
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handlePostTweets = async () => {
    if (tweets.some((tweet) => !tweet.trim())) {
      alert("Please fill in all tweets before posting");
      return;
    }

    setIsPosting(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add tweets as JSON string
      formData.append("tweets", JSON.stringify(tweets));

      // Add media files
      if (media && media.length > 0) {
        media.forEach((mediaItem, index) => {
          if (mediaItem.file) {
            formData.append(`media[${index}]`, mediaItem.file);
          }
        });
      }

      console.log(formData);

      const response = await fetch("/api/post-tweet", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert("Tweets posted successfully!");
      setIsPosting(false);
      // Reset form
      setTweets(["", "", ""]);
      setMedia([]);
    } catch (error) {
      console.error("Error posting tweets:", error);
      alert("Failed to post tweets. Please try again.");
      setIsPosting(false);
    }
  };

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
        <Button
          variant="outline"
          onClick={() => setView(view === "edit" ? "preview" : "edit")}
        >
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
  );
}
