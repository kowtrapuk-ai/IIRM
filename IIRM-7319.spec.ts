// spec: Jira IIRM-7319
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import qaConfig from '../../../env/qa.json';
import { IBP } from '../../../pages/ibp/IBP';
import { TIMEOUTS } from '../../../env/timeouts';

test.describe('IBP:Login', () => {
  test('IIRM-7319: Verify redirect to Dashboard for completed enrolment', async ({ page }) => {

    const userName: string = 'kishore@mailinator.com';
    const password: string = 'Test@123'
    const companyDescription: string = 'A Group Mediclaim health insurance policy covering hospitalization expenses for employees and dependents. Provides cashless treatment at network hospitals. Typically includes standard room rent limits, co-pay clauses, and sum insured based on company policy.';
    // 1. Login with completed enrolment user. Verify User is successfully logged in.

    const ibpPages = new IBP(page);
    const loginPage = ibpPages.getLogin();
    const ibpTopNavBar = ibpPages.getDashboard().topNavBar;
    const enrollmentWindow = ibpPages.getDashboard().enrollMentWindow;
    const enrollmentPage = ibpPages.getEnrollMentPage();
    const ibpMyInsurancePage = ibpPages.getMyInsurancePage();

    await loginPage.login(qaConfig.HCL.IBP_URL, userName, password);
    expect(await loginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
    expect(await loginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');

    await enrollmentWindow.enrollmentDeadLine.scrollIntoViewIfNeeded();
    // 2. Click on Enroll now button from Dashboard page. Verify Dashboard displayed. Data in view-only mode. No edit buttons visible.
    expect(await enrollmentWindow.calendarIcon.isVisible(), "Calendar icon is not visible").toBeTruthy();
    expect(await enrollmentWindow.enrollmentDeadLine.isVisible(), "Enrollment deadline is not visible").toBeTruthy();
    expect(await enrollmentWindow.button('Enroll Now').isvisible(), "Enroll now button is not visible in Enrollment Window").toBeTruthy();
    await enrollmentWindow.button('Enroll Now').click();

    await ibpMyInsurancePage.compulsoryBenefits.expandIcon.click();

    const card = await ibpMyInsurancePage.compulsoryBenefits.getCardContainer('GMC (Group Mediclaim)');
    expect(card, "The sub card inside the compulsory benefits section is not visible").toBeVisible();
    expect((await ibpMyInsurancePage.getCompanyDescription(companyDescription)).isVisible(), "Company description is not visible in GMC card").toBeTruthy();

    const cardEnrollNow = ibpMyInsurancePage.getEnrollNowLink();
    expect((await cardEnrollNow).isVisible(), "Enroll Now button is not visible in compulsory benefits card").toBeTruthy();
    await (await cardEnrollNow).click();

    await enrollmentPage.verifyEmployeeDetails();
    expect(await enrollmentPage.getShieldBackgroundLogo('Base Policy'), "Shield background logo is not visible in Enrollment page").toBeVisible();
    expect(await enrollmentPage.planContinue.isVisible(), "First Continue button is not visible in Enrollment page").toBeTruthy();
    await enrollmentPage.planContinue.click();

    expect(await enrollmentPage.summaryContinue.isVisible(), "Second Continue button is not visible in Enrollment page").toBeTruthy();
    await enrollmentPage.summaryContinue.click();
    
    await enrollmentPage.verifyViewEnrollmentSummary();
    await enrollmentPage.termsAndConditionsCheckbox('I consent to premium deductions from my salary in 1 installment.').check();
    await enrollmentPage.termsAndConditionsCheckbox('I confirm that the information provided is accurate and complete.').check();
    await enrollmentPage.button('Confirm Enrollment').click();

    await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

    expect(await enrollmentPage.thankYouText.isVisible(), "Thank you text is not visible after enrollment submission").toBeTruthy();
    expect(enrollmentPage.thankYouText,"Thank you text content is changed").toBe('Thank you! Your Enrollment Has Been Successfully Submitted');
    await enrollmentPage.button('Go to DashBoard').click();
    expect(await ibpTopNavBar.dashboard.isVisible(),"Not Redirected to DashBoard").toBeTruthy();

  });

});