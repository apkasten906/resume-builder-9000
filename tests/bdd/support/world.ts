import { IWorldOptions, World } from '@cucumber/cucumber';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export interface TestWorldParameters {
  trace?: boolean;
  webBase?: string;
}

const TRACE_DIRECTORY = 'playwright-traces';
const TRACE_ARCHIVE = path.join(TRACE_DIRECTORY, 'trace.zip');

export class TestWorld extends World<TestWorldParameters> {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  webBase?: string;
  private readonly traceEnabled: boolean;
  private tracingStarted = false;

  constructor(options: IWorldOptions<TestWorldParameters>) {
    super(options);
    this.traceEnabled = Boolean(options.parameters?.trace);
    this.webBase = options.parameters?.webBase ?? process.env.WEB_BASE;
  }

  async init(): Promise<void> {
    const resolvedWebBase = this.webBase ?? 'http://localhost:3000';
    this.webBase = resolvedWebBase;

    this.browser = await chromium.launch({
      headless: process.env.HEADLESS === 'false' ? false : true,
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      baseURL: resolvedWebBase,
    });

    if (this.traceEnabled) {
      await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
      this.tracingStarted = true;
    }

    this.page = await this.context.newPage();
  }

  async dispose(): Promise<void> {
    try {
      if (this.traceEnabled && this.tracingStarted && this.context) {
        await fs.mkdir(TRACE_DIRECTORY, { recursive: true });
        await this.context.tracing.stop({ path: TRACE_ARCHIVE });
        this.tracingStarted = false;
      }
    } finally {
      await this.page?.close();
      await this.context?.close();
      await this.browser?.close();
      this.page = undefined;
      this.context = undefined;
      this.browser = undefined;
    }
  }
}
