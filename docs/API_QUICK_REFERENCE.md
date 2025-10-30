# 🚀 API Testing Quick Reference

## Commands

```bash
# Run all API tests
npm run test:api

# Run specific suites
npm run test:api:products      # Products API
npm run test:api:auth          # Authentication API
npm run test:api:performance   # Performance tests

# Debug & Development
npm run test:api:debug         # Debug mode
npm run test:api:headed        # Headed mode
```

## Basic Test Template

```typescript
import { apiTest as test, expect } from '../../fixtures/api';
import { ENDPOINTS } from '../../config/api-config';

test.describe('My API Tests', () => {
  test('should do something', async ({ apiContext, apiValidator, endpoints }) => {
    // Arrange
    const url = endpoints.build(ENDPOINTS.products.list);
    
    // Act
    const response = await apiContext.get(url);
    
    // Assert
    apiValidator.assertStatus(response, 200);
  });
});
```

## Common Patterns

### GET Request
```typescript
const response = await apiContext.get(endpoints.build('/endpoint'));
```

### POST with JSON
```typescript
const response = await apiContext.post(endpoints.build('/endpoint'), {
  data: { key: 'value' }
});
```

### POST with Form Data
```typescript
const formData = apiHelpers.createFormData({
  email: 'test@example.com',
  password: 'password123'
});

const response = await apiContext.post(endpoints.build('/endpoint'), {
  data: formData,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
```

### DELETE Request
```typescript
const response = await apiContext.delete(endpoints.build('/endpoint'), {
  data: formData,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
```

## Assertions

### Status Code
```typescript
apiValidator.assertStatus(response, 200);
apiValidator.assertSuccess(response); // 2xx
```

### Headers
```typescript
apiValidator.assertHeader(response, 'content-type');
apiValidator.assertContentType(response, 'application/json');
```

### Body
```typescript
await apiValidator.assertBodyContains(response, 'fieldName', 'value');
await apiValidator.assertBodyMatches(response, { key: 'value' });
await apiValidator.assertBodyIsArray(response, 10);
```

### Schema Validation
```typescript
const body = await apiValidator.validateSchema<MyType>(
  response,
  mySchema,
  'schemaName'
);
```

## Helpers

### Retry Request
```typescript
const response = await apiHelpers.retryRequest(
  () => apiContext.get(url),
  { maxRetries: 3, retryDelay: 1000 }
);
```

### Measure Response Time
```typescript
const { response, duration } = await apiHelpers.measureResponseTime(
  () => apiContext.get(url)
);
```

### Assert Response Time
```typescript
const response = await apiHelpers.assertResponseTime(
  () => apiContext.get(url),
  1000 // max 1 second
);
```

### Batch Requests
```typescript
const requests = Array(10).fill(null).map(() => 
  () => apiContext.get(url)
);
const responses = await apiHelpers.batchRequests(requests, 5);
```

### Generate Unique Data
```typescript
const email = apiHelpers.generateUniqueEmail('test');
const randomString = apiHelpers.generateRandomString(10);
```

## Test Data

### Access Test Data
```typescript
import apiTestData from '../../data/apiTestData.json';

const email = apiTestData.users.validUser.email;
const query = apiTestData.products.searchQueries.valid[0];
```

### Use Schemas
```typescript
import { productsListSchema, ProductsListResponse } from '../../data/apiSchemas';

const body = await apiValidator.validateSchema<ProductsListResponse>(
  response,
  productsListSchema
);
```

## Endpoints

```typescript
import { ENDPOINTS } from '../../config/api-config';

// Products
ENDPOINTS.products.list        // /productsList
ENDPOINTS.products.search      // /searchProduct
ENDPOINTS.products.brands      // /brandsList

// Auth
ENDPOINTS.auth.login           // /verifyLogin
ENDPOINTS.auth.createAccount   // /createAccount
ENDPOINTS.auth.deleteAccount   // /deleteAccount
```

## Interceptor (Debugging)

```typescript
import { apiTestWithLogging as test } from '../../fixtures/api';

test('example', async ({ apiContext, apiInterceptor, endpoints }) => {
  // Requests are automatically logged
  
  const response = await apiContext.get(endpoints.build('/endpoint'));
  
  // Get logs
  const logs = apiInterceptor.getLogs();
  const failed = apiInterceptor.findFailedRequests();
  const slow = apiInterceptor.findSlowRequests(1000);
  
  // Summary logged automatically after test
});
```

## Performance Testing

### Baseline Measurement
```typescript
const iterations = 10;
const measurements: number[] = [];

for (let i = 0; i < iterations; i++) {
  const { duration } = await apiHelpers.measureResponseTime(
    () => apiContext.get(url)
  );
  measurements.push(duration);
}

const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
```

### Concurrent Testing
```typescript
const requests = Array(10).fill(null).map(() => 
  () => apiContext.get(url)
);
const responses = await apiHelpers.batchRequests(requests, 10);
```

## Common Test Scenarios

### CRUD Lifecycle
```typescript
test('complete CRUD', async ({ apiContext, apiHelpers, endpoints }) => {
  // CREATE
  const createResponse = await apiContext.post(url, { data });
  expect(createResponse.status()).toBe(201);
  
  // READ
  const readResponse = await apiContext.get(url);
  expect(readResponse.ok()).toBeTruthy();
  
  // UPDATE
  const updateResponse = await apiContext.put(url, { data });
  expect(updateResponse.ok()).toBeTruthy();
  
  // DELETE
  const deleteResponse = await apiContext.delete(url);
  expect(deleteResponse.ok()).toBeTruthy();
});
```

### Error Handling
```typescript
test('should handle errors', async ({ apiContext, apiValidator }) => {
  const response = await apiContext.post(url); // Missing data
  
  apiValidator.assertStatus(response, 400);
  await apiValidator.validateErrorResponse(response);
});
```

### Idempotency
```typescript
test('should be idempotent', async ({ apiContext, apiValidator }) => {
  const response1 = await apiContext.get(url);
  const response2 = await apiContext.get(url);
  
  await apiValidator.validateIdempotency(response1, response2);
});
```

## Configuration

### API Base URL
```typescript
// Set via environment variable
API_BASE_URL=https://api.example.com npm run test:api

// Or in config/api-config.ts
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'https://automationexercise.com/api'
};
```

### Timeouts
```typescript
// In config/api-config.ts
timeout: {
  default: 30000,
  long: 60000,
  short: 10000
}
```

## Tips & Tricks

1. **Use descriptive test names**: `should return 404 when product not found`
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Clean up test data**: Delete created resources
4. **Use unique data**: `apiHelpers.generateUniqueEmail()`
5. **Validate schemas**: Catch breaking changes early
6. **Test error cases**: Not just happy paths
7. **Measure performance**: Set acceptable thresholds
8. **Log for debugging**: Use `apiTestWithLogging`

## Documentation

- **Full Guide**: [`API_TESTING_GUIDE.md`](./API_TESTING_GUIDE.md)
- **Summary**: [`API_TESTING_SUMMARY.md`](./API_TESTING_SUMMARY.md)
- **Main README**: [`../README.md`](../README.md)

---

**Quick Start**: `npm run test:api` 🚀
