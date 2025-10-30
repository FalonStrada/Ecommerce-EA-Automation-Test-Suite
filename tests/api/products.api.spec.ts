import { apiTest as test, expect } from '../../fixtures/api';
import { ENDPOINTS, RESPONSE_CODES } from '../../config/api-config';
import { productsListSchema, searchProductSchema, ProductsListResponse } from '../../data/apiSchemas';
import apiTestData from '../../data/apiTestData.json';

/**
 * Products API Test Suite
 * Demonstrates API testing best practices and heuristics:
 * - Schema validation
 * - Response structure verification
 * - Performance testing
 * - Error handling
 * - Data integrity checks
 */

test.describe('Products API - GET /productsList', () => {
  
  test('should return all products with valid schema', async ({ apiContext, apiValidator, endpoints }) => {
    // Arrange
    const url = endpoints.build(ENDPOINTS.products.list);
    
    // Act
    const response = await apiContext.get(url);
    
    // Assert - Status
    apiValidator.assertStatus(response, RESPONSE_CODES.SUCCESS);
    
    /**
     * BUG: API returns Content-Type: text/html instead of application/json
     * Expected: Content-Type should be 'application/json' for JSON responses
     * Actual: Returns 'text/html; charset=utf-8'
     * Impact: Violates REST API standards, may cause issues with API clients
     * Status: Known issue, not fixed
     */
    // TODO: Uncomment when bug is fixed
    // apiValidator.assertContentType(response, 'application/json');
    
    // Assert - Schema validation
    const body = await apiValidator.validateSchema<ProductsListResponse>(
      response, 
      productsListSchema,
      'productsList'
    );
    
    // Assert - Data integrity
    expect(body.responseCode).toBe(RESPONSE_CODES.SUCCESS);
    expect(body.products).toBeDefined();
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('should return products with correct structure', async ({ apiContext, apiValidator, endpoints }) => {
    // Act
    const response = await apiContext.get(endpoints.build(ENDPOINTS.products.list));
    const body = await response.json();
    
    // Assert - Each product has required fields
    body.products.forEach((product: any) => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('category');
      
      // Validate data types
      expect(typeof product.id).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(typeof product.price).toBe('string');
      expect(typeof product.brand).toBe('string');
      
      // Validate nested structure
      expect(product.category).toHaveProperty('usertype');
      expect(product.category).toHaveProperty('category');
    });
  });

  test('should respond within acceptable time', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const maxResponseTime = apiTestData.testScenarios.performance.acceptableResponseTime;
    
    // Act & Assert
    const response = await apiHelpers.assertResponseTime(
      () => apiContext.get(endpoints.build(ENDPOINTS.products.list)),
      maxResponseTime,
      `Products list should respond within ${maxResponseTime}ms`
    );
    
    expect(response.ok()).toBeTruthy();
  });

  test('should return consistent data on multiple requests (idempotency)', async ({ apiContext, apiValidator, endpoints }) => {
    // Act
    const url = endpoints.build(ENDPOINTS.products.list);
    const response1 = await apiContext.get(url);
    const response2 = await apiContext.get(url);
    
    // Assert - Idempotency
    await apiValidator.validateIdempotency(response1, response2);
  });

  test('should handle concurrent requests correctly', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const concurrentRequests = 5;
    const requests = Array(concurrentRequests).fill(null).map(() => 
      () => apiContext.get(endpoints.build(ENDPOINTS.products.list))
    );
    
    // Act
    const responses = await apiHelpers.batchRequests(requests, concurrentRequests);
    
    // Assert
    expect(responses).toHaveLength(concurrentRequests);
    responses.forEach((response: any) => {
      expect(response.ok()).toBeTruthy();
    });
  });

  /**
   * BUG: Inconsistent POST method handling on GET endpoint
   * Expected: POST to GET-only endpoint should consistently return 405 Method Not Allowed
   * Actual: Behavior depends on request body:
   *   - POST without body: Returns 200 OK with data (incorrect)
   *   - POST with body: Returns 405 with vague message "This request method is not supported"
   * Impact: 
   *   - Violates REST conventions
   *   - Inconsistent behavior is confusing
   *   - Vague error message doesn't help developers
   *   - Security concern (accepting POST on GET endpoint)
   * Severity: Medium
   * Note: This is not good practice - endpoints should have clear, single purposes
   */
  test.fixme('should consistently reject POST method on GET endpoint', async ({ apiContext, endpoints }) => {
    // Test 1: POST without body
    const responseNoBody = await apiContext.post(endpoints.build(ENDPOINTS.products.list));
    expect(responseNoBody.status()).toBe(405);
    
    // Test 2: POST with body (simulating "All Products" form submission)
    const responseWithBody = await apiContext.post(endpoints.build(ENDPOINTS.products.list), {
      data: 'some=data',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    expect(responseWithBody.status()).toBe(405);
    
    // Assert - Error message should be clear and consistent
    const body = await responseWithBody.json();
    expect(body.message).not.toBe('This request method is not supported'); // Too vague
    expect(body.message).toMatch(/POST.*not allowed|method not supported/i);
    expect(body.message).toContain('GET'); // Should suggest correct method
  });
});

test.describe('Products API - POST /searchProduct', () => {
  
  test('should search products by valid query', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange
    const searchQuery = apiTestData.products.searchQueries.valid[0];
    const formData = apiHelpers.createFormData({ search_product: searchQuery });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.products.search), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert
    apiValidator.assertStatus(response, RESPONSE_CODES.SUCCESS);
    
    const body = await apiValidator.validateSchema(
      response,
      searchProductSchema,
      'searchProduct'
    );
    
    expect(body.responseCode).toBe(RESPONSE_CODES.SUCCESS);
    expect(Array.isArray(body.products)).toBeTruthy();
    
    /**
     * BUG: Search results don't filter by query term
     * Expected: Only products matching search query should be returned
     * Actual: Returns all products regardless of search term
     * Impact: Search functionality is broken
     * Severity: High
     */
    // TODO: Uncomment when search filtering is fixed
    // if (body.products.length > 0) {
    //   body.products.forEach((product: any) => {
    //     const productName = product.name.toLowerCase();
    //     const query = searchQuery.toLowerCase();
    //     expect(productName).toContain(query);
    //   });
    // }
  });

  /**
   * BUG: Empty search query behavior is undefined
   * Expected: Should return 400 Bad Request or all products with clear documentation
   * Actual: Behavior is inconsistent
   * Severity: Low
   */
  test.fixme('should handle empty search query appropriately', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange
    const formData = apiHelpers.createFormData({ search_product: '' });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.products.search), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should either reject or return all products
    const body = await response.json();
    if (response.status() === RESPONSE_CODES.BAD_REQUEST) {
      expect(body.message).toContain('search query');
    } else {
      expect(response.status()).toBe(RESPONSE_CODES.SUCCESS);
      expect(Array.isArray(body.products)).toBeTruthy();
    }
  });

  /**
   * BUG: Search with no matches returns all products instead of empty array
   * Expected: Should return empty array when no products match
   * Actual: Returns all products
   * Severity: High
   */
  test.fixme('should return empty array for search with no results', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange
    const invalidQuery = apiTestData.products.searchQueries.invalid[0];
    const formData = apiHelpers.createFormData({ search_product: invalidQuery });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.products.search), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert
    apiValidator.assertStatus(response, RESPONSE_CODES.SUCCESS);
    const body = await response.json();
    
    // Should return empty array when no matches
    expect(body.products).toEqual([]);
    expect(body.products.length).toBe(0);
  });

  /**
   * BUG: Missing required parameter doesn't return proper error
   * Expected: Should return 400 Bad Request with clear error message
   * Actual: Returns 200 or inconsistent response
   * Severity: Medium
   */
  test.fixme('should reject search request without required parameter', async ({ apiContext, apiValidator, endpoints }) => {
    // Act - Send request without search parameter
    const response = await apiContext.post(endpoints.build(ENDPOINTS.products.search), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 400 Bad Request
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.message).toContain('required');
  });

  test('should measure search performance', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const searchQuery = apiTestData.products.searchQueries.valid[1];
    const formData = apiHelpers.createFormData({ search_product: searchQuery });
    const maxTime = apiTestData.testScenarios.performance.maxResponseTime;
    
    // Act
    const { response, duration } = await apiHelpers.measureResponseTime(
      () => apiContext.post(endpoints.build(ENDPOINTS.products.search), {
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    );
    
    // Assert
    console.log(`Search completed in ${duration}ms`);
    expect(duration).toBeLessThan(maxTime);
    expect(response.ok()).toBeTruthy();
  });
});

