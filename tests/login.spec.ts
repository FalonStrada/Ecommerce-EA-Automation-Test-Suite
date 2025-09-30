import { test } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';
import { AccountDeletedPage } from '../pages/accountDeletedPage';
import { Header } from '../pages/header';
import { makeUniqueEmail } from '../utils/userFactory';
import { SignupFlowPage } from '../pages/signupFlowPage';

// Use CommonJS require for JSON to avoid needing tsconfig resolveJsonModule.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import testData from '../data/testData.json';


test('TC1: Login with incorrect email and password', async ({ page }) => {
  const home = new HomePage(page);
  const login = new LoginPage(page);

  const { invalidUser } = testData;

  await test.step('Navigate to home page', async () => {
    await home.navigateHomePage();
    await home.expectHomeVisible();
  });

  await test.step("Open 'Signup / Login' page", async () => {
    await home.clickSignupLoginButton();
    await login.expectLoginHeaderVisible();
  });

  await test.step('Attempt login with incorrect credentials', async () => {
    await login.login(invalidUser.emailAddress, invalidUser.password);
  });

  await test.step('Verify error message is displayed', async () => {
    await login.expectLoginErrorVisible();
  });
});

test('TC2: Login user with correct email and password then delete account (self-sufficient, compact POM)', async ({ page }) => {
  const home = new HomePage(page);
  const login = new LoginPage(page);
  const accountDeleted = new AccountDeletedPage(page);
  const header = new Header(page);
  const signupFlow = new SignupFlowPage(page);

  const { validUser } = testData;
  const uniqueEmail = makeUniqueEmail(validUser.emailAddress);
  const password = validUser.password;

  await test.step('Navigate to home and verify it is visible', async () => {
    await home.navigateHomePage();
    await home.expectHomeVisible();
  });

  await test.step('Precondition: Create a new user via UI', async () => {
    await test.step("Open 'Signup / Login' page", async () => {
      await home.clickSignupLoginButton();
      await login.expectLoginHeaderVisible();
    });

    await test.step('Complete signup flow (small form + details + created + continue)', async () => {
      await signupFlow.completeSignup({ name: validUser.name, email: uniqueEmail, password });
      await page.waitForURL(/\/(?:$|[?#])/);
    });

    await test.step("Verify 'Logged in as <username>' and logout", async () => {
      await header.expectLoggedInAs(validUser.name);
      await header.clickLogout();
    });
  });

  await test.step("Verify 'Login to your account' is visible", async () => {
    await login.expectLoginHeaderVisible();
  });

  await test.step('Login with the new user credentials', async () => {
    await login.login(uniqueEmail, password);
  });

  await test.step("Verify 'Logged in as <username>' is visible", async () => {
    await page.waitForURL(/\/(?:$|[?#])/);
    await header.expectLoggedInAs(validUser.name);
  });

  await test.step('Delete account and verify deletion', async () => {
    await header.clickDeleteAccount();
    await accountDeleted.expectAccountDeletedVisible();
  });
});
