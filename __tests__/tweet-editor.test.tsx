import { render, screen, fireEvent } from "@testing-library/react"
import TweetEditor from "@/components/tweet-editor"

describe("TweetEditor", () => {
  const mockProps = {
    tweets: ["Test tweet"],
    media: [],
    onTweetChange: jest.fn(),
    onMediaAdd: jest.fn(),
    onMediaRemove: jest.fn(),
    onAddTweet: jest.fn(),
    onRemoveTweet: jest.fn(),
  }

  it("renders the tweet editor correctly", () => {
    render(<TweetEditor {...mockProps} />)

    // Check if the textarea is rendered with the correct value
    const textarea = screen.getByRole("textbox")
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue("Test tweet")

    // Check if the "Add Another Tweet" button is rendered
    const addButton = screen.getByTestId("add-tweet-button")
    expect(addButton).toBeInTheDocument()

    // Check if media buttons are rendered
    expect(screen.getByText("Image")).toBeInTheDocument()
    expect(screen.getByText("Video")).toBeInTheDocument()
    expect(screen.getByText("GIF")).toBeInTheDocument()
  })

  it("calls onTweetChange when textarea value changes", () => {
    render(<TweetEditor {...mockProps} />)

    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Updated tweet" } })

    expect(mockProps.onTweetChange).toHaveBeenCalledWith(0, "Updated tweet")
  })

  it("calls onAddTweet when add button is clicked", () => {
    render(<TweetEditor {...mockProps} />)

    const addButton = screen.getByTestId("add-tweet-button")
    fireEvent.click(addButton)

    expect(mockProps.onAddTweet).toHaveBeenCalled()
  })

  it("calls onMediaAdd when media buttons are clicked", () => {
    render(<TweetEditor {...mockProps} />)

    const imageButton = screen.getByText("Image").closest("button")
    const videoButton = screen.getByText("Video").closest("button")
    const gifButton = screen.getByText("GIF").closest("button")

    if (imageButton) fireEvent.click(imageButton)
    expect(mockProps.onMediaAdd).toHaveBeenCalledWith("image")

    if (videoButton) fireEvent.click(videoButton)
    expect(mockProps.onMediaAdd).toHaveBeenCalledWith("video")

    if (gifButton) fireEvent.click(gifButton)
    expect(mockProps.onMediaAdd).toHaveBeenCalledWith("gif")
  })

  it("shows remove button for tweets when there are multiple tweets", () => {
    const multiTweetProps = {
      ...mockProps,
      tweets: ["First tweet", "Second tweet"],
    }

    render(<TweetEditor {...multiTweetProps} />)

    // There should be two remove buttons (one for each tweet)
    const removeButtons = screen.getAllByRole("button", { name: /remove tweet/i })
    expect(removeButtons.length).toBe(2)

    // Click the first remove button
    fireEvent.click(removeButtons[0])
    expect(mockProps.onRemoveTweet).toHaveBeenCalledWith(0)
  })

  it("displays media when provided", () => {
    const mediaProps = {
      ...mockProps,
      media: [{ url: "/test-image.jpg", type: "image" as const }],
    }

    render(<TweetEditor {...mediaProps} />)

    // Check if the image is rendered
    const image = screen.getByAltText("Media 1")
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute("src", "/test-image.jpg")
  })
})
