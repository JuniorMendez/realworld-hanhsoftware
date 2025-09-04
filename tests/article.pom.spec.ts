import { test, expect } from '../support/fixtures';
import { readFileSync } from 'fs';
import { newArticle } from '../support/data-factory';

// Type for the user we’ll assert against in the UI
type User = { username: string; email: string; password: string };
let account: User;

test.beforeAll(() => {
  // Here the user created by global-setup.ts
  account = JSON.parse(readFileSync('storage/user.json', 'utf-8'));
});

test.describe('Articles (POM)', () => {
  test('Create article (positive) and validate in Global Feed', 
    async ({ navbar, editor, article, home }) => {
    await home.goto();
    await navbar.expectLoggedIn(account.username);
    
    // Go to the editor and fill the form with valid data
    await editor.openFromNavbar();
    const art = newArticle();
    await editor.fillArticle(art);

    const { resp, json } = await editor.publishAndWaitJson();

    // Backend assertions
    expect([200, 201]).toContain(resp.status());
    expect(json.article.title).toBe(art.title);
    await editor.expectPublished();
    await article.expectTitle(art.title);

    // Validate the article is listed in the Global Feed
    await home.goto();
    await home.openGlobalFeed();
    await home.expectArticleInFeed(art.title);
  });

  test('Create article (negative) — only title must NOT publish', 
    async ({ navbar, editor, home }) => {
    await home.goto();
    await navbar.expectLoggedIn(account.username);

    await editor.openFromNavbar();
    const badTitle = `Only Title ${Date.now()}`;
    await editor.fillArticle({ title: badTitle });

    // Capture the network response
    const resp = await editor.publishAndWait();
    expect(resp.status(), 'Expected 422 when required fields are missing').toBe(422);

    await expect(editor['page']).toHaveURL(/\/editor$/);
    await home.goto();
    await home.openGlobalFeed();
    await home.expectArticleNotInFeed(badTitle);
  });
});
