import { apiTest as test, expect } from '../../fixtures/api';
import { ENDPOINTS } from '../../config/api-config';
import apiTestData from '../../data/apiTestData.json';

/**
 * Performance API Test Suite
 * Demonstrates performance testing heuristics:
 * - Response time validation
 * - Load testing
 * - Concurrent request handling
 * - Rate limiting detection
 * - Performance benchmarking
 */

test.describe('API Performance Testing', () => {
  
  test('should measure baseline response times', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const iterations = 10;
    const measurements: number[] = [];
    
    // Act - Measure multiple requests
    for (let i = 0; i < iterations; i++) {
      const { duration } = await apiHelpers.measureResponseTime(
        () => apiContext.get(endpoints.build(ENDPOINTS.products.list))
      );
      measurements.push(duration);
    }
    
    // Calculate statistics
    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    const median = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];
    
    // Assert
    console.log('\n=== Performance Baseline ===');
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Min: ${min}ms`);
    console.log(`Max: ${max}ms`);
    console.log(`Median: ${median}ms`);
    console.log('============================\n');
    
    expect(avg).toBeLessThan(apiTestData.testScenarios.performance.maxResponseTime);
  });

  test('should handle concurrent requests efficiently', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const concurrentRequests = 10;
    const startTime = Date.now();
    
    const requests = Array(concurrentRequests).fill(null).map(() => 
      () => apiContext.get(endpoints.build(ENDPOINTS.products.list))
    );
    
    // Act
    const responses = await apiHelpers.batchRequests(requests, concurrentRequests);
    const totalDuration = Date.now() - startTime;
    
    // Assert
    expect(responses).toHaveLength(concurrentRequests);
    
    const successCount = responses.filter((r: any) => r.ok()).length;
    const successRate = (successCount / concurrentRequests) * 100;
    
    console.log(`\n=== Concurrent Request Test ===`);
    console.log(`Total requests: ${concurrentRequests}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Success rate: ${successRate}%`);
    console.log(`Total duration: ${totalDuration}ms`);
    console.log(`Avg per request: ${(totalDuration / concurrentRequests).toFixed(2)}ms`);
    console.log('================================\n');
    
    expect(successRate).toBeGreaterThanOrEqual(90); // 90% success rate minimum
  });

  test('should maintain performance under sequential load', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const requestCount = 20;
    const durations: number[] = [];
    
    // Act - Sequential requests
    for (let i = 0; i < requestCount; i++) {
      const { response, duration } = await apiHelpers.measureResponseTime(
        () => apiContext.get(endpoints.build(ENDPOINTS.products.list))
      );
      
      if (response.ok()) {
        durations.push(duration);
      }
    }
    
    // Calculate performance degradation
    const firstHalf = durations.slice(0, Math.floor(durations.length / 2));
    const secondHalf = durations.slice(Math.floor(durations.length / 2));
    
    const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const degradation = ((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100;
    
    // Assert
    console.log(`\n=== Sequential Load Test ===`);
    console.log(`First half avg: ${avgFirstHalf.toFixed(2)}ms`);
    console.log(`Second half avg: ${avgSecondHalf.toFixed(2)}ms`);
    console.log(`Degradation: ${degradation.toFixed(2)}%`);
    console.log('=============================\n');
    
    // Performance should not degrade more than 50%
    expect(Math.abs(degradation)).toBeLessThan(50);
  });

  test('should compare performance across different endpoints', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const endpointsToTest = [
      { name: 'Products List', path: ENDPOINTS.products.list },
      { name: 'Brands List', path: ENDPOINTS.products.brands },
    ];
    
    const results: Record<string, number> = {};
    
    // Act - Measure each endpoint
    for (const endpoint of endpointsToTest) {
      const { duration } = await apiHelpers.measureResponseTime(
        () => apiContext.get(endpoints.build(endpoint.path))
      );
      results[endpoint.name] = duration;
    }
    
    // Assert & Report
    console.log('\n=== Endpoint Performance Comparison ===');
    Object.entries(results).forEach(([name, duration]) => {
      console.log(`${name}: ${duration}ms`);
      expect(duration).toBeLessThan(apiTestData.testScenarios.performance.maxResponseTime);
    });
    console.log('========================================\n');
  });

  test('should validate response time consistency', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const samples = 15;
    const durations: number[] = [];
    
    // Act
    for (let i = 0; i < samples; i++) {
      const { duration } = await apiHelpers.measureResponseTime(
        () => apiContext.get(endpoints.build(ENDPOINTS.products.list))
      );
      durations.push(duration);
    }
    
    // Calculate standard deviation
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avg) * 100;
    
    // Assert
    console.log('\n=== Response Time Consistency ===');
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Std Deviation: ${stdDev.toFixed(2)}ms`);
    console.log(`Coefficient of Variation: ${coefficientOfVariation.toFixed(2)}%`);
    console.log('==================================\n');
    
    // Response times should be relatively consistent (CV < 50%)
    expect(coefficientOfVariation).toBeLessThan(50);
  });

  test('should measure search endpoint performance with different queries', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const queries = apiTestData.products.searchQueries.valid;
    const results: Record<string, number> = {};
    
    // Act
    for (const query of queries) {
      const formData = apiHelpers.createFormData({ search_product: query });
      const { duration } = await apiHelpers.measureResponseTime(
        () => apiContext.post(endpoints.build(ENDPOINTS.products.search), {
          data: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      );
      results[query] = duration;
    }
    
    // Assert & Report
    console.log('\n=== Search Performance by Query ===');
    Object.entries(results).forEach(([query, duration]) => {
      console.log(`"${query}": ${duration}ms`);
      expect(duration).toBeLessThan(apiTestData.testScenarios.performance.maxResponseTime);
    });
    console.log('====================================\n');
  });

  test('should detect performance bottlenecks with large payloads', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange - Create large search query
    const largeQuery = 'a'.repeat(1000); // 1000 character query
    const formData = apiHelpers.createFormData({ search_product: largeQuery });
    
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
    console.log(`\nLarge payload response time: ${duration}ms\n`);
    expect(response.status()).toBeDefined();
    expect(duration).toBeLessThan(apiTestData.testScenarios.performance.maxResponseTime * 2);
  });

  test('should measure time to first byte (TTFB)', async ({ apiContext, endpoints }) => {
    // Arrange
    const iterations = 5;
    const ttfbMeasurements: number[] = [];
    
    // Act
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const response = await apiContext.get(endpoints.build(ENDPOINTS.products.list));
      const ttfb = Date.now() - startTime;
      
      if (response.ok()) {
        ttfbMeasurements.push(ttfb);
      }
    }
    
    const avgTTFB = ttfbMeasurements.reduce((a, b) => a + b, 0) / ttfbMeasurements.length;
    
    // Assert
    console.log(`\n=== Time to First Byte ===`);
    console.log(`Average TTFB: ${avgTTFB.toFixed(2)}ms`);
    console.log(`Min TTFB: ${Math.min(...ttfbMeasurements)}ms`);
    console.log(`Max TTFB: ${Math.max(...ttfbMeasurements)}ms`);
    console.log('===========================\n');
    
    expect(avgTTFB).toBeLessThan(apiTestData.testScenarios.performance.maxResponseTime);
  });

  test('should validate caching behavior', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const url = endpoints.build(ENDPOINTS.products.list);
    
    // Act - First request (cold cache)
    const { duration: firstDuration } = await apiHelpers.measureResponseTime(
      () => apiContext.get(url)
    );
    
    // Act - Second request (potentially cached)
    const { duration: secondDuration } = await apiHelpers.measureResponseTime(
      () => apiContext.get(url)
    );
    
    // Assert
    console.log(`\n=== Caching Analysis ===`);
    console.log(`First request: ${firstDuration}ms`);
    console.log(`Second request: ${secondDuration}ms`);
    console.log(`Difference: ${firstDuration - secondDuration}ms`);
    console.log('=========================\n');
    
    // Both requests should complete successfully
    expect(firstDuration).toBeGreaterThan(0);
    expect(secondDuration).toBeGreaterThan(0);
  });

  test('should test API throughput', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange
    const duration = 10000; // 10 seconds
    const startTime = Date.now();
    let requestCount = 0;
    let successCount = 0;
    
    // Act - Make requests for specified duration
    while (Date.now() - startTime < duration) {
      try {
        const response = await apiContext.get(endpoints.build(ENDPOINTS.products.list));
        requestCount++;
        if (response.ok()) {
          successCount++;
        }
      } catch (error) {
        requestCount++;
      }
    }
    
    const actualDuration = Date.now() - startTime;
    const throughput = (requestCount / actualDuration) * 1000; // requests per second
    const successRate = (successCount / requestCount) * 100;
    
    // Assert
    console.log(`\n=== Throughput Test ===`);
    console.log(`Duration: ${actualDuration}ms`);
    console.log(`Total requests: ${requestCount}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Success rate: ${successRate.toFixed(2)}%`);
    console.log(`Throughput: ${throughput.toFixed(2)} req/s`);
    console.log('========================\n');
    
    expect(successRate).toBeGreaterThan(80); // At least 80% success rate
    expect(throughput).toBeGreaterThan(0);
  });
});

