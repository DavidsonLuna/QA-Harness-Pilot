import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly storeHeading: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.storeHeading = page.getByRole('heading', { name: 'Your Store' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
  }

  async goto() {
    await super.goto('/index.php?route=common/home');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/route=common\/home/);
    await expect(this.storeHeading).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }
}
