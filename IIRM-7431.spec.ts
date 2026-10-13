import test, { expect } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBP } from "../../../pages/ibp/IBP";

test.describe('IBP:Login:ForgotPassword', () => {

  test('IIRM-7431 - Verify unregistered email handling (security - no email disclosure)', async ({ page }) => {

    const invalidEmail: string = 'unregistered@gmail.com'
    const ibpPages = new IBP(page);
    const ibpLoginPage = ibpPages.getLogin();

    //1. Login with IBP Url
    await ibpLoginPage.goto(qa.HCL.IBP_URL);

    // 2. Enter email not in system: notfound@email.com
    // Step: Click the Forgot Password link
    await ibpLoginPage.forgotPassword.click();

    // 3. Enter unregistered email and submit
    await ibpLoginPage.emailAddress.fill(invalidEmail);
    await ibpLoginPage.sendResetLink.click();

    // 4. Check response
    // Step: Verify generic message (no indication if email exists)
    expect(await ibpLoginPage.isAlertVisible(), "Login Invalid alert is not visible").toBeTruthy();
    expect(await ibpLoginPage.getAlertContent(), "Login Invalid Alert message is modified").toBe(`Employee not found`);

  });
});
