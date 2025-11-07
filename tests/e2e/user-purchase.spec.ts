import { test, expect } from '../../fixtures/base';
import testData from '../../data/testData.json';
import { fullUrl, URLS } from '../../config/urls';
import { makeUniqueEmail, makeSignupData } from '../../utils/userFactory';


test.describe('User Purchase Tests', () => {
  test.beforeEach(async ({ page, adBlocker }) => {
    await page.goto(fullUrl(URLS.home));
    await adBlocker.closePopups();
    await adBlocker.waitForStablePage();
  });

  test('E2E: Logged user purchases two products from Products flow', async ({
    page,
    homePage,
    signupFlowPage,
    header,
    userPurchasePage,
    adBlocker,
  }) => {
    // Create user account without auto-cleanup
    const uniqueEmail = makeUniqueEmail(testData.validUser.emailAddress);
    const userData = {
      email: uniqueEmail,
      name: testData.validUser.name,
      password: testData.validUser.password
    };

    await test.step('Create account and login', async () => {
      await homePage.navigateHomePage();
      await adBlocker.closePopups();
      await adBlocker.waitForStablePage();
      await homePage.clickSignupLoginButton();
      
      const signupData = makeSignupData(
        { ...testData.validUser, emailAddress: uniqueEmail }, 
        testData.signupDetails.user1
      );
      
      await signupFlowPage.completeSignup(signupData);
    });

    await test.step('Verify logged in indicator is visible', async () => {
      await header.expectLoggedInAs(userData.name);
    });

    await test.step('Navigate to Products > Women > Dress', async () => {
      await userPurchasePage.navigateToProducts();
      await userPurchasePage.navigateToWomenDressCategory();
      await expect(page).toHaveURL(/products/i);
    });

    await test.step('Add two products to cart from dress category', async () => {
      await userPurchasePage.addProductToCart(0);
      await userPurchasePage.continueShopping();

      await userPurchasePage.addProductToCart(1);
      await userPurchasePage.viewCart();
    });

    await test.step('Validate cart contains at least two items', async () => {
      await userPurchasePage.expectCartVisible();
      const count = await userPurchasePage.expectAtLeastTwoItems();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    await test.step('Proceed to checkout and verify delivery address section', async () => {
      await userPurchasePage.proceedToCheckout();
      await expect(page).toHaveURL(/checkout/i);
      await expect(page.locator('#address_delivery')).toContainText(testData.signupDetails.user1.firstName);
    });

    await test.step('Place order and arrive at payment form', async () => {
      await userPurchasePage.placeOrder();
      await expect(page).toHaveURL(/payment/i);
    });

    await test.step('Fill payment information and confirm order', async () => {
      const cardNumberInput = page.locator('input[name="card_number"]');
      await cardNumberInput.click({ button: 'right' });
      await page.keyboard.press('Escape');

      await userPurchasePage.fillPaymentForm({
        nameOnCard: 'James Bond',
        cardNumber: '5555444433331111',
        cvc: '897',
        expiryMonth: '01',
        expiryYear: '2030',
      });

      await userPurchasePage.payAndConfirm();
      await userPurchasePage.expectOrderSuccess();
    });

    await test.step('Return to home and verify session persists', async () => {
      await userPurchasePage.continueAfterPayment();
      await expect(page).toHaveURL(fullUrl(URLS.home));
      await header.expectLoggedInAs(userData.name);
    });
  });
});