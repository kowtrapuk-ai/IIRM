import { test, expect, chromium } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBPLoginPage } from "../../../pages/ibp/IBP_login.page";
import { TIMEOUTS } from "../../../env/timeouts";
import { IBPDashBoardPage } from "../../../pages/ibp/IBP_Dashboard.page";

type NetworkProfile = {
  name: string;
  latency: number;
  download: number;
  upload: number;
};

const networkProfiles: NetworkProfile[] = [
  { name: "Slow 3G", latency: 400, download: 400 * 1024 / 8, upload: 400 * 1024 / 8 },
  { name: "Slow 4G", latency: 100, download: 2 * 1024 * 1024 / 8, upload: 1 * 1024 * 1024 / 8 },
  { name: "Slow 5G", latency: 20, download: 50 * 1024 * 1024 / 8, upload: 10 * 1024 * 1024 / 8 },
];

test.describe("IBP Login: Verification under throttled networks", () => {

  for (const profile of networkProfiles) {
    test(`Verify login works under ${profile.name}`, async () => {
      const browser = await chromium.launch({ headless: false });
      const context = await browser.newContext({
        bypassCSP: true,
        ignoreHTTPSErrors: true,
      });
      const page = await context.newPage();

      try {
        // Connect to CDP
        const client = await context.newCDPSession(page);
        await client.send("Network.enable");

        // Go to login URL first to establish target
        await page.goto(qa.HCL.IBP_URL, { waitUntil: "domcontentloaded" });

        // Apply throttling *after* page is ready
        await client.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: profile.latency,
          downloadThroughput: profile.download,
          uploadThroughput: profile.upload,
        });

        const ibpLoginPage = new IBPLoginPage(page);
        const ibpDashBoardPage = new IBPDashBoardPage(page);

        await ibpLoginPage.userName.fill(qa.HCL.USERNAME);
        await ibpLoginPage.password.fill(qa.HCL.PASSWORD);
        await ibpLoginPage.loginToIWH.click();

        // Wait for navigation completion by checking URL change or key element
        await Promise.race([
          page.waitForURL('**/dashboard**', { timeout: TIMEOUTS.API_TIMEOUT * 8 }),
          ibpDashBoardPage.welcomeUserName.waitFor({
            state: 'visible',
            timeout: TIMEOUTS.API_TIMEOUT * 8
          })
        ]);

        // Wait for greeting (main success indicator)
        await expect(ibpDashBoardPage.welcomeUserName, `${profile.name}: greeting not visible`).toBeVisible({
          timeout: TIMEOUTS.API_TIMEOUT * 8,
        });

        // Alert verification with proper assertions
        const alertVisible = await ibpLoginPage.isAlertVisible().catch(() => false);
        
        if (alertVisible) {
          const alertText = await ibpLoginPage.getAlertContent();
          expect(alertText.trim(), `${profile.name}: Alert text should be success message`).toBe("Logged in successfully");
        } else {
          // If no alert found, still verify login was successful via dashboard visibility
          expect(await ibpDashBoardPage.welcomeUserName.isVisible(), 
            `${profile.name}: Login should succeed even without visible alert`).toBeTruthy();
        }

        // Additional verification: Check if we're on the correct page
        const baseUrl = qa.HCL.IBP_URL.replace('/login', '');
        expect(page.url(), `${profile.name}: Should be redirected to dashboard`).toContain(baseUrl);
        expect(page.url(), `${profile.name}: Should not remain on login page`).not.toContain('/login');

      } finally {
        await context.close();
        await browser.close();
      }
    });
  }
});