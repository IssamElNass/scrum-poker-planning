import { Page, Locator, expect } from "@playwright/test";
import { safeClick } from "../utils/test-helpers";

export class JoinRoomPage {
  readonly page: Page;
  readonly joinDialog: Locator;
  readonly nameInput: Locator;
  readonly participantRadio: Locator;
  readonly spectatorRadio: Locator;
  readonly joinButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly dialogTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dialog elements - looking for the join room container
    this.joinDialog = page.locator(".max-w-md.w-full.space-y-6.bg-card").first();
    this.dialogTitle = page.getByRole("heading", { name: "Join Room" });

    // Form elements
    this.nameInput = page.getByPlaceholder("Enter your name");
    // Switch is used for spectator mode
    this.spectatorRadio = page.getByRole("switch", { name: "Join as spectator" });
    this.participantRadio = page.locator(".dummy-participant-radio"); // Not used in current UI

    // Buttons
    this.joinButton = page.getByRole("button", { name: "Join Room" });
    this.cancelButton = page.locator(".dummy-cancel-button"); // Not present in current UI

    // Error handling - using alert for now as per the component
    this.errorMessage = page.locator(".dummy-error-message"); // Not present in current UI
  }

  async waitForDialog(): Promise<void> {
    await expect(this.joinDialog).toBeVisible({ timeout: 5000 });
  }

  async enterName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async selectParticipantRole(): Promise<void> {
    // In current UI, participant is default when spectator switch is off
    const isSpectatorOn = await this.spectatorRadio.isChecked();
    if (isSpectatorOn) {
      await safeClick(this.spectatorRadio); // Turn off spectator mode
    }
  }

  async selectSpectatorRole(): Promise<void> {
    const isSpectatorOn = await this.spectatorRadio.isChecked();
    if (!isSpectatorOn) {
      await safeClick(this.spectatorRadio); // Turn on spectator mode
    }
    await expect(this.spectatorRadio).toBeChecked();
  }

  async clickJoin(): Promise<void> {
    await safeClick(this.joinButton);
  }

  async clickCancel(): Promise<void> {
    await safeClick(this.cancelButton);
  }

  async joinAsParticipant(name: string): Promise<void> {
    await this.waitForDialog();
    await this.enterName(name);
    await this.selectParticipantRole();
    await this.clickJoin();
  }

  async joinAsSpectator(name: string): Promise<void> {
    await this.waitForDialog();
    await this.enterName(name);
    await this.selectSpectatorRole();
    await this.clickJoin();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectNoErrorMessage(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async isJoinButtonEnabled(): Promise<boolean> {
    return await this.joinButton.isEnabled();
  }

  async expectJoinButtonDisabled(): Promise<void> {
    await expect(this.joinButton).toBeDisabled();
  }

  async expectJoinButtonEnabled(): Promise<void> {
    await expect(this.joinButton).toBeEnabled();
  }

  async expectDialogClosed(): Promise<void> {
    await expect(this.joinDialog).not.toBeVisible();
  }

  async getNameInputValue(): Promise<string> {
    return await this.nameInput.inputValue();
  }

  async expectNameInputValue(value: string): Promise<void> {
    await expect(this.nameInput).toHaveValue(value);
  }

  async isParticipantSelected(): Promise<boolean> {
    // Participant is selected when spectator switch is off
    const isSpectatorOn = await this.spectatorRadio.isChecked();
    return !isSpectatorOn;
  }

  async isSpectatorSelected(): Promise<boolean> {
    return await this.spectatorRadio.isChecked();
  }
}
