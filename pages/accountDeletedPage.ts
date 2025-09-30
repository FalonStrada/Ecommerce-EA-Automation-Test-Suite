import { Page, Locator, expect } from '@playwright/test';

export class AccountDeletedPage {
  readonly page: Page;
  private readonly accountDeletedHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountDeletedHeading = page.getByRole('heading', { name: /ACCOUNT DELETED!/i });
  }

  async expectAccountDeletedVisible() {
    await expect(this.accountDeletedHeading).toBeVisible();
  }
}
