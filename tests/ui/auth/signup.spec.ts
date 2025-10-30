import { test, expect } from '../../../fixtures/base';
import { urlPattern, URLS } from '../../../config/urls';
import TestData from '../../../data/testData.json';
import { makeUniqueEmail, makeSignupData } from '../../../utils/userFactory';

/**
 * Signup Tests
 * Refactored to use fixtures and centralized URLs
 */

test("TC-01 Click on 'Signup / Login' button", async ({ stableHomePage, page }) => {
  await test.step('Verify Signup/Login button is visible', async () => {
    await expect(stableHomePage.signupLoginButton).toBeVisible();
  });

  await test.step('Click Signup/Login button', async () => {
    await stableHomePage.clickSignupLoginButton();
  });

  await test.step('Verify navigation to login page', async () => {
    await expect(page).toHaveURL(urlPattern(URLS.login));
  });
});

test('TC-02 Fields validation', async ({ stableHomePage, signupFlowPage, page }) => {
  await test.step('Navigate to Signup/Login page', async () => {
    await stableHomePage.clickSignupLoginButton();
    await expect(page).toHaveURL(urlPattern(URLS.login));
  });

  await test.step('Verify signup form fields are visible', async () => {
    await signupFlowPage.expectSmallFormVisible();
  });
});

test('TC-03 Enter valid name and email address', async ({ stableHomePage, signupFlowPage, page }) => {
  await test.step('Navigate to Signup/Login page', async () => {
    await stableHomePage.clickSignupLoginButton();
  });

  await test.step('Fill signup form with valid data', async () => {
    await signupFlowPage.startSmallForm(
      TestData.validUser.name,
      makeUniqueEmail(TestData.validUser.emailAddress)
    );
  });

  await test.step('Verify navigation to signup details page', async () => {
    await expect(page).toHaveURL(urlPattern(URLS.signup));
  });
});

test('TC-04 Complete signup form and create account', async ({ stableHomePage, signupFlowPage, header, page }) => {
  await test.step('Navigate to Signup/Login page', async () => {
    await stableHomePage.clickSignupLoginButton();
  });

  const signupData = makeSignupData(TestData.validUser, TestData.signupDetails.user1);

  await test.step('Fill initial signup form', async () => {
    await signupFlowPage.startSmallForm(signupData.name, signupData.email);
  });

  await test.step('Fill detailed registration form', async () => {
    await signupFlowPage.fillDetails(signupData);
  });

  await test.step('Verify account was created successfully', async () => {
    await signupFlowPage.expectAccountCreated();
  });

  await test.step('Continue after account creation', async () => {
    await signupFlowPage.clickContinueAfterCreation();
  });

  await test.step('Verify user is logged in', async () => {
    await header.expectLoggedInAs(TestData.validUser.name);
  });
});

test('TC-05 Complete signup flow and delete account', async ({ stableHomePage, signupFlowPage, header, accountDeletedPage }) => {
  await test.step('Navigate to Signup/Login page', async () => {
    await stableHomePage.clickSignupLoginButton();
  });

  const signupData = makeSignupData(TestData.validUser, TestData.signupDetails.user2);

  await test.step('Complete entire signup process', async () => {
    await signupFlowPage.completeSignup(signupData);
  });

  await test.step('Verify user is logged in', async () => {
    await header.expectLoggedInAs(TestData.validUser.name);
  });

  await test.step('Delete account', async () => {
    await header.clickDeleteAccount();
  });

  await test.step('Verify account was deleted', async () => {
    await accountDeletedPage.expectAccountDeletedVisible();
  });
});