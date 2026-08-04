import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { invalidOpenCartLoginCases } from '../fixtures/login.fixture';

test.describe('OpenCart login page', () => {
  test('allows a returning customer to open password recovery', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.assertOnLoginPage();
    await loginPage.openPasswordRecovery();

    await loginPage.assertOnPasswordRecoveryPage();
    await page.goBack();
    await loginPage.assertOnLoginPage();
  });

  for (const invalidCase of invalidOpenCartLoginCases) {
    test(`displays an error for ${invalidCase.name}`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.assertOnLoginPage();

      await loginPage.login(invalidCase.email, invalidCase.password);
      await loginPage.assertLoginFailure('No match for E-Mail Address and/or Password.');
    });
  }
});
