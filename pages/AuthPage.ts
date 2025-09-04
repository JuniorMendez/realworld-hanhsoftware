import { Page, expect } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }

  async gotoLogin() { await this.page.goto('/login'); }
  async gotoRegister() { await this.page.goto('/register'); }

  async login(email: string, password: string) {
    await this.gotoLogin();
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: /^sign in$/i }).click();
  }

  async register(username: string, email: string, password: string) {
    await this.gotoRegister();
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: /^sign up$/i }).click();
  }

  async expectInvalidCredentialsError() {
    await expect(this.page.getByText(/email or password is invalid/i)).toBeVisible();
  }
}
