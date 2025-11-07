import { test, expect } from '../../../fixtures/base';
import testData from '../../../data/testData.json';
import { fullUrl, URLS } from '../../../config/urls';



test.describe('Login Tests', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto(fullUrl(URLS.login));
    await loginPage.expectLoginHeaderVisible();
  });

  test('E1: Should show error with invalid credentials', async ({ loginPage }) => {
    const { invalidUser } = testData;
    
    await test.step('Fill email and password with invalid credentials', async () => {
      await loginPage.fillEmail(invalidUser.emailAddress);
      await loginPage.fillPassword(invalidUser.password);
    });

    await test.step('Click Login button', async () => {
      await loginPage.clickLogin();
    });

    await test.step('Verify error message "Your email or password is incorrect!" is displayed', async () => {
      await loginPage.expectLoginErrorVisible('Your email or password is incorrect!');
    });
  });

  test('E2: Should show validation message with empty password', async ({ loginPage }) => {
    const { validUser } = testData;
    
    await test.step('Fill email field with valid email', async () => {
      await loginPage.fillEmail(validUser.emailAddress);
    });

    await test.step('Leave password field empty and click Login button', async () => {
      await loginPage.clickLogin();
    });

    await test.step('Verify validation message "Completa este campo" is displayed', async () => {
      await loginPage.expectValidationMessage('Completa este campo');
    });
  });

  test('E3: Should show validation message with empty email', async ({ loginPage }) => {
    const { validUser } = testData;
    
    await test.step('Leave email field empty', async () => {
      // Email field is already empty
    });

    await test.step('Fill password field and click Login button', async () => {
      await loginPage.fillPassword(validUser.password);
      await loginPage.clickLogin();
    });

    await test.step('Verify validation message "Completa este campo" is displayed', async () => {
      await loginPage.expectValidationMessage('Completa este campo');
    });
  });
});

test.describe('Positive Login Test', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto(fullUrl(URLS.login));
    await loginPage.expectLoginHeaderVisible();
  });

  test('E4: Should login successfully with valid credentials', async ({ page, loginPage, header }) => {
    const validCredentials = {
      emailAddress: 'unmail@mailinator.com',
      password: '12345678'
    };
    
    await test.step('Fill email field with valid email', async () => {
      await loginPage.fillEmail(validCredentials.emailAddress);
    });

    await test.step('Fill password field with valid password', async () => {
      await loginPage.fillPassword(validCredentials.password);
    });

    await test.step('Click Login button', async () => {
      await loginPage.clickLogin();
    });

    await test.step('Verify successful login - user is redirected to home page', async () => {
      await loginPage.page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(fullUrl(URLS.home));
    });

    await test.step('Verify logout link is visible', async () => {
      await expect(header.page.getByRole('link', { name: /Logout/i })).toBeVisible();
    });
  });
});



  
  

