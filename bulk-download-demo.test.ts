import { test, expect } from '../fixtures/iwork';
import { TabList } from '../appcomponents/TabList.component';
import { Utils } from '../utils/utils';
import { DownloadComponent } from '../appcomponents/Download.component';
import { Dialog } from '../appcomponents/Dialog.component';
import fs from 'fs';

const loginCredentials: any = Utils.loadTestData('testdata/setup/users.json');

test.describe('Bulk Download:', { tag: '@document-download' }, () => {

    const companyName: string = "Dummy_Automation";
    const roName: string = "Company_1768";
    const soName: string = "kavyasri";
    const policyName: string = "Company_8236";

    const users = [
        { role: 'BRANCHHEAD', credentials: loginCredentials.INDIA.BRANCHHEAD },
        { role: 'SUPER_USER', credentials: loginCredentials.INDIA.SUPER_USER }
    ];

    for (const user of users) {

        test.describe(`${user.role}`, () => {

            let tab: TabList;
            let downloadDialog: Dialog;
            let downloadUtils: DownloadComponent;
            let password: string;

            test.beforeEach(async ({ navBar, page }) => {
                tab = new TabList(page);
                downloadDialog = new Dialog(page);
                downloadUtils = new DownloadComponent(page);
            });

            test('01. Download and Validate multiple files in My Companies', async ({ loginPage, page, manageCompanyPage, navBar }) => {

                await loginPage.open("/");
                await loginPage.login(user.credentials.USERNAME, user.credentials.PASSWORD);

                await navBar.profileIcon.click();
                await navBar.configureFilePasswordOption.click();

                expect(await navBar.passwordPreviewDialog.getTitle(), "The File password dialog title got mismatched").toBe("File Password");
                expect(await navBar.passwordPreviewDialog.button("Close").isvisible(), "The File password dialog message got mismatched").toBeTruthy();
                password = await navBar.passwordPreviewDialog.getValueByLabel("Current File Password");
                const firstName = await navBar.passwordPreviewDialog.getValueByLabel("Password Source");

                console.log(firstName);
                await navBar.passwordPreviewDialog.close();

                await navBar.open("My Companies");

                await manageCompanyPage.smartSearch().searchFor(companyName);
                await manageCompanyPage.frozenAgGrid.clickOn('Display name', 0);

                // Navigate to Documents tab
                await tab.open('Documents');

                const fileCount = await manageCompanyPage.frozenAgGrid.getRowCount();
                const entityId = downloadUtils.extractEntityIdFromUrl(page.url(), 'company');

                await manageCompanyPage.frozenAgGrid.selectAllCheckbox.check();
                await manageCompanyPage.button("Bulk Download").click();

                expect(await downloadDialog.getTitle(), "The dialog message got mismatched").toBe("Confirm Download");
                expect(await downloadDialog.getMessage(), "The dialog success message got mismatched").toBe(`Do you want to download ${fileCount} documents as a ZIP file?`);
                expect(await downloadDialog.button("Yes").isvisible(), "Yes button is not visible").toBeTruthy();
                expect(await downloadDialog.button("No").isvisible(), "No button is not visible").toBeTruthy();

                await downloadDialog.button('Yes').click();

                const zipDownloadPromise = downloadUtils.waitAndSaveZipDownload(page);
                const downloadedZip = await zipDownloadPromise;
                const downloadedZipFileName = downloadedZip.fileName;

                const extractedPath = await downloadUtils.extractZipFile(downloadedZip.filePath, password);
                const extractedFiles = fs.readdirSync(extractedPath);

                const companyZipFileName = await downloadUtils.verifyZipNamingConvention('company', entityId);

                // Verify ZIP naming convention for Company
                expect(downloadedZipFileName, "The company ZIP file naming convention is incorrect").toContain(companyZipFileName);
                expect(extractedFiles.length, "The number of extracted files does not match the expected file count").toBe(fileCount);

            });

            test('02. Download and Validate multiple files in My RO', async ({ loginPage, page, manageROPage, navBar }) => {

                await loginPage.open("/");
                await loginPage.login(user.credentials.USERNAME, user.credentials.PASSWORD);

                await navBar.profileIcon.click();
                await navBar.configureFilePasswordOption.click();

                expect(await navBar.passwordPreviewDialog.getTitle(), "The File password dialog title got mismatched").toBe("File Password");
                expect(await navBar.passwordPreviewDialog.button("Close").isvisible(), "The File password dialog message got mismatched").toBeTruthy();
                password = await navBar.passwordPreviewDialog.getValueByLabel("Current File Password");

                await navBar.passwordPreviewDialog.close();

                await navBar.open("My Sales Portfolio", "My RO");

                await manageROPage.smartSearch().searchFor(roName);
                await manageROPage.frozenAgGrid.clickOn('Policy type', 0);

                // Navigate to Documents tab
                await tab.open('Documents');
                const fileCount = await manageROPage.frozenAgGrid.getRowCount();

                await manageROPage.frozenAgGrid.selectAllCheckbox.check();
                await manageROPage.button("Bulk Download").click();

                expect(await downloadDialog.getTitle(), "The dialog message got mismatched").toBe("Confirm Download");
                expect(await downloadDialog.getMessage(), "The dialog success message got mismatched").toBe(`Do you want to download ${fileCount} document as a ZIP file?`);
                expect(await downloadDialog.button("Yes").isvisible(), "Yes button is not visible").toBeTruthy();
                expect(await downloadDialog.button("No").isvisible(), "No button is not visible").toBeTruthy();

                await downloadDialog.button("Yes").click();

                const entityId = downloadUtils.extractEntityIdFromUrl(page.url(), 'ro');
                const zipPromise = downloadUtils.waitAndSaveZipDownload(page);

                const downloadedZip = await zipPromise;
                const extractedPath = await downloadUtils.extractZipFile(downloadedZip.filePath, password);
                const extractedFiles = fs.readdirSync(extractedPath);
                const fileName = downloadedZip.fileName;

                const roZipFile = await downloadUtils.verifyZipNamingConvention('renewal_opportunity', entityId);

                // Verify ZIP naming convention for RO
                expect(fileName, `The ro ZIP file naming convention is incorrect`).toContain(roZipFile);
                expect(extractedFiles.length, "The number of extracted files does not match the expected file count").toBe(fileCount);

            });

            test('03. Download and Validate multiple files in My SO', async ({ loginPage, page, manageSOPage, navBar }) => {

                await loginPage.open("/");
                await loginPage.login(user.credentials.USERNAME, user.credentials.PASSWORD);

                await navBar.profileIcon.click();
                await navBar.configureFilePasswordOption.click();

                expect(await navBar.passwordPreviewDialog.getTitle(), "The File password dialog title got mismatched").toBe("File Password");
                expect(await navBar.passwordPreviewDialog.button("Close").isvisible(), "The File password dialog message got mismatched").toBeTruthy();
                password = await navBar.passwordPreviewDialog.getValueByLabel("Current File Password");

                await navBar.passwordPreviewDialog.close();

                await navBar.open("My Sales Portfolio", "My SO");

                await manageSOPage.smartSearch().searchFor(soName);
                await manageSOPage.frozenAgGrid.clickOn('Policy type', 0);

                // Navigate to Documents tab
                await tab.open('Documents');

                const fileCount = await manageSOPage.frozenAgGrid.getRowCount();

                await manageSOPage.frozenAgGrid.selectAllCheckbox.check();
                await manageSOPage.button("Bulk Download").click();

                expect(await downloadDialog.getTitle(), "The dialog message got mismatched").toBe("Confirm Download");
                expect(await downloadDialog.getMessage(), "The dialog success message got mismatched").toContain(`Do you want to download ${fileCount} documents as a ZIP file?`);
                expect(await downloadDialog.button("Yes").isvisible(), "Yes button is not visible").toBeTruthy();
                expect(await downloadDialog.button("No").isvisible(), "No button is not visible").toBeTruthy();

                await downloadDialog.button("Yes").click();

                const entityId = downloadUtils.extractEntityIdFromUrl(page.url(), 'so');
                const zipPromise = downloadUtils.waitAndSaveZipDownload(page);
                const downloadedZip = await zipPromise;

                // Extract and verify contents
                const extractedPath = await downloadUtils.extractZipFile(downloadedZip.filePath, password);
                const extractedFiles = fs.readdirSync(extractedPath);

                const fileName = downloadedZip.fileName;
                const downloadedZipFileName = await downloadUtils.verifyZipNamingConvention('sales_opportunity', entityId);

                //Verifying zip file naming convention
                expect(fileName, `The so ZIP file naming convention is incorrect`).toBe(downloadedZipFileName);
                expect(extractedFiles.length, "Policy ZIP file count mismatch").toBe(fileCount);

            });

            test('04. Download and Validate multiple files in Manage Policies', async ({ loginPage, page, manageCompanyPage, navBar }) => {

                await loginPage.open("/");
                await loginPage.login(user.credentials.USERNAME, user.credentials.PASSWORD);

                await navBar.profileIcon.click();
                await navBar.configureFilePasswordOption.click();

                expect(await navBar.passwordPreviewDialog.getTitle(), "The File password dialog title got mismatched").toBe("File Password");
                expect(await navBar.passwordPreviewDialog.button("Close").isvisible(), "The File password dialog message got mismatched").toBeTruthy();
                password = await navBar.passwordPreviewDialog.getValueByLabel("Current File Password");

                await navBar.passwordPreviewDialog.close();

                await navBar.open("Manage Placements", "Manage Policies");

                await manageCompanyPage.smartSearch().searchFor(policyName);
                await manageCompanyPage.frozenAgGrid.clickOn('Policy type', 0);

                // Navigate to Documents tab
                await tab.open('Documents');
                const fileCount = await manageCompanyPage.frozenAgGrid.getRowCount();

                await manageCompanyPage.frozenAgGrid.selectAllCheckbox.check();
                await manageCompanyPage.button("Bulk Download").click();

                expect(await downloadDialog.getTitle(), "The dialog message got mismatched").toBe("Confirm Download");
                expect(await downloadDialog.getMessage(), "The dialog success message got mismatched").toBe(`Do you want to download ${fileCount} documents as a ZIP file?`);
                expect(await downloadDialog.button("Yes").isvisible(), "Yes button is not visible").toBeTruthy();
                expect(await downloadDialog.button("No").isvisible(), "No button is not visible").toBeTruthy();

                // Extract entity ID before download
                await downloadDialog.button("Yes").click();

                const entityId = downloadUtils.extractEntityIdFromUrl(page.url(), 'policy');
                const zipPromise = downloadUtils.waitAndSaveZipDownload(page);
                const downloadedZip = await zipPromise;

                // Extract and verify contents
                const extractedPath = await downloadUtils.extractZipFile(downloadedZip.filePath, password);
                const extractedFiles = fs.readdirSync(extractedPath);

                const fileName = downloadedZip.fileName;
                const downloadedZipFileName = await downloadUtils.verifyZipNamingConvention('policy', entityId);

                // Verify policy ZIP naming convention
                expect(fileName, `The policy ZIP file naming convention is incorrect`).toBe(downloadedZipFileName);
                expect(extractedFiles.length, "Policy ZIP file count mismatch").toBe(fileCount);

            });

        });
    }
});
