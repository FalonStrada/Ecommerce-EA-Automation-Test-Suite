import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

export class AutoOpenReporter implements Reporter {
  private shouldOpen: boolean;

  constructor(options: { open?: boolean } = {}) {
    this.shouldOpen = options.open ?? true;
  }

  async onEnd(result: FullResult) {
    if (this.shouldOpen && result.status !== 'interrupted') {
      // Only open report if tests completed (not interrupted)
      const { spawn } = await import('child_process');
      
      // Open report in default browser
      try {
        if (process.platform === 'win32') {
          spawn('cmd', ['/c', 'start', 'playwright-report/index.html'], { detached: true });
        } else if (process.platform === 'darwin') {
          spawn('open', ['playwright-report/index.html'], { detached: true });
        } else {
          spawn('xdg-open', ['playwright-report/index.html'], { detached: true });
        }
      } catch (error) {
        console.log('Could not auto-open report:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}

export default AutoOpenReporter;
