import { Page, Locator, expect } from "@playwright/test";
import { safeClick } from "../utils/test-helpers";

export class RoomSettingsPage {
  readonly page: Page;
  readonly settingsDialog: Locator;
  readonly settingsButton: Locator;

  // Tab navigation
  readonly generalTab: Locator;
  readonly membersTab: Locator;

  // General settings elements
  readonly roomNameInput: Locator;
  readonly saveRoomNameButton: Locator;
  readonly saveButton: Locator;
  readonly roomIdDisplay: Locator;
  readonly roomCreatedDate: Locator;
  readonly totalMembersCount: Locator;
  readonly participantsCount: Locator;
  readonly spectatorsCount: Locator;

  // Member management elements
  readonly membersList: Locator;
  readonly currentUserCard: Locator;
  readonly otherUsersCards: Locator;
  readonly kickUserButton: Locator;
  readonly makeOwnerButton: Locator;
  readonly kickConfirmDialog: Locator;
  readonly ownershipConfirmDialog: Locator;
  readonly confirmKickButton: Locator;
  readonly confirmOwnershipButton: Locator;
  readonly cancelKickButton: Locator;
  readonly cancelOwnershipButton: Locator;

  // Status indicators
  readonly ownerBadge: Locator;
  readonly youBadge: Locator;
  readonly participantRole: Locator;
  readonly spectatorRole: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main dialog
    this.settingsDialog = page
      .locator('[role="dialog"]')
      .filter({ hasText: "Room Settings" });
    // Settings button is in a dropdown - it's the button with Settings icon and "Room settings" aria-label
    this.settingsButton = page.getByRole("button", {
      name: "Room settings",
    });

    // Tab navigation
    this.generalTab = page.getByRole("button", { name: "General" });
    this.membersTab = page.getByRole("button", { name: "Members" });

    // General settings
    this.roomNameInput = page.locator("#room-name");
    this.saveRoomNameButton = page.getByRole("button", { name: "Save" });
    this.saveButton = this.saveRoomNameButton; // Alias for convenience
    this.roomIdDisplay = page.locator(".font-mono.text-sm.bg-gray-50");
    this.roomCreatedDate = page
      .locator("text=/Created/")
      .locator("..")
      .locator("+ div");
    // Statistics selectors based on actual UI structure from room-settings-dialog.tsx
    this.totalMembersCount = page
      .locator(".bg-gradient-to-br.from-emerald-50")
      .locator(".text-xl.font-bold.text-emerald-700");
    this.participantsCount = page
      .locator(".bg-gradient-to-br.from-blue-50")
      .locator(".text-xl.font-bold.text-blue-700");
    this.spectatorsCount = page
      .locator(".bg-gradient-to-br.from-purple-50")
      .locator(".text-xl.font-bold.text-purple-700");

    // Member management - based on actual structure from room-settings-dialog.tsx
    this.membersList = page.locator(".space-y-4.max-h-96.overflow-y-auto");
    this.currentUserCard = page.locator(
      ".bg-gradient-to-r.from-blue-50.to-indigo-50"
    );
    this.otherUsersCards = page.locator(
      ".bg-white.dark\\:bg-gray-800\\/50.rounded-xl"
    );
    this.kickUserButton = page.getByRole("button", { name: /kick/i });
    this.makeOwnerButton = page.getByRole("button", {
      name: /make owner|owner/i,
    });

    // Confirmation dialogs
    this.kickConfirmDialog = page
      .locator('[role="alertdialog"]')
      .filter({ hasText: "Kick User" });
    this.ownershipConfirmDialog = page
      .locator('[role="alertdialog"]')
      .filter({ hasText: "Transfer Ownership" });
    this.confirmKickButton = this.kickConfirmDialog.getByRole("button", {
      name: /kick user/i,
    });
    this.confirmOwnershipButton = this.ownershipConfirmDialog.getByRole(
      "button",
      { name: /transfer ownership/i }
    );
    this.cancelKickButton = this.kickConfirmDialog.getByRole("button", {
      name: /cancel/i,
    });
    this.cancelOwnershipButton = this.ownershipConfirmDialog.getByRole(
      "button",
      { name: /cancel/i }
    );

