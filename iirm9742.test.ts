import { test, expect } from '../../../fixtures/iwork';
import { Utils } from '../../../utils/utils';

const bdBranchHeadLogin = Utils.loadTestData('testdata/setup/users.json').INDIA.BRANCHHEAD;

test.describe('IIRM-9742: Template Management - Applying filters', () => {
    test('Verifying Templates count', async ({ loginPage, navBar, templateManagementPage, page }) => {
        // Navigate to Template Management
        await loginPage.open("/");
        await loginPage.login(bdBranchHeadLogin.USERNAME, bdBranchHeadLogin.PASSWORD);

        // Open Template Management and wait for API
        await Promise.all([
            page.waitForResponse(resp => 
                resp.url().includes("/templates") && resp.status() === 200
            ),
            navBar.open("Admin Module", "Template Management")
        ]);
        
        await templateManagementPage.waitForTemplates();

        // Get initial template count
        const initialCount = await templateManagementPage.getTemplateCardsCount();
        expect(initialCount, "No templates are displayed initially").toBeGreaterThan(0);

        // Apply filters
        await templateManagementPage.applyFilters({
            channelType: "In-App",
            approvalStatus: "Draft",
            templateStatus: "Active"
        });

        const filteredCount = await templateManagementPage.getTemplateCardsCount();

        // Reset filters
        await templateManagementPage.resetFilters();

        const countAfterReset = await templateManagementPage.getTemplateCardsCount();
        expect(countAfterReset, "Template count mismatch after reset").toBe(initialCount);
    });
});