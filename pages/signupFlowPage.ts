import { Page, Locator, expect } from '@playwright/test';

export interface SignupFlowData {
  name: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  country?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  mobileNumber?: string;
}

// Compact POM that encapsulates the entire signup journey on Automation Exercise
// (left small form + details form + account created screen)
export class SignupFlowPage {
  readonly page: Page;

  // Step 1: Left small form (on /login)
  private readonly smallForm: Locator;
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly signupButton: Locator;

  // Step 2: Details form
  private readonly passwordInput: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly address1Input: Locator;
  private readonly countrySelect: Locator;
  private readonly stateInput: Locator;
  private readonly cityInput: Locator;
  private readonly zipcodeInput: Locator;
  private readonly mobileNumberInput: Locator;
  private readonly createAccountButton: Locator;

  // Step 3: Account created confirmation
  private readonly accountCreatedHeading: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Small form (left side)
    this.smallForm = page.locator('form[action="/signup"]');
    this.nameInput = this.smallForm.getByPlaceholder('Name');
    this.emailInput = this.smallForm.getByPlaceholder('Email Address');
    this.signupButton = this.smallForm.getByRole('button', { name: /^Signup$/i });

    // Details form
    // Prefer explicit IDs used by Automation Exercise for reliability
    this.passwordInput = page.locator('#password');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.address1Input = page.locator('#address1');
    this.countrySelect = page.locator('select[name="country"], #country');
    this.stateInput = page.locator('#state');
    this.cityInput = page.locator('#city');
    this.zipcodeInput = page.locator('#zipcode');
    this.mobileNumberInput = page.locator('#mobile_number');
    this.createAccountButton = page.getByRole('button', { name: /Create Account/i }).or(page.locator('[data-qa="create-account"]'));

    // Created confirmation
    this.accountCreatedHeading = page.getByRole('heading', { name: /ACCOUNT CREATED!/i });
    this.continueButton = page.getByRole('link', { name: /Continue/i });
  }

  async startSmallForm(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.signupButton.click();
    // Wait for the account details form to be ready
    await this.passwordInput.waitFor({ state: 'visible' });
  }

  async expectSmallFormVisible() {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.signupButton).toBeVisible();
  }

  async fillDetails(data: SignupFlowData) {
    // Ensure details form is visible before interacting
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(data.password);
    await this.firstNameInput.fill(data.firstName ?? 'John');
    await this.lastNameInput.fill(data.lastName ?? 'Doe');
    await this.address1Input.fill(data.address1 ?? '123 Main St');
    await this.countrySelect.selectOption({ label: data.country ?? 'Canada' });
    await this.stateInput.fill(data.state ?? 'ON');
    await this.cityInput.fill(data.city ?? 'Toronto');
    await this.zipcodeInput.fill(data.zipcode ?? 'A1A1A1');
    await this.mobileNumberInput.fill(data.mobileNumber ?? '+1 416 555 0000');
    await this.createAccountButton.click();
  }

  async expectAccountCreated() {
    await expect(this.accountCreatedHeading).toBeVisible();
  }

  async clickContinueAfterCreation() {
    await this.continueButton.click();
  }

  async completeSignup(data: SignupFlowData) {
    await this.startSmallForm(data.name, data.email);
    await this.fillDetails(data);
    await this.expectAccountCreated();
    await this.clickContinueAfterCreation();
  }
}