    // Status indicators
    this.ownerBadge = page.locator("text=Owner");
    this.youBadge = page.locator("text=You");
    this.participantRole = page.locator("text=Participant");
    this.spectatorRole = page.locator("text=Spectator");
  }

  async openSettings(): Promise<void> {
    // Click the dropdown trigger (Settings icon button with "Room settings" aria-label)
    await safeClick(this.settingsButton);

    // Then click the "Room settings" menu item
    const settingsMenuItem = this.page
      .getByRole("menuitem")
      .filter({ hasText: "Room settings" });
    await safeClick(settingsMenuItem);

    await expect(this.settingsDialog).toBeVisible({ timeout: 10000 });
  }

  async closeSettings(): Promise<void> {
    // Click outside dialog or use escape key
    await this.page.keyboard.press("Escape");
    await expect(this.settingsDialog).not.toBeVisible();
  }

  async switchToGeneralTab(): Promise<void> {
    await safeClick(this.generalTab);
    await expect(this.roomNameInput).toBeVisible();
  }

  async switchToMembersTab(): Promise<void> {
    await safeClick(this.membersTab);
    await expect(this.membersList).toBeVisible();
  }

  async updateRoomName(newName: string): Promise<void> {
    await this.roomNameInput.fill(newName);
    await safeClick(this.saveRoomNameButton);

    // Wait for success toast or updated name
    await this.page.waitForTimeout(1000);
  }

  async getRoomName(): Promise<string> {
    return await this.roomNameInput.inputValue();
  }

  async getRoomId(): Promise<string> {
    return (await this.roomIdDisplay.textContent()) || "";
  }

  async getCreatedDate(): Promise<string> {
    // Find the date element that comes after "Created" text
    const createdSection = this.page.locator('text="Created"').locator("..");
    const dateElement = createdSection.locator(".font-medium").first();
    return (await dateElement.textContent()) || "";
  }

  async getTotalMembersCount(): Promise<number> {
    try {
      const text = await this.totalMembersCount.textContent({ timeout: 5000 });
      return parseInt(text?.trim() || "0");
    } catch {
      // Fallback: count actual members in the list
      try {
        const membersList = await this.getMembersList();
        return membersList.length;
      } catch {
        return 0;
      }
    }
  }

  async getParticipantsCount(): Promise<number> {
    try {
      const text = await this.participantsCount.textContent({ timeout: 5000 });
      return parseInt(text?.trim() || "0");
    } catch {
      return 0;
    }
  }

  async getSpectatorsCount(): Promise<number> {
    try {
      const text = await this.spectatorsCount.textContent({ timeout: 5000 });
      return parseInt(text?.trim() || "0");
    } catch {
      return 0;
    }
  }

  async getMembersList(): Promise<string[]> {
    const members: string[] = [];

    // Get current user name from the blue gradient card within members list
    // Need to skip the avatar initial and get the actual name
    const currentUserName = await this.currentUserCard
      .locator(".font-semibold")
      .nth(1) // Skip the avatar "A" and get the actual name element
      .textContent();

    if (currentUserName) {
      // For "AliceYouOwner", we want just "Alice"
      // Split on "You" first, then on "Owner"
      let cleanName = currentUserName.split("You")[0].split("Owner")[0].trim();
      if (cleanName) {
        members.push(cleanName);
      }
    }

    // Get other users names from white/gray cards
    const otherUserElements = await this.otherUsersCards.all();
    for (const userElement of otherUserElements) {
      const name = await userElement
        .locator(".font-semibold")
        .nth(1) // Skip the avatar initial and get the actual name element
        .textContent();
      if (name) {
        // Split on "Owner" to get just the name part
        let cleanName = name.split("Owner")[0].trim();
        if (cleanName) {
          members.push(cleanName);
        }
      }
    }

    return members;
  }

  getUserCard(userName: string): Locator {
    // Find user card by name within the members list area
    return this.page
      .locator(".space-y-4.max-h-96 .bg-gradient-to-r, .space-y-4 .bg-white")
      .filter({ hasText: userName })
      .first();
  }

  async isUserOwner(userName: string): Promise<boolean> {
    const userCard = this.getUserCard(userName);
    const ownerBadge = userCard.locator("text=Owner");
    try {
      return await ownerBadge.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async isUserCurrentUser(userName: string): Promise<boolean> {
    const userCard = this.getUserCard(userName);
    const youBadge = userCard.locator("text=You");
    try {
      return await youBadge.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async getUserRole(userName: string): Promise<"participant" | "spectator"> {
    const userCard = this.getUserCard(userName);
    const isSpectator = await userCard
      .locator("text=Spectator")
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    return isSpectator ? "spectator" : "participant";
  }

  async kickUser(userName: string): Promise<void> {
    const userCard = this.getUserCard(userName);
    const kickButton = userCard.getByRole("button", { name: /kick/i });

    await safeClick(kickButton);
    await expect(this.kickConfirmDialog).toBeVisible();

    // Verify the correct user is being kicked
    await expect(this.kickConfirmDialog).toContainText(userName);

    await safeClick(this.confirmKickButton);
    await expect(this.kickConfirmDialog).not.toBeVisible();
  }

  async cancelKickUser(userName: string): Promise<void> {
    const userCard = this.getUserCard(userName);
    const kickButton = userCard.getByRole("button", { name: /kick/i });

    await safeClick(kickButton);
    await expect(this.kickConfirmDialog).toBeVisible();

    await safeClick(this.cancelKickButton);
    await expect(this.kickConfirmDialog).not.toBeVisible();
  }

  async transferOwnership(userName: string): Promise<void> {
    const userCard = this.getUserCard(userName);
    const makeOwnerButton = userCard.getByRole("button", {
      name: /make owner|owner/i,
    });

    await safeClick(makeOwnerButton);
    await expect(this.ownershipConfirmDialog).toBeVisible();

    // Verify the correct user is being made owner
    await expect(this.ownershipConfirmDialog).toContainText(userName);

    await safeClick(this.confirmOwnershipButton);
    await expect(this.ownershipConfirmDialog).not.toBeVisible();
  }

  async cancelTransferOwnership(userName: string): Promise<void> {
    const userCard = await this.getUserCard(userName);
    const makeOwnerButton = userCard.getByRole("button", {
      name: /make owner|owner/i,
    });

    await safeClick(makeOwnerButton);
    await expect(this.ownershipConfirmDialog).toBeVisible();

    await safeClick(this.cancelOwnershipButton);
    await expect(this.ownershipConfirmDialog).not.toBeVisible();
  }

  async expectUserInMembersList(userName: string): Promise<void> {
    const userCard = await this.getUserCard(userName);
    await expect(userCard).toBeVisible();
  }

  async expectUserNotInMembersList(userName: string): Promise<void> {
    const userCard = await this.getUserCard(userName);
    await expect(userCard).not.toBeVisible();
  }

  async expectOwnerActions(
    userName: string,
    shouldHaveActions: boolean
  ): Promise<void> {
    const userCard = this.getUserCard(userName);
    const kickButton = userCard.getByRole("button", { name: /kick/i });
    const makeOwnerButton = userCard.getByRole("button", {
      name: /make owner|owner/i,
    });

    if (shouldHaveActions) {
      await expect(kickButton).toBeVisible({ timeout: 5000 });
      await expect(makeOwnerButton).toBeVisible({ timeout: 5000 });
    } else {
      await expect(kickButton).not.toBeVisible();
      await expect(makeOwnerButton).not.toBeVisible();
    }
  }

  async expectEmptyMembersList(): Promise<void> {
    const emptyState = this.page.locator("text=No other members");
    await expect(emptyState).toBeVisible();
  }

  async expectRoomNameSaveButton(visible: boolean): Promise<void> {
    if (visible) {
      await expect(this.saveRoomNameButton).toBeVisible();
    } else {
      await expect(this.saveRoomNameButton).not.toBeVisible();
    }
  }

  async expectSettingsDialogClosed(): Promise<void> {
    await expect(this.settingsDialog).not.toBeVisible();
  }

  async expectToast(message: string): Promise<void> {
    // Look for toast messages in common locations
    const toast = this.page
      .locator('[role="status"], .sonner-toast, [data-sonner-toast], .toast')
      .filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async hasSettingsAccess(): Promise<boolean> {
    try {
      // Check if the settings dropdown trigger exists and is enabled
      const isVisible = await this.settingsButton.isVisible({
        timeout: 1000,
      });
      if (!isVisible) return false;

      // Click to open dropdown
      await this.settingsButton.click();

      // Check if the settings menu item is enabled
      const settingsMenuItem = this.page
        .getByRole("menuitem")
        .filter({ hasText: "Room settings" });
      const isEnabled = await settingsMenuItem.isEnabled({ timeout: 1000 });

      // Close dropdown by clicking elsewhere
      await this.page.keyboard.press("Escape");

      return isEnabled;
    } catch {
      return false;
    }
  }
}
