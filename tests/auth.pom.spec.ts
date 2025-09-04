import { test, expect } from '../support/fixtures';
import { newUser } from '../support/data-factory';

test.use({ storageState: { cookies: [], origins: [] } }); // no session

test.describe('Auth (POM)', () => {
  test('Sign In (positive) — log in and sees username', 
    async ({ page, navbar, auth }) => {
    // User ready for testing
    const u = newUser();
    await auth.register(u.username, u.email, u.password);
    await navbar.expectLoggedIn(u.username);

    // Log out and log back in
    await navbar.logoutIfLoggedIn();
    await auth.login(u.email, u.password);
    await navbar.expectLoggedIn(u.username);
  });

  test('Sign In (negative) — wrong password shows validation error', 
    async ({ navbar, auth }) => {
    const u = newUser();
    await auth.register(u.username, u.email, u.password);
    await navbar.expectLoggedIn(u.username);
    await navbar.logoutIfLoggedIn();

    await auth.login(u.email, 'wrong-' + u.password);
    await auth.expectInvalidCredentialsError();
  });
});
