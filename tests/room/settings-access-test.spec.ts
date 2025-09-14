import { test, expect } from "@playwright/test";
import { RoomSettingsPage } from "../pages/room-settings-page";
import { createAndJoinRoom } from "../utils/room-helpers";
import { mockClipboardAPI } from "../utils/test-helpers";
import { TEST_USERS } from "../fixtures/test-data";

test.describe("Settings Access Verification", () => {
  test.beforeEach(async ({ page }) => {
    await mockClipboardAPI(page);
  });

  test("owner should be able to access settings", async ({ page }) => {
    // Create and join room as owner
    await createAndJoinRoom(page, TEST_USERS.participant1.name);

    const settingsPage = new RoomSettingsPage(page);

    // Check if settings access is available
    const hasAccess = await settingsPage.hasSettingsAccess();
    expect(hasAccess).toBe(true);

    // Try to open settings dialog
    await settingsPage.openSettings();
    await expect(settingsPage.settingsDialog).toBeVisible();

    // Close settings
    await settingsPage.closeSettings();
  });

  test("should show room information in general tab", async ({ page }) => {
    const { roomId } = await createAndJoinRoom(
      page,
      TEST_USERS.participant1.name
    );

    const settingsPage = new RoomSettingsPage(page);
    await settingsPage.openSettings();
    await settingsPage.switchToGeneralTab();

    // Verify room ID is displayed
    const displayedRoomId = await settingsPage.getRoomId();
    expect(displayedRoomId).toContain(roomId);

    // Verify room statistics
    const totalMembers = await settingsPage.getTotalMembersCount();
    expect(totalMembers).toBe(1);
  });
});
