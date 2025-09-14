import { test, expect } from "@playwright/test";
import { RoomSettingsPage } from "../pages/room-settings-page";
import { createMultipleUsers, cleanupUsers } from "../utils/room-helpers";
import { mockClipboardAPI } from "../utils/test-helpers";

test.describe("Member Actions - Simplified Tests", () => {
  test.beforeEach(async ({ page }) => {
    await mockClipboardAPI(page);
  });

  test("should show kick and make owner buttons for non-owner users", async ({
    browser,
  }) => {
    const users = await createMultipleUsers(browser, 2);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();
    await settingsPage.switchToMembersTab();

    // Wait for members to load
    await settingsPage.page.waitForTimeout(2000);

    // Check if User2 (participant) has action buttons visible
    const user2Card = settingsPage.getUserCard("User2");
    const kickButton = user2Card.getByRole("button", { name: /kick/i });
    const makeOwnerButton = user2Card.getByRole("button", {
      name: /make owner/i,
    });

    // These buttons should be visible for the owner when looking at other users
    await expect(kickButton).toBeVisible({ timeout: 5000 });
    await expect(makeOwnerButton).toBeVisible({ timeout: 5000 });

    await cleanupUsers(users);
  });

  test("should not show action buttons for the current user", async ({
    browser,
  }) => {
    const users = await createMultipleUsers(browser, 1);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();
    await settingsPage.switchToMembersTab();

    // Owner should not have kick/make owner buttons for themselves
    const ownerCard = settingsPage.getUserCard("User1");
    const kickButton = ownerCard.getByRole("button", { name: /kick/i });
    const makeOwnerButton = ownerCard.getByRole("button", {
      name: /make owner/i,
    });

    await expect(kickButton).not.toBeVisible();
    await expect(makeOwnerButton).not.toBeVisible();

    await cleanupUsers(users);
  });

  test("should open kick confirmation dialog", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 2);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();
    await settingsPage.switchToMembersTab();

    // Wait for members to load
    await settingsPage.page.waitForTimeout(2000);

    // Try to kick User2
    const user2Card = settingsPage.getUserCard("User2");
    const kickButton = user2Card.getByRole("button", { name: /kick/i });

    await kickButton.click();

    // Should show confirmation dialog
    await expect(settingsPage.kickConfirmDialog).toBeVisible({ timeout: 5000 });
    await expect(settingsPage.kickConfirmDialog).toContainText("User2");

    // Cancel the kick
    await settingsPage.cancelKickButton.click();
    await expect(settingsPage.kickConfirmDialog).not.toBeVisible();

    await cleanupUsers(users);
  });

  test("should open ownership transfer confirmation dialog", async ({
    browser,
  }) => {
    const users = await createMultipleUsers(browser, 2);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();
    await settingsPage.switchToMembersTab();

    // Wait for members to load
    await settingsPage.page.waitForTimeout(2000);

    // Try to make User2 owner
    const user2Card = settingsPage.getUserCard("User2");
    const makeOwnerButton = user2Card.getByRole("button", {
      name: /make owner/i,
    });

    await makeOwnerButton.click();

    // Should show confirmation dialog
    await expect(settingsPage.ownershipConfirmDialog).toBeVisible({
      timeout: 5000,
    });
    await expect(settingsPage.ownershipConfirmDialog).toContainText("User2");

    // Cancel the transfer
    await settingsPage.cancelOwnershipButton.click();
    await expect(settingsPage.ownershipConfirmDialog).not.toBeVisible();

    await cleanupUsers(users);
  });

  test("should identify user roles correctly", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 2);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();
    await settingsPage.switchToMembersTab();

    // Check if we can identify user roles
    const user1Role = await settingsPage.getUserRole("User1");
    const user2Role = await settingsPage.getUserRole("User2");

    // Both should be participants by default
    expect(user1Role).toBe("participant");
    expect(user2Role).toBe("spectator");

    await cleanupUsers(users);
  });

  test("should handle scrollable member list display", async ({ browser }) => {
    const users = await createMultipleUsers(browser, 2);
    const [owner] = users;

    const settingsPage = new RoomSettingsPage(owner.page);
    await settingsPage.openSettings();
    await settingsPage.switchToMembersTab();

    // Check members list has proper styling for scrolling
    const membersList = settingsPage.membersList;
    await expect(membersList).toBeVisible();

    // Check it has overflow auto
    await expect(membersList).toHaveCSS("overflow-y", "auto");

    // Check max height is set correctly (could be rem or px)
    const maxHeight = await membersList.evaluate(
      (el) => getComputedStyle(el).maxHeight
    );
    expect(maxHeight === "24rem" || maxHeight === "384px").toBe(true);

    await cleanupUsers(users);
  });
});
