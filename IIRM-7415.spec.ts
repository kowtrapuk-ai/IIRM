import { chromium, firefox, webkit, Browser, expect, test } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBPLoginPage } from "../../../pages/ibp/IBP_login.page";

test('IIRM:7415: Login: Verify valid login in multiple machines at same time', async () => {

  // Define browser configs
  const browserConfigs = [
    { name: "chrome", launch: () => chromium.launch({ channel: "chrome", headless: false }) },
    { name: "edge", launch: () => chromium.launch({ channel: "msedge", headless: false }) },
    { name: "firefox", launch: () => firefox.launch({ headless: false }) },
    { name: "chromium", launch: () => chromium.launch({ headless: false }) },
    { name: "webkit", launch: () => webkit.launch({ headless: false }) },
  ];

  // Launch all browsers in parallel
  const browserInstances = await Promise.all(
    browserConfigs.map(async config => ({
      name: config.name,
      browser: await config.launch()
    }))
  );

  // Helper function to perform login flow per browser
  const runLoginTest = async (name: string, browser: Browser) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // Set viewport size for consistency across browsers
    await page.setViewportSize({ width: 600, height: 800 });
    const ibpLoginPage = new IBPLoginPage(page);

    // Run login and assertions in parallel
    await Promise.all([
      (async () => {
        // Wait for login to complete before checking alerts
        await ibpLoginPage.login(qa.HCL.IBP_URL, qa.HCL.USERNAME, qa.HCL.PASSWORD);
        expect(await ibpLoginPage.isAlertVisible(), `Alert missing in ${name}`).toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), `Alert mismatch in ${name}`).toBe("Logged in successfully");
      })()
    ]);

    await context.close();
    await browser.close();
  };

  try {
    // Run all logins simultaneously
    await Promise.all(browserInstances.map(({ name, browser }) => runLoginTest(name, browser)));
  }
  finally {
    // Cleanup in case of any test failure
    await Promise.all(
      browserInstances.map(({ browser }) =>
        browser.isConnected() ? browser.close() : Promise.resolve()
      )
    );
  }
});
