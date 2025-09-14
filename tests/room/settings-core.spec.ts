import { test, expect } from "@playwright/test";
import { RoomSettingsPage } from "../pages/room-settings-page";
import { createMultipleUsers, cleanupUsers } from "../utils/room-helpers";
import { mockClipboardAPI } from "../utils/test-helpers";

test.describe("Room Settings - Core Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await mockClipboardAPI(page);
  });

  test("should open and close settings dialog as owner", async ({
    browser,
  }) => {
    const users = await createMultipleUsers(browser, 1);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);

    // Verify owner has access
    const hasAccess = await settingsPage.hasSettingsAccess();
    expect(hasAccess).toBe(true);

    // Open settings
    await settingsPage.openSettings();
    await expect(settingsPage.settingsDialog).toBeVisible();

    // Close settings
    await settingsPage.closeSettings();
    await expect(settingsPage.settingsDialog).not.toBeVisible();

    await cleanupUsers(users);
  });

  test("should update room name successfully", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 1);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();

    // Update room name
    const newName = "Updated Test Room";
    await settingsPage.updateRoomName(newName);

    // Verify name was updated
    const currentName = await settingsPage.getRoomName();
    expect(currentName).toBe(newName);

    await cleanupUsers(users);
  });

  test("should show owner badge for room owner", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 1);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();
    await settingsPage.switchToMembersTab();

    // Verify owner badge
    const isOwner = await settingsPage.isUserOwner("User1");
    expect(isOwner).toBe(true);

    await cleanupUsers(users);
  });

  test("should restrict settings access to owner only", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 2);
    const [owner, participant] = users;

    // Owner should have access
    const ownerSettingsPage = new RoomSettingsPage(owner.page);
    const ownerHasAccess = await ownerSettingsPage.hasSettingsAccess();
    expect(ownerHasAccess).toBe(true);

    // Non-owner should not have access
    const participantSettingsPage = new RoomSettingsPage(participant.page);
    const participantHasAccess =
      await participantSettingsPage.hasSettingsAccess();
    expect(participantHasAccess).toBe(false);

    await cleanupUsers(users);
  });

  test("should display room information correctly", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 1);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();

    // Check room ID exists
    const roomId = await settingsPage.getRoomId();
    expect(roomId.length).toBeGreaterThan(0);

    // Check created date exists
    const createdDate = await settingsPage.getCreatedDate();
    expect(createdDate.length).toBeGreaterThan(0);

    await cleanupUsers(users);
  });

  test("should handle invalid room name input", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 1);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();

    // Try to save with empty name
    await settingsPage.roomNameInput.fill("");
    await settingsPage.saveButton.click();

    // Should not allow empty name - verify input still exists
    await expect(settingsPage.roomNameInput).toBeVisible();

    await cleanupUsers(users);
  });

  test("should navigate between tabs correctly", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 1);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();

    // Start on General tab - check for active class
    await expect(settingsPage.generalTab).toHaveClass(/bg-gradient-to-r/);

    // Switch to Members tab
    await settingsPage.switchToMembersTab();
    await expect(settingsPage.membersTab).toHaveClass(/bg-gradient-to-r/);

    // Switch back to General tab
    await settingsPage.switchToGeneralTab();
    await expect(settingsPage.generalTab).toHaveClass(/bg-gradient-to-r/);

    await cleanupUsers(users);
  });
});
