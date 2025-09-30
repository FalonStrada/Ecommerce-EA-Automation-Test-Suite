import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  private readonly productName: Locator;
  private readonly productCategory: Locator;
  private readonly productPrice: Locator;
  private readonly productAvailability: Locator;
  private readonly productCondition: Locator;
  private readonly productBrand: Locator;

  constructor(page: Page) {
    this.page = page;
    // Product details are typically in a product-details section
    this.productName = page.locator('.product-information h2');
    this.productCategory = page.locator('.product-information p').filter({ hasText: /Category:/i });
    this.productPrice = page.locator('.product-information span span');
    this.productAvailability = page.locator('.product-information p').filter({ hasText: /Availability:/i });
    this.productCondition = page.locator('.product-information p').filter({ hasText: /Condition:/i });
    this.productBrand = page.locator('.product-information p').filter({ hasText: /Brand:/i });
  }

  async expectProductDetailsVisible() {
    await expect(this.productName).toBeVisible();
    await expect(this.productCategory).toBeVisible();
    await expect(this.productPrice).toBeVisible();
    await expect(this.productAvailability).toBeVisible();
    await expect(this.productCondition).toBeVisible();
    await expect(this.productBrand).toBeVisible();
  }

  async expectProductNameVisible() {
    await expect(this.productName).toBeVisible();
  }

  async expectProductCategoryVisible() {
    await expect(this.productCategory).toBeVisible();
  }

  async expectProductPriceVisible() {
    await expect(this.productPrice).toBeVisible();
  }

  async expectProductAvailabilityVisible() {
    await expect(this.productAvailability).toBeVisible();
  }

  async expectProductConditionVisible() {
    await expect(this.productCondition).toBeVisible();
  }

  async expectProductBrandVisible() {
    await expect(this.productBrand).toBeVisible();
  }
}
