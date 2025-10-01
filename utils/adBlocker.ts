import { Page } from '@playwright/test';

export class AdBlocker {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Block common ad networks and tracking scripts with enhanced security
   */
  async blockAds() {
    await this.page.route('**/*', (route) => {
      const url = route.request().url();
      const resourceType = route.request().resourceType();
      
      // Enhanced blocked domains list for security
      const blockedDomains = [
        // Ad networks
        'googleads', 'googlesyndication', 'googletagmanager', 'google-analytics',
        'doubleclick', 'adsystem', 'amazon-adsystem', 'adsystem.amazon',
        'ads.yahoo.com', 'advertising.com', 'adnxs.com', 'adsystem.amazon.com',
        'amazon-adsystem.com', 'googletag', 'gstatic.com/ads',
        // Social trackers
        'facebook.com/tr', 'connect.facebook.net', 'facebook.net',
        'twitter.com/i/adsct', 'analytics.twitter.com',
        // Malicious/suspicious domains
        'malware', 'phishing', 'suspicious', 'tracker',
        // Popup and redirect domains
        'popup', 'redirect', 'click.', 'promo.',
        // Cryptocurrency miners
        'coinhive', 'jsecoin', 'minergate', 'cryptoloot',
        // Additional ad networks
        'media.net', 'criteo', 'outbrain', 'taboola', 'revcontent',
        'propellerads', 'popads', 'popcash', 'adcash'
      ];

      // Block suspicious resource types
      const blockedResourceTypes = ['font', 'websocket'];
      
      // Check for blocked domains
      const shouldBlockDomain = blockedDomains.some(domain => url.toLowerCase().includes(domain));
      
      // Check for blocked resource types in non-essential contexts
      const shouldBlockResourceType = blockedResourceTypes.includes(resourceType) && 
        !url.includes(new URL(this.page.url()).hostname);
      
      // Block suspicious URL patterns
      const suspiciousPatterns = [
        /\/ads?\//i,
        /\/popup/i,
        /\/banner/i,
        /\/tracking/i,
        /\/analytics/i,
        /\.ads\./i,
        /ad[sv]\d/i,
        /popup/i,
        /banner/i
      ];
      
      const shouldBlockPattern = suspiciousPatterns.some(pattern => pattern.test(url));
      
      if (shouldBlockDomain || shouldBlockResourceType || shouldBlockPattern) {
        console.log(`🛡️ Blocked: ${url}`);
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  /**
   * Close any popup ads that might appear
   */
  async closePopups() {
    try {
      // Wait for potential popups and close them
      const popupSelectors = [
        '[id*="popup"]',
        '[class*="popup"]',
        '[id*="modal"]',
        '[class*="modal"]',
        '[id*="ad"]',
        '[class*="advertisement"]',
        'iframe[src*="ads"]',
        // Common close button selectors
        'button[aria-label*="close"]',
        'button[title*="close"]',
        '.close',
        '[data-dismiss="modal"]'
      ];

      for (const selector of popupSelectors) {
        const elements = await this.page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            await element.click({ timeout: 1000 }).catch(() => {
              // Ignore if click fails
            });
          }
        }
      }
    } catch (error) {
      // Ignore popup handling errors
      console.log('Popup handling completed');
    }
  }

  /**
   * Wait for page to be stable (no more network requests)
   */
  async waitForStablePage(timeout: number = 5000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      // Continue if timeout, page might still be usable
      console.log('Page stabilization timeout, continuing...');
    }
  }

  /**
   * Hide ad elements with enhanced CSS for security
   */
  async hideAdsWithCSS() {
    await this.page.addStyleTag({
      content: `
        /* Hide common ad containers */
        [id*="ad"], [class*="ad"], 
        [id*="banner"], [class*="banner"],
        [id*="popup"], [class*="popup"],
        [id*="modal"], [class*="modal"],
        iframe[src*="ads"], iframe[src*="doubleclick"],
        .advertisement, .ads, .ad-container,
        .google-ads, .adsense {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          pointer-events: none !important;
        }
        
        /* Remove overlay backgrounds and suspicious elements */
        .modal-backdrop, .overlay, 
        [class*="promo"], [id*="promo"],
        [class*="offer"], [id*="offer"],
        [class*="deal"], [id*="deal"] {
          display: none !important;
        }
        
        /* Block suspicious iframes and embeds */
        iframe[src*="popup"], iframe[src*="ad"],
        iframe[src*="banner"], iframe[src*="promo"],
        embed[src*="ad"], object[data*="ad"] {
          display: none !important;
        }
        
        /* Security: Hide elements that could be malicious */
        [onclick*="window.open"], [onclick*="popup"],
        [href*="javascript:"], [href*="data:"] {
          pointer-events: none !important;
          display: none !important;
        }
      `
    });
  }

  /**
   * Browser-specific security enhancements
   */
  async applyBrowserSpecificSecurity() {
    const userAgent = await this.page.evaluate(() => navigator.userAgent);
    
    if (userAgent.includes('Chrome') || userAgent.includes('Chromium')) {
      await this.applyChromeSecurityEnhancements();
    } else if (userAgent.includes('Firefox')) {
      await this.applyFirefoxSecurityEnhancements();
    } else if (userAgent.includes('Safari') || userAgent.includes('WebKit')) {
      await this.applyWebKitSecurityEnhancements();
    }
  }

  /**
   * Chrome/Chromium specific security
   */
  private async applyChromeSecurityEnhancements() {
    await this.page.addInitScript(() => {
      // Disable dangerous APIs
      window.open = () => null;
      window.alert = () => null;
      window.confirm = () => false;
      window.prompt = () => null;
      
      // Block eval and similar dangerous functions
      window.eval = () => { throw new Error('eval blocked for security'); };
    });
  }

  /**
   * Firefox specific security
   */
  private async applyFirefoxSecurityEnhancements() {
    await this.page.addInitScript(() => {
      // Firefox-specific security measures
      Object.defineProperty(window, 'open', { value: () => null });
      Object.defineProperty(window, 'alert', { value: () => null });
      
      // Block WebRTC for privacy
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia = () => Promise.reject('Blocked for security');
      }
    });
  }

  /**
   * WebKit/Safari specific security
   */
  private async applyWebKitSecurityEnhancements() {
    await this.page.addInitScript(() => {
      // WebKit-specific security measures
      window.open = () => null;
      window.alert = () => null;
      window.confirm = () => false;
      
      // Block notifications
      if ('Notification' in window) {
        Notification.requestPermission = () => Promise.resolve('denied');
      }
      
      // Block geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition = () => { throw new Error('Geolocation blocked'); };
      }
    });
  }

  /**
   * Complete security setup for all browsers
   */
  async setupCompleteSecurity() {
    await this.blockAds();
    await this.hideAdsWithCSS();
    await this.applyBrowserSpecificSecurity();
    
    // Additional security measures - disable dangerous APIs
    await this.page.addInitScript(() => {
      // Simple approach: disable dangerous functions completely
      (window as any).eval = () => { throw new Error('eval blocked for security'); };
      console.log('🛡️ Enhanced security measures applied');
    });
  }
}
