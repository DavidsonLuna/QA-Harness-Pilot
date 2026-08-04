import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { invalidOpenCartUser } from '../fixtures/login.fixture';

test.describe('OpenCart login page', () => {
  test('allows a returning customer to open password recovery', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.assertOnLoginPage();
    await loginPage.openPasswordRecovery();

    await loginPage.assertOnPasswordRecoveryPage();
  });

  test('displays an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.assertOnLoginPage();

    await loginPage.login(invalidOpenCartUser.email, invalidOpenCartUser.password);
    await loginPage.assertLoginFailure('No match for E-Mail Address and/or Password.');
  });
});
