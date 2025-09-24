

import { test as base, expect, chromium } from '@playwright/test';

// Custom test fixture that logs in before each test and saves the session state
  storageState: async (_, use) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(process.env.WEB_BASE || 'http://localhost:3000/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/applications/);
    // Save storage state (cookies, localStorage)
    await page.context().storageState({ path: 'storageState.json' });
    await browser.close();
    await use('storageState.json');
  },
});

export { expect };
