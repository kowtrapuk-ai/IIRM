// spec: Jira IIRM-7323
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import qaConfig from '../../../env/qa.json';
import { IBP } from '../../../pages/ibp/IBP';

test('IIRM-7323: Verify View-only access for completed enrolment', async ({ page }) => {

  const USERNAME: string = 'capev72561@foxroids.com';
  
  const ibpPages=new IBP(page);
  const ibpLoginPage=ibpPages.getLogin();
  const ibpDashBoardPage=ibpPages.getDashboard();

  // 1️ Login
  await ibpLoginPage.login(qaConfig.HCL.IBP_URL, USERNAME, qaConfig.HCL.PASSWORD);
  expect(await ibpLoginPage.isAlertVisible(), 'Login alert is not visible').toBeTruthy();
  expect(await ibpLoginPage.getAlertContent(), 'Login Alert message is modified').toBe('Logged in successfully');

  // 2️ Verify Company Provided Insurances section
  await ibpDashBoardPage.companyProvidedInsurances.scrollIntoViewIfNeeded();
  expect(await ibpDashBoardPage.companyProvidedInsurances.isVisible(), "Company Provided Insurances heading is not visible").toBeTruthy();

  // 3️ Verify Group Mediclaim Policy card is visible
  expect(ibpDashBoardPage.groupMediclaimCard.isVisible(), 'Group Mediclaim Policy card is not visible').toBeTruthy();

  // 4️ Verify Shield Background image (completed enrolment indicator)
  expect(ibpDashBoardPage.statusLogo.isVisible(), "Shield Background image not found for Group Mediclaim Policy card").toBeTruthy();

  // 5️ (Optional) Verify basic labels inside the card
  const sumInsured = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Sum Insured');
  const balanceValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Balance');
  const dependentsValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Dependents');
  const expiredValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Expires');

  expect(ibpDashBoardPage.sumInsuredLabel.isVisible(), "Sum Insured label missing").toBeTruthy();
  expect(sumInsured, "Sum insured value is not displaying correctly").toBe('7,00,000');

  expect(ibpDashBoardPage.balanceLabel.isVisible(), "Balance label missing").toBeTruthy();
  expect(balanceValue, "Sum insured value is not displaying correctly").toBe('7,00,000');

  expect(ibpDashBoardPage.dependentsLabel.isVisible(), "Dependents label missing").toBeTruthy();
  expect(dependentsValue, "Sum insured value is not displaying correctly").toBe('0');

  expect(ibpDashBoardPage.expiresLabel.isVisible(), "Expires label missing").toBeTruthy();
  expect(expiredValue, "Sum insured value is not displaying correctly").toBe('2030-10-22');

  expect(ibpDashBoardPage.starHealthLogo.isVisible(), "Star Health logo missing").toBeTruthy();

});
