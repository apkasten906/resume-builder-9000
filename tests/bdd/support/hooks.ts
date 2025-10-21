import { After, AfterStep, Before, BeforeAll, ITestStepHookParameter, Status } from '@cucumber/cucumber';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TestWorld } from './world.js';

const REPORTS_DIR = path.join('reports', 'cucumber');

BeforeAll(async () => {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
});

Before(async function (this: TestWorld) {
  await this.init();
});

After(async function (this: TestWorld) {
  await this.dispose();
});

AfterStep(async function (this: TestWorld, { result }: ITestStepHookParameter) {
  if (result?.status !== Status.FAILED) {
    return;
  }

  if (!this.page) {
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(REPORTS_DIR, `screenshot-${timestamp}.png`);

  await this.page.screenshot({ path: screenshotPath, fullPage: true });
});
