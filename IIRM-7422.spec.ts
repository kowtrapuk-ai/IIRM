import { test, expect } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBPLoginPage } from "../../../pages/ibp/IBP_login.page";

test('IIRM:7422 ForgotPassword: Verify complete forgot password flow: Link click to email input', async ({ page }) => {

    const ibpLoginPage = new IBPLoginPage(page);

    await ibpLoginPage.goto(qa.HCL.IBP_URL);

    // 1. Click 'Forgot Password?' link
    await ibpLoginPage.forgotPassword.click();

    // 2. Enter generated inbox email and click 'Send Reset Link'
    await ibpLoginPage.verifyForgotPasswordScreen();
    
});

