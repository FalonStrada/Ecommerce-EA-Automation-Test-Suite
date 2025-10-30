import { test as base, APIRequestContext, expect } from '@playwright/test';
import { API_CONFIG, ENDPOINTS, APIEndpoints } from '../config/api-config';
import { APITestHelpers } from '../utils/apiHelpers';
import { APIResponseValidator } from '../utils/apiValidator';
import { APIInterceptor } from '../utils/apiInterceptor';

/**
 * Extended API fixtures for comprehensive API testing
 * Follows Playwright best practices and API testing heuristics
 */

export interface APIFixtures {
  /** Pre-configured API request context with base URL and headers */
  apiContext: APIRequestContext;
  
  /** Helper utilities for common API operations */
  apiHelpers: APITestHelpers;
  
  /** Response validation utilities with JSON Schema support */
  apiValidator: APIResponseValidator;
  
  /** Request/Response interceptor for debugging and monitoring */
  apiInterceptor: APIInterceptor;
  
  /** Endpoint builder for constructing API URLs */
  endpoints: APIEndpoints;
  
  /** Authenticated API context (with valid user token/session) */
  authenticatedAPI: APIRequestContext;
}

export const apiTest = base.extend<APIFixtures>({
  /**
   * Base API request context
   * Configured with default headers and base URL
   */
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_CONFIG.baseURL,
      extraHTTPHeaders: {
        ...API_CONFIG.headers.common,
      },
      timeout: API_CONFIG.timeout.default,
      ignoreHTTPSErrors: false, // Enforce SSL validation
    });

    await use(context);
    await context.dispose();
  },

  /**
   * API Helper utilities
   * Provides common operations like retry, polling, etc.
   */
  apiHelpers: async ({ apiContext }, use) => {
    const helpers = new APITestHelpers(apiContext);
    await use(helpers);
  },

  /**
   * API Response Validator
   * JSON Schema validation and response assertions
   */
  apiValidator: async ({}, use) => {
    const validator = new APIResponseValidator();
    await use(validator);
  },

  /**
   * API Interceptor
   * Captures and logs requests/responses for debugging
   */
  apiInterceptor: async ({}, use) => {
    const interceptor = new APIInterceptor();
    await use(interceptor);
  },

  /**
   * Endpoint builder
   * Constructs full URLs from endpoint paths
   */
  endpoints: async ({}, use) => {
    const endpoints = new APIEndpoints(API_CONFIG.baseURL);
    await use(endpoints);
  },

  /**
   * Authenticated API context
   * Pre-configured with authentication credentials
   * Note: Implement based on your authentication mechanism
   */
  authenticatedAPI: async ({ playwright, apiHelpers }, use) => {
    // Create a user and get authentication token
    // This is a placeholder - implement based on your API's auth mechanism
    const context = await playwright.request.newContext({
      baseURL: API_CONFIG.baseURL,
      extraHTTPHeaders: {
        ...API_CONFIG.headers.common,
        // Add authentication headers here
        // 'Authorization': `Bearer ${token}`,
      },
      timeout: API_CONFIG.timeout.default,
    });

    await use(context);
    await context.dispose();
  },
});

/**
 * API test with automatic request/response logging
 * Useful for debugging and monitoring
 */
export const apiTestWithLogging = apiTest.extend({
  apiContext: async ({ playwright, apiInterceptor }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_CONFIG.baseURL,
      extraHTTPHeaders: API_CONFIG.headers.common,
      timeout: API_CONFIG.timeout.default,
    });

    // Enable request/response interception
    apiInterceptor.enable();

    await use(context);

    // Log summary after test
    apiInterceptor.logSummary();
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
