import test, { expect } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBP } from "../../../pages/ibp/IBP";

// IIRM-7326: Verify login fails with invalid email
test.describe('IIRM-7326 - Verify login fails with invalid email', () => {

    const invalidEmails = [
        'nonexistent@gmail.com',
        'nonexistent@gmail',
        'nonexistent@',
        'invalid@@gmail.com',
        'user name@gmail.com',
        'user!@gmail.com',
        '"user"@gmail.com',
        'user@domain..com',
        'user@domain .com',
    ];

    for (const email of invalidEmails) {
        test(`Verify login fails for invalid email: "${email}"`, async ({ page }) => {
            const ibpPages = new IBP(page);
            const ibpLoginPage = ibpPages.getLogin();

            // Step 1: Login attempt
            await ibpLoginPage.login(qa.HCL.IBP_URL, email, qa.HCL.PASSWORD);

            // Step 2: Verify error
            expect(await ibpLoginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
            expect(await ibpLoginPage.getAlertContent(), "Login Alert message is modified").toBe('User not found');

            // Step 3: Verify still on login page
            expect(ibpLoginPage.userName.isVisible(), 'User name field should still be visible (no session created)').toBeTruthy();
        });
    }
});
