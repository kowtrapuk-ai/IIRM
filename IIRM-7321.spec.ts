import { test, expect } from '@playwright/test';
import qaEnv from '../../../env/qa.json';
import { LoginPage } from '../../../pages/Login.page';
import { IBPDashBoardPage } from '../../../pages/ibp/IBP_Dashboard.page';
import { IBPLoginPage } from '../../../pages/ibp/IBP_login.page';

test('IBP:Login: Verify company identification from policy', async ({ page }) => {
  // Navigate to IBP URL from env
  const ibpLoginPage = new IBPLoginPage(page);
  const ibpDashBoardPage = new IBPDashBoardPage(page);
  await page.goto(qaEnv.HCL.IBP_URL);

  // Login using credentials from env
  await ibpLoginPage.login(qaEnv.HCL.IBP_URL,qaEnv.HCL.USERNAME, qaEnv.HCL.PASSWORD);

  // Verify visibility of company element
  await expect(ibpDashBoardPage.hclLogoImg, "The Company name is not visible after login").toBeVisible();

});