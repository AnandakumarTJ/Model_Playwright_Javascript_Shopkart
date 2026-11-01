# Shopkart Playwright Automation

A JavaScript-based UI and API automation project for testing the Shopkart application using **Playwright Test**. The framework follows the **Page Object Model (POM)** pattern and uses custom fixtures to centralize application launch and test setup.

> **Note:** This README is based on the project structure and examples discussed so far. Update the sample URLs, test names, and folder paths if your repository differs.

## Contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Framework design](#framework-design)
- [Running tests](#running-tests)
- [HTML test report](#html-test-report)
- [API testing](#api-testing)
- [Best practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Tech stack

- JavaScript (CommonJS modules)
- [Playwright Test](https://playwright.dev/docs/intro)
- Chromium (the configured browser; other browsers can be enabled in the Playwright configuration)
- Page Object Model (POM)
- Playwright fixtures
- Playwright HTML reporter

## Project structure

The following is the intended structure based on the files used in the examples:

```text
Shopkart-Playwright-Automation/
│
├── config/
│   ├── appConfig.js          # Application URL and environment configuration
│   └── dataConfig.js         # Test data, expected page title, and other constants
│
├── pages/
│   └── homepage.js           # Home page locators and page actions
│
├── tests/
│   └── appLaunch.spec.js     # Application launch and page validation tests
│
├── utills/                   # Existing folder name; consider renaming to utils
│   ├── fixtures.js           # Custom Playwright fixtures
│   └── ApiUtills.js           # Reusable API utility methods, if present
│
├── playwright.config.js      # Playwright runner configuration
├── package.json
├── package-lock.json
└── README.md
```

If the API utility is stored in another folder, adjust its import path in the tests. For new work, `utils/` and `ApiUtils.js` are recommended spellings.

## Prerequisites

- Node.js and npm installed.
- Access to the Shopkart application and its test environment.
- Valid test credentials, if a test requires authentication.

Check the installed versions:

```bash
node --version
npm --version
```

## Installation

Clone the repository and open the project directory:

```bash
git clone <repository-url>
cd <repository-folder>
```

Install the project dependencies:

```bash
npm install
```

Install Playwright browser binaries:

```bash
npx playwright install
```

If this is a new project and Playwright Test has not yet been added, install it with:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

## Configuration

Keep environment-specific values and test data outside the test scripts.

### `config/appConfig.js`

Example:

```javascript
const appConfig = {
    appURL: 'https://your-shopkart-test-url.com'
};

module.exports = appConfig;
```

### `config/dataConfig.js`

Example:

```javascript
const dataConfig = {
    appTitle: 'Shopkart'
};

module.exports = dataConfig;
```

Replace the example URL and title with the actual values for your application. Do not commit passwords, API keys, or other secrets to source control; use environment variables or a secrets manager for sensitive values.

### `playwright.config.js`

Example configuration:

```javascript
const { defineConfig } = require('@playwright/test');
const appConfig = require('./config/appConfig');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30_000,
    expect: {
        timeout: 5_000
    },
    fullyParallel: true,
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }]
    ],
    use: {
        baseURL: appConfig.appURL,
        browserName: 'chromium',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry'
    }
});
```

`baseURL` allows tests and page objects to navigate with relative paths, for example `page.goto('/login')`.

## Framework design

### Custom fixtures

The custom fixture should launch the application and provide reusable page objects to tests. A representative example is:

```javascript
const { test: base, expect } = require('@playwright/test');
const Homepage = require('../pages/homepage');

const launchshopkart = base.extend({
    homePageLaunch: async ({ page }, use) => {
        await page.goto('/');
        await use(page);
    },

    homePage: async ({ homePageLaunch }, use) => {
        const homepage = new Homepage(homePageLaunch);
        await use(homepage);
    }
});

module.exports = { launchshopkart, expect };
```

The fixture above expects `baseURL` to be configured in `playwright.config.js`. If your fixture uses `appConfig.appURL` directly, keep the navigation approach consistent and avoid maintaining duplicate URL values.

### Page Object Model

Keep page-specific locators and browser interactions in page classes. Keep test scenarios and assertions in the spec files.

Example `pages/homepage.js`:

```javascript
class Homepage {
    constructor(page) {
        this.page = page;
        this.pageNotFoundHeading = page.getByRole('heading', {
            name: 'Page not found'
        });
    }

    async openInvalidPage() {
        return await this.page.goto('/invalid-url');
    }
}

module.exports = Homepage;
```

Example `tests/appLaunch.spec.js`:

```javascript
const { launchshopkart, expect } = require('../utills/fixtures');
const dataConfig = require('../config/dataConfig');

launchshopkart('Launch Shopkart and verify the page title', async ({ homePageLaunch }) => {
    await expect(homePageLaunch).toHaveTitle(dataConfig.appTitle);
});

launchshopkart('Open an invalid URL and verify the not-found page', async ({ homePage }) => {
    const response = await homePage.openInvalidPage();

    // Check the HTTP response only when the application returns a 404 status.
    expect(response.status()).toBe(404);
    await expect(homePage.pageNotFoundHeading).toBeVisible();
});
```

The invalid-route example assumes the route returns an HTTP 404 response. Some single-page applications render a not-found screen with HTTP 200; for those applications, assert the visible not-found content instead of requiring status 404.

## Running tests

Run all tests:

```bash
npx playwright test
```

Run a specific test file:

```bash
npx playwright test tests/appLaunch.spec.js
```

Run tests with the browser visible:

```bash
npx playwright test --headed
```

Run tests in debug mode:

```bash
npx playwright test --debug
```

Run tests with a specific browser project, if configured:

```bash
npx playwright test --project=chromium
```

Run a test by title:

```bash
npx playwright test -g "Launch Shopkart"
```

## HTML test report

The HTML report is generated in the `playwright-report/` directory when the HTML reporter is enabled.

Open the latest report:

```bash
npx playwright show-report
```

Open the report on a specific port:

```bash
npx playwright show-report --port 9323
```

To generate the HTML report without automatically opening it, use this reporter setting in `playwright.config.js`:

```javascript
reporter: [['html', { open: 'never' }]]
```

## API testing

Use Playwright's `request` API or the built-in `request` fixture for HTTP tests. The HTTP status is read with `response.status()`; `toHaveStatus()` is not a built-in Playwright assertion.

Example API utility:

```javascript
const { request, expect } = require('@playwright/test');
const appConfig = require('../config/appConfig');

class ApiUtils {
    async getAPIResponse(apiEndpoint, expectedStatusCode) {
        const apiContext = await request.newContext();

        try {
            const response = await apiContext.get(
                `${appConfig.appURL}${apiEndpoint}`
            );

            expect(response.status()).toBe(expectedStatusCode);
            return response;
        } finally {
            await apiContext.dispose();
        }
    }
}

module.exports = ApiUtils;
```

For test code that already receives Playwright's `{ request }` fixture, prefer using that fixture rather than creating a separate API context for every request.

## Best practices

- Keep locators and page actions in page-object classes; keep assertions and test intent in spec files.
- Use Playwright's accessible locators where possible, such as `getByRole()`, `getByLabel()`, and `getByText()`.
- Use fixtures for reusable setup and teardown; avoid duplicating navigation logic in every test.
- Prefer `baseURL` plus relative paths for environment-independent navigation.
- Keep test data and environment configuration separate from test logic.
- Do not hardcode credentials or secrets in the repository.
- Prefer auto-waiting Playwright assertions over fixed `waitForTimeout()` calls.
- Ensure API request contexts you create manually are disposed of after use.
- Keep tests isolated so they can run independently and in parallel.

## Troubleshooting

| Error | Likely cause | Fix |
|---|---|---|
| `... is not a function` | The method is missing, misspelled, or the exported class was not instantiated. | Check the page-object method and CommonJS export/import. |
| `page is not defined` | The test callback did not receive the `page` fixture. | Use `async ({ page }) => { ... }`. |
| `toHaveStatus is not a function` | `toHaveStatus()` is not a Playwright assertion. | Use `expect(response.status()).toBe(expectedStatusCode)`. |
| Application URL is incorrect | URL configuration or `baseURL` is inconsistent. | Check `config/appConfig.js` and `playwright.config.js`. |
| HTML report is not available | HTML reporter is not configured or tests have not run. | Configure the HTML reporter, run tests, then execute `npx playwright show-report`. |

## Useful Playwright documentation

- [Playwright Test](https://playwright.dev/docs/intro)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Model](https://playwright.dev/docs/pom)
- [API testing](https://playwright.dev/docs/api-testing)
- [HTML reporter](https://playwright.dev/docs/test-reporters#html-reporter)