// Brands tests moved to tests/api/brands.api.spec.ts

test.describe('Products API - Error Handling & Edge Cases', () => {
  
  /**
   * BUG: Invalid endpoints don't return proper 404
   * Expected: Should return 404 Not Found
   * Actual: May return 200 or other unexpected status
   * Severity: Medium
   */
  test.fixme('should return 404 for invalid endpoint', async ({ apiContext, endpoints }) => {
    // Act
    const response = await apiContext.get(endpoints.build('/api/invalidEndpoint'));
    
    // Assert
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.message).toContain('not found');
  });

  /**
   * BUG: Malformed request body doesn't return 400 Bad Request
   * Expected: Should return 400 with validation error
   * Actual: May accept invalid data or return unclear error
   * Severity: High - Security concern
   */
  test.fixme('should reject malformed request body', async ({ apiContext, endpoints }) => {
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.products.search), {
      data: 'invalid-data-format',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.message).toContain('invalid');
  });

  /**
   * BUG: Missing critical security headers
   * Expected: Should include X-Content-Type-Options, X-Frame-Options, etc.
   * Actual: Security headers are missing
   * Severity: High - Security vulnerability
   */
  test.fixme('should include proper security headers', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Act
    const response = await apiContext.get(endpoints.build(ENDPOINTS.products.list));
    
    // Assert - Security headers
    expect(apiHelpers.hasHeader(response, 'X-Content-Type-Options')).toBeTruthy();
    expect(apiHelpers.hasHeader(response, 'X-Frame-Options')).toBeTruthy();
    expect(apiHelpers.hasHeader(response, 'X-XSS-Protection')).toBeTruthy();
    
    // Validate Content-Type is correct
    apiValidator.assertContentType(response, 'application/json');
  });
});
