import { Page, Locator, expect } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  private readonly allProductsHeader: Locator;
  private readonly productsGrid: Locator;
  private readonly firstProductCard: Locator;
  private readonly firstViewProductLink: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly searchedProductsHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    // The All Products page shows this heading
    this.allProductsHeader = page.getByRole('heading', { name: /All Products/i });
    // Main products list container used on automationexercise
    this.productsGrid = page.locator('.features_items');
    // First product card and its View Product link
    this.firstProductCard = this.productsGrid.locator('.col-sm-4').first();
    this.firstViewProductLink = this.firstProductCard.getByRole('link', { name: /View Product/i });
    // Search functionality
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsHeader = page.getByRole('heading', { name: /Searched Products/i });
  }

  async expectAllProductsVisible() {
    await expect(this.allProductsHeader).toBeVisible();
  }

  async expectProductsListVisible() {
    await expect(this.productsGrid).toBeVisible();
    // Ensure at least one product exists (assert first card is visible)
    await expect(this.productsGrid.locator('.col-sm-4').first()).toBeVisible();
  }

  async clickFirstViewProduct() {
    await this.firstViewProductLink.click();
    await this.page.waitForURL(/\/product_details\//);
  }

  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
  }

  async expectSearchedProductsVisible() {
    await expect(this.searchedProductsHeader).toBeVisible();
  }

  async expectSearchResultsVisible(searchTerm: string) {
    await expect(this.productsGrid).toBeVisible();
    
    // Obtener todos los productos mostrados - selector actualizado para coincidir con la estructura real
    const productItems = this.productsGrid.locator('.product-image-wrapper');
    const count = await productItems.count();
    
    // Verificar que hay al menos un resultado
    if (count === 0) {
      throw new Error('No se encontraron productos en los resultados de búsqueda');
    }
    
    // Verificar que cada producto mostrado contiene el término de búsqueda
    for (let i = 0; i < count; i++) {
      const currentItem = productItems.nth(i);
      const productName = await currentItem.locator('p').first().textContent() || '';
      const productNameLower = productName.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      
      // Verificar que el término de búsqueda está en el nombre del producto
      if (!productNameLower.includes(searchTermLower)) {
        // Si no está en el nombre, verificar en la descripción si existe
        const productDescription = await currentItem.locator('p:not(.text-center)').first().textContent() || '';
        const productDescriptionLower = productDescription.toLowerCase();
        
        if (!productDescriptionLower.includes(searchTermLower)) {
          throw new Error(`El producto "${productName}" no contiene el término de búsqueda "${searchTerm}" en su nombre o descripción`);
        }
      }
    }
  }
}
