import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { Header } from '../pages/header';
import { ProductsPage } from '../pages/productsPage';
import { ProductDetailPage } from '../pages/productDetailPage';

test('TC1: Verify All Products and product detail page', async ({ page }) => {
  const home = new HomePage(page);
  const header = new Header(page);
  const products = new ProductsPage(page);
  const productDetail = new ProductDetailPage(page);

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

  await test.step('Verify products list is visible', async () => {
    await products.expectProductsListVisible();
  });

  await test.step('Click on View Product of first product', async () => {
    await products.clickFirstViewProduct();
  });

  await test.step('Verify user is landed to product detail page', async () => {
    await expect(page).toHaveURL(/\/product_details\//);
  });

  await test.step('Verify product details are visible: name, category, price, availability, condition, brand', async () => {
    await productDetail.expectProductDetailsVisible();
  });
});
