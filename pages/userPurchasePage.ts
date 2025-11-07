import { Page, Locator, expect } from '@playwright/test';

export class UserPurchasePage {
  readonly page: Page;
  private readonly productsLink: Locator;
  private readonly womenCategoryLink: Locator;
  private readonly dressSubcategoryLink: Locator;
  private readonly productCards: Locator;
  private readonly cartModal: Locator;
  private readonly cartModalContinueButton: Locator;
  private readonly cartModalViewCartLink: Locator;
  private readonly cartItems: Locator;
  private readonly cartItemsTable: Locator;
  private readonly proceedToCheckoutButton: Locator;
  private readonly placeOrderButton: Locator;
  private readonly nameOnCardInput: Locator;
  private readonly cardNumberInput: Locator;
  private readonly cvcInput: Locator;
  private readonly expiryMonthInput: Locator;
  private readonly expiryYearInput: Locator;
  private readonly payAndConfirmButton: Locator;
  private readonly continueButton: Locator;
  private readonly cartTotalsSummary: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Navigation links
    this.productsLink = page.getByRole('link', { name: /Products/i }).first();
    this.womenCategoryLink = page.getByRole('link', { name: /Women/i }).first();
    this.dressSubcategoryLink = page.getByRole('link', { name: /Dress/i }).first();

    // Product actions
    this.productCards = page.locator('.features_items .col-sm-4');
    this.cartModal = page.locator('#cartModal');
    this.cartModalContinueButton = this.cartModal.getByRole('button', { name: /Continue Shopping/i });
    this.cartModalViewCartLink = this.cartModal.getByRole('link', { name: /View Cart/i });

    // Cart
    this.cartItemsTable = page.locator('#cart_info_table');
    this.cartItems = this.cartItemsTable.locator('tbody tr');
    this.cartTotalsSummary = page.locator('#do_action .total_area li').filter({ hasText: /^Total/i }).locator('span');

    // Checkout buttons
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');
    this.placeOrderButton = page.getByText('Place Order', { exact: true });

    // Payment inputs
    this.nameOnCardInput = page.locator('input[name="name_on_card"]');
    this.cardNumberInput = page.locator('input[name="card_number"]');
    this.cvcInput = page.locator('input[name="cvc"]');
    this.expiryMonthInput = page.locator('input[placeholder*="MM"]');
    this.expiryYearInput = page.locator('input[placeholder*="YYYY"]');
    this.payAndConfirmButton = page.getByRole('button', { name: /Pay and Confirm Order/i });
    this.continueButton = page.getByRole('link', { name: /Continue/i }).last();

    // Success message
    this.successMessage = page.getByText('Congratulations! Your order has been confirmed!', { exact: true });
  }

  async navigateToProducts() {
    await this.productsLink.click();
    await this.page.waitForURL(/\/products(?:$|[?#])/);
  }

  async navigateToWomenDressCategory() {
    await this.womenCategoryLink.click();
    await this.dressSubcategoryLink.click();
  }

  async addProductToCart(index = 0) {
    const card = this.productCards.nth(index);
    await expect(card, `Product card at index ${index} should be visible`).toBeVisible();
    
    // Hover to reveal the overlay with Add to cart button
    await card.hover();
    
    // Wait for overlay to appear and click Add to cart
    // Use :has-text selector to find link within this specific card
    const addToCartButton = card.locator('a:has-text("Add to cart")').first();
    await addToCartButton.waitFor({ state: 'visible', timeout: 5000 });
    await addToCartButton.click();
    
    // Wait for modal content to be visible ("Added!" message)
    await this.page.locator('#cartModal').locator('text=Added!').waitFor({ state: 'visible', timeout: 10000 });
  }

  async continueShopping() {
    await this.cartModalContinueButton.click();
    await this.cartModal.waitFor({ state: 'hidden' });
  }

  async viewCart() {
    await this.cartModalViewCartLink.click();
    await this.page.waitForURL(/\/view_cart(?:$|[?#])/);
  }

  async expectCartVisible() {
    await expect(this.cartItemsTable).toBeVisible();
  }

  async getCartItemsCount() {
    return this.cartItems.count();
  }

  async getCartItemDetails(index: number) {
    const item = this.cartItems.nth(index);
    
    // Extract product name from Description column (td index 1)
    const nameText = await item.locator('td').nth(1).textContent();
    const name = nameText?.split('\n')[0]?.trim() ?? '';
    
    // Extract unit price from Price column (td index 2)
    const priceText = await item.locator('td').nth(2).textContent();
    const unitPrice = parseFloat(priceText?.replace(/[^0-9.]/g, '') ?? '0');
    
    // Extract quantity from Quantity column (td index 3) - it's an input field
    const quantityInput = item.locator('td').nth(3).locator('input');
    const quantityValue = await quantityInput.inputValue();
    const quantity = parseInt(quantityValue ?? '1', 10);
    
    // Extract total from Total column (td index 4)
    const totalText = await item.locator('td').nth(4).textContent();
    const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') ?? '0');

    return { name, unitPrice, quantity, total };
  }

  async expectAtLeastTwoItems() {
    const count = await this.getCartItemsCount();
    expect(count).toBeGreaterThanOrEqual(2);
    return count;
  }

  async expectItemsTotalsConsistent() {
    const count = await this.getCartItemsCount();
    expect(count).toBeGreaterThan(0);

    let sumOfTotals = 0;
    for (let i = 0; i < count; i++) {
      const { unitPrice, quantity, total } = await this.getCartItemDetails(i);
      expect(total).toBeCloseTo(unitPrice * quantity, 0);
      sumOfTotals += total;
    }

    const totalText = await this.cartTotalsSummary.textContent();
    const displayedTotal = parseFloat(totalText?.replace(/[^0-9.]/g, '') ?? '0');
    expect(displayedTotal).toBeCloseTo(sumOfTotals, 0);
    return { count, sumOfTotals, displayedTotal };
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
    await this.page.waitForURL(/\/checkout(?:$|[?#])/);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
    await this.page.waitForURL(/\/payment(?:$|[?#])/);
  }

  async fillPaymentForm({
    nameOnCard,
    cardNumber,
    cvc,
    expiryMonth,
    expiryYear,
  }: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }) {
    await this.nameOnCardInput.fill(nameOnCard);
    await this.cardNumberInput.fill(cardNumber);
    await this.cvcInput.fill(cvc);
    await this.expiryMonthInput.fill(expiryMonth);
    await this.expiryYearInput.fill(expiryYear);
  }

  async payAndConfirm() {
    await this.payAndConfirmButton.click();
  }

  async continueAfterPayment() {
    await this.continueButton.click();
  }

  async expectOrderSuccess() {
    await expect(this.successMessage).toBeVisible();
  }
}
