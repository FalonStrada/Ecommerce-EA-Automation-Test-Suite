import { test as base } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';
import { SignupFlowPage } from '../pages/signupFlowPage';
import { ProductsPage } from '../pages/productsPage';
import { ProductDetailPage } from '../pages/productDetailPage';
import { Header } from '../pages/header';
import { AccountDeletedPage } from '../pages/accountDeletedPage';
import { AdBlocker } from '../utils/adBlocker';
import { makeUniqueEmail, makeSignupData } from '../utils/userFactory';
import testData from '../data/testData.json';

// Interfaces for advanced fixtures
export interface AuthenticatedUser {
  email: string;
  name: string;
  password: string;
}

export interface TestSession {
  user: AuthenticatedUser;
  isLoggedIn: boolean;
  cleanup: () => Promise<void>;
}

// Extend base test with page object fixtures
export const test = base.extend<{
  homePage: HomePage;
  loginPage: LoginPage;
  signupFlowPage: SignupFlowPage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  header: Header;
  accountDeletedPage: AccountDeletedPage;
  adBlocker: AdBlocker;
  // Advanced fixtures
  authenticatedUser: AuthenticatedUser;
  testSession: TestSession;
  cleanSession: void;
  stableHomePage: HomePage;
}>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupFlowPage: async ({ page }, use) => {
    await use(new SignupFlowPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  header: async ({ page }, use) => {
    await use(new Header(page));
  },

  accountDeletedPage: async ({ page }, use) => {
    await use(new AccountDeletedPage(page));
  },

  adBlocker: async ({ page }, use) => {
    const adBlocker = new AdBlocker(page);
    // Setup complete security for all browsers
    await adBlocker.setupCompleteSecurity();
    await use(adBlocker);
  },

  // Advanced Fixtures

  /**
   * Creates a user account and provides authenticated user data
   * Automatically creates and cleans up the account
   */
  authenticatedUser: async ({ page, homePage, signupFlowPage, header, adBlocker }, use) => {
    const uniqueEmail = makeUniqueEmail(testData.validUser.emailAddress);
    const userData = {
      email: uniqueEmail,
      name: testData.validUser.name,
      password: testData.validUser.password
    };

    // Setup: Create account and login with stability
    await homePage.navigateHomePage();
    await adBlocker.closePopups();
    await adBlocker.waitForStablePage();
    await homePage.clickSignupLoginButton();
    
    const signupData = makeSignupData(
      { ...testData.validUser, emailAddress: uniqueEmail }, 
      testData.signupDetails.user1
    );
    
    await signupFlowPage.completeSignup(signupData);
    
    // Provide authenticated user data
    await use(userData);
    
    // Cleanup: Delete account
    try {
      await header.clickDeleteAccount();
    } catch (error) {
      console.log('Account cleanup completed or already cleaned');
    }
  },

  /**
   * Provides a complete test session with user management
   * Includes login state and cleanup functions
   */
  testSession: async ({ page, homePage, signupFlowPage, header, loginPage, adBlocker }, use) => {
    const uniqueEmail = makeUniqueEmail(testData.validUser.emailAddress);
    const userData = {
      email: uniqueEmail,
      name: testData.validUser.name,
      password: testData.validUser.password
    };

    let isLoggedIn = false;
    let accountCreated = false;

    // Setup: Create account with stability
    await homePage.navigateHomePage();
    await adBlocker.closePopups();
    await adBlocker.waitForStablePage();
    await homePage.clickSignupLoginButton();
    
    const signupData = makeSignupData(
      { ...testData.validUser, emailAddress: uniqueEmail }, 
      testData.signupDetails.user1
    );
    
    await signupFlowPage.completeSignup(signupData);
    isLoggedIn = true;
    accountCreated = true;

    const session: TestSession = {
      user: userData,
      isLoggedIn,
      cleanup: async () => {
        if (accountCreated) {
          try {
            if (!isLoggedIn) {
              await homePage.navigateHomePage();
              await homePage.clickSignupLoginButton();
              await loginPage.login(userData.email, userData.password);
            }
            await header.clickDeleteAccount();
            accountCreated = false;
          } catch (error) {
            console.log('Session cleanup completed or already cleaned');
          }
        }
      }
    };

    await use(session);
    
    // Automatic cleanup
    await session.cleanup();
  },

  /**
   * Ensures a clean session by logging out any existing user
   * Useful for tests that need to start from a clean state
   */
  cleanSession: async ({ page, header, adBlocker }, use) => {
    // Setup: Navigate to home and ensure clean state
    try {
      await page.goto('/');
      await adBlocker.closePopups();
      await adBlocker.waitForStablePage();
      
      // Check if user is logged in and logout
      const loggedInText = page.getByText(/Logged in as/i);
      if (await loggedInText.isVisible({ timeout: 3000 })) {
        await header.clickLogout();
        await page.waitForURL(/\/login(?:$|[?#])/, { timeout: 10000 });
      }
    } catch (error) {
      // User was not logged in or logout failed, continue
      console.log('Clean session setup: no user to logout or logout failed');
    }
    
    await use();
    
    // Cleanup: Ensure logout after test (optional, best effort)
    try {
      const loggedInText = page.getByText(/Logged in as/i);
      if (await loggedInText.isVisible({ timeout: 2000 })) {
        await header.clickLogout();
      }
    } catch (error) {
      // User was not logged in, no cleanup needed
      console.log('Clean session cleanup: no user to logout');
    }
  },

  /**
   * HomePage with automatic ad blocking and stability waiting
   * Perfect for tests that need a stable starting point
   */
  stableHomePage: async ({ page, adBlocker }, use) => {
    const homePage = new HomePage(page);
    
    // Only navigate if we're not already on a page
    const currentUrl = page.url();
    if (currentUrl === 'about:blank' || !currentUrl.includes('automationexercise.com')) {
      await homePage.navigateHomePage();
      await adBlocker.closePopups();
      await adBlocker.waitForStablePage();
      await homePage.expectHomeVisible();
    }
    
    await use(homePage);
    
    // No cleanup needed - page will be closed automatically
  },
});

export { expect } from '@playwright/test';
