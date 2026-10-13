import test, { expect, Page } from "@playwright/test";
import qa from "../../../env/qa.json";
import {IBP} from '../../../pages/ibp/IBP';

// Title: IBP:Login: Verify email case-insensitivity
// Description: Login succeeds with any email case


test.describe('IBP:Login: Email Case Insensitivity', () => {

    
    test('1. IBP:Login: Login succeeds with uppercase email', async ({ page }) => {
        const ibpPages=new IBP(page);
        const ibpLoginPage = ibpPages.getLogin();
        await ibpLoginPage.login(qa.HCL.IBP_URL, qa.HCL.USERNAME.toUpperCase(), qa.HCL.PASSWORD);
        expect(await ibpLoginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');
    });

    test('2. IBP:Login: Login succeeds with mixed case email', async ({ page }) => {
        const mixedCaseEmail = qa.HCL.USERNAME.split('').map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase())).join('');
        const ibpLoginPage = new IBP(page).getLogin();
        await ibpLoginPage.login(qa.HCL.IBP_URL, mixedCaseEmail, qa.HCL.PASSWORD);
        expect(await ibpLoginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');
    });
    
    test('3. Login succeeds with domain in uppercase', async ({ page }) => {
        const [local, domain] = qa.HCL.USERNAME.split('@');
        const domainUppercaseEmail = `${local}@${domain.toUpperCase()}`;
        const ibpLoginPage = new IBP(page).getLogin();
        await ibpLoginPage.login(qa.HCL.IBP_URL, domainUppercaseEmail, qa.HCL.PASSWORD);
        expect(await ibpLoginPage.isAlertVisible()).toBeTruthy();
        expect(await ibpLoginPage.getAlertContent()).toBe('Logged in successfully');
    });


});