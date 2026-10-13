import { test, expect } from '@playwright/test';
import qaConfig from '../../../env/qa.json';
import { IBP } from '../../../pages/ibp/IBP';

test('IIRM-7338: Verify enrolment form functionality', async ({ page }) => {
    const userName: string = 'heyeyod500@hh7f.com';
    const password: string = 'Test@123';
    const companyDescription = 'A Group Mediclaim health insurance policy covering hospitalization expenses for employees and dependents. Provides cashless treatment at network hospitals. Typically includes standard room rent limits, co-pay clauses, and sum insured based on company policy.';

    // Login and verify success alert
    const ibpPages = new IBP(page);
    const ibpLoginPage = ibpPages.getLogin();
    const ibpEnrollmentWindow = ibpPages.getDashboard().enrollMentWindow;
    const ibpEnrollmentPage=ibpPages.getEnrollMentPage();
    const ibpMyInsurancePage = ibpPages.getMyInsurancePage();
    
    await ibpLoginPage.login(qaConfig.HCL.IBP_URL, userName, password);
    expect(await ibpLoginPage.isAlertVisible(), 'Login alert is not visible').toBeTruthy();
    expect(await ibpLoginPage.getAlertContent(), 'Login Alert message is modified').toBe('Logged in successfully');

    // Verify "Enroll Now" button on enrollment banner
    expect(await ibpEnrollmentWindow.enrollmentDeadLine.isVisible(), 'Enrollment deadline not visible').toBeTruthy();
    const enrollNowButton = ibpEnrollmentWindow.button('Enroll Now');
    expect(await enrollNowButton.isvisible(), 'Enroll now button is not visible').toBeTruthy();

    await enrollNowButton.click();

    // Expand Compulsory Benefits section
    await ibpMyInsurancePage.compulsoryBenefits.expandIcon.click();

    // Wait for the Compulsory Benefits card to be visible (adding explicit wait)
    // Wait for Compulsory Benefits card to appear
    const gmcCard = (await ibpMyInsurancePage.compulsoryBenefits.getCardContainer('Compulsory Benefits')).textContent();

    expect(gmcCard, 'Compulsory Benefits card is not visible').toBeTruthy();
  
    // Verify company description inside GMC card
    const descriptionLocator = await ibpMyInsurancePage.getCompanyDescription(companyDescription);
    expect(descriptionLocator.isVisible(), 'Company description is not visible').toBeTruthy();

    // Wait for Enroll Now button to be visible and clickable (explicit wait)
    const link = await ibpMyInsurancePage.getEnrollNowLink();
    expect(link.isVisible(), "Enroll now Link is not visible").toBeTruthy();
    await link.click();

    // Verify enrollment form details
    await ibpEnrollmentPage.verifyEmployeeDetails();

    // Verify summary card
    await ibpEnrollmentPage.verifySummaryCard();

    // Save and verify alert
    await ibpEnrollmentWindow.button('Save & Exit').click();

    expect(await ibpEnrollmentWindow.isAlertVisible(), 'Enrollment alert is not visible').toBeTruthy();
    expect(await ibpEnrollmentWindow.getAlertContent(), 'Enrollment Alert message is modified').toBe('Enrollment progress saved successfully');
});
