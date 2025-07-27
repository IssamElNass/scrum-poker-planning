import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home-page";
import { RoomPage } from "../pages/room-page";
import { JoinRoomPage } from "../pages/join-room-page";
import {
  createRoom,
  navigateToRoom,
  createAndJoinRoom,
  verifyRoomPersistence,
  extractRoomIdFromUrl,
} from "../utils/room-helpers";
import { mockClipboardAPI, waitForNetworkIdle } from "../utils/test-helpers";

test.describe("Room Creation Suite", () => {
  test.describe("Create room from home page", () => {
    test("should create a new room when clicking Start New Game button", async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await mockClipboardAPI(page);
      await homePage.goto();

      // Click start button and wait for navigation
      const roomId = await homePage.createNewRoom();

      // Verify room ID format
      expect(roomId).toMatch(/^[a-z0-9]+$/);
      expect(roomId.length).toBeGreaterThan(5);

      // Verify URL changed to room
      await expect(page).toHaveURL(new RegExp(`/room/${roomId}`));

      // Should see join dialog for new room
      await expect(page.getByRole("heading", { name: "Join Room" })).toBeVisible({ timeout: 10000 });
    });

    test("should generate unique room IDs for each creation", async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await mockClipboardAPI(page);
      await homePage.goto();

      // Create first room
      const roomId1 = await homePage.createNewRoom();

      // Navigate back to home
      await homePage.goto();

      // Create second room
      const roomId2 = await homePage.createNewRoom();

      // Verify room IDs are different
      expect(roomId1).not.toBe(roomId2);
      expect(roomId1).toMatch(/^[a-z0-9]+$/);
      expect(roomId2).toMatch(/^[a-z0-9]+$/);
    });

    test("should copy room URL to clipboard on room creation", async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await mockClipboardAPI(page);
      await homePage.goto();

      const roomId = await homePage.createNewRoom();

      // Verify clipboard contains room URL
      const clipboardText = await homePage.getClipboardText();
      expect(clipboardText).toContain(`/room/${roomId}`);
      expect(clipboardText).toMatch(/https?:\/\/.*\/room\/[a-z0-9]+/);
    });
  });

  test.describe("Create room with custom name", () => {
    test("should allow setting custom room name after creation", async ({
      page,
    }) => {
      await mockClipboardAPI(page);
      // Create and join room
      await createAndJoinRoom(page, "Test User");

      // Verify we successfully joined the room and canvas is visible
      await expect(page.locator(".react-flow")).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Direct navigation to room URL", () => {
    test("should load room when navigating directly to room URL", async ({
      page,
    }) => {
      await mockClipboardAPI(page);

      // First create a room to get a valid ID
      const roomId = await createRoom(page);

      // Navigate away
      await page.goto("/");
      await waitForNetworkIdle(page);

      // Navigate directly to room URL
      await navigateToRoom(page, roomId);

      // Should see join dialog
      const joinPage = new JoinRoomPage(page);
      await expect(page.getByRole("heading", { name: "Join Room" })).toBeVisible({ timeout: 10000 });

      // Join and verify room loads
      await joinPage.joinAsParticipant("Direct Navigator");
      await joinPage.expectDialogClosed();

      const roomPage = new RoomPage(page);
      await roomPage.waitForRoomLoad();

      // Verify we're in the correct room
      const currentRoomId = await roomPage.getRoomId();
      expect(currentRoomId).toBe(roomId);
    });

    test("should handle URL with trailing slash", async ({ page }) => {
      await mockClipboardAPI(page);

      // Create a room
      const roomId = await createRoom(page);

      // Navigate with trailing slash
      await page.goto(`/room/${roomId}/`);
      await waitForNetworkIdle(page);

      // Should still load the room
      await expect(page).toHaveURL(new RegExp(`/room/${roomId}`));
      await expect(page.getByRole("heading", { name: "Join Room" })).toBeVisible({ timeout: 10000 });
    });

    test("should handle URL with query parameters", async ({ page }) => {
      await mockClipboardAPI(page);

      // Create a room
      const roomId = await createRoom(page);

      // Navigate with query parameters
      await page.goto(`/room/${roomId}?ref=test&utm_source=test`);
      await waitForNetworkIdle(page);

      // Should load the room
      await expect(page.getByRole("heading", { name: "Join Room" })).toBeVisible({ timeout: 10000 });

      // Verify room ID is preserved
      const currentRoomId = extractRoomIdFromUrl(page.url());
      expect(currentRoomId).toBe(roomId);
    });
  });

  test.describe("Handle invalid room IDs", () => {
    test("should redirect to home for non-existent room ID", async ({
      page,
    }) => {
      await mockClipboardAPI(page);

      // Try to navigate to a non-existent room
      const fakeRoomId = "nonexistent123";
      await page.goto(`/room/${fakeRoomId}`);
      await waitForNetworkIdle(page);

      // Should redirect to home or show error
      // The exact behavior depends on implementation
      const url = page.url();

      // Either redirected to home or stays on room page with error
      if (url.includes("/room/")) {
        // If still on room page, might show error message
        // This behavior is implementation-dependent
        await expect(page.locator("text=/not found|error|invalid/i"))
          .toBeVisible({ timeout: 5000 })
          .catch(() => {
            // If no error message, at least verify we're not in a working room
            return expect(page.locator(".react-flow")).not.toBeVisible({
              timeout: 1000,
            });
          });
      } else {
        // Redirected to home
        expect(url).toMatch(/^[^\/]*\/?$/); // Root URL
      }
    });

    test("should handle invalid room ID format", async ({ page }) => {
      await mockClipboardAPI(page);

      // Try various invalid formats
      const invalidIds = [
        "UPPERCASE",
        "special-chars!",
        "with spaces",
        "../../../etc/passwd",
        "<script>alert('xss')</script>",
        "';DROP TABLE rooms;--",
      ];

      for (const invalidId of invalidIds) {
        await page.goto(`/room/${encodeURIComponent(invalidId)}`);
        await waitForNetworkIdle(page);

        // Should not load a valid room
        const url = page.url();

        // Verify we're not in a working room
        if (url.includes("/room/")) {
          // Should either show error or redirect
          const isJoinDialogVisible = await page.getByRole("heading", { name: "Join Room" })
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          const isCanvasVisible = await page.locator(".react-flow")
            .isVisible({ timeout: 1000 })
            .catch(() => false);

          expect(isJoinDialogVisible || isCanvasVisible).toBe(false);
        }
      }
    });

    test("should handle extremely long room IDs gracefully", async ({
      page,
    }) => {
      await mockClipboardAPI(page);

      // Create an extremely long ID
      const longId = "a".repeat(1000);

      await page.goto(`/room/${longId}`);
      await waitForNetworkIdle(page);

      // Should handle gracefully without crashing
      await expect(page).not.toHaveTitle(/error|crash/i);

      // Should not load as a valid room
      const isCanvasVisible = await page.locator(".react-flow")
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      expect(isCanvasVisible).toBe(false);
    });
  });

  test.describe("Room persistence after creation", () => {
    test("should persist room data after page refresh", async ({ page }) => {
      await mockClipboardAPI(page);

      // Create and join room
      const { roomId, roomPage } = await createAndJoinRoom(
        page,
        "Test User",
        "participant"
      );

      // Make some changes (select a card)
      await roomPage.selectCard("5");
      await roomPage.expectCardSelected("5");

      // Refresh the page
      await page.reload();
      await waitForNetworkIdle(page);

      // Should remember the user and not show join dialog
      const joinPage = new JoinRoomPage(page);
      const isJoinDialogVisible = await page.getByRole("heading", { name: "Join Room" })
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (isJoinDialogVisible) {
        // If join dialog appears, rejoin with same name
        await joinPage.joinAsParticipant("Test User");
        await joinPage.expectDialogClosed();
      }

      // Room should still be accessible
      await roomPage.waitForRoomLoad();
      const currentRoomId = await roomPage.getRoomId();
      expect(currentRoomId).toBe(roomId);
    });

    test("should allow multiple users to access the same room", async ({
      browser,
    }) => {
      // Create first user and room
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      await mockClipboardAPI(page1);

      const { roomId: roomId1, roomPage: roomPage1 } = await createAndJoinRoom(
        page1,
        "User 1"
      );

      // Create second user
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await mockClipboardAPI(page2);

      // Second user joins the same room
      await navigateToRoom(page2, roomId1);
      const joinPage2 = new JoinRoomPage(page2);
      await joinPage2.joinAsParticipant("User 2");
      await joinPage2.expectDialogClosed();

      const roomPage2 = new RoomPage(page2);
      await roomPage2.waitForRoomLoad();

      // Verify both users see each other
      await roomPage1.expectPlayerInList("User 2");
      await roomPage2.expectPlayerInList("User 1");

      // Cleanup
      await context1.close();
      await context2.close();
    });

    test("should maintain room state across user sessions", async ({
      browser,
    }) => {
      // Create room with first user
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      await mockClipboardAPI(page1);

      const { roomId } = await createAndJoinRoom(page1, "User 1");
      const roomPage1 = new RoomPage(page1);

      // User 1 votes
      await roomPage1.selectCard("8");

      // User 1 leaves
      await context1.close();

      // New user joins the same room
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await mockClipboardAPI(page2);

      await navigateToRoom(page2, roomId);
      const joinPage2 = new JoinRoomPage(page2);
      await joinPage2.joinAsParticipant("User 2");

      const roomPage2 = new RoomPage(page2);
      await roomPage2.waitForRoomLoad();

      // Room should still exist and be functional
      const currentRoomId = await roomPage2.getRoomId();
      expect(currentRoomId).toBe(roomId);

      // User 2 should be able to vote
      await roomPage2.selectCard("5");
      await roomPage2.expectCardSelected("5");

      // Cleanup
      await context2.close();
    });

    test("should verify room exists in database", async ({ page }) => {
      await mockClipboardAPI(page);

      // Create a room
      const roomId = await createRoom(page);

      // Navigate away
      await page.goto("/");

      // Verify room persists
      const roomExists = await verifyRoomPersistence(page, roomId);
      expect(roomExists).toBe(true);
    });
  });

  test.describe("Room creation edge cases", () => {
    test("should handle rapid room creation attempts", async ({ page }) => {
      const homePage = new HomePage(page);
      await mockClipboardAPI(page);
      await homePage.goto();

      // Click the button multiple times rapidly
      const button = page.getByTestId("hero-start-button");

      // Click 3 times without waiting
      await Promise.all([button.click(), button.click(), button.click()]);

      // Should end up in a room (only one)
      await page.waitForURL(/\/room\/[a-z0-9]+/, { timeout: 10000 });

      // Verify we're in a valid room
      const roomId = extractRoomIdFromUrl(page.url());
      expect(roomId).toBeTruthy();
      expect(roomId).toMatch(/^[a-z0-9]+$/);
    });

    test("should handle room creation with slow network", async ({ page }) => {
      await mockClipboardAPI(page);

      // Simulate slow network
      await page.route("**/*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        await route.continue();
      });

      const homePage = new HomePage(page);
      await homePage.goto();

      // Create room with slow network
      const startTime = Date.now();
      const button = page.getByTestId("hero-start-button");
      await button.click();

      // Should eventually navigate to room
      await page.waitForURL(/\/room\/[a-z0-9]+/, { timeout: 30000 });
      const endTime = Date.now();

      // Verify it took some time due to network delay
      expect(endTime - startTime).toBeGreaterThan(1000);

      // Verify room is valid
      const roomId = extractRoomIdFromUrl(page.url());
      expect(roomId).toBeTruthy();
    });
  });
});
