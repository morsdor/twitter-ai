"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send } from "lucide-react"
import TweetEditor from "@/components/tweet-editor"
import TweetPreview from "@/components/tweet-preview"
import DirectPostPanel from "@/components/direct-post-panel"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [tweets, setTweets] = useState<string[]>([])
  const [media, setMedia] = useState<{ tweetIndex: number; url: string; type: "image" | "video" | "gif" }[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    try {
      // In a real app, this would call the API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error("Failed to generate tweets")

      const data = await response.json()
      setTweets(
        data.tweets || [
          prompt.length > 50
            ? "Here's the first tweet in the thread based on your request! #AI #Content"
            : "Here's a single tweet based on your request! This is AI-generated content that's ready to share. #AI #Content",
        ],
      )
      setActiveTab("edit")
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddTweet = () => {
    setTweets([...tweets, ""])
  }

  const handleTweetEdit = (index: number, newText: string) => {
    const newTweets = [...tweets]
    newTweets[index] = newText
    setTweets(newTweets)
  }

  const handleRemoveTweet = (index: number) => {
    if (tweets.length <= 1) return
    const newTweets = [...tweets]
    newTweets.splice(index, 1)
    setTweets(newTweets)
  }

  const handleMediaUpload = (type: "image" | "video" | "gif", tweetIndex: number) => {
    // In a real app, this would open a file picker and upload the file
    const mockMediaUrls = {
      image: "/placeholder.svg?height=400&width=400",
      video: "/placeholder.svg?height=400&width=400",
      gif: "/placeholder.svg?height=400&width=400",
    }

    setMedia([...media, { tweetIndex, url: mockMediaUrls[type], type }])
  }

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
  }

  const handlePostTweets = async () => {
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
      setPrompt("")
      setTweets([])
      setMedia([])
      setActiveTab("generate")
    } catch (error) {
      console.error("Error posting tweets:", error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Tweet Generator</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="edit" disabled={tweets.length === 0}>
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={tweets.length === 0}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="direct-post">Direct Post</TabsTrigger>
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
              <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full">
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

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Tweets</CardTitle>
            </CardHeader>
            <CardContent>
              <TweetEditor
                tweets={tweets}
                media={media}
                onTweetChange={handleTweetEdit}
                onMediaAdd={handleMediaUpload}
                onMediaRemove={removeMedia}
                onAddTweet={handleAddTweet}
                onRemoveTweet={handleRemoveTweet}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("generate")}>
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
    </main>
  )
}
