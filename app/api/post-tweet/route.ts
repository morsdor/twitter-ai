import { NextResponse } from "next/server";
import { uploadMedia, postTweet, postThread } from "@/lib/twitter-api";

interface TweetMedia {
  url: string;
  type: string;
  file: File;
  tweetIndex: number;
}

export async function POST(req: Request) {
  try {
    // Read tweets from FormData
    const formData = await req.formData();
    const tweets = JSON.parse(formData.get("tweets") as string) as string[];
    const mediaFiles: TweetMedia[] = [];
    for (let i = 0; i < 100; i++) {
      // Adjust 10 based on your max media count
      const file = JSON.parse(
        formData.get(`media[${i}]`) as string
      ) as TweetMedia | null;
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
    const mediaIds: { mediaId: string; tweetIndex: number }[] = [];
    if (mediaFiles && mediaFiles.length > 0) {
      for (const mediaFile of mediaFiles) {
        const mediaId = await uploadMedia({
          file: mediaFile.file,
          mimeType: mediaFile.type,
          tweetIndex: mediaFile.tweetIndex,
        });
        mediaIds.push({ mediaId, tweetIndex: mediaFile.tweetIndex });
      }
    }

    let tweetIds: string[];

    if (tweets.length === 1) {
      // Single tweet
      const mediaList = mediaIds
        .filter((m) => m.tweetIndex === 0)
        .map((m) => m.mediaId);
      const tweetId = await postTweet(tweets[0], mediaList);
      tweetIds = [tweetId];
    } else {
      // Thread of tweets
      const tweetMedia: TweetMedia[] = mediaFiles.map((m) => ({
        url: "",
        type: m.type,
        file: m.file,
        tweetIndex: m.tweetIndex,
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
