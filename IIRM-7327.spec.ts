import test, { expect, Page } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBPLoginPage } from "../../../pages/ibp/IBP_login.page";

// Testcase IIRM-7327: Invalid login should show error and no session is created
// Steps:
// 1. Enter email from CSV as username
// 2. Enter empId from CSV + random number as password
// 3. Click Login
// 4. Observe error: Password must be atleast 8 characters long.

async function verifyLoginFailure(url: string, UserName: string, Password: string, page: Page, loginPage: any, expectedError: string) {
    await loginPage.login(url, UserName, Password);
    await expect(page.getByText(expectedError), `Password validation message is not displayed for ${Password}`).toBeVisible();
}

async function verifyLoginFailureWithCSV(url: string, csvFilePath: string, userIndex: number, page: Page, loginPage: any, expectedError: string) {
    // Get user data from CSV
    const { Utils } = require('../../../utils/utils');
    const csvData = Utils.loadCSVData(csvFilePath);
    const user = csvData[userIndex];
    
    const email = user['email'];
    const empId = user['Employee ID'];
    const fullName = user['Full Name'];
    
    // Append random number to empId to ensure login failure
    const randomNumber = Math.floor(Math.random() * 9999);
    const passwordWithRandom = empId + randomNumber;
    
    // Use regular login method with email as username and empId+random as password
    await loginPage.login(url, email, passwordWithRandom);
    await expect(page.getByText(expectedError), `Password validation message is not displayed for ${fullName}`).toBeVisible();
}

test.describe('IIRM:7327 Login: Verify login fails with incorrect password', () => {

    test('1. IIRM:7327 Login: Verify login fails with empty password', async ({ page }) => {

        let emptyPasswordError: string = 'Password is required';
        const ibpLoginPage = new IBPLoginPage(page);

        // 1. Enter email and empty password, Login
        await verifyLoginFailure(qa.HCL.IBP_URL, qa.HCL.USERNAME, '', page, ibpLoginPage, emptyPasswordError);
    });


    test('2. IIRM:7327 Login: Verify login fails with incorrect passwords', async ({ page }) => {

        let passwordError: string = 'Invalid credentials';

        let passwords: string[] = [
            "Ab1!",
            "aB3$z7",
            "password1!",
            "lowercase9#",
            "PASSWORD1!",
            "UPPER9$%",
            "Password!",
            "GoodPass#",
            "Password1",
            "Abcdef12",
            "pass1",
            "PASSWORD",
            "abc12345",
            "Ab1",
            "abcdefg1",
            "ABCDEFG1",
            "Abcde123",
            "Abc!@#$%",
            "12345678!",
            "!@#AaBb"
        ];

        const ibpLoginPage = new IBPLoginPage(page);

        for (let index = 0; index < passwords.length; index++) {
            // Expect error message
            await verifyLoginFailure(qa.HCL.IBP_URL, qa.HCL.USERNAME, passwords[index], page, ibpLoginPage, passwordError);
        }

    });

  
    test('3. IIRM:7327 Login: Test multiple users with email+empId+random combination', async ({ page }) => {

        let passwordError: string = 'Invalid credentials';
        const ibpLoginPage = new IBPLoginPage(page);
        const csvPath = 'testdata/ui/ibp/employee_data.csv';

        // Test with first 3 users from CSV
        for (let userIndex = 0; userIndex < 3; userIndex++) {
            console.log(`Testing user at index: ${userIndex}`);
            await verifyLoginFailureWithCSV(qa.HCL.IBP_URL, csvPath, userIndex, page, ibpLoginPage, passwordError);
        
        }
    });

});