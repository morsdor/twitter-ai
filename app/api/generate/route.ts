import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Determine if we should generate a thread or single tweet
    const shouldGenerateThread = prompt.length > 50

    const systemPrompt = shouldGenerateThread
      ? "You are an expert at creating engaging Twitter/X threads. Create a thread of 3-5 tweets that are concise, engaging, and shareable. Each tweet should be under 280 characters and build on the previous one."
      : "You are an expert at creating engaging Twitter/X posts. Create a single tweet that is concise, engaging, and shareable. The tweet should be under 280 characters."

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt,
    })

    // Parse the response into individual tweets
    let tweets: string[]

    if (shouldGenerateThread) {
      // Split by common tweet separators like "Tweet 1:", "1/", etc.
      tweets = text
        .split(/Tweet \d+:|^\d+\/\d+:|\n\n/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    } else {
      tweets = [text.trim()]
    }

    return NextResponse.json({ tweets })
  } catch (error) {
    console.error("Error generating tweets:", error)
    return NextResponse.json({ error: "Failed to generate tweets" }, { status: 500 })
  }
}
