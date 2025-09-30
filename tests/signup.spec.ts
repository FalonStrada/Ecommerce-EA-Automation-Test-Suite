import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import TestData from "../data/testData.json";
import { makeUniqueEmail, makeSignupData } from "../utils/userFactory";
import { SignupFlowPage } from "../pages/signupFlowPage";
import { Header } from "../pages/header";
import { AccountDeletedPage } from "../pages/accountDeletedPage";

// Page objects will be initialized in beforeEach
let homePage: HomePage;
test.beforeEach(async ({ page }) => {
  homePage = new HomePage(page);
  await homePage.navigateHomePage();
});

test("TC-01 Click on 'Signup / Login' button", async ({ page }) => {
  await expect(homePage.signupLoginButton).toBeVisible();
  await homePage.clickSignupLoginButton();
  await expect(page).toHaveURL('https://www.automationexercise.com/login');
});

test('TC-02 Fields validation', async ({ page }) => {
  const home = new HomePage(page);
  await expect(home.signupLoginButton).toBeVisible();
  await home.clickSignupLoginButton();
  await expect(page).toHaveURL('https://www.automationexercise.com/login');
  const signupFlow = new SignupFlowPage(page);
  await signupFlow.expectSmallFormVisible();
});

test('TC-03 Enter valid name and email address', async ({ page }) => {
  const home = new HomePage(page);
  await home.clickSignupLoginButton();
  const signupFlow = new SignupFlowPage(page);
  await signupFlow.startSmallForm(
    TestData.validUser.name,
    makeUniqueEmail(TestData.validUser.emailAddress)
  );
  await expect(page).toHaveURL(/https?:\/\/www\.automationexercise\.com\/signup(?:$|[?#])/);
});

test('TC-04 Complete signup form and create account', async ({ page }) => {
  const home = new HomePage(page);
  await home.clickSignupLoginButton();
  
  const signupFlow = new SignupFlowPage(page);
  const signupData = makeSignupData(TestData.validUser, TestData.signupDetails.user1);
  
  // Fill the initial signup form
  await signupFlow.startSmallForm(signupData.name, signupData.email);
  
  // Fill the detailed registration form
  await signupFlow.fillDetails(signupData);
  
  // Verify account was created successfully
  await signupFlow.expectAccountCreated();
  await signupFlow.clickContinueAfterCreation();
  
  // Verify user is logged in
  const header = new Header(page);
  await header.expectLoggedInAs(TestData.validUser.name);
});

test('TC-05 Complete signup flow and delete account', async ({ page }) => {
  const home = new HomePage(page);
  await home.clickSignupLoginButton();
  
  const signupFlow = new SignupFlowPage(page);
  const signupData = makeSignupData(TestData.validUser, TestData.signupDetails.user2);
  
  // Complete the entire signup process
  await signupFlow.completeSignup(signupData);
  
  // Verify user is logged in
  const header = new Header(page);
  await header.expectLoggedInAs(TestData.validUser.name);
  
  // Delete the account to keep test environment clean
  await header.clickDeleteAccount();
  
  // Verify account was deleted
  const accountDeletedPage = new AccountDeletedPage(page);
  await accountDeletedPage.expectAccountDeletedVisible();
});