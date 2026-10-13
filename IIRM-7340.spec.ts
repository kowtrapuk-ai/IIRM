import test, { expect } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBPLoginPage } from "../../../pages/ibp/IBP_login.page";
import { IBP } from "../../../pages/ibp/IBP";

// Testcase IIRM-7340: Login succeeds with whitespace around email
// Steps:
// 1. Enter email with leading/trailing whitespace
// 2. Enter valid password
// 3. Click Login
// 4. Observe success: 'Logged in successfully'
// The leading space and trailing spaces are not accepted at the time of inception so the login will fail as per the requirement but if we give spaces for the registered email field then it is accepted.

test.describe('IBP: Login succeeds with whitespace around email', () => {

    test('1. IIRM-7340 - Login succeeds with Leading whitespace around email', async ({ page }) => {

        const ibpPages = new IBP(page);
        const ibpLoginPage = ibpPages.getLogin();
        const userName: string = ` ${qa.HCL.USERNAME}`

        // 1. Enter email with whitespace and valid password, Login
        await ibpLoginPage.login(qa.HCL.IBP_URL, userName, qa.HCL.PASSWORD);

        // 4. Observe success
        expect(await ibpLoginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');

    });

    test('2. IIRM-7340 - Login succeeds with Leading and trailing whitespace around email', async ({ page }) => {

        const userName: string = ` ${qa.HCL.USERNAME} `;
        const ibpLoginPage = new IBP(page).getLogin();

        // 1. Enter email with whitespace and valid password, Login
        await ibpLoginPage.login(qa.HCL.IBP_URL, userName, qa.HCL.PASSWORD);

        // 4. Observe success
        expect(await ibpLoginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');

    });

    test('3. IIRM-7340 - Login succeeds with trailing whitespace around email', async ({ page }) => {

        const userName: string = `${qa.HCL.USERNAME} `
        const ibpLoginPage = new IBP(page).getLogin();

        // 1. Enter email with whitespace and valid password, Login
        await ibpLoginPage.login(qa.HCL.IBP_URL, userName, qa.HCL.PASSWORD);

        // 4. Observe success
        expect(await ibpLoginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');

    });


    test('4. IIRM-7340 - Login succeeds with Leading and trailing whitespace around email', async ({ page }) => {

        const userName: string = ' hawin85217@ametitas.com '
        const ibpLoginPage = new IBP(page).getLogin();

        // 1. Enter email with whitespace and valid password, Login
        await ibpLoginPage.login(qa.HCL.IBP_URL, userName, qa.HCL.PASSWORD);

        // 4. Observe success
        expect(await ibpLoginPage.isAlertVisible(), "Employee alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Employee Alert message is modified").toBe('User not found');

    });

});