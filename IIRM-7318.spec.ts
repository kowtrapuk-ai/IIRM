
import { test, expect } from '@playwright/test';
import qaConfig from '../../../env/qa.json';
import {IBP} from '../../../pages/ibp/IBP';

test('IIRM-7318: Verify successful login with valid credentials', async ({ page }) => {
  // 1. Navigate to IBP login page
  // 2. Enter valid email and password using Page Object Model
  const ibpPages =new IBP(page);
  const loginPage = ibpPages.getLogin();
  const topNavBar= ibpPages.getDashboard().topNavBar;
  const dashBoardPage = ibpPages.getDashboard();

  await loginPage.login(qaConfig.HCL.IBP_URL, qaConfig.HCL.USERNAME, qaConfig.HCL.PASSWORD);
  await loginPage.verifyLoginScreen();

  // 3. Click Login button using Page Object Model
  expect(await loginPage.isAlertVisible(), "Login alert is not visible").toBeTruthy();
  expect(await loginPage.getAlertContent(), "Login Alert message is modified").toBe('Logged in successfully');

  // 4. Verify user is successfully logged in (dashboard page loads) using Page Object Model
  expect(topNavBar.dashboard, "Login Failed").toBeVisible();
  expect(dashBoardPage.welcomeUserName, "User greeting is not visible").toBeVisible();

});