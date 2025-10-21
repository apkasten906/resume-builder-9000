import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DashboardPage } from '../pages/DashboardPage.js';
import { TestWorld } from '../support/world.js';

Given('I set WEB_BASE to default if not provided', function (this: TestWorld) {
  if (this.webBase) {
    return;
  }

  const fallback = process.env.WEB_BASE ?? 'http://localhost:3000';
  this.webBase = fallback;
});

When('I navigate to the dashboard', async function (this: TestWorld) {
  if (!this.page) {
    throw new Error('Playwright page was not initialised.');
  }

  const baseUrl = this.webBase ?? 'http://localhost:3000';
  const dashboard = new DashboardPage(this.page, baseUrl);
  await dashboard.goto();
});

Then('the page title should contain {string}', async function (this: TestWorld, expected: string) {
  if (!this.page) {
    throw new Error('Playwright page was not initialised.');
  }

  const baseUrl = this.webBase ?? 'http://localhost:3000';
  const dashboard = new DashboardPage(this.page, baseUrl);
  const title = await dashboard.title();
  assert.ok(title.includes(expected), `Expected page title to contain "${expected}" but received "${title}".`);
});
