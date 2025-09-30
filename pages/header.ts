import { Page, Locator, expect } from '@playwright/test';

export class Header {
  readonly page: Page;
  private readonly logoutLink: Locator;
  private readonly loggedInAsText: Locator;
  private readonly deleteAccountLink: Locator;
  private readonly productsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutLink = page.getByRole('link', { name: /Logout/i });
    // The site renders this as a link in the header
    this.loggedInAsText = page.getByRole('link', { name: /Logged in as/i });
    this.deleteAccountLink = page.getByRole('link', { name: /Delete Account/i });
    this.productsLink = page.getByRole('link', { name: /Products/i });
  }

  async clickLogout() {
    await this.logoutLink.click();
    await this.page.waitForURL(/\/login(?:$|[?#])/, { timeout: 10000 });
  }

  async expectLoggedInAs(username: string) {
    // Be flexible: some pages render this as a link, but we match any text containing the phrase
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`Logged\\s*in\\s*as\\s*${escaped}`, 'i');
    await expect(this.page.getByText(pattern)).toBeVisible({ timeout: 15_000 });
  }

  async clickDeleteAccount() {
    await this.deleteAccountLink.click();
  }

  async clickProducts() {
    await this.productsLink.click();
    await this.page.waitForURL(/\/products(?:$|[?#])/, { timeout: 15000 });
  }
}
