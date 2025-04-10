import { NextResponse } from "next/server";
import { uploadMedia, postTweet, postThread } from "@/lib/twitter-api";

interface TweetMedia {
  mediaId: string;
  tweetIndex: number;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const tweets = JSON.parse(formData.get("tweets") as string) as string[];
    const mediaFiles: TweetMedia[] = [];

    // Process media files
    for (let i = 0; i < 100; i++) {
      const mediaData = formData.get(`media[${i}]`);
      const mediaType = formData.get(`mediaType[${i}]`) as string;
      const mediaTweetIndex = formData.get(`mediaTweetIndex[${i}]`) as string;

      if (!mediaData) break;

      if (mediaData instanceof File) {
        // Handle direct file upload
        const file = mediaData;
        const mediaId = await uploadMedia({
          file,
          mimeType: mediaType,
          tweetIndex: parseInt(mediaTweetIndex),
        });
        mediaFiles.push({ mediaId, tweetIndex: parseInt(mediaTweetIndex) });
      } else {
        // Handle URL-based media
        const mediaObj = JSON.parse(mediaData as string);
        const mediaId = await uploadMedia({
          url: mediaObj.url,
          mimeType: mediaObj.type,
          tweetIndex: parseInt(mediaTweetIndex),
        });
        mediaFiles.push({ mediaId, tweetIndex: parseInt(mediaTweetIndex) });
      }
    }

    // Handle three cases:
    // 1. Single tweet without media
    // 2. Single tweet with media
    // 3. Thread of tweets with/without media

    if (!tweets || !tweets.length) {
      return NextResponse.json(
        { error: "No tweets provided" },
        { status: 400 }
      );
    }

    // Single tweet without media
    if (tweets.length === 1 && mediaFiles.length === 0) {
      await postTweet(tweets[0]);
    } else {
      // Handle media files first
      for (let i = 0; i < 100; i++) {
        const mediaData = formData.get(`media[${i}]`);
        const mediaType = formData.get(`mediaType[${i}]`) as string;
        const mediaTweetIndex = formData.get(`mediaTweetIndex[${i}]`) as string;

        if (!mediaData) break;

        if (mediaData instanceof File) {
          const file = mediaData;
          const mediaId = await uploadMedia({
            file,
            mimeType: mediaType,
            tweetIndex: parseInt(mediaTweetIndex),
          });
          mediaFiles.push({ mediaId, tweetIndex: parseInt(mediaTweetIndex) });
        } else {
          const mediaObj = JSON.parse(mediaData as string);
          const mediaId = await uploadMedia({
            url: mediaObj.url,
            mimeType: mediaObj.type,
            tweetIndex: mediaObj.tweetIndex,
          });
          mediaFiles.push({ mediaId, tweetIndex: parseInt(mediaTweetIndex) });
        }
      }

      // Single tweet with media
      if (tweets.length === 1 && mediaFiles.length > 0) {
        await postTweet(
          tweets[0],
          mediaFiles.map((m) => m.mediaId)
        );
      } else {
        // Thread of tweets
        const tweetMedia: TweetMedia[] = mediaFiles.map((m) => ({
          mediaId: m.mediaId,
          tweetIndex: m.tweetIndex,
        }));
        await postThread(tweets, tweetMedia);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting tweets:", error);
    return NextResponse.json(
      { error: "Failed to post tweets" },
      { status: 500 }
    );
  }
}
