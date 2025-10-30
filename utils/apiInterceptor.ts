import { APIResponse } from '@playwright/test';

/**
 * API Request/Response Interceptor
 * Captures and logs API calls for debugging and monitoring
 */

export interface RequestLog {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
}

export interface ResponseLog {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  duration: number;
  timestamp: number;
}

export interface APICallLog {
  request: RequestLog;
  response?: ResponseLog;
  error?: string;
}

export class APIInterceptor {
  private logs: APICallLog[] = [];
  private enabled: boolean = false;
  private startTimes: Map<string, number> = new Map();

  /**
   * Enable request/response interception
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable request/response interception
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if interceptor is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Log a request
   */
  logRequest(
    method: string,
    url: string,
    headers: Record<string, string> = {},
    body?: any
  ): string {
    if (!this.enabled) return '';

    const requestId = `${Date.now()}-${Math.random()}`;
    const timestamp = Date.now();

    this.startTimes.set(requestId, timestamp);

    const log: APICallLog = {
      request: {
        method,
        url,
        headers,
        body,
        timestamp,
      },
    };

    this.logs.push(log);
    return requestId;
  }

  /**
   * Log a response
   */
  async logResponse(requestId: string, response: APIResponse): Promise<void> {
    if (!this.enabled) return;

    const startTime = this.startTimes.get(requestId) || Date.now();
    const duration = Date.now() - startTime;

    const log = this.logs.find(l => 
      l.request.timestamp === startTime
    );

    if (log) {
      let body: any;
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
        }
      } catch (error) {
        body = '[Unable to parse response body]';
      }

      log.response = {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body,
        duration,
        timestamp: Date.now(),
      };
    }

    this.startTimes.delete(requestId);
  }

  /**
   * Log an error
   */
  logError(requestId: string, error: Error): void {
    if (!this.enabled) return;

    const startTime = this.startTimes.get(requestId);
    const log = this.logs.find(l => 
      l.request.timestamp === startTime
    );

    if (log) {
      log.error = error.message;
    }

    this.startTimes.delete(requestId);
  }

  /**
   * Get all logs
   */
  getLogs(): APICallLog[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by criteria
   */
  getFilteredLogs(filter: {
    method?: string;
    urlPattern?: RegExp;
    status?: number;
    hasError?: boolean;
  }): APICallLog[] {
    return this.logs.filter(log => {
      if (filter.method && log.request.method !== filter.method) {
        return false;
      }

      if (filter.urlPattern && !filter.urlPattern.test(log.request.url)) {
        return false;
      }

      if (filter.status && log.response?.status !== filter.status) {
        return false;
      }

      if (filter.hasError !== undefined) {
        const hasError = !!log.error;
        if (hasError !== filter.hasError) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get statistics from logs
   */
  getStatistics(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    slowestRequest: APICallLog | null;
    fastestRequest: APICallLog | null;
    statusCodes: Record<number, number>;
  } {
    const stats = {
      totalRequests: this.logs.length,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      slowestRequest: null as APICallLog | null,
      fastestRequest: null as APICallLog | null,
      statusCodes: {} as Record<number, number>,
    };

    if (this.logs.length === 0) {
      return stats;
    }

    let totalDuration = 0;
    let slowestDuration = 0;
    let fastestDuration = Infinity;

    this.logs.forEach(log => {
      if (log.response) {
        const status = log.response.status;
        stats.statusCodes[status] = (stats.statusCodes[status] || 0) + 1;

        if (status >= 200 && status < 400) {
          stats.successfulRequests++;
        } else {
          stats.failedRequests++;
        }

        const duration = log.response.duration;
        totalDuration += duration;

        if (duration > slowestDuration) {
          slowestDuration = duration;
          stats.slowestRequest = log;
        }

        if (duration < fastestDuration) {
          fastestDuration = duration;
          stats.fastestRequest = log;
        }
      } else if (log.error) {
        stats.failedRequests++;
      }
    });

    stats.averageResponseTime = totalDuration / this.logs.length;

    return stats;
  }

  /**
   * Log summary to console
   */
  logSummary(): void {
    if (!this.enabled || this.logs.length === 0) {
      return;
    }

    console.log('\n=== API Call Summary ===');
    console.log(`Total requests: ${this.logs.length}`);

    const stats = this.getStatistics();
    console.log(`Successful: ${stats.successfulRequests}`);
    console.log(`Failed: ${stats.failedRequests}`);
    console.log(`Average response time: ${stats.averageResponseTime.toFixed(2)}ms`);

    if (stats.slowestRequest?.response) {
      console.log(`Slowest request: ${stats.slowestRequest.request.method} ${stats.slowestRequest.request.url} (${stats.slowestRequest.response.duration}ms)`);
    }

    console.log('\nStatus codes:');
    Object.entries(stats.statusCodes).forEach(([code, count]) => {
      console.log(`  ${code}: ${count}`);
    });

    console.log('========================\n');
  }

  /**
   * Log detailed information for a specific request
   */
  logDetails(log: APICallLog): void {
    console.log('\n=== Request Details ===');
    console.log(`Method: ${log.request.method}`);
    console.log(`URL: ${log.request.url}`);
    console.log(`Timestamp: ${new Date(log.request.timestamp).toISOString()}`);
    
    if (log.request.body) {
      console.log('Request Body:', JSON.stringify(log.request.body, null, 2));
    }

    if (log.response) {
      console.log('\n=== Response Details ===');
      console.log(`Status: ${log.response.status} ${log.response.statusText}`);
      console.log(`Duration: ${log.response.duration}ms`);
      console.log('Response Body:', JSON.stringify(log.response.body, null, 2));
    }

    if (log.error) {
      console.log('\n=== Error ===');
      console.log(log.error);
    }

    console.log('========================\n');
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.startTimes.clear();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Find requests by URL pattern
   */
  findByUrl(pattern: RegExp): APICallLog[] {
    return this.logs.filter(log => pattern.test(log.request.url));
  }

  /**
   * Find failed requests
   */
  findFailedRequests(): APICallLog[] {
    return this.logs.filter(log => 
      log.error || (log.response && log.response.status >= 400)
    );
  }

  /**
   * Find slow requests (above threshold)
   */
  findSlowRequests(thresholdMs: number): APICallLog[] {
    return this.logs.filter(log => 
      log.response && log.response.duration > thresholdMs
    );
  }
}
