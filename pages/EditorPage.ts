import { expect, type Page, type Response } from '@playwright/test';

export class EditorPage {
  constructor(private readonly page: Page) {}

  async openFromNavbar() {
    await this.page.getByRole('link', { name: /new post/i }).click();
    await expect(this.page).toHaveURL(/\/editor$/);

  }

 
async publishAndWaitJson() {
  const resp = await this.publishAndWait();
  const json = await resp.json();
  return { resp, json };
}


  async fillArticle(form: { title?: string; description?: string; body?: string; tags?: string; }) {
    const { title, description, body, tags } = form;
    if (title) await this.page.getByPlaceholder('Article Title').fill(title);
    if (description) await this.page.getByPlaceholder(`What's this article about?`).fill(description);
    if (body) await this.page.getByPlaceholder('Write your article (in markdown)').fill(body);
    if (tags) await this.page.getByPlaceholder('Enter tags').fill(tags);
  }

    async publishAndWait(): Promise<Response> {
    const respPromise = this.page.waitForResponse(r =>
      r.url().includes('/api/articles') && r.request().method() === 'POST'
    );
    await this.page.getByRole('button', { name: /publish article/i }).click();
    return await respPromise;
  }

  async expectPublished() {
    await expect(this.page).toHaveURL(/\/article\/.+/);
  }
}
