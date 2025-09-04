export type User = { username: string; email: string; password: string };
export type Article = { title: string; description: string; body: string; tags?: string };

export const newUser = (): User => {
  const id = Date.now();
  return {
    username: `qa_user_${id}`,
    email: `qa_${id}@example.com`,
    password: 'HanhSoftwarePreInterview',
  };
};

export const newArticle = (): Article => {
  const id = Date.now();
  return {
    title: `QA Post ${id}`,
    description: 'Playwright positive flow',
    body: 'This is the article body created by an E2E test.',
    tags: 'qa,testing',
  };
};
