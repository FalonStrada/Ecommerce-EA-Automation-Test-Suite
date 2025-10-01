import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { Header } from '../pages/header';
import { ProductsPage } from '../pages/productsPage';

test('TC1: Search Product', async ({ page }) => {
  const home = new HomePage(page);
  const header = new Header(page);
  const products = new ProductsPage(page);

  await test.step('Navigate to home page', async () => {
    await home.navigateHomePage();
  });

  await test.step('Verify that home page is visible successfully', async () => {
    await home.expectHomeVisible();
  });

  await test.step('Click on Products button', async () => {
    await header.clickProducts();
  });

  await test.step('Verify user is navigated to ALL PRODUCTS page successfully', async () => {
    await products.expectAllProductsVisible();
    await expect(page).toHaveURL(/\/products(?:$|[?#])/);
  });

  await test.step('Enter product name in search input and click search button', async () => {
    await products.searchProduct('dress');
  });

  await test.step('Verify SEARCHED PRODUCTS is visible', async () => {
    await products.expectSearchedProductsVisible();
  });

  await test.step('Verify all the products related to search are visible', async () => {
    await products.expectSearchResultsVisible('dress');
  });
});
