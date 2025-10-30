# 🔌 API Testing Guide

Comprehensive guide for API testing in the Ecommerce Automation Test Suite using Playwright and TypeScript.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Writing API Tests](#writing-api-tests)
- [Best Practices](#best-practices)
- [API Testing Heuristics](#api-testing-heuristics)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The API testing framework provides:

- **Type-safe API testing** with TypeScript
- **JSON Schema validation** with AJV
- **Comprehensive fixtures** for API context and helpers
- **Performance testing** utilities
- **Request/Response interception** for debugging
- **Retry mechanisms** with exponential backoff
- **Concurrent testing** support
- **Custom assertions** and validators

## 🏗️ Architecture

```
├── fixtures/
│   └── api.ts                    # API fixtures and context
├── utils/
│   ├── apiHelpers.ts             # Helper utilities
│   ├── apiValidator.ts           # Response validators
│   └── apiInterceptor.ts         # Request/Response interceptor
├── config/
│   └── api-config.ts             # API configuration and endpoints
├── data/
│   ├── apiTestData.json          # Test data
│   └── apiSchemas.ts             # JSON Schema definitions
└── tests/api/
    ├── products.api.spec.ts      # Products API tests
    ├── auth.api.spec.ts          # Authentication API tests
    └── performance.api.spec.ts   # Performance tests
```

## 🚀 Getting Started

### Running API Tests

```bash
# Run all API tests
npm run test:api

# Run specific test suites
npm run test:api:products      # Products API tests
npm run test:api:auth          # Authentication API tests
npm run test:api:performance   # Performance tests

# Debug mode
npm run test:api:debug

# Headed mode (with browser UI)
npm run test:api:headed
```

### Configuration

API configuration is centralized in `config/api-config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'https://automationexercise.com/api',
  timeout: {
    default: 30000,
    long: 60000,
    short: 10000
  },
  headers: {
    common: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
};
```

## ✍️ Writing API Tests

### Basic Test Structure

```typescript
import { apiTest as test, expect } from '../../fixtures/api';
import { ENDPOINTS } from '../../config/api-config';

test.describe('My API Tests', () => {
  
  test('should perform API operation', async ({ apiContext, apiValidator, endpoints }) => {
    // Arrange
    const url = endpoints.build(ENDPOINTS.products.list);
    
    // Act
    const response = await apiContext.get(url);
    
    // Assert
    apiValidator.assertStatus(response, 200);
    apiValidator.assertContentType(response, 'application/json');
  });
});
```

### Using Fixtures

#### API Context
Pre-configured request context with base URL and headers:

```typescript
test('example', async ({ apiContext }) => {
  const response = await apiContext.get('/endpoint');
  expect(response.ok()).toBeTruthy();
});
```

#### API Helpers
Utility functions for common operations:

```typescript
test('example', async ({ apiContext, apiHelpers, endpoints }) => {
  // Retry mechanism
  const response = await apiHelpers.retryRequest(
    () => apiContext.get(endpoints.build('/endpoint')),
    { maxRetries: 3 }
  );
  
  // Measure response time
  const { response: res, duration } = await apiHelpers.measureResponseTime(
    () => apiContext.get(endpoints.build('/endpoint'))
  );
  
  // Generate unique data
  const email = apiHelpers.generateUniqueEmail('test');
  
  // Create form data
  const formData = apiHelpers.createFormData({
    email: 'test@example.com',
    password: 'password123'
  });
});
```

#### API Validator
Response validation and assertions:

```typescript
test('example', async ({ apiContext, apiValidator, endpoints }) => {
  const response = await apiContext.get(endpoints.build('/endpoint'));
  
  // Status assertions
  apiValidator.assertStatus(response, 200);
  apiValidator.assertSuccess(response);
  
  // Header assertions
  apiValidator.assertHeader(response, 'content-type', /json/);
  apiValidator.assertContentType(response, 'application/json');
  
  // Body assertions
  await apiValidator.assertBodyContains(response, 'fieldName', 'expectedValue');
  await apiValidator.assertBodyMatches(response, { key: 'value' });
  await apiValidator.assertBodyIsArray(response, 10);
  
  // Schema validation
  const body = await apiValidator.validateSchema(
    response,
    mySchema,
    'schemaName'
  );
});
```

#### API Interceptor
Request/Response logging and debugging:

```typescript
import { apiTestWithLogging as test } from '../../fixtures/api';

test('example', async ({ apiContext, apiInterceptor, endpoints }) => {
  // Interceptor is automatically enabled
  
  const response = await apiContext.get(endpoints.build('/endpoint'));
  
  // Get logs
  const logs = apiInterceptor.getLogs();
  const failedRequests = apiInterceptor.findFailedRequests();
  const slowRequests = apiInterceptor.findSlowRequests(1000);
  
  // Summary is automatically logged after test
});
```

### Schema Validation

Define schemas in `data/apiSchemas.ts`:

```typescript
export interface MyResponse {
  id: number;
  name: string;
  email: string;
}

export const myResponseSchema: JSONSchemaType<MyResponse> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string' }
  },
  required: ['id', 'name', 'email']
};
```

Use in tests:

```typescript
test('should validate response schema', async ({ apiContext, apiValidator, endpoints }) => {
  const response = await apiContext.get(endpoints.build('/endpoint'));
  
  const body = await apiValidator.validateSchema<MyResponse>(
    response,
    myResponseSchema,
    'myResponse'
  );
  
  // TypeScript knows the shape of body
  expect(body.id).toBeGreaterThan(0);
  expect(body.email).toContain('@');
});
```

## 🎯 Best Practices

### 1. Use Descriptive Test Names

```typescript
// ✅ Good
test('should return 404 when product does not exist', async ({ ... }) => {});

// ❌ Bad
test('test product', async ({ ... }) => {});
```

### 2. Follow AAA Pattern

```typescript
test('example', async ({ apiContext, endpoints }) => {
  // Arrange - Setup test data
  const productId = 123;
  const url = endpoints.build(`/products/${productId}`);
  
  // Act - Perform action
  const response = await apiContext.get(url);
  
  // Assert - Verify results
  expect(response.status()).toBe(200);
});
```

### 3. Test Both Happy and Unhappy Paths

```typescript
test.describe('Product API', () => {
  test('should return product when ID is valid', async ({ ... }) => {
    // Happy path
  });
  
  test('should return 404 when ID does not exist', async ({ ... }) => {
    // Unhappy path
  });
  
  test('should return 400 when ID is invalid format', async ({ ... }) => {
    // Edge case
  });
});
```

### 4. Use Test Data Files

```typescript
import apiTestData from '../../data/apiTestData.json';

test('example', async ({ apiContext, apiHelpers }) => {
  const formData = apiHelpers.createFormData({
    email: apiTestData.users.validUser.email,
    password: apiTestData.users.validUser.password
  });
});
```

### 5. Clean Up Test Data

```typescript
test('should create and delete user', async ({ apiContext, apiHelpers, endpoints }) => {
  const email = apiHelpers.generateUniqueEmail('test');
  
  // Create user
  const createResponse = await apiContext.post(
    endpoints.build(ENDPOINTS.auth.createAccount),
    { data: apiHelpers.createFormData({ email, password: 'pass123' }) }
  );
  
  // Test operations...
  
  // Cleanup
  await apiContext.delete(
    endpoints.build(ENDPOINTS.auth.deleteAccount),
    { data: apiHelpers.createFormData({ email, password: 'pass123' }) }
  );
});
```

### 6. Validate Response Structure

```typescript
test('should return valid product structure', async ({ apiContext, endpoints }) => {
  const response = await apiContext.get(endpoints.build(ENDPOINTS.products.list));
  const body = await response.json();
  
  // Validate structure
  expect(body).toHaveProperty('responseCode');
  expect(body).toHaveProperty('products');
  expect(Array.isArray(body.products)).toBeTruthy();
  
  // Validate each item
  body.products.forEach((product: any) => {
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
  });
});
```

## 🔍 API Testing Heuristics

### CRUD Operations Testing

Test all CRUD operations systematically:

```typescript
test.describe('User CRUD Operations', () => {
  test('CREATE - should create new user', async ({ ... }) => {});
  test('READ - should retrieve user details', async ({ ... }) => {});
  test('UPDATE - should update user information', async ({ ... }) => {});
  test('DELETE - should delete user', async ({ ... }) => {});
  test('Complete lifecycle', async ({ ... }) => {
    // Create -> Read -> Update -> Delete
  });
});
```

### Idempotency Testing

Verify that operations are idempotent:

```typescript
test('should return same result on multiple GET requests', async ({ apiContext, apiValidator, endpoints }) => {
  const url = endpoints.build(ENDPOINTS.products.list);
  
  const response1 = await apiContext.get(url);
  const response2 = await apiContext.get(url);
  
  await apiValidator.validateIdempotency(response1, response2);
});
```

### Error Handling Testing

Test various error scenarios:

```typescript
test.describe('Error Handling', () => {
  test('should handle missing parameters', async ({ ... }) => {});
  test('should handle invalid data types', async ({ ... }) => {});
  test('should handle malformed JSON', async ({ ... }) => {});
  test('should handle SQL injection attempts', async ({ ... }) => {});
  test('should handle XSS attempts', async ({ ... }) => {});
});
```

### Performance Testing

Measure and validate performance:

```typescript
test('should respond within acceptable time', async ({ apiContext, apiHelpers, endpoints }) => {
  const maxTime = 1000; // 1 second
  
  const response = await apiHelpers.assertResponseTime(
    () => apiContext.get(endpoints.build(ENDPOINTS.products.list)),
    maxTime
  );
  
  expect(response.ok()).toBeTruthy();
});
```

### Concurrency Testing

Test concurrent request handling:

```typescript
test('should handle concurrent requests', async ({ apiContext, apiHelpers, endpoints }) => {
  const requests = Array(10).fill(null).map(() => 
    () => apiContext.get(endpoints.build(ENDPOINTS.products.list))
  );
  
  const responses = await apiHelpers.batchRequests(requests, 10);
  
  expect(responses).toHaveLength(10);
  responses.forEach((r: any) => expect(r.ok()).toBeTruthy());
});
```

### Boundary Testing

Test edge cases and boundaries:

```typescript
test.describe('Boundary Tests', () => {
  test('should handle empty string', async ({ ... }) => {});
  test('should handle very long string', async ({ ... }) => {});
  test('should handle special characters', async ({ ... }) => {});
  test('should handle null values', async ({ ... }) => {});
  test('should handle maximum allowed value', async ({ ... }) => {});
});
```

### State Management Testing

Test state changes and dependencies:

```typescript
test('should maintain state across operations', async ({ apiContext, apiHelpers, endpoints }) => {
  // Create resource
  const createResponse = await apiContext.post(endpoints.build('/resource'), {
    data: { name: 'Test' }
  });
  const resourceId = (await createResponse.json()).id;
  
  // Verify creation
  const getResponse = await apiContext.get(endpoints.build(`/resource/${resourceId}`));
  expect(getResponse.ok()).toBeTruthy();
  
  // Update resource
  await apiContext.put(endpoints.build(`/resource/${resourceId}`), {
    data: { name: 'Updated' }
  });
  
  // Verify update
  const updatedResponse = await apiContext.get(endpoints.build(`/resource/${resourceId}`));
  const body = await updatedResponse.json();
  expect(body.name).toBe('Updated');
});
```

## 📚 Examples

### Example 1: Basic GET Request

```typescript
test('should get all products', async ({ apiContext, apiValidator, endpoints }) => {
  const response = await apiContext.get(endpoints.build(ENDPOINTS.products.list));
  
  apiValidator.assertStatus(response, 200);
  apiValidator.assertContentType(response, 'application/json');
  
  const body = await response.json();
  expect(body.products.length).toBeGreaterThan(0);
});
```

### Example 2: POST with Form Data

```typescript
test('should search products', async ({ apiContext, apiHelpers, endpoints }) => {
  const formData = apiHelpers.createFormData({
    search_product: 'tshirt'
  });
  
  const response = await apiContext.post(endpoints.build(ENDPOINTS.products.search), {
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  expect(response.ok()).toBeTruthy();
});
```

### Example 3: Authentication Flow

```typescript
test('should complete authentication flow', async ({ apiContext, apiHelpers, endpoints }) => {
  const email = apiHelpers.generateUniqueEmail('auth');
  const password = 'Test123!@#';
  
  // Create account
  const createData = apiHelpers.createFormData({
    name: 'Test User',
    email: email,
    password: password,
    // ... other required fields
  });
  
  const createResponse = await apiContext.post(
    endpoints.build(ENDPOINTS.auth.createAccount),
    {
      data: createData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  
  expect(createResponse.status()).toBe(201);
  
  // Login
  const loginData = apiHelpers.createFormData({ email, password });
  const loginResponse = await apiContext.post(
    endpoints.build(ENDPOINTS.auth.login),
    {
      data: loginData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  
  expect(loginResponse.status()).toBe(200);
  
  // Cleanup
  await apiContext.delete(
    endpoints.build(ENDPOINTS.auth.deleteAccount),
    {
      data: loginData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
});
```

### Example 4: Performance Benchmarking

```typescript
test('should benchmark endpoint performance', async ({ apiContext, apiHelpers, endpoints }) => {
  const iterations = 10;
  const measurements: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const { duration } = await apiHelpers.measureResponseTime(
      () => apiContext.get(endpoints.build(ENDPOINTS.products.list))
    );
    measurements.push(duration);
  }
  
  const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
  const min = Math.min(...measurements);
  const max = Math.max(...measurements);
  
  console.log(`Average: ${avg.toFixed(2)}ms, Min: ${min}ms, Max: ${max}ms`);
  
  expect(avg).toBeLessThan(1000); // Should average under 1 second
});
```

## 🐛 Troubleshooting

### Common Issues

#### Timeout Errors

```typescript
// Increase timeout for specific request
const response = await apiContext.get(url, {
  timeout: 60000 // 60 seconds
});
```

#### CORS Issues

```typescript
// Check CORS headers
apiValidator.validateCORSHeaders(response);
```

#### SSL Certificate Errors

```typescript
// In fixtures/api.ts, set ignoreHTTPSErrors
const context = await playwright.request.newContext({
  baseURL: API_CONFIG.baseURL,
  ignoreHTTPSErrors: true, // Only for testing
});
```

#### Schema Validation Failures

```typescript
// Use try-catch for detailed error messages
try {
  await apiValidator.validateSchema(response, schema);
} catch (error) {
  console.error('Schema validation failed:', error.message);
  throw error;
}
```

### Debugging Tips

1. **Enable request logging:**
```typescript
import { apiTestWithLogging as test } from '../../fixtures/api';
```

2. **Inspect response details:**
```typescript
console.log('Status:', response.status());
console.log('Headers:', response.headers());
console.log('Body:', await response.text());
```

3. **Use interceptor for detailed analysis:**
```typescript
const logs = apiInterceptor.getLogs();
logs.forEach(log => apiInterceptor.logDetails(log));
```

4. **Run in debug mode:**
```bash
npm run test:api:debug
```

## 📊 Test Coverage

Current API test coverage:

- ✅ Products API (GET /productsList)
- ✅ Products Search (POST /searchProduct)
- ✅ Brands API (GET /brandsList)
- ✅ User Authentication (POST /verifyLogin)
- ✅ Account Creation (POST /createAccount)
- ✅ Account Deletion (DELETE /deleteAccount)
- ✅ Performance Testing
- ✅ Concurrency Testing
- ✅ Error Handling
- ✅ Security Testing (SQL Injection, XSS)

## 🔗 Resources

- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [JSON Schema Documentation](https://json-schema.org/)
- [AJV Documentation](https://ajv.js.org/)
- [REST API Testing Best Practices](https://www.ministryoftesting.com/dojo/lessons/api-testing-best-practices)

## 📝 Contributing

When adding new API tests:

1. Follow the existing structure and naming conventions
2. Add schemas to `data/apiSchemas.ts`
3. Add test data to `data/apiTestData.json`
4. Document new endpoints in `config/api-config.ts`
5. Write comprehensive tests covering happy paths, error cases, and edge cases
6. Update this guide with new examples

---

**Happy API Testing! 🚀**
