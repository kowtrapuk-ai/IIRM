import { chromium, firefox, webkit, Browser, Page, expect, test } from "@playwright/test";
import qa from "../../../env/qa.json";
import { IBPLoginPage } from "../../../pages/ibp/IBP_login.page";
import { IBPDashBoardPage } from "../../../pages/ibp/IBP_Dashboard.page";

const browsersToTest: { name: string; launch: () => Promise<Browser> }[] = [
    { name: "chrome", launch: () => chromium.launch({ channel: "chrome", headless: false }) },
    { name: "edge", launch: () => chromium.launch({ channel: "msedge", headless: false }) },
    { name: "firefox", launch: () => firefox.launch({ headless: false }) },
    { name: "webkit", launch: () => webkit.launch({ headless: false }) },
    { name: "chromium", launch: () => chromium.launch({ headless: false }) }
];

for (const b of browsersToTest) {

    test(`IBP: Verify login functionality with cross browsers on ${b.name}`, async () => {
        
        const browser: Browser = await b.launch();
        const context = await browser.newContext();
        const page: Page = await context.newPage();
        const ibpLoginPage = new IBPLoginPage(page);
        const ibpDashBoardPage=new IBPDashBoardPage(page);

        // Perform login
        await ibpLoginPage.login(qa.HCL.IBP_URL, qa.HCL.USERNAME, qa.HCL.PASSWORD);

        // Assertions
        expect(await ibpLoginPage.isAlertVisible(), `Login alert missing in ${b.name}`).toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), `Login alert text mismatch in ${b.name}`).toBe('Logged in successfully');
        expect(ibpDashBoardPage.welcomeUserName.isVisible(), `User greeting not visible in ${b.name}`).toBeTruthy();

        await context.close();
        await browser.close();
    });
}
