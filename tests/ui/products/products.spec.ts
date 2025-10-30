import { test, expect } from '../../../fixtures/base';

test('TC1: Verify All Products and product detail page', async ({ navigatedProductsPage, productDetailPage, page }) => {
  // Already on products page via fixture!

  await test.step('Verify products list is visible', async () => {
    await navigatedProductsPage.expectProductsListVisible();
  });

  await test.step('Click on View Product of first product', async () => {
    await navigatedProductsPage.clickFirstViewProduct();
  });

  await test.step('Verify user is landed to product detail page', async () => {
    await expect(page).toHaveURL(/\/product_details\//);
  });

  await test.step('Verify product details are visible: name, category, price, availability, condition, brand', async () => {
    await productDetailPage.expectProductDetailsVisible();
  });
});
