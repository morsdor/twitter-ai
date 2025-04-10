"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send } from "lucide-react";
import TweetEditor from "@/components/tweet-editor";
import TweetPreview from "@/components/tweet-preview";
import DirectPostPanel from "@/components/direct-post-panel";

type NewMedia = {
  tweetIndex: number;
  url: string;
  type: string;
  file?: File;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tweets, setTweets] = useState<string[]>([]);
  const [media, setMedia] = useState<NewMedia[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Map<string, string>>(new Map());
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    return () => {
      mediaUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mediaUrls]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // In a real app, this would call the API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate tweets");

      const data = await response.json();
      setTweets(
        data.tweets || [
          prompt.length > 50
            ? "Here's the first tweet in the thread based on your request! #AI #Content"
            : "Here's a single tweet based on your request! This is AI-generated content that's ready to share. #AI #Content",
        ]
      );
      setActiveTab("edit");
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTweet = () => {
    setTweets([...tweets, ""]);
  };

  const handleTweetEdit = (index: number, newText: string) => {
    const newTweets = [...tweets];
    newTweets[index] = newText;
    setTweets(newTweets);
  };

  const handleRemoveTweet = (index: number) => {
    if (tweets.length <= 1) return;
    const newTweets = [...tweets];
    newTweets.splice(index, 1);
    setTweets(newTweets);
  };

  const handleMediaUpload = (newMedia: Array<NewMedia>) => {
    setMedia(prevMedia => {
      // Create URLs for new files if they don't already exist
      const updatedMedia = [...prevMedia, ...newMedia];
      updatedMedia.forEach(item => {
        if (item.file && !mediaUrls.has(item.file.name)) {
          const url = URL.createObjectURL(item.file);
          // Store the URL in the mediaUrls map
          setMediaUrls(prev => {
            const newMap = new Map(prev);
            newMap.set(item.file.name, url);
            return newMap;
          });
          // Also update the item's url property
          item.url = url;
        }
      });
      return updatedMedia;
    });
  };

  const removeMedia = (index: number) => {
    setMedia(prev => {
      const removedMedia = prev[index];
      if (removedMedia?.file) {
        const url = mediaUrls.get(removedMedia.file.name);
        if (url) {
          URL.revokeObjectURL(url);
          setMediaUrls(prev => {
            prev.delete(removedMedia.file.name);
            return new Map(prev);
          });
        }
      }
      return prev.filter((_, i) => i !== index);
    });
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
          // If we have a file, send it directly
          if (mediaItem.file) {
            formData.append(
              `media[${index}]`,
              mediaItem.file,
              mediaItem.file.name
            );
            formData.append(`mediaType[${index}]`, mediaItem.type);
            formData.append(
              `mediaTweetIndex[${index}]`,
              mediaItem.tweetIndex.toString()
            );
          } else {
            // For URLs, keep the current approach
            formData.append(
              `media[${index}]`,
              JSON.stringify({
                type: mediaItem.type,
                url: mediaItem.url,
                tweetIndex: mediaItem.tweetIndex,
              })
            );
          }
        });
      }

      const response = await fetch("/api/post-tweet", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Tweets posted successfully!");
      setIsPosting(false);
      // Reset form
      setTweets([]);
      setMedia([]);
    } catch (error) {
      console.error("Error posting tweets:", error);
      alert("Failed to post tweets. Please try again.");
      setIsPosting(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    setGeneratedImages([]);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = await response.json();
      setGeneratedImages(data.imageUrls || []);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            AI Tweet Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Generate and post tweets with AI-powered content and images
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-2 mb-6 rounded-lg bg-card p-1">
            <TabsTrigger
              value="image"
              className="data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground"
            >
              Image
            </TabsTrigger>
            <TabsTrigger
              value="generate"
              className="data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground"
            >
              Generate
            </TabsTrigger>
            <TabsTrigger
              value="edit"
              disabled={tweets.length === 0}
              className="data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground"
            >
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              disabled={tweets.length === 0}
              className="data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="direct-post"
              className="data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground"
            >
              Post
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Tweet Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your prompt here... (e.g., 'Create a tweet about the benefits of AI in content creation')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px]"
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Tweets"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Image</CardTitle>
                <CardDescription>
                  Describe the image you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the image you want to generate..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="w-full"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Image...
                      </>
                    ) : (
                      "Generate Image"
                    )}
                  </Button>

                  {generatedImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Generated Images
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {generatedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="rounded-lg overflow-hidden"
                          >
                            <img
                              src={imageUrl}
                              alt={`Generated image ${index + 1}`}
                              className="w-full h-auto max-h-[200px] object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Your Tweets</CardTitle>
              </CardHeader>
              <CardContent>
                <TweetEditor
                  tweets={tweets}
                  media={media}
                  mediaUrls={mediaUrls}
                  onTweetChange={handleTweetEdit}
                  onMediaAdd={handleMediaUpload}
                  onMediaRemove={removeMedia}
                  onAddTweet={handleAddTweet}
                  onRemoveTweet={handleRemoveTweet}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("generate")}
                >
                  Back
                </Button>
                <Button onClick={() => setActiveTab("preview")}>Preview</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Tweets</CardTitle>
              </CardHeader>
              <CardContent>
                <TweetPreview tweets={tweets} media={media} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("edit")}>
                  Edit
                </Button>
                <Button onClick={handlePostTweets} disabled={isPosting}>
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
          </TabsContent>

          <TabsContent value="direct-post" className="space-y-6">
            <DirectPostPanel />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
