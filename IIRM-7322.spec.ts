
// spec: Jira IIRM-7319
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import qaConfig from '../../../env/qa.json';
import { IBP } from '../../../pages/ibp/IBP';
import { TIMEOUTS } from '../../../env/timeouts';

test.describe('IBP:Login', () => {
  test('IIRM-7322: IBP:Login: Verify Edit access for pending enrolment', async ({ page }) => {

    const userName: string = 'jansi@mailinator.com';
    const password: string = 'Test@123'
    const companyDescription: string = 'A Group Mediclaim health insurance policy covering hospitalization expenses for employees and dependents. Provides cashless treatment at network hospitals. Typically includes standard room rent limits, co-pay clauses, and sum insured based on company policy.';
    // 1. Login with completed enrolment user. Verify User is successfully logged in.

    const ibpPages = new IBP(page);
    const loginPage = ibpPages.getLogin();
    const ibpTopNavBar = ibpPages.getDashboard().topNavBar;
    const enrollmentPage = ibpPages.getEnrollMentPage();
    const ibpMyInsurancePage = ibpPages.getMyInsurancePage();

    await loginPage.login(qaConfig.HCL.IBP_URL, userName, password);
    expect(await loginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
    expect(await loginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');

    await ibpTopNavBar.myInsurance.click();
    await ibpMyInsurancePage.compulsoryBenefits.expandIcon.click();

    const card = await ibpMyInsurancePage.compulsoryBenefits.getCardContainer('GMC (Group Mediclaim)');
    expect(card, "The sub card inside the compulsory benefits section is not visible").toBeVisible();
    expect((await ibpMyInsurancePage.getCompanyDescription(companyDescription)).isVisible(), "Company description is not visible in GMC card").toBeTruthy();

    await ibpMyInsurancePage.editEnrollmentLink.click();
    await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
    expect(await ibpMyInsurancePage.expiredActiveIcon.isVisible(), "The enrollment is not in active state").toBeTruthy();
    expect(await ibpMyInsurancePage.activeIcon.isVisible(), "The enrollment is not in active state").toBeTruthy();
    await ibpMyInsurancePage.activeIcon.click();

    await ibpMyInsurancePage.button('Edit').click();
    await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
    expect(await ibpMyInsurancePage.expiredActiveIcon.isVisible(), "The enrollment is not in active state").toBeTruthy();
    expect(await ibpMyInsurancePage.activeIcon.isVisible(), "The enrollment is not in active state").toBeTruthy();

    await page.pause();
    await ibpMyInsurancePage.activeIcon.click();
    expect(await enrollmentPage.planContinue.isVisible(), "First Continue button is not visible in Enrollment page").toBeTruthy();
    await enrollmentPage.planContinue.click();

    expect(await enrollmentPage.summaryContinue.isVisible(), "Second Continue button is not visible in Enrollment page").toBeTruthy();
    await enrollmentPage.summaryContinue.click();

    await enrollmentPage.verifyViewEnrollmentSummary();
    await enrollmentPage.termsAndConditionsCheckbox('I consent to premium deductions from my salary in 1 installment.').check();
    await enrollmentPage.termsAndConditionsCheckbox('I confirm that the information provided is accurate and complete.').check();
    await enrollmentPage.button('Confirm Enrollment').click();
    await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
    expect(await enrollmentPage.thankYouText.isVisible(), "Thank you text is not visible").toBeTruthy();
      expect(await enrollmentPage.isAlertVisible(), "Success Enrollment message is not visible").toBeTruthy();
    expect(await enrollmentPage.getAlertContent(), "Success Enrollment message is modified").toBe('Enrollment submitted successfully');

  
  });

});