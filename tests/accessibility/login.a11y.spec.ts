import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Login accessibility', () => {
  test('exposes labels and a named submit control', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
