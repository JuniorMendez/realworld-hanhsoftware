// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';

export default async function globalSetup(_config: FullConfig) {
  const BASE_URL = process.env.FRONT_URL || 'http://localhost:4100';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // usuario único para esta corrida
  const id = Date.now();
  const user = {
    username: `qa_user_${id}`,
    email: `qa_${id}@example.com`,
    password: 'HanhSoftwarePreInterview',
  };

  // 1) intenta registrarlo
  await page.goto(`${BASE_URL}/register`);
  await page.getByPlaceholder('Username').fill(user.username);
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: /^sign up$/i }).click();

  // 2) si no aparece el username, intenta login (por si el usuario ya existía)
  try {
    await page.getByRole('link', { name: user.username }).waitFor({ timeout: 5000 });
  } catch {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await page.getByRole('link', { name: user.username }).waitFor({ timeout: 5000 });
  }

  // 3) guarda la sesión y las credenciales para el resto de los tests
  mkdirSync('storage', { recursive: true });
  await context.storageState({ path: 'storage/auth.json' });
  writeFileSync('storage/user.json', JSON.stringify(user), 'utf-8');

  await browser.close();
}
