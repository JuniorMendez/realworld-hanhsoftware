import { Page, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }

  async goto() { await this.page.goto('/'); }

  async openGlobalFeed() {
    await this.page.getByRole('link', { name: /global feed/i }).click();
  }

  async expectArticleInFeed(title: string) {
    await expect(this.page.getByRole('link', { name: title })).toBeVisible();
  }

  async expectArticleNotInFeed(title: string) {
    await expect(this.page.getByRole('link', { name: title })).toHaveCount(0);
  }
}
