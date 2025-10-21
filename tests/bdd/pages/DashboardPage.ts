import type { Page } from 'playwright';

export class DashboardPage {
  constructor(private readonly page: Page, private readonly baseUrl: string) {}

  async goto(): Promise<void> {
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
  }

  async title(): Promise<string> {
    return this.page.title();
  }
}
