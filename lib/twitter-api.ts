import { SendTweetV2Params, TwitterApi } from "twitter-api-v2";

// Initialize the Twitter API client using environment variables
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

interface TweetMedia {
  file: Buffer | Uint8Array | { arrayBuffer: () => Promise<ArrayBuffer> };
  mimeType?: string;
}

export async function uploadMedia(media: TweetMedia): Promise<string> {
  try {
    let buffer: Buffer | undefined;

    if (media.file instanceof File || media.file instanceof Blob) {
      buffer = Buffer.from(await media.file.arrayBuffer());
    } else if (Buffer.isBuffer(media.file)) {
      buffer = media.file;
    } else if (media.file instanceof Uint8Array) {
      buffer = Buffer.from(media.file);
    }

    if (!buffer) {
      throw new Error("Invalid media file");
    }

    const mediaId = await client.v1.uploadMedia(buffer, {
      mimeType: media.mimeType,
    });
    return mediaId;
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
}
export async function postTweet(
  text: string,
  mediaIds: string[] = [],
  replyToId?: string
): Promise<string> {
  try {
    // First, check if mediaIds is actually an array
    if (mediaIds && !Array.isArray(mediaIds)) {
      mediaIds = [mediaIds]; // Convert single ID to array
    }

    // Make sure mediaIds contains strings, not numbers
    if (mediaIds) {
      mediaIds = mediaIds.map((id) => String(id));
    }

    // Then try posting with better error handling
    try {
      const tweetOptions: Partial<SendTweetV2Params> = {};

      if (mediaIds && mediaIds.length > 0) {
        tweetOptions.media = { media_ids: mediaIds };
      }

      if (replyToId) {
        tweetOptions.reply = { in_reply_to_tweet_id: String(replyToId) };
      }

      console.log("Tweet options:", JSON.stringify(tweetOptions));

      const tweet = await client.v2.tweet(text, tweetOptions);
      return tweet.data.id;
    } catch (error) {
      console.error("Detailed error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error posting tweet:", error);
    throw error;
  }
}

export async function postThread(
  tweets: string[],
  media: TweetMedia[]
): Promise<string[]> {
  const tweetIds: string[] = [];

  try {
    // Upload media first if any
    const mediaIds = await Promise.all(
      media.map(async (m) => await uploadMedia(m))
    );

    // Post the first tweet with media
    const firstTweetId = await postTweet(tweets[0], mediaIds);
    tweetIds.push(firstTweetId);

    // Post the rest of the tweets as replies
    for (let i = 1; i < tweets.length; i++) {
      const tweetId = await postTweet(tweets[i], [], tweetIds[i - 1]);
      tweetIds.push(tweetId);
    }

    return tweetIds;
  } catch (error) {
    console.error("Error posting thread:", error);
    throw error;
  }
}
