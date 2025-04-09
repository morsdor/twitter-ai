import { NextResponse } from "next/server";
import { uploadMedia, postTweet, postThread } from "@/lib/twitter-api";

interface TweetMedia {
  url: string;
  type: string;
  file: File;
}

export async function POST(req: Request) {
  try {
    // Read tweets from FormData
    const formData = await req.formData();
    const tweets = JSON.parse(formData.get("tweets") as string);
    const mediaFiles: File[] = [];
    for (let i = 0; i < 10; i++) {
      // Adjust 10 based on your max media count
      const file = formData.get(`media[${i}]`) as File;
      if (file) {
        mediaFiles.push(file);
      }
    }

    if (!tweets || !tweets.length) {
      return NextResponse.json(
        { error: "Tweets are required" },
        { status: 400 }
      );
    }

    // Upload media files first if any
    const mediaIds: string[] = [];
    if (mediaFiles && mediaFiles.length > 0) {
      for (const mediaFile of mediaFiles) {
        const mediaId = await uploadMedia({file: mediaFile, mimeType: mediaFile.type});
        mediaIds.push(mediaId);
      }
    }

    let tweetIds: string[];

    if (tweets.length === 1) {
      // Single tweet
      const tweetId = await postTweet(tweets[0], mediaIds);
      tweetIds = [tweetId];
    } else {
      // Thread of tweets
      const tweetMedia: TweetMedia[] = mediaFiles.map((m) => ({
        url: "",
        type: m.type.startsWith("image/")
          ? "image"
          : m.type.startsWith("video/")
          ? "video"
          : "gif",
        file: m,
      }));
      tweetIds = await postThread(tweets, tweetMedia);
    }

    return NextResponse.json({
      success: true,
      message: "Tweets posted successfully",
      tweetIds,
    });
  } catch (error) {
    console.error("Error posting tweets:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to post tweets",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
