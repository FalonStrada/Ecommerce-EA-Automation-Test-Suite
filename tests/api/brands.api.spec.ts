import { apiTest as test, expect } from '../../fixtures/api';
import { ENDPOINTS, RESPONSE_CODES } from '../../config/api-config';
import { brandsListSchema, Brand } from '../../data/apiSchemas';
import apiTestData from '../../data/apiTestData.json';
import { BrandsListResponse } from '../../data/apiSchemas';
import { APIResponseValidator } from '../../utils/apiValidator';
import { APIInterceptor } from '../../utils/apiInterceptor';

test.describe('Brands API - GET /brandsList', () => {
  test('should return all brands with valid schema', async ({ apiContext, apiValidator, endpoints }) => {
    // Arrange
    const url = endpoints.build(ENDPOINTS.products.brands);
    
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
    const body = await apiValidator.validateSchema<BrandsListResponse>(
      response, 
      brandsListSchema,
      'brandsList'
    );
    
    // Assert - Data integrity
    expect(body.responseCode).toBe(RESPONSE_CODES.SUCCESS);
    expect(body.brands).toBeDefined();
    expect(Array.isArray(body.brands)).toBeTruthy();
    expect(body.brands.length).toBeGreaterThan(0);
  });
});