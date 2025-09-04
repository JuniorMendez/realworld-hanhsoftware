import { test as base } from '@playwright/test';
import { Navbar } from '../pages/Navbar';
import { AuthPage } from '../pages/AuthPage';
import { EditorPage } from '../pages/EditorPage';
import { HomePage } from '../pages/HomePage';
import { ArticlePage } from '../pages/ArticlePage';

type Fixtures = {
  navbar: Navbar;
  auth: AuthPage;
  editor: EditorPage;
  home: HomePage;
  article: ArticlePage;
};

export const test = base.extend<Fixtures>({
  navbar: async ({ page }, use) => { await use(new Navbar(page)); },
  auth: async ({ page }, use) => { await use(new AuthPage(page)); },
  editor: async ({ page }, use) => { await use(new EditorPage(page)); },
  home: async ({ page }, use) => { await use(new HomePage(page)); },
  article: async ({ page }, use) => { await use(new ArticlePage(page)); },
});

export { expect } from '@playwright/test';
