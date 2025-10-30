import { apiTest as test, expect } from '../../fixtures/api';
import { ENDPOINTS, RESPONSE_CODES, RESPONSE_MESSAGES } from '../../config/api-config';
import { userResponseSchema, UserResponse } from '../../data/apiSchemas';
import apiTestData from '../../data/apiTestData.json';

/**
 * Authentication API Test Suite
 * Demonstrates API testing heuristics:
 * - CRUD operations testing
 * - Authentication flow testing
 * - Negative testing
 * - Data validation
 * - State management
 */

test.describe('Auth API - POST /verifyLogin', () => {
  
  /**
   * BUG: API returns 200 OK for validation errors instead of 400 Bad Request
   * Expected: HTTP status should reflect the error (400 for bad requests)
   * Actual: Always returns 200, error is only in response body
   * Impact: Violates HTTP standards, makes error handling difficult
   * Severity: Medium
   */
  
  test.fixme('should reject login with missing parameters', async ({ apiContext, apiValidator, endpoints }) => {
    // Act - Send request without parameters
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 400 Bad Request
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    
    const body = await response.json();
    expect(body.message).toContain('parameter');
    expect(body.message).toContain('required');
  });

  test.fixme('should reject login with invalid credentials', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange
    const formData = apiHelpers.createFormData({
      email: apiTestData.users.invalidUser.email,
      password: apiTestData.users.invalidUser.password
    });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 401 Unauthorized
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.message).toBe(RESPONSE_MESSAGES.INVALID_EMAIL_PASSWORD);
  });

  test.fixme('should reject login with only email', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange
    const formData = apiHelpers.createFormData({
      email: apiTestData.users.validUser.email
    });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 400 Bad Request
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    
    const body = await response.json();
    expect(body.message).toContain('password');
    expect(body.message).toContain('required');
  });

  test.fixme('should reject login with only password', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange
    const formData = apiHelpers.createFormData({
      password: apiTestData.users.validUser.password
    });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 400 Bad Request
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    
    const body = await response.json();
    expect(body.message).toContain('email');
    expect(body.message).toContain('required');
  });

  /**
   * SECURITY TEST: SQL Injection protection
   * Severity: Critical
   */
  test.fixme('should reject SQL injection attempt', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange - SQL injection payload
    const formData = apiHelpers.createFormData({
      email: "admin' OR '1'='1",
      password: "password' OR '1'='1"
    });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 401 Unauthorized (not 200)
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.message).toContain('Invalid');
  });

  /**
   * SECURITY TEST: XSS protection
   * Severity: High
   */
  test.fixme('should sanitize XSS attempt in credentials', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange - XSS payload
    const formData = apiHelpers.createFormData({
      email: '<script>alert("xss")</script>@test.com',
      password: '<script>alert("xss")</script>'
    });
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 401 and sanitize input
    expect(response.status()).toBe(401);
    const body = await response.json();
    // Response should not contain unsanitized script tags
    expect(JSON.stringify(body)).not.toContain('<script>');
  });
});

