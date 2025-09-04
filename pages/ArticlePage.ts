import { Page, expect } from '@playwright/test';

export class ArticlePage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }

  async expectTitle(title: string) {
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }
}
