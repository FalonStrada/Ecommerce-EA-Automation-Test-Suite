import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { RETRY_CONFIG } from '../config/api-config';

/**
 * API Test Helpers
 * Provides reusable utilities for API testing following best practices
 */
export class APITestHelpers {
  constructor(private apiContext: APIRequestContext) {}

  /**
   * Retry mechanism for flaky API calls
   * Implements exponential backoff
   */
  async retryRequest(
    requestFn: () => Promise<APIResponse>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      retryOn?: number[];
    } = {}
  ): Promise<APIResponse> {
    const maxRetries = options.maxRetries ?? RETRY_CONFIG.maxRetries;
    const retryDelay = options.retryDelay ?? RETRY_CONFIG.retryDelay;
    const retryOn = options.retryOn ?? RETRY_CONFIG.retryOn;

    let lastError: Error | null = null;
    let response: APIResponse | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        response = await requestFn();
        
        // Check if status code requires retry
        if (retryOn.includes(response.status()) && attempt < maxRetries) {
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} for status ${response.status()}`);
          await this.sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} after error: ${lastError.message}`);
          await this.sleep(retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Poll an endpoint until a condition is met
   * Useful for async operations and eventual consistency
   */
  async pollUntil(
    requestFn: () => Promise<APIResponse>,
    conditionFn: (response: APIResponse) => Promise<boolean> | boolean,
    options: {
      timeout?: number;
      interval?: number;
      errorMessage?: string;
    } = {}
  ): Promise<APIResponse> {
    const timeout = options.timeout ?? 30000;
    const interval = options.interval ?? 1000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const response = await requestFn();
      const conditionMet = await conditionFn(response);

      if (conditionMet) {
        return response;
      }

      await this.sleep(interval);
    }

    throw new Error(options.errorMessage || `Polling timeout after ${timeout}ms`);
  }

  /**
   * Extract and parse JSON response body
   */
  async getJsonBody<T = any>(response: APIResponse): Promise<T> {
    const body = await response.json();
    return body as T;
  }

  /**
   * Extract response headers as object
   */
  getHeaders(response: APIResponse): Record<string, string> {
    return response.headers();
  }

  /**
   * Check if response contains specific header
   */
  hasHeader(response: APIResponse, headerName: string): boolean {
    const headers = this.getHeaders(response);
    return Object.keys(headers).some(
      key => key.toLowerCase() === headerName.toLowerCase()
    );
  }

  /**
   * Get specific header value (case-insensitive)
   */
  getHeader(response: APIResponse, headerName: string): string | undefined {
    const headers = this.getHeaders(response);
    const entry = Object.entries(headers).find(
      ([key]) => key.toLowerCase() === headerName.toLowerCase()
    );
    return entry?.[1];
  }

  /**
   * Create form data for x-www-form-urlencoded requests
   */
  createFormData(data: Record<string, string>): string {
    return new URLSearchParams(data).toString();
  }

  /**
   * Create multipart form data
   */
  createMultipartFormData(data: Record<string, string | Buffer>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        formData.append(key, value);
      } else {
        formData.append(key, new Blob([new Uint8Array(value)]));
      }
    });
    return formData;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random string for unique data
   */
  generateRandomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate unique email
   */
  generateUniqueEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = this.generateRandomString(5);
    return `${prefix}_${timestamp}_${random}@example.com`;
  }

  /**
   * Measure response time
   */
  async measureResponseTime(requestFn: () => Promise<APIResponse>): Promise<{
    response: APIResponse;
    duration: number;
  }> {
    const startTime = Date.now();
    const response = await requestFn();
    const duration = Date.now() - startTime;
    return { response, duration };
  }

  /**
   * Batch requests with concurrency control
   */
  async batchRequests<T>(
    requests: (() => Promise<T>)[],
    concurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = request().then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Assert response time is within acceptable range
   */
  async assertResponseTime(
    requestFn: () => Promise<APIResponse>,
    maxDuration: number,
    message?: string
  ): Promise<APIResponse> {
    const { response, duration } = await this.measureResponseTime(requestFn);
    expect(duration, message || `Response time ${duration}ms exceeds ${maxDuration}ms`).toBeLessThanOrEqual(maxDuration);
    return response;
  }

  /**
   * Compare two API responses for equality
   */
  async compareResponses(
    response1: APIResponse,
    response2: APIResponse,
    options: {
      compareStatus?: boolean;
      compareHeaders?: boolean;
      compareBody?: boolean;
      ignoreHeaders?: string[];
    } = {}
  ): Promise<{
    equal: boolean;
    differences: string[];
  }> {
    const differences: string[] = [];
    const opts = {
      compareStatus: true,
      compareHeaders: false,
      compareBody: true,
      ignoreHeaders: [],
      ...options,
    };

    if (opts.compareStatus && response1.status() !== response2.status()) {
      differences.push(`Status: ${response1.status()} vs ${response2.status()}`);
    }

    if (opts.compareHeaders) {
      const headers1 = this.getHeaders(response1);
      const headers2 = this.getHeaders(response2);
      
      Object.keys(headers1).forEach(key => {
        if (!opts.ignoreHeaders?.includes(key) && headers1[key] !== headers2[key]) {
          differences.push(`Header ${key}: ${headers1[key]} vs ${headers2[key]}`);
        }
      });
    }

    if (opts.compareBody) {
      const body1 = await response1.text();
      const body2 = await response2.text();
      
      if (body1 !== body2) {
        differences.push('Response bodies differ');
      }
    }

    return {
      equal: differences.length === 0,
      differences,
    };
  }
}
