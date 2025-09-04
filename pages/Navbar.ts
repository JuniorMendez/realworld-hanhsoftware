import { Page, Locator, expect } from '@playwright/test';

export class Navbar {
  readonly page: Page;
  readonly linkHome: Locator;
  readonly linkSignIn: Locator;
  readonly linkSignUp: Locator;
  readonly linkNewPost: Locator;
  readonly linkSettings: Locator;

  constructor(page: Page) {
    this.page = page;
    this.linkHome = page.getByRole('link', { name: 'conduit' });
    this.linkSignIn = page.getByRole('link', { name: /sign in/i });
    this.linkSignUp = page.getByRole('link', { name: /sign up/i });
    this.linkNewPost = page.getByRole('link', { name: /new post/i });
    this.linkSettings = page.getByRole('link', { name: /settings/i });
  }

  async expectLoggedIn(username: string) {
    await expect(this.page.getByRole('link', { name: username })).toBeVisible();
  }

  async logoutIfLoggedIn() {
    const settingsVisible = await this.linkSettings.isVisible().catch(() => false);
    if (settingsVisible) {
      await this.linkSettings.click();
      await this.page.getByRole('button', { name: /or click here to logout/i }).click();
      await expect(this.linkSignIn).toBeVisible();
    }
  }
}
