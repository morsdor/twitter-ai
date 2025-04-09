import { render, screen } from "@testing-library/react"
import TweetPreview from "@/components/tweet-preview"

describe("TweetPreview", () => {
  it("renders a single tweet correctly", () => {
    const props = {
      tweets: ["This is a test tweet"],
      media: [],
    }

    render(<TweetPreview {...props} />)

    // Check if the tweet content is rendered
    expect(screen.getByText("This is a test tweet")).toBeInTheDocument()

    // Check if user info is rendered
    expect(screen.getByText("Your Name")).toBeInTheDocument()
    expect(screen.getByText("@yourusername")).toBeInTheDocument()
  })

  it("renders multiple tweets correctly", () => {
    const props = {
      tweets: ["First tweet", "Second tweet", "Third tweet"],
      media: [],
    }

    render(<TweetPreview {...props} />)

    // Check if all tweets are rendered
    expect(screen.getByText("First tweet")).toBeInTheDocument()
    expect(screen.getByText("Second tweet")).toBeInTheDocument()
    expect(screen.getByText("Third tweet")).toBeInTheDocument()

    // There should be three cards
    const cards = screen.getAllByRole("article")
    expect(cards.length).toBe(3)
  })

  it("renders media in the first tweet only", () => {
    const props = {
      tweets: ["Tweet with media", "Tweet without media"],
      media: [
        { url: "/image1.jpg", type: "image" as const },
        { url: "/image2.jpg", type: "image" as const },
      ],
    }

    render(<TweetPreview {...props} />)

    // Check if media is rendered
    const images = screen.getAllByRole("img")

    // Should have 4 images: 2 avatar images + 2 media images
    expect(images.length).toBe(4)

    // Check if media is only in the first tweet
    const cards = screen.getAllByRole("article")
    const firstCardImages = cards[0].querySelectorAll("img")
    const secondCardImages = cards[1].querySelectorAll("img")

    // First card should have 3 images (1 avatar + 2 media)
    expect(firstCardImages.length).toBe(3)

    // Second card should have 1 image (avatar only)
    expect(secondCardImages.length).toBe(1)
  })

  it("renders the correct grid layout based on media count", () => {
    // Test with single media item
    const singleMediaProps = {
      tweets: ["Tweet with one media item"],
      media: [{ url: "/image.jpg", type: "image" as const }],
    }

    const { rerender } = render(<TweetPreview {...singleMediaProps} />)

    // With one media item, should use grid-cols-1
    let mediaContainer = screen.getByRole("article").querySelector('div[class*="grid"]')
    expect(mediaContainer).toHaveClass("grid-cols-1")

    // Test with multiple media items
    const multiMediaProps = {
      tweets: ["Tweet with multiple media items"],
      media: [
        { url: "/image1.jpg", type: "image" as const },
        { url: "/image2.jpg", type: "image" as const },
      ],
    }

    rerender(<TweetPreview {...multiMediaProps} />)

    // With multiple media items, should use grid-cols-2
    mediaContainer = screen.getByRole("article").querySelector('div[class*="grid"]')
    expect(mediaContainer).toHaveClass("grid-cols-2")
  })
})
