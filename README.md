# 🛒 Ecommerce Automation Test Suite

Comprehensive end-to-end test automation framework for [Automation Exercise](https://www.automationexercise.com) using Playwright and TypeScript.

## 🚀 Features

- **Page Object Model (POM)** - Clean, maintainable test architecture
- **TypeScript** - Type safety and better IDE support
- **Cross-browser testing** - Chrome, Firefox, Safari support
- **Parallel execution** - Fast test execution
- **Detailed reporting** - HTML reports with screenshots
- **CI/CD ready** - GitHub Actions integration

## 📁 Project Structure

```
├── pages/              # Page Object Models
│   ├── homePage.ts
│   ├── loginPage.ts
│   ├── signupFlowPage.ts
│   ├── productsPage.ts
│   ├── productDetailPage.ts
│   ├── header.ts
│   └── accountDeletedPage.ts
├── tests/              # Regression test specifications
│   ├── login.spec.ts
│   ├── signup.spec.ts
│   ├── products.spec.ts
│   └── search.spec.ts
├── examples/           # Demo tests and fixture examples
│   ├── advanced-fixtures-examples.spec.ts
│   └── example-with-adblocker.spec.ts
├── utils/              # Utility functions
│   └── userFactory.ts
├── data/               # Test data
│   └── testData.json
├── playwright.config.ts
└── package.json
```

## 🧪 Regression Test Coverage

### Login Tests (2)
- ✅ Login with incorrect credentials
- ✅ Login with correct credentials + account deletion

### Signup Tests (5)
- ✅ Navigate to signup page
- ✅ Fields validation
- ✅ Valid name and email entry
- ✅ Complete signup form and create account
- ✅ Complete signup flow and delete account

### Products Tests (1)
- ✅ Verify all products and product detail page

### Search Tests (1)
- ✅ Search product functionality

**Total: 9 regression tests covering core e-commerce functionality**

## 📚 Examples & Demos

### Advanced Fixtures Examples (5)
- ✅ Authenticated user fixture demo
- ✅ Test session management demo
- ✅ Clean session fixture demo
- ✅ Stable home page fixture demo
- ✅ Combined fixtures demo

### Ad Blocking Examples (1)
- ✅ Ad blocking functionality demo

## 🛠️ Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:FalonStrada/Ecommerce-EA-Automation-Test-Suite.git
   cd Ecommerce-EA-Automation-Test-Suite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

## 🏃‍♂️ Running Tests

### Regression Tests (Main Test Suite)
```bash
npm test                    # Run all regression tests
npm run test:regression     # Run regression tests explicitly
npm run test:auto-report    # Run all tests + auto-open report
```

### Specific Test Files
```bash
# Login tests
npm run test:login          # Run login tests
npm run test:login:report   # Run login tests + auto-open report

# Signup tests
npm run test:signup         # Run signup tests  
npm run test:signup:report  # Run signup tests + auto-open report

# Products tests
npm run test:products       # Run products tests
npm run test:products:report # Run products tests + auto-open report

# Search tests
npm run test:search         # Run search tests
npm run test:search:report  # Run search tests + auto-open report
```

### Examples & Learning
```bash
# Run example tests (for learning fixtures)
npm run test:examples       # All example tests
npm run test:fixtures-demo  # Advanced fixtures examples
npm run test:adblocker-demo # Ad blocking examples
```

### Headed Mode (See browser)
```bash
npm run test:headed         # Run with visible browser
npm run test:headed:report  # Run with visible browser + auto-open report
```

### Debug Mode
```bash
npm run test:debug          # Debug mode
```

### Browser Testing
```bash
# Recommended for practice projects (fast & reliable)
npm run test:fast            # Chromium only (fastest)
npm run test:fast:report     # Chromium + auto-open report

# Individual browser tests (if needed)
npm run test:chromium        # Chrome/Chromium explicitly
npm run test:firefox         # Firefox (may have ad issues)
npm run test:webkit          # Safari/WebKit (may have ad issues)

# Enhanced security versions
npm run test:chromium:secure # Chrome with enhanced security
npm run test:firefox:secure  # Firefox with security (if enabled)
npm run test:webkit:secure   # WebKit with security (if enabled)
```

**💡 Recommendation:** Use `npm run test:fast` for daily development - it's optimized for speed and reliability.

## 📊 Reports

### Automatic Report Opening
The framework supports automatic report opening after test execution:

```bash
# Tests with auto-opening reports
npm run test:auto-report        # All tests + auto-open report
npm run test:login:report       # Login tests + auto-open report
npm run test:headed:report      # Headed mode + auto-open report
```

### Manual Report Opening
```bash
npm run report                  # Open existing report
npx playwright show-report      # Alternative command
```

### Report Features
- **Auto-opens in browser** after test completion
- **Interactive HTML report** with test details
- **Screenshots on failure** automatically captured
- **Videos on failure** (when enabled)
- **Trace files** for detailed debugging
- **Test timeline** and execution details

### Test Results Location
Test results are automatically generated in:
- `playwright-report/` - HTML reports
- `test-results/` - Screenshots, videos, traces

## 🔧 Configuration

### Playwright Configuration
Main configuration in `playwright.config.ts`:
- Base URL: `https://www.automationexercise.com`
- Timeout: 20 seconds per test
- Retries: 0 (for debugging)
- Parallel execution: Enabled

### Test Data
Centralized test data in `data/testData.json`:
- User credentials
- Signup details
- Form data

## 🏗️ Architecture

### Page Object Model
Each page has its own class with:
- **Private locators** - Element selectors
- **Public methods** - User actions
- **Assertion methods** - Verification logic

Example:
```typescript
export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
  
  async expectLoginErrorVisible() {
    await expect(this.errorMessage).toBeVisible();
  }
}
```

### Utilities
Helper functions for:
- **Data generation** - Unique emails, user objects
- **Common operations** - Reusable test logic
- **Ad blocking** - Network blocking, popup handling
- **Advanced fixtures** - Authenticated users, clean sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Best Practices

- **Independent tests** - Each test can run in isolation
- **Descriptive naming** - Clear test and method names
- **Data separation** - Test data separate from test logic
- **Error handling** - Proper assertions and error messages
- **Clean code** - TypeScript interfaces and type safety

## 🐛 Troubleshooting

### Common Issues

**Tests failing with timeout**
```bash
# Increase timeout in playwright.config.ts
timeout: 30_000
```

**Browser not found**
```bash
# Reinstall browsers
npx playwright install --force
```

**Port conflicts**
```bash
# Check if application is running on expected port
# Update baseURL in config if needed
```

**Ads interfering with tests (especially Firefox)**
```bash
# Use the AdBlocker utility (automatically included in fixtures)
# Or run Firefox-specific tests with extra timeout
npx playwright test --project=firefox --timeout=45000
```

### Ad Blocking Features

The framework includes comprehensive security and ad blocking:

#### **Browser Strategy**
- **Chromium**: Primary browser - optimized, fast, reliable (recommended)
- **Firefox**: Available but disabled by default due to ad interference
- **WebKit**: Available but disabled by default due to ad interference

**For practice projects:** Focus on Chromium for best experience
**For production projects:** Enable all browsers for comprehensive coverage

#### **Advanced Ad Blocking**
- **Network-level blocking** of 30+ ad networks and trackers
- **Pattern-based blocking** for suspicious URLs
- **CSS hiding** of ad elements and overlays
- **JavaScript API blocking** (eval, window.open, alerts)
- **Browser-specific security enhancements**

#### **Security Features**
- **Popup and redirect blocking**
- **Malicious domain filtering**
- **Cryptocurrency miner blocking**
- **Tracking protection**
- **Geolocation and notification blocking**

Example usage:
```typescript
test('My test', async ({ page, adBlocker }) => {
  // Ad blocking is automatic, but you can also:
  await adBlocker.closePopups();
  await adBlocker.waitForStablePage();
});
```

### Advanced Fixtures

The framework includes powerful advanced fixtures for complex scenarios:

#### **authenticatedUser**
Automatically creates and logs in a user, provides user data, and cleans up:
```typescript
test('My test', async ({ authenticatedUser, header }) => {
  // User is already logged in!
  await header.expectLoggedInAs(authenticatedUser.name);
  console.log(`Testing with: ${authenticatedUser.email}`);
  // Account automatically deleted after test
});
```

#### **testSession**
Complete session management with manual control:
```typescript
test('My test', async ({ testSession }) => {
  expect(testSession.isLoggedIn).toBe(true);
  console.log(`User: ${testSession.user.email}`);
  
  // Manual cleanup if needed
  await testSession.cleanup();
});
```

#### **cleanSession**
Ensures tests start with no logged-in user:
```typescript
test('My test', async ({ cleanSession, homePage }) => {
  // Guaranteed clean state - no user logged in
  await homePage.clickSignupLoginButton();
});
```

#### **stableHomePage**
Pre-loaded, ad-blocked, stable home page:
```typescript
test('My test', async ({ stableHomePage, header }) => {
  // Home page already loaded and stable
  await header.clickProducts();
});
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Amazing testing framework
- [Automation Exercise](https://www.automationexercise.com) - Test application
- TypeScript community for excellent tooling
