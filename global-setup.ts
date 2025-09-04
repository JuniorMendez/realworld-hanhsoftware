// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';

export default async function globalSetup(_config: FullConfig) {
  const BASE_URL = process.env.FRONT_URL || 'http://localhost:4100';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // unique user
  const id = Date.now();
  const user = {
    username: `qa_user_${id}`,
    email: `qa_${id}@example.com`,
    password: 'HanhSoftwarePreInterview',
  };

  // register
  await page.goto(`${BASE_URL}/register`);
  await page.getByPlaceholder('Username').fill(user.username);
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: /^sign up$/i }).click();

  // If the username does not appear, try to login (in case the user already existed
  try {
    await page.getByRole('link', { name: user.username }).waitFor({ timeout: 5000 });
  } catch {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await page.getByRole('link', { name: user.username }).waitFor({ timeout: 5000 });
  }

  // Save the session to the storage
  mkdirSync('storage', { recursive: true });
  await context.storageState({ path: 'storage/auth.json' });
  writeFileSync('storage/user.json', JSON.stringify(user), 'utf-8');

  await browser.close();
}
