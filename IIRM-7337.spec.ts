import test, { expect } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBP } from "../../../pages/ibp/IBP";

// Testcase IIRM-7337: IBP Login - Verify user can navigate dashboard and name is displayed
// Steps:
// 1. Login with completed enrolment
// 2. Click Dashboard link
// 3. Check the data loads

test('IIRM-7337 - Dashboard displays user name after login', async ({ page }) => {

    const ibpPages=new IBP(page);
    const ibpLoginPage = ibpPages.getLogin();
    const ibpTopNavBarPage= ibpPages.getDashboard().topNavBar;
    const ibpDashBoardPage=ibpPages.getDashboard();

    // Step 1: Login with completed enrolment
    await ibpLoginPage.login(qa.HCL.IBP_URL,qa.HCL.USERNAME,qa.HCL.PASSWORD);

    // Step 2: Verify Login page alert
    expect(await ibpLoginPage.isAlertVisible(),"Login alert is not visible").toBeTruthy();
    expect(await ibpLoginPage.getAlertContent(),"Login Alert message is modified").toBe('Logged in successfully');

    // Step 3: Verify user name/email is displayed in dashboard
    expect(await ibpTopNavBarPage.dashboard.isVisible(),"The DashBoard is not visible").toBeTruthy();
    expect(ibpDashBoardPage.welcomeUserName.isVisible(), "Navigation to Dashboard is not successful").toBeTruthy();

});
