/**
 * Centralized URL configuration
 * Avoids hardcoding URLs in tests
 */

export const BASE_URL = 'https://www.automationexercise.com';

export const URLS = {
  home: '/',
  login: '/login',
  signup: '/signup',
  products: '/products',
  productDetails: '/product_details',
  cart: '/view_cart',
  checkout: '/checkout',
  payment: '/payment',
  paymentDone: '/payment_done',
  contactUs: '/contact_us',
  testCases: '/test_cases',
} as const;

/**
 * Helper to create URL regex patterns
 */
export function urlPattern(path: string): RegExp {
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escapedPath}(?:$|[?#])`);
}

/**
 * Helper to create full URL
 */
export function fullUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
