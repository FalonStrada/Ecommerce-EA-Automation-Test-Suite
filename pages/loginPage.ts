import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  private readonly loginForm: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly loginHeader: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginForm = page.locator('form[action="/login"]');
    this.emailInput = this.loginForm.getByPlaceholder('Email Address');
    this.passwordInput = this.loginForm.getByPlaceholder('Password');
    this.loginButton = this.loginForm.getByRole('button', { name: /^Login$/i });
    this.loginHeader = page.getByRole('heading', { name: /Login to your account/i });
    this.errorMessage = page.locator('p').filter({ hasText: /Your email or password is incorrect/i });
  }

  async expectLoginHeaderVisible() {
    await expect(this.loginHeader).toBeVisible();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async expectLoginErrorVisible() {
    await expect(this.errorMessage).toBeVisible();
  }
}
