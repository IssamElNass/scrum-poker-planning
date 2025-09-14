import { Page, Browser, BrowserContext } from "@playwright/test";
import { RoomSettingsPage } from "../pages/room-settings-page";
import {
  createAndJoinRoom,
  createMultipleUsers,
  cleanupUsers,
} from "./room-helpers";
import { mockClipboardAPI, waitForNetworkIdle } from "./test-helpers";

export interface SettingsTestUser {
  page: Page;
  context: BrowserContext;
  name: string;
  role: "participant" | "spectator";
  isOwner: boolean;
}

/**
 * Create a room with owner and open settings dialog
 */
export async function createRoomWithSettings(
  page: Page,
  ownerName: string
): Promise<{ roomId: string; settingsPage: RoomSettingsPage }> {
  await mockClipboardAPI(page);

  const { roomId } = await createAndJoinRoom(page, ownerName);
  const settingsPage = new RoomSettingsPage(page);

  return { roomId, settingsPage };
}

/**
 * Create multiple users and return settings page for owner
 */
export async function createUsersWithSettings(
  browser: Browser,
  userCount: number,
  options: {
    spectatorCount?: number;
    ownerName?: string;
  } = {}
): Promise<{
  users: SettingsTestUser[];
  settingsPage: RoomSettingsPage;
  roomId: string;
}> {
  const { spectatorCount = 1, ownerName = "Owner" } = options;

  const rawUsers = await createMultipleUsers(browser, userCount);
  const [owner, ...others] = rawUsers;

  // Update owner name if provided
  if (ownerName !== "Owner") {
    // This would require updating the user name in the actual room
    // For now, we'll use the generated name
  }

  const users: SettingsTestUser[] = [
    {
      page: owner.page,
      context: owner.context,
      name: owner.name,
      role: owner.role,
      isOwner: true,
    },
    ...others.map((user, index) => ({
      page: user.page,
      context: user.context,
      name: user.name,
      role: user.role,
      isOwner: false,
    })),
  ];

  const settingsPage = new RoomSettingsPage(owner.page);
  const roomId = await owner.roomPage.getRoomId();

  return { users, settingsPage, roomId };
}

/**
 * Clean up settings test users
 */
export async function cleanupSettingsUsers(
  users: SettingsTestUser[]
): Promise<void> {
  for (const user of users) {
    await user.context.close();
  }
}

/**
 * Wait for member count to update in settings
 */
export async function waitForMemberCountUpdate(
  settingsPage: RoomSettingsPage,
  expectedCount: number,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const currentCount = await settingsPage.getTotalMembersCount();
      if (currentCount === expectedCount) {
        return;
      }
    } catch {
      // Continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timeout waiting for member count to be ${expectedCount}`);
}

/**
 * Verify settings permissions for user role
 */
export async function verifySettingsPermissions(
  page: Page,
  shouldHaveAccess: boolean
): Promise<void> {
  const settingsButton = page.getByRole("button", {
    name: /settings|room settings/i,
  });
  const hasAccess = await settingsButton.isVisible().catch(() => false);

  if (shouldHaveAccess && !hasAccess) {
    throw new Error("User should have access to settings but doesn't");
  }

  if (!shouldHaveAccess && hasAccess) {
    throw new Error("User should not have access to settings but does");
  }
}

/**
 * Simulate network delay for settings operations
 */
export async function simulateNetworkDelay(
  page: Page,
  delayMs: number = 1000
): Promise<void> {
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.method() === "POST" || request.url().includes("convex")) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    await route.continue();
  });
}

/**
 * Mock settings operation failure
 */
export async function mockSettingsOperationFailure(
  page: Page,
  operation: "updateName" | "kick" | "transferOwnership",
  errorMessage: string = "Operation failed"
): Promise<void> {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const postData = request.postData();

    if (postData && postData.includes(operation)) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: errorMessage }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Generate test data for settings
 */
export const SETTINGS_TEST_DATA = {
  roomNames: {
    valid: "Test Planning Room",
    long: "A".repeat(100),
    special: "Room @#$%^&*()_+{}|:<>?",
    unicode: "会议室 🏢 Salle de réunion",
    empty: "",
    whitespace: "   ",
  },
  userNames: {
    normal: "TestUser",
    long: "User with very long name that might cause display issues",
    special: "User@123!#$%^&*()",
    unicode: "用户 👤 Utilisateur",
    duplicate: "DuplicateName",
  },
  errorMessages: {
    nameRequired: "Name is required",
    nameTooLong: "Name must be less than",
    kickFailed: "Failed to kick user",
    transferFailed: "Failed to transfer ownership",
    updateFailed: "Failed to update room name",
    unauthorized: "You don't have permission",
  },
} as const;

/**
 * Verify toast message appears and contains expected text
 */
export async function verifyToastMessage(
  page: Page,
  expectedText: string,
  timeout: number = 5000
): Promise<void> {
  const toast = page
    .locator('[role="status"], .sonner-toast')
    .filter({ hasText: expectedText });
  await toast.waitFor({ state: "visible", timeout });

  // Wait for toast to disappear (optional)
  await toast
    .waitFor({ state: "hidden", timeout: timeout + 2000 })
    .catch(() => {
      // Toast might still be visible, that's okay
    });
}

/**
 * Perform bulk member operations for testing
 */
export async function performBulkMemberOperations(
  settingsPage: RoomSettingsPage,
  operations: Array<{
    type: "kick" | "transfer";
    userName: string;
  }>
): Promise<void> {
  for (const operation of operations) {
    switch (operation.type) {
      case "kick":
        await settingsPage.kickUser(operation.userName);
        break;
      case "transfer":
        await settingsPage.transferOwnership(operation.userName);
        return; // Transfer ownership ends the session for current owner
    }

    // Small delay between operations
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Create test scenario with specific user distribution
 */
export async function createTestScenario(
  browser: Browser,
  scenario: {
    participants: number;
    spectators: number;
    ownerRole?: "participant" | "spectator";
  }
): Promise<{
  users: SettingsTestUser[];
  settingsPage: RoomSettingsPage;
  roomId: string;
}> {
  const totalUsers = scenario.participants + scenario.spectators + 1; // +1 for owner
  const rawUsers = await createMultipleUsers(browser, totalUsers);

  // Assign roles based on scenario
  const users: SettingsTestUser[] = rawUsers.map((user, index) => {
    let role: "participant" | "spectator";
    let isOwner = false;

    if (index === 0) {
      // First user is owner
      role = scenario.ownerRole || "participant";
      isOwner = true;
    } else if (index <= scenario.participants) {
      role = "participant";
    } else {
      role = "spectator";
    }

    return {
      page: user.page,
      context: user.context,
      name: user.name,
      role,
      isOwner,
    };
  });

  const settingsPage = new RoomSettingsPage(users[0].page);
  const roomId =
    (await users[0].page.url().match(/\/room\/([a-z0-9]+)/)?.[1]) || "";

  return { users, settingsPage, roomId };
}
