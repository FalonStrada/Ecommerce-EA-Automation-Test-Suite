import { test, expect } from '../../../fixtures/base';

/**
 * Search Product Tests
 * Note: Search functionality has known bugs (see productsPage.ts for details)
 */
test('TC1: Search Product', async ({ navigatedProductsPage, page }) => {
  // Already on products page via fixture!
  
  await test.step('Enter product name in search input and click search button', async () => {
    await navigatedProductsPage.searchProduct('dress');
  });

  await test.step('Verify SEARCHED PRODUCTS is visible', async () => {
    await navigatedProductsPage.expectSearchedProductsVisible();
  });

  await test.step('Verify all the products related to search are visible', async () => {
    // BUG: This will show warning because search doesn't filter
    await navigatedProductsPage.expectSearchResultsVisible('dress');
  });
  
  await test.step('Verify URL is still on products page', async () => {
    await expect(page).toHaveURL(/\/products(?:$|[?#])/);
  });
});
