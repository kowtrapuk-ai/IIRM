import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/Login.page'; // adjust path if needed
import { SnackBar } from '../../appcomponents/SnackBar.component';


test.describe('SQL Injection Tests - Login Page', () => {
    let loginPage: LoginPage;
    let snackBar: SnackBar;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        snackBar = new SnackBar(page);
        await loginPage.open("/");
    });

    // -------------------------------
    // 1. Error-based SQL Injection
    // -------------------------------
    test('Should not expose SQL errors when single quote is injected', async ({page}) => {

        await loginPage.login("'", 'test');

        const pageContent = await loginPage.page.content();
        expect(pageContent.toLowerCase(), "The sql text is visible").not.toContain('sql');
        expect(pageContent.toLowerCase(), "The syntax text is visible").not.toContain('syntax');
        expect(pageContent.toLowerCase(), "The mysql text is visible").not.toContain('mysql');
        expect(await snackBar.getMessage(), "The User not found message is not visible").toBe('User not found');
    });

    // -------------------------------
    // 2. Authentication bypass attempt
    // -------------------------------
    test('Should not allow login bypass using OR 1=1 payload', async () => {
        await loginPage.login("' OR 1=1 --", 'anything');

        // Assert: user should NOT be redirected to dashboard
        await expect(loginPage.page, "The login bypass attempt was successful").not.toHaveURL(/dashboard/);
        expect(await snackBar.getMessage(), "The User not found message is not visible").toBe('User not found');
    });

    // -------------------------------
    // 3. Boolean-based SQL Injection
    // -------------------------------
    test('Should respond consistently to true and false boolean injections', async () => {
        // TRUE condition
        await loginPage.login("' AND 1=1 --", 'test');
        const trueResponse = await loginPage.page.textContent('body');

        await loginPage.page.reload();

        // FALSE condition
        await loginPage.login("' AND 1=2 --", 'test');
        const falseResponse = await loginPage.page.textContent('body');

        // Assert: responses should be similar (no SQL behavior difference)
        expect(trueResponse?.length ?? 0, "The true and false responses differ significantly").toBeCloseTo(falseResponse?.length ?? 0, -2);
    });

    // -------------------------------
    // 4. Comment-based SQL Injection
    // -------------------------------
    test('Should not allow comment-based SQL injection', async () => {
        await loginPage.login("admin' --", 'irrelevant');
        await expect(loginPage.page, "The comment-based SQL injection attempt was successful").not.toHaveURL(/dashboard/);
        expect(await snackBar.getMessage(), "The User not found message is not visible").toBe('User not found');
    });

    // -------------------------------
    // 5. Time-based SQL Injection
    // -------------------------------
    test('Should not delay response for time-based SQL injection', async () => {
        const startTime = Date.now();

        await loginPage.login("' OR IF(1=1, SLEEP(5), 0) --", 'test');

        const duration = Date.now() - startTime;
        expect(duration, "The time-based SQL injection caused a delay").toBeLessThan(4000); // ensure no SQL sleep effect
        expect(await snackBar.getMessage(), "The User not found message is not visible").toBe('User not found');
    });

    // -------------------------------
    // 6. Input sanitization validation
    // -------------------------------
    test('Should sanitize special characters in input fields', async () => {
        await loginPage.login("<script>alert(1)</script>' OR 1=1 --", `' OR ""="`);
        await expect(loginPage.page, "The input sanitization failed").not.toHaveURL(/dashboard/);
        expect(await snackBar.getMessage(), "The User not found message is not visible").toBe('User not found');
    });
});