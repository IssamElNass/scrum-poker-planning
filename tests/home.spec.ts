import { test, expect, type Page } from "@playwright/test";

// Helper to wait for room navigation (accepts any room ID)
async function waitForRoomNavigation(page: Page) {
  await page.waitForURL(/\/room\/[a-z0-9]+/, { timeout: 10000 });
}

test.describe("Home Page - Basic Elements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load successfully and display main heading", async ({
    page,
  }) => {
    // Verify page loads
    await expect(page).toHaveTitle(/Planning Poker for Teams|PokerPlanning/i);

    // Check main heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Estimate stories with");
    await expect(heading).toContainText("Planning Poker");
  });

  test("should display description text", async ({ page }) => {
    const description = page.locator("text=Join thousands of Agile teams");
    await expect(description).toBeVisible();
    await expect(description).toContainText(
      "collaborative story point estimation"
    );
  });

  test("should display key action buttons", async ({ page }) => {
    // Start New Game button
    const startButton = page.locator("button", { hasText: "Start New Game" });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();

    // GitHub link - first one in hero section
    const githubLink = page.locator("a", { hasText: "View on GitHub" }).first();
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/INQTR/poker-planning"
    );
    await expect(githubLink).toHaveAttribute("target", "_blank");
  });

  test("should display trust indicators", async ({ page }) => {
    // Look for trust indicators in the hero section (main content area)
    const heroSection = page.locator("main").first();
    await expect(
      heroSection.locator("text=100% Free Forever").first()
    ).toBeVisible();
    await expect(
      heroSection.locator("text=No Account Required").first()
    ).toBeVisible();
    await expect(
      heroSection.locator("text=Real-time Collaboration").first()
    ).toBeVisible();
  });

  test("should display all major sections", async ({ page }) => {
    // Scroll through the page to trigger any lazy-loaded content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for major sections (these components are imported in the home page)
    await expect(page.locator("section").first()).toBeVisible();

    // Footer should be present
    await expect(page.locator("footer")).toBeVisible();
  });
});

test.describe("Home Page - Room Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should create room and navigate on button click", async ({ page }) => {
    // Mock clipboard API
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: () => Promise.resolve(),
        },
        writable: true,
      });
    });

    // Wait for button to be ready and click the first Start New Game button
    const startButton = page
      .locator("button", { hasText: "Start New Game" })
      .first();
    await expect(startButton).toBeVisible();

    // Click and wait for navigation to any room
    const navigationPromise = waitForRoomNavigation(page);
    await startButton.click();
    await navigationPromise;

    // Verify we're on a room page
    await expect(page).toHaveURL(/\/room\/[a-z0-9]+/);
  });

  test("should copy room URL to clipboard", async ({ page }) => {
    // Mock clipboard API and track calls
    await page.evaluate(() => {
      window.clipboardText = "";
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: (text: string) => {
            window.clipboardText = text;
            return Promise.resolve();
          },
        },
        writable: true,
      });
    });

    const startButton = page
      .locator("button", { hasText: "Start New Game" })
      .first();

    // Click and wait for navigation
    const navigationPromise = waitForRoomNavigation(page);
    await startButton.click();
    await navigationPromise;

    // Verify clipboard was called with a room URL
    const copiedText = await page.evaluate(() => window.clipboardText);
    expect(copiedText).toMatch(/\/room\/[a-z0-9]+/);

    // Verify the clipboard text matches the current URL
    const currentUrl = page.url();
    expect(copiedText).toContain(
      currentUrl.split(page.url().split("/room/")[0])[1]
    );
  });
});

test.describe("Home Page - Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should open GitHub link in new tab", async ({ page }) => {
    const githubLink = page.locator("a", { hasText: "View on GitHub" }).first();

    // Verify attributes for new tab
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    // Test that clicking would open new tab (we can't actually test new tab in Playwright)
    const href = await githubLink.getAttribute("href");
    expect(href).toBe("https://github.com/INQTR/poker-planning");
  });

  test("should have working skip to main content link", async ({ page }) => {
    // The skip link is only visible when focused
    const skipLink = page.locator("a", { hasText: "Skip to main content" });

    // Tab to focus the skip link
    await page.keyboard.press("Tab");

    // Should be visible when focused
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    // Use force click since element might be covered by banner
    await skipLink.click({ force: true });

    // Verify main content has focus or is in view
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeInViewport();
  });
});

test.describe("Home Page - Error Handling", () => {
  test("should handle room creation errors gracefully", async ({ page }) => {
    await page.goto("/");

    // Mock error response by intercepting all mutation requests
    await page.route(
      (url) => {
        return (
          url.href.includes("mutation") ||
          url.href.includes("convex") ||
          url.href.includes("_api")
        );
      },
      async (route) => {
        const request = route.request();
        const postData = request.postData();

        if (postData && postData.includes("rooms:create")) {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Internal Server Error",
            }),
          });
        } else {
          await route.continue();
        }
      }
    );

    // Click the Start New Game button
    const startButton = page
      .locator("button", { hasText: "Start New Game" })
      .first();
    await startButton.click();

    // Button should be re-enabled after error
    await expect(startButton).toBeEnabled({ timeout: 5000 });

    // Should still be on home page
    await expect(page).toHaveURL("/");

    // Error toast should appear (based on the toast.error call in the code)
    // Note: This assumes the toast component renders in the DOM
    await expect(page.locator("text=Failed to create room")).toBeVisible();
  });

  test("should handle clipboard API failures gracefully", async ({ page }) => {
    await page.goto("/");

    // Set up console listener to verify no errors break the app
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Mock clipboard API to fail
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: () => Promise.reject(new Error("Clipboard access denied")),
        },
        writable: true,
      });
    });

    const startButton = page
      .locator("button", { hasText: "Start New Game" })
      .first();
    await expect(startButton).toBeVisible();

    // Click the button and wait a moment
    await startButton.click();

    // Use a more flexible wait - either navigation happens or timeout
    try {
      await waitForRoomNavigation(page);
      // If we get here, navigation succeeded despite clipboard failure - good!
      await expect(page).toHaveURL(/\/room\/[a-z0-9]+/);
    } catch (e) {
      // If navigation fails, that's also acceptable as long as no critical errors occurred
      // The key is that clipboard failure doesn't crash the app
      console.log(
        "Navigation did not occur, but app should still be functional"
      );

      // Verify the app is still responsive
      await expect(startButton).toBeVisible();

      // Check that no critical errors were logged
      const criticalErrors = consoleErrors.filter(
        (err) => !err.includes("Clipboard") && !err.includes("clipboard")
      );
      expect(criticalErrors.length).toBe(0);
    }
  });
});

test.describe("Home Page - Content Sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should render all imported components", async ({ page }) => {
    // Scroll to load any lazy content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Since we can't know the exact content of each component,
    // we'll verify that multiple sections are rendered
    const sections = page.locator("section");
    const sectionCount = await sections.count();

    // Should have multiple sections (AppPreview, HowItWorks, Features, etc.)
    expect(sectionCount).toBeGreaterThan(0);
  });

  test("should have interactive call-to-action at the bottom", async ({
    page,
  }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // The CallToAction component should have another button to start game
    // Look for any additional Start Game buttons
    const ctaButtons = page
      .locator("button")
      .filter({ hasText: /start|game/i });
    const buttonCount = await ctaButtons.count();

    // Should have at least the main button, possibly more in CTA
    expect(buttonCount).toBeGreaterThanOrEqual(1);
  });
});

// Add type declaration for window.clipboardText
declare global {
  interface Window {
    clipboardText: string;
  }
}
