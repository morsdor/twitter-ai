import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import DirectPostPanel from "@/components/direct-post-panel"

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  }),
) as jest.Mock

// Mock alert
global.alert = jest.fn()

describe("DirectPostPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the direct post panel correctly", () => {
    render(<DirectPostPanel />)

    // Check if the textarea is rendered
    const textarea = screen.getByRole("textbox")
    expect(textarea).toBeInTheDocument()

    // Check if the post button is rendered
    const postButton = screen.getByTestId("post-button")
    expect(postButton).toBeInTheDocument()

    // Check if the preview/edit button is rendered
    const toggleButton = screen.getByText("Preview")
    expect(toggleButton).toBeInTheDocument()
  })

  it("toggles between edit and preview modes", () => {
    render(<DirectPostPanel />)

    // Initially in edit mode
    expect(screen.getByRole("textbox")).toBeInTheDocument()

    // Click preview button
    const toggleButton = screen.getByText("Preview")
    fireEvent.click(toggleButton)

    // Should now be in preview mode
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.getByText("Edit")).toBeInTheDocument()

    // Click edit button
    const editButton = screen.getByText("Edit")
    fireEvent.click(editButton)

    // Should be back in edit mode
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("adds a new tweet when add button is clicked", () => {
    render(<DirectPostPanel />)

    // Initially one textarea
    expect(screen.getAllByRole("textbox").length).toBe(1)

    // Find and click the add tweet button
    const addButton = screen.getByTestId("add-tweet-button")
    fireEvent.click(addButton)

    // Should now have two textareas
    expect(screen.getAllByRole("textbox").length).toBe(2)
  })

  it("posts tweets when post button is clicked", async () => {
    render(<DirectPostPanel />)

    // Fill in the tweet
    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Test tweet" } })

    // Click post button
    const postButton = screen.getByTestId("post-button")
    fireEvent.click(postButton)

    // Check if fetch was called with the correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/post-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets: ["Test tweet"], media: [] }),
      })
    })

    // Check if alert was shown
    expect(global.alert).toHaveBeenCalledWith("Tweets posted successfully!")

    // Form should be reset
    await waitFor(() => {
      const textareas = screen.getAllByRole("textbox")
      expect(textareas.length).toBe(1)
      expect(textareas[0]).toHaveValue("")
    })
  })

  it("prevents posting empty tweets", () => {
    render(<DirectPostPanel />)

    // Post button should be disabled initially (empty tweet)
    const postButton = screen.getByTestId("post-button")
    expect(postButton).toBeDisabled()

    // Fill in the tweet
    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Test tweet" } })

    // Post button should be enabled
    expect(postButton).not.toBeDisabled()

    // Clear the tweet
    fireEvent.change(textarea, { target: { value: "" } })

    // Post button should be disabled again
    expect(postButton).toBeDisabled()
  })

  it("handles API errors gracefully", async () => {
    // Mock fetch to return an error
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      }),
    )

    render(<DirectPostPanel />)

    // Fill in the tweet
    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "Test tweet" } })

    // Click post button
    const postButton = screen.getByTestId("post-button")
    fireEvent.click(postButton)

    // Check if fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Form should not be reset on error
    await waitFor(() => {
      const textareas = screen.getAllByRole("textbox")
      expect(textareas[0]).toHaveValue("Test tweet")
    })

    // Post button should be enabled again
    expect(postButton).not.toBeDisabled()
  })
})
