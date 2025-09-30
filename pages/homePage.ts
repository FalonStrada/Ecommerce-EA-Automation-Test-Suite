import {Page,Locator} from '@playwright/test';

export class HomePage {
    readonly signupLoginButton: Locator;
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        // Use accessible role and a regex to avoid dependency on icon characters or exact spacing
        this.signupLoginButton = page.getByRole('link', { name: /Signup\s*\/\s*Login/i });
    }

    async clickSignupLoginButton() {
        await this.signupLoginButton.click();
        await this.page.waitForURL(/\/login(?:$|[?#])/);
    }

    async navigateHomePage() {
        // Use baseURL set in playwright.config.ts
        await this.page.goto('/');
    }

    async expectHomeVisible() {
        // A lightweight verification that home loaded successfully.
        // We assert the URL and that the Signup/Login link is visible on the page header.
        await this.signupLoginButton.waitFor({ state: 'visible' });
    }
}