test.describe('Auth API - POST /createAccount', () => {
  
  test.fixme('should reject account creation with missing parameters', async ({ apiContext, apiValidator, endpoints }) => {
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.createAccount), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 400 Bad Request
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    
    const body = await response.json();
    expect(body.message).toContain('required');
    expect(body.message).toContain('parameter');
  });

  test('should create account with all required parameters', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange - Generate unique email
    const uniqueEmail = apiHelpers.generateUniqueEmail('apitest');
    const userData = {
      name: apiTestData.users.validUser.name,
      email: uniqueEmail,
      password: apiTestData.users.validUser.password,
      title: apiTestData.users.validUser.title,
      birth_date: apiTestData.users.validUser.birth_date,
      birth_month: apiTestData.users.validUser.birth_month,
      birth_year: apiTestData.users.validUser.birth_year,
      firstname: apiTestData.users.validUser.firstname,
      lastname: apiTestData.users.validUser.lastname,
      company: apiTestData.users.validUser.company,
      address1: apiTestData.users.validUser.address1,
      address2: apiTestData.users.validUser.address2,
      country: apiTestData.users.validUser.country,
      zipcode: apiTestData.users.validUser.zipcode,
      state: apiTestData.users.validUser.state,
      city: apiTestData.users.validUser.city,
      mobile_number: apiTestData.users.validUser.mobile_number
    };
    
    const formData = apiHelpers.createFormData(userData);
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.createAccount), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - API returns 200 with success in body
    apiValidator.assertStatus(response, RESPONSE_CODES.SUCCESS);
    
    const body = await apiValidator.validateSchema<UserResponse>(
      response,
      userResponseSchema,
      'userResponse'
    );
    
    expect(body.responseCode).toBe(RESPONSE_CODES.CREATED);
    expect(body.message).toContain('created');
    
    // Cleanup - Delete the created account
    const deleteFormData = apiHelpers.createFormData({
      email: uniqueEmail,
      password: userData.password
    });
    
    await apiContext.delete(endpoints.build(ENDPOINTS.auth.deleteAccount), {
      data: deleteFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  });

  /**
   * BUG: Duplicate email validation
   * Expected: Should return 409 Conflict
   * Actual: Returns 200 with error in body
   * Severity: Medium
   */
  test.fixme('should reject duplicate account creation', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange - Create account first
    const uniqueEmail = apiHelpers.generateUniqueEmail('duplicate');
    const userData = {
      name: apiTestData.users.validUser.name,
      email: uniqueEmail,
      password: apiTestData.users.validUser.password,
      title: apiTestData.users.validUser.title,
      birth_date: apiTestData.users.validUser.birth_date,
      birth_month: apiTestData.users.validUser.birth_month,
      birth_year: apiTestData.users.validUser.birth_year,
      firstname: apiTestData.users.validUser.firstname,
      lastname: apiTestData.users.validUser.lastname,
      company: apiTestData.users.validUser.company,
      address1: apiTestData.users.validUser.address1,
      address2: apiTestData.users.validUser.address2,
      country: apiTestData.users.validUser.country,
      zipcode: apiTestData.users.validUser.zipcode,
      state: apiTestData.users.validUser.state,
      city: apiTestData.users.validUser.city,
      mobile_number: apiTestData.users.validUser.mobile_number
    };
    
    const formData = apiHelpers.createFormData(userData);
    
    // Act - Create account
    const createResponse = await apiContext.post(endpoints.build(ENDPOINTS.auth.createAccount), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    apiValidator.assertStatus(createResponse, RESPONSE_CODES.SUCCESS);
    
    // Act - Try to create duplicate
    const duplicateResponse = await apiContext.post(endpoints.build(ENDPOINTS.auth.createAccount), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 409 Conflict
    expect(duplicateResponse.status()).toBe(409);
    
    const body = await duplicateResponse.json();
    expect(body.message).toContain('already exists');
    
    // Cleanup
    const deleteFormData = apiHelpers.createFormData({
      email: uniqueEmail,
      password: userData.password
    });
    
    await apiContext.delete(endpoints.build(ENDPOINTS.auth.deleteAccount), {
      data: deleteFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  });

  /**
   * BUG: Email validation is missing or insufficient
   * Expected: Should return 400 for invalid email format
   * Actual: May accept invalid emails
   * Severity: Medium
   */
  test.fixme('should validate email format', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange - Invalid email format
    const userData = {
      name: 'Test User',
      email: 'invalid-email-format',
      password: 'password123',
      title: 'Mr',
      birth_date: '1',
      birth_month: '1',
      birth_year: '1990',
      firstname: 'Test',
      lastname: 'User',
      company: 'Company',
      address1: 'Address',
      address2: 'Address2',
      country: 'Country',
      zipcode: '12345',
      state: 'State',
      city: 'City',
      mobile_number: '1234567890'
    };
    
    const formData = apiHelpers.createFormData(userData);
    
    // Act
    const response = await apiContext.post(endpoints.build(ENDPOINTS.auth.createAccount), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 400 Bad Request
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.message).toContain('email');
    expect(body.message).toMatch(/invalid|format/);
  });
});

test.describe('Auth API - DELETE /deleteAccount', () => {
  
  test('should delete existing account', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange - Create account first
    const uniqueEmail = apiHelpers.generateUniqueEmail('todelete');
    const password = 'Test123!@#';
    
    const createData = {
      name: 'Delete Test',
      email: uniqueEmail,
      password: password,
      title: 'Mr',
      birth_date: '1',
      birth_month: '1',
      birth_year: '1990',
      firstname: 'Delete',
      lastname: 'Test',
      company: 'Company',
      address1: 'Address',
      address2: 'Address2',
      country: 'Country',
      zipcode: '12345',
      state: 'State',
      city: 'City',
      mobile_number: '1234567890'
    };
    
    await apiContext.post(endpoints.build(ENDPOINTS.auth.createAccount), {
      data: apiHelpers.createFormData(createData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Act - Delete account
    const deleteFormData = apiHelpers.createFormData({
      email: uniqueEmail,
      password: password
    });
    
    const response = await apiContext.delete(endpoints.build(ENDPOINTS.auth.deleteAccount), {
      data: deleteFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert
    apiValidator.assertStatus(response, RESPONSE_CODES.SUCCESS);
    
    const body = await response.json();
    expect(body.responseCode).toBe(RESPONSE_CODES.SUCCESS);
    expect(body.message).toBe(RESPONSE_MESSAGES.USER_DELETED);
  });

  test.fixme('should reject delete with missing parameters', async ({ apiContext, apiValidator, endpoints }) => {
    // Act
    const response = await apiContext.delete(endpoints.build(ENDPOINTS.auth.deleteAccount), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 400 Bad Request
    expect(response.status()).toBe(RESPONSE_CODES.BAD_REQUEST);
    
    const body = await response.json();
    expect(body.message).toContain('required');
  });

  test.fixme('should reject delete for non-existent account', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    // Arrange
    const formData = apiHelpers.createFormData({
      email: 'nonexistent@example.com',
      password: 'password123'
    });
    
    // Act
    const response = await apiContext.delete(endpoints.build(ENDPOINTS.auth.deleteAccount), {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Assert - Should return 404 Not Found
    expect(response.status()).toBe(RESPONSE_CODES.NOT_FOUND);
    
    const body = await response.json();
    expect(body.message).toContain('not found');
  });
});

test.describe('Auth API - Complete User Lifecycle', () => {
  
  test('should complete full CRUD lifecycle', async ({ apiContext, apiValidator, apiHelpers, endpoints }) => {
    const uniqueEmail = apiHelpers.generateUniqueEmail('lifecycle');
    const password = 'Lifecycle123!@#';
    
    // 1. CREATE - Create account
    const createData = {
      name: 'Lifecycle Test',
      email: uniqueEmail,
      password: password,
      title: 'Mr',
      birth_date: '15',
      birth_month: '6',
      birth_year: '1990',
      firstname: 'Lifecycle',
      lastname: 'Test',
      company: 'Test Company',
      address1: '123 Test St',
      address2: 'Suite 100',
      country: 'United States',
      zipcode: '12345',
      state: 'California',
      city: 'San Francisco',
      mobile_number: '+1234567890'
    };
    
    const createResponse = await apiContext.post(endpoints.build(ENDPOINTS.auth.createAccount), {
      data: apiHelpers.createFormData(createData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // API returns 200 with success in body
    apiValidator.assertStatus(createResponse, RESPONSE_CODES.SUCCESS);
    const createBody = await createResponse.json();
    expect(createBody.responseCode).toBe(RESPONSE_CODES.CREATED);
    
    // 2. READ - Verify login works
    const loginResponse = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      data: apiHelpers.createFormData({
        email: uniqueEmail,
        password: password
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    apiValidator.assertStatus(loginResponse, RESPONSE_CODES.SUCCESS);
    console.log('✓ Login verified');
    
    // 3. DELETE - Delete account
    const deleteResponse = await apiContext.delete(endpoints.build(ENDPOINTS.auth.deleteAccount), {
      data: apiHelpers.createFormData({
        email: uniqueEmail,
        password: password
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    apiValidator.assertStatus(deleteResponse, RESPONSE_CODES.SUCCESS);
    console.log('✓ Account deleted');
    
    // 4. VERIFY - Confirm account is deleted
    const verifyResponse = await apiContext.post(endpoints.build(ENDPOINTS.auth.login), {
      data: apiHelpers.createFormData({
        email: uniqueEmail,
        password: password
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    expect(verifyResponse.ok()).toBeFalsy();
    console.log('✓ Deletion confirmed');
  });
});
