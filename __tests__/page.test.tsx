import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Home from "@/app/page"

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ tweets: ["Generated tweet"] }),
  }),
) as jest.Mock

// Mock alert
global.alert = jest.fn()

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the home page correctly", () => {
    render(<Home />)

    // Check if the title is rendered
    expect(screen.getByText("AI Tweet Generator")).toBeInTheDocument()

    // Check if the tabs are rendered
    expect(screen.getByRole("tab", { name: "Generate" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Edit" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Preview" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Direct Post" })).toBeInTheDocument()
  })

  it("generates tweets when the generate button is clicked", async () => {
    render(<Home />)

    // Enter a prompt
    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Test prompt" } })

    // Click generate button
    const generateButton = screen.getByText("Generate Tweets")
    fireEvent.click(generateButton)

    // Check if fetch was called with the correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Test prompt" }),
      })
    })

    // Should switch to edit tab with generated tweet
    await waitFor(() => {
      expect(screen.getByText("Generated tweet")).toBeInTheDocument()
    })
  })

  it("allows editing tweets", async () => {
    render(<Home />)

    // Generate a tweet first
    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Test prompt" } })

    const generateButton = screen.getByText("Generate Tweets")
    fireEvent.click(generateButton)

    // Wait for the tweet to be generated
    await waitFor(() => {
      expect(screen.getByText("Generated tweet")).toBeInTheDocument()
    })

    // Edit the tweet
    const editTextarea = screen.getByRole("textbox")
    fireEvent.change(editTextarea, { target: { value: "Edited tweet" } })

    // The tweet should be updated
    expect(editTextarea).toHaveValue("Edited tweet")
  })

  it("allows adding new tweets in edit mode", async () => {
    render(<Home />)

    // Generate a tweet first
    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Test prompt" } })

    const generateButton = screen.getByText("Generate Tweets")
    fireEvent.click(generateButton)

    // Wait for the tweet to be generated
    await waitFor(() => {
      expect(screen.getByText("Generated tweet")).toBeInTheDocument()
    })

    // Add a new tweet
    const addButton = screen.getByTestId("add-tweet-button")
    fireEvent.click(addButton)

    // Should now have two textareas
    expect(screen.getAllByRole("textbox").length).toBe(2)
  })

  it("posts tweets when the post button is clicked", async () => {
    render(<Home />)

    // Generate a tweet first
    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Test prompt" } })

    const generateButton = screen.getByText("Generate Tweets")
    fireEvent.click(generateButton)

    // Wait for the tweet to be generated
    await waitFor(() => {
      expect(screen.getByText("Generated tweet")).toBeInTheDocument()
    })

    // Go to preview tab
    const previewTab = screen.getByRole("tab", { name: "Preview" })
    fireEvent.click(previewTab)

    // Click post button
    const postButton = screen.getByText("Post to X")
    fireEvent.click(postButton)

    // Check if fetch was called with the correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/post-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets: ["Generated tweet"], media: [] }),
      })
    })

    // Check if alert was shown
    expect(global.alert).toHaveBeenCalledWith("Tweets posted successfully!")
  })

  it("switches to direct post tab correctly", () => {
    render(<Home />)

    // Click direct post tab
    const directPostTab = screen.getByRole("tab", { name: "Direct Post" })
    fireEvent.click(directPostTab)

    // Should show direct post panel
    expect(screen.getByText("Post Directly to X")).toBeInTheDocument()
  })
})
