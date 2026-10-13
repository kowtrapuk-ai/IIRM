import test, { expect } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBP } from "../../../pages/ibp/IBP";

test.describe('IBP:Login:ForgotPassword', () => {

  test.skip('1. Verify error for empty email field', async ({ page }) => {
    const ibpPages = new IBP(page);
    const ibpLoginPage = ibpPages.getLogin();
    await ibpLoginPage.goto(qa.HCL.IBP_URL);

    await ibpLoginPage.forgotPassword.click();
    await ibpLoginPage.emailAddress.fill('');
    await ibpLoginPage.sendResetLink.click();

    await expect(page.getByText('Email is required').first()).toBeVisible();
    expect(await ibpLoginPage.isAlertVisible(), "Login empty alert is not visible").toBeTruthy();
    expect(await ibpLoginPage.getAlertContent(), "Login empty Alert message is modified").toBe('Email is required to send reset link');
  });

  test.skip('2. Verify error for invalid email format', async ({ page }) => {
    const invalidEmail: string = 'abc@xyz';
    const ibpLoginPage = new IBP(page).getLogin();
    await ibpLoginPage.goto(qa.HCL.IBP_URL);

    await ibpLoginPage.forgotPassword.click();
    await ibpLoginPage.emailAddress.fill(invalidEmail);
    await ibpLoginPage.sendResetLink.click();

    expect(await ibpLoginPage.isAlertVisible(), "Login Invalid alert is not visible").toBeTruthy();
    expect(await ibpLoginPage.getAlertContent(), "Login Invalid Alert message is modified").toBe(`Employee not found`);
  });

  test('3. Verify success for valid email', async ({ page }) => {
    const validEmail: string = 'capev72561@foxroids.com';
    const ibpLoginPage = new IBP(page).getLogin();
    await ibpLoginPage.goto(qa.HCL.IBP_URL);

    await ibpLoginPage.forgotPassword.click();
    await ibpLoginPage.emailAddress.fill(validEmail);
    await ibpLoginPage.sendResetLink.click();

    expect(await ibpLoginPage.isAlertVisible(), "Forgot password mail reset alert is not visible").toBeTruthy();
    expect(await ibpLoginPage.getAlertContent(), "Forgot password mail reset Alert message is modified").toBe('Mail sent successfully. You may receive it in couple of minutes');
  });

});