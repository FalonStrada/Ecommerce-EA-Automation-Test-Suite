import { Page, Locator, expect } from '@playwright/test';
import { fullUrl } from '../config/urls';
import { URLS } from '../config/urls';

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
    // Esperar a que el estado de la página sea listo antes de verificar
    await this.page.waitForLoadState('networkidle');
    await this.loginHeader.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.loginHeader).toBeVisible();
  }

  async fillEmail(email: string) {
    // Esperar a que el input esté visible antes de llenar
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    // Esperar a que el input esté visible antes de llenar
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    // Esperar a que el botón esté visible y habilitado antes de hacer click
    await this.loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
    // Esperar a que la página esté lista y luego verificar la URL
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForURL(fullUrl(URLS.home), { timeout: 15000 });
  }

  /**
   * Verifies the validation message is visible and matches the expected text
   * Handles HTML5 validation messages that are bound to the form element
   * @param expectedMessage - The expected validation message text
   */
  async expectLoginErrorVisible(expectedMessage: string = 'Your email or password is incorrect!') {
    // Esperar a que el elemento de error esté visible
    await this.errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    
    // Verify the error message element is visible
    await expect(this.errorMessage, 'Error message should be visible').toBeVisible();
    
    // Verify the exact text matches
    await expect(this.errorMessage, 'Error message text does not match expected').toHaveText(expectedMessage);
  }

  /**
   * Verifies that an HTML5 validation message is visible on any input
   * Note: HTML5 validation messages are browser/OS language-dependent
   * This method validates that a message EXISTS, not the exact text
   * @param expectedMessage - Optional expected message text (for logging purposes)
   */
  async expectValidationMessage(expectedMessage?: string) {
    // Esperar a que el mensaje de validación HTML5 esté disponible en algún input
    await this.page.waitForFunction(
      () => {
        const form = document.querySelector('form[action="/login"]') as HTMLFormElement;
        if (!form) return false;
        
        // Get all input elements in the form
        const inputs = form.querySelectorAll('input');
        
        // Check if any input has a validation message (language-independent)
        for (const input of inputs) {
          const inputElement = input as HTMLInputElement;
          // Validate that a message exists and is not empty
          if (inputElement.validationMessage && inputElement.validationMessage.length > 0) {
            return true;
          }
        }
        
        return false;
      },
      { timeout: 10000 }
    );
  }
}
