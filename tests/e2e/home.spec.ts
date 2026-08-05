import { test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test.describe('OpenCart home page', () => {
  test('shows the store header and search field', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    await homePage.assertLoaded();
  });
});
