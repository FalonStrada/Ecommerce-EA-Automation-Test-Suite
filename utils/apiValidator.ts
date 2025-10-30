import { APIResponse, expect } from '@playwright/test';
import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';

/**
 * API Response Validator
 * Provides comprehensive validation utilities for API responses
 * Includes JSON Schema validation, custom assertions, and heuristic checks
 */
export class APIResponseValidator {
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction<any>>;

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true,
      verbose: true,
      strict: false,
    });
    this.validators = new Map();
  }

  /**
   * Validate response against JSON Schema
   */
  async validateSchema<T>(
    response: APIResponse,
    schema: JSONSchemaType<T>,
    schemaName?: string
  ): Promise<T> {
    const body = await response.json();
    
    // Get or create validator
    const key = schemaName || JSON.stringify(schema);
    let validate = this.validators.get(key);
    
    if (!validate) {
      validate = this.ajv.compile(schema);
      this.validators.set(key, validate);
    }

    const valid = validate(body);
    
    if (!valid) {
      const errors = validate.errors?.map(err => 
        `${err.instancePath} ${err.message}`
      ).join(', ');
      throw new Error(`Schema validation failed: ${errors}`);
    }

    return body as T;
  }

  /**
   * Assert response status code
   */
  assertStatus(response: APIResponse, expectedStatus: number, message?: string): void {
    expect(
      response.status(),
      message || `Expected status ${expectedStatus}, got ${response.status()}`
    ).toBe(expectedStatus);
  }

  /**
   * Assert response is successful (2xx)
   */
  assertSuccess(response: APIResponse, message?: string): void {
    expect(
      response.ok(),
      message || `Expected successful response, got status ${response.status()}`
    ).toBeTruthy();
  }

  /**
   * Assert response contains specific header
   */
  assertHeader(
    response: APIResponse,
    headerName: string,
    expectedValue?: string | RegExp,
    message?: string
  ): void {
    const headers = response.headers();
    const headerKey = Object.keys(headers).find(
      key => key.toLowerCase() === headerName.toLowerCase()
    );

    expect(headerKey, message || `Header ${headerName} not found`).toBeDefined();

    if (expectedValue !== undefined && headerKey) {
      const actualValue = headers[headerKey];
      
      if (typeof expectedValue === 'string') {
        expect(actualValue, message || `Header ${headerName} value mismatch`).toBe(expectedValue);
      } else {
        expect(actualValue, message || `Header ${headerName} doesn't match pattern`).toMatch(expectedValue);
      }
    }
  }

  /**
   * Assert Content-Type header
   */
  assertContentType(response: APIResponse, expectedType: string, message?: string): void {
    this.assertHeader(response, 'content-type', new RegExp(expectedType, 'i'), message);
  }

  /**
   * Assert response body contains specific field
   */
  async assertBodyContains(
    response: APIResponse,
    field: string,
    expectedValue?: any,
    message?: string
  ): Promise<void> {
    const body = await response.json();
    
    expect(
      body,
      message || `Response body doesn't contain field: ${field}`
    ).toHaveProperty(field);

    if (expectedValue !== undefined) {
      expect(
        body[field],
        message || `Field ${field} value mismatch`
      ).toEqual(expectedValue);
    }
  }

  /**
   * Assert response body matches partial object
   */
  async assertBodyMatches(
    response: APIResponse,
    expectedPartial: Record<string, any>,
    message?: string
  ): Promise<void> {
    const body = await response.json();
    
    expect(
      body,
      message || 'Response body doesn\'t match expected partial'
    ).toMatchObject(expectedPartial);
  }

  /**
   * Assert response body is an array with specific length
   */
  async assertBodyIsArray(
    response: APIResponse,
    expectedLength?: number,
    message?: string
  ): Promise<void> {
    const body = await response.json();
    
    expect(
      Array.isArray(body),
      message || 'Response body is not an array'
    ).toBeTruthy();

    if (expectedLength !== undefined) {
      expect(
        body.length,
        message || `Expected array length ${expectedLength}, got ${body.length}`
      ).toBe(expectedLength);
    }
  }

  /**
   * Assert array contains item matching criteria
   */
  async assertArrayContains<T>(
    response: APIResponse,
    matchFn: (item: T) => boolean,
    message?: string
  ): Promise<void> {
    const body = await response.json();
    
    expect(Array.isArray(body), 'Response body is not an array').toBeTruthy();
    
    const found = body.some(matchFn);
    expect(found, message || 'Array doesn\'t contain matching item').toBeTruthy();
  }

  /**
   * Assert response time is acceptable
   */
  assertResponseTime(
    startTime: number,
    maxDuration: number,
    message?: string
  ): void {
    const duration = Date.now() - startTime;
    expect(
      duration,
      message || `Response time ${duration}ms exceeds ${maxDuration}ms`
    ).toBeLessThanOrEqual(maxDuration);
  }

  /**
   * Validate pagination response structure
   */
  async validatePagination(
    response: APIResponse,
    options: {
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
      totalField?: string;
      dataField?: string;
    } = {}
  ): Promise<void> {
    const body = await response.json();
    
    // Check common pagination fields
    const paginationFields = ['page', 'limit', 'total', 'totalPages'];
    const hasAnyPaginationField = paginationFields.some(field => field in body);
    
    expect(
      hasAnyPaginationField,
      'Response doesn\'t contain pagination fields'
    ).toBeTruthy();

    if (options.dataField) {
      expect(body).toHaveProperty(options.dataField);
      expect(Array.isArray(body[options.dataField])).toBeTruthy();
    }

    if (options.totalField) {
      expect(body).toHaveProperty(options.totalField);
      expect(typeof body[options.totalField]).toBe('number');
    }
  }

  /**
   * Validate error response structure
   */
  async validateErrorResponse(
    response: APIResponse,
    options: {
      hasErrorMessage?: boolean;
      hasErrorCode?: boolean;
      errorMessageField?: string;
      errorCodeField?: string;
    } = {}
  ): Promise<void> {
    const opts = {
      hasErrorMessage: true,
      hasErrorCode: false,
      errorMessageField: 'message',
      errorCodeField: 'code',
      ...options,
    };

    const body = await response.json();

    if (opts.hasErrorMessage) {
      expect(body).toHaveProperty(opts.errorMessageField);
      expect(typeof body[opts.errorMessageField]).toBe('string');
      expect(body[opts.errorMessageField].length).toBeGreaterThan(0);
    }

    if (opts.hasErrorCode) {
      expect(body).toHaveProperty(opts.errorCodeField);
    }
  }

  /**
   * Validate CRUD operation response
   */
  async validateCRUDResponse(
    response: APIResponse,
    operation: 'create' | 'read' | 'update' | 'delete',
    options: {
      idField?: string;
      dataField?: string;
    } = {}
  ): Promise<void> {
    const opts = {
      idField: 'id',
      dataField: 'data',
      ...options,
    };

    const body = await response.json();

    switch (operation) {
      case 'create':
        this.assertStatus(response, 201, 'Create should return 201');
        expect(body).toHaveProperty(opts.idField);
        break;
      case 'read':
        this.assertSuccess(response, 'Read should be successful');
        expect(body).toHaveProperty(opts.dataField);
        break;
      case 'update':
        this.assertSuccess(response, 'Update should be successful');
        break;
      case 'delete':
        this.assertSuccess(response, 'Delete should be successful');
        break;
    }
  }

  /**
   * Validate idempotency (same request returns same result)
   */
  async validateIdempotency(
    response1: APIResponse,
    response2: APIResponse
  ): Promise<void> {
    expect(response1.status()).toBe(response2.status());
    
    const body1 = await response1.json();
    const body2 = await response2.json();
    
    expect(body1).toEqual(body2);
  }

  /**
   * Validate security headers
   */
  validateSecurityHeaders(response: APIResponse): void {
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
    ];

    const headers = response.headers();
    const headerKeys = Object.keys(headers).map(k => k.toLowerCase());

    securityHeaders.forEach(header => {
      const hasHeader = headerKeys.includes(header);
      console.log(`Security header ${header}: ${hasHeader ? '✓' : '✗'}`);
    });
  }

  /**
   * Validate CORS headers
   */
  validateCORSHeaders(response: APIResponse, origin?: string): void {
    this.assertHeader(response, 'access-control-allow-origin');
    
    if (origin) {
      const allowOrigin = response.headers()['access-control-allow-origin'];
      expect(allowOrigin === origin || allowOrigin === '*').toBeTruthy();
    }
  }

  /**
   * Custom assertion with detailed error message
   */
  async assertCustom(
    response: APIResponse,
    assertionFn: (body: any) => boolean,
    errorMessage: string
  ): Promise<void> {
    const body = await response.json();
    const result = assertionFn(body);
    expect(result, errorMessage).toBeTruthy();
  }
}