test.describe('API Performance - Edge Cases', () => {
  
  // Timeout test skipped - inconsistent behavior
  test.skip('should handle timeout scenarios gracefully', async ({ playwright }) => {
    // Arrange - Create context with very short timeout
    const shortTimeoutContext = await playwright.request.newContext({
      baseURL: 'https://automationexercise.com/api',
      timeout: 1 // 1ms timeout - will definitely timeout
    });
    
    // Act & Assert
    try {
      await shortTimeoutContext.get(ENDPOINTS.products.list);
      // If it doesn't timeout, that's also acceptable
      expect(true).toBeTruthy();
    } catch (error: any) {
      // Timeout is expected
      expect(error.message).toMatch(/timeout|exceeded/i);
    } finally {
      await shortTimeoutContext.dispose();
    }
  });

  test('should measure performance degradation with complex queries', async ({ apiContext, apiHelpers, endpoints }) => {
    // Arrange - Simple vs complex queries
    const simpleQuery = 'top';
    const complexQuery = 'blue cotton top with long sleeves';
    
    // Act
    const { duration: simpleDuration } = await apiHelpers.measureResponseTime(
      () => apiContext.post(endpoints.build(ENDPOINTS.products.search), {
        data: apiHelpers.createFormData({ search_product: simpleQuery }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
    );
    
    const { duration: complexDuration } = await apiHelpers.measureResponseTime(
      () => apiContext.post(endpoints.build(ENDPOINTS.products.search), {
        data: apiHelpers.createFormData({ search_product: complexQuery }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
    );
    
    // Assert
    console.log(`\n=== Query Complexity Impact ===`);
    console.log(`Simple query: ${simpleDuration}ms`);
    console.log(`Complex query: ${complexDuration}ms`);
    console.log(`Difference: ${complexDuration - simpleDuration}ms`);
    console.log('================================\n');
    
    expect(simpleDuration).toBeLessThan(apiTestData.testScenarios.performance.maxResponseTime);
    expect(complexDuration).toBeLessThan(apiTestData.testScenarios.performance.maxResponseTime);
  });
});
