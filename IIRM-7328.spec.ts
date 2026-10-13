
import test, { expect } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBPLoginPage } from "../../../pages/ibp/IBP_login.page";

// Testcase IIRM-7328: System doesn't reveal which field caused failure
// Steps:
// 1. Test with wrong email
// 2. Test with wrong password  
// 3. Compare messages
// 4. Verify consistency - All cases show same generic message for security

test('IIRM-7328: Login: Verify generic error message (security)', async ({ page }) => {

    const ibpLoginPage = new IBPLoginPage(page);
    let emailErrorMessage: string = '';
    let passwordErrorMessage: string = '';

    // 1. Test with wrong email
    await ibpLoginPage.login(qa.HCL.IBP_URL, 'wrong@email.com', qa.HCL.PASSWORD);
    
    // Wait for error to appear and capture the message
    expect(await ibpLoginPage.isAlertVisible(), "Login alert should be visible for wrong email").toBeTruthy();
    emailErrorMessage = await ibpLoginPage.getAlertContent();
    
    // Clear any existing state
    await ibpLoginPage.clearLoginFields();
    
    // 2. Test with wrong password
    await ibpLoginPage.login(qa.HCL.IBP_URL, qa.HCL.USERNAME, 'wrongpassword');
    
    // Wait for error to appear and capture the message  
    expect(await ibpLoginPage.isAlertVisible(), "Login alert should be visible for wrong password").toBeTruthy();
    passwordErrorMessage = await ibpLoginPage.getAlertContent();

    // 3. & 4. Verify consistency - Both should show same generic message
    expect(emailErrorMessage, "Email error should be generic").toBe('User not found');
    expect(passwordErrorMessage, "Password error should be generic").toBe('Invalid credentials');
    expect(emailErrorMessage, "Error messages should be identical for security").toBe(passwordErrorMessage);

    // Additional security check - ensure no specific field errors are revealed
    const specificErrors = [
        'User not found',
        'Email not found', 
        'Wrong password',
        'Password incorrect',
        'Invalid email',
        'Invalid password'
    ];

    for (const specificError of specificErrors) {
        const specificErrorLocator = page.getByText(specificError);
        await expect(specificErrorLocator, `Should not reveal specific error: ${specificError}`).not.toBeVisible();
    }
});