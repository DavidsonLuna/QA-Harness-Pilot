import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgottenPasswordLink: Locator;
  readonly warningMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('E-Mail Address');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgottenPasswordLink = page.locator('#content').getByRole('link', { name: 'Forgotten Password' });
    this.warningMessage = page.locator('.alert-dismissible');
  }

  async goto() {
    await super.goto('/index.php?route=account/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async openPasswordRecovery() {
    await this.forgottenPasswordLink.click();
  }

  async assertOnLoginPage() {
    await expect(this.page).toHaveURL(/route=account\/login/);
    await expect(this.loginButton).toBeVisible();
  }

  async assertLoginFailure(expectedText?: string) {
    await expect(this.warningMessage).toBeVisible();
    if (expectedText) {
      await expect(this.warningMessage).toContainText(expectedText);
    }
  }

  async assertOnPasswordRecoveryPage() {
    await expect(this.page).toHaveURL(/route=account\/forgotten/);
    await expect(this.page.getByRole('heading', { name: 'Account', level: 1 })).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: '* E-Mail Address' })).toBeVisible();
  }
}
