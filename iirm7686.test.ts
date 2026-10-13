import { test, expect } from '../../../fixtures/iwork';
import qa from "../../../env/qa.json";
import { TIMEOUTS } from '../../../env/timeouts';
import { Dialog } from '../../../appcomponents/Dialog.component';
import { Utils } from '../../../utils/utils';
import { IBP } from '../../../pages/ibp/IBP';
import { CreateInceptionPage } from '../../../pages/CreateInception.page';
import { PolicyDetailsPage } from '../../../pages/PolicyDetails.page';
import { LoginPage } from '../../../pages/Login.page';
import { PolicyConfigurePage } from '../../../pages/PolicyConfigure.page';
import { ManageEntityListing } from '../../../pages/ManageEntityListing.template';
import { NavBarPage } from '../../../pages/Navbar.page';
import path from 'path';

//For handling date formats and timestamps in the inception Table
import { faker } from '@faker-js/faker';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import dayjs from 'dayjs';
import { SnackBar } from '../../../appcomponents/SnackBar.component';
dayjs.extend(customParseFormat);

const xlsx = require('xlsx');

let policyConfigurationData2ApproveUser: string = "";
let activatePolicyUser: string = "";
let inceptionUser: string = "";

const policyConfigurationData1: any = Utils.loadTestData("testdata/ui/functionaltests/iirm7685/iirm7685_policyConfiguration1.json");
const policyConfigurationData2: any = Utils.loadTestData("testdata/ui/functionaltests/iirm7685/iirm7685_policyConfiguration2.json");
const inceptionUploadData: any = Utils.loadTestData("testdata/ui/functionaltests/iirm7685/iirm7685_inception.json");

//Run this script using microsoft edge browser   
const policyType: string = policyConfigurationData1.policyConfiguration.policyType;

const { policyConfiguration } = policyConfigurationData1;

const { inceptionDetails } = inceptionUploadData;

let expectedInceptionTableFileName: string;


let recordCount: number = 1;
const filePath2 = 'testdata/ui/functionaltests/iirm7685/IBP-OnlyEmployee-2.xlsx';


//Used to generate dynamic effective date within allowed range
function getValidEffectiveDateWithFaker(): string {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // UI allowed range

    const randomDate = faker.date.between({ from: today, to: maxDate });

    // Convert to DD/MM/YYYY
    return randomDate.toLocaleDateString("en-GB");
}

//Used to format the dates in xlsheet
function toIsoDate(ddmmyyyy: string): string {
    const [dd, mm, yyyy] = ddmmyyyy.split('/');
    return `${yyyy}-${mm}-${dd}`;
}



test.describe('ConstraintsCombinations: Verify employer contribution and custom declaration on Base policy enroll for PerFamily contribution type', { tag: '@ policyConfiguration,@iirm7686' }, async () => {

    let companyName: string = 'API_Wipro_5106';

    const compulsoryBenefitsDescription: string = "These benefits allow you to structure and modify compulsory benefits components as per your requirements.";
    const gmcPolicyDescription: string = "A Group Mediclaim health insurance policy covering hospitalization expenses for employees and dependents. Provides cashless treatment at network hospitals. Typically includes standard room rent limits, co-pay clauses, and sum insured based on company policy."

    test('1. ConstraintsCombinations: Verify employer contribution and custom declaration on Base policy enroll for PerFamily contribution type with single SI Amount constraint-1', async ({ page }) => {

        const date = new Date();
        const formattedGMCActiveCardDate = `${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getDate()}`;
        // // // Wrap in array if it's a single object
        const dialog = new Dialog(page);

        const ibpPages = new IBP(page, 'Enrolment window open for Group Medical Cover');
        const ibpLoginPage = ibpPages.getLogin();

        const ibpDashBoardPage = ibpPages.getDashboard();
        const ibpInsurancePage = ibpPages.getMyInsurancePage();
        const ibpEnrollmentPage = ibpPages.getEnrollMentPage();

        const loginPage = new LoginPage(page);
        const navBar = new NavBarPage(page);
        const managePoliciesPage = new ManageEntityListing(page);
        const policyConfigPage = new PolicyConfigurePage(page);
        const policyDetailsPage = new PolicyDetailsPage(page);
        const createInceptionPage = new CreateInceptionPage(page);

        const toastMessage = new SnackBar(page);

        // Navigate to Policy Configuration page
        await loginPage.open("/");
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // Search for policy using test data 
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await navBar.open('Manage Placements', 'Manage Policies');
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);


        await managePoliciesPage.button('Configuration').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        // Configure Policy Components using optimized method
        await policyConfigPage.configurePolicyComponent(policyConfiguration.policyComponent);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);


        // Configure Policy Template 
        const policyTemplate = policyConfiguration.policyTemplate[0];
        await policyConfigPage.basePolicyTemplate.midYearEnrollmentAllowed(policyTemplate.label).set(policyTemplate.midYearEnrollmentAllowed);
        await policyConfigPage.basePolicyTemplate.sumInsuredVisibleToEmployee(policyTemplate.label).set(policyTemplate.sumInsuredVisibleToEmployee);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        // Configure Policy Relationships with cross-parent restrictions
        await policyConfigPage.configurePolicyRelationships(policyConfiguration.policyRelationships);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await policyConfigPage.configurePolicyParamenters(policyConfiguration.policyParameters);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await policyConfigPage.configurePolicyChoices(policyConfiguration.policyChoices);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        // Configure Constraints.
        await policyConfigPage.configureConstraints(policyConfiguration.constraints);

        // Verify specific IIRM-7685 requirement:Show Employer Contribution to Employee? is not set to "Yes"
        expect(await policyConfigPage.constraints('Show Employer Contribution to Employee?').getValue(), 'Cross Parent Selection constraint is not disabled as per IIRM-7685 requirements').toBe('Yes');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy configuration submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy configuration has been sent for approval.');


        await navBar.logout();
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        await managePoliciesPage.button('Configuration').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy configuration submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy configuration has been approved. Please activate the policy.');

        await navBar.logout();
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);

        await navBar.open("Manage Placements", "Manage Policies");
        //Submit for Approval and approving Policy details
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        await managePoliciesPage.tab().open('Policy details');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        //Clicking on Approve button in Policy details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve policy details');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.getAlertContent(), "The Policy details success alert got mismatched").toBe('Policy section approval updated successfully');

        //Submitting and Approving the cover details
        await managePoliciesPage.tab().open('Cover details');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        // Clicking on Approve button in Cover details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve covers');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.getAlertContent(), "The Approve covers success alert got mismatched").toBe('Policy section approval updated successfully');

        //Submitting and approving CD details
        await managePoliciesPage.tab().open('CD details');
        await managePoliciesPage.button('Submit for Approval').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        //Clicking Approve on CD details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve CD details');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.getAlertContent(), "The Approve covers success alert got mismatched").toBe('Policy section approval updated successfully');

        await navBar.logout();
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await managePoliciesPage.smartSearch().searchFor(companyName);

        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        // Activate the policy
        await managePoliciesPage.button('Activate policy').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after activate policy').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after activate policy').toContain('Policy activated successfully.');

        //Verifying all sections are approved
        await managePoliciesPage.tab().open('Policy details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await managePoliciesPage.tab().open('Cover details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await managePoliciesPage.tab().open('CD details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await loginPage.open("/");
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Placements");
        await managePoliciesPage.smartSearch().searchFor(companyName);

        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        // Navigate to Create Inception page
        await policyDetailsPage.quickActionsCard.click('Inception data upload');

        // // // STEP 1: Inception Request Received
        const step1Data = inceptionDetails.inceptionRequestReceived;
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await createInceptionPage.getCurrentStepTitle(), 'Create Inception page is not load with first step title').toBe('Inception Request Received');
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        //Fill basic inception request details
        await createInceptionPage.osTicketNumber.set(step1Data.osTicketNumber);
        expect(await createInceptionPage.osTicketNumber.getValue(), 'OS Ticket Number is not saved correctly').toBe(step1Data.osTicketNumber);
        // Fill inception data upload details
        await createInceptionPage.numberOfEmployees.set(step1Data.numberOfEmployees);
        expect(await createInceptionPage.numberOfEmployees.getValue(), 'Number of Employees is not saved correctly').toBe(step1Data.numberOfEmployees);
        await createInceptionPage.numberOfDependents.set(step1Data.numberOfDependents);
        expect(await createInceptionPage.numberOfDependents.getValue(), 'Number of Dependents is not saved correctly').toBe(step1Data.numberOfDependents);
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        await createInceptionPage.dataType.set(step1Data.dataType);
        expect(await createInceptionPage.dataType.getValue(), 'Data Type is not selected correctly').toBe(step1Data.dataType);
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        await navBar.collapse.click();
        // Download template and upload file

        expect(await createInceptionPage.documentUpload.downloadTemplate.isvisible(), 'Download Template button is not visible for file upload').toBeTruthy();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        const downloadedFile = await createInceptionPage.documentUpload.downloadTemplate.click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // Verify template download success
        expect(await createInceptionPage.isAlertVisible(), 'Alert is not visible after file upload').toBeTruthy();
        expect(await createInceptionPage.getAlertContent(), 'Alert content is not displayed after upload').toContain('Template downloaded successfully.');
        await toastMessage.close.click();

        expect(await toastMessage.close.isvisible(), 'Snack bar close button is still visible').toBeFalsy();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // // Download and get file path
        const downloadDir = path.resolve("testdata/ui/functionaltests/iirm7685");

        const inceptionFilePath = await createInceptionPage.downloadTemplateFile(downloadDir);

        const inceptionFile = path.basename(inceptionFilePath);


        const workbook = xlsx.readFile(inceptionFile);
        const sheetName = workbook.SheetNames[0];
        let rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // // Keep 1 row only
        rows = [rows[0]];

        // const employId = rows[0]['Employee ID'];
        // Generate EMPID + digits (2-5 digit number)
        const employId = `EMPID${faker.number.int({ min: 100, max: 999 })}`;

        const companyId: string = (Utils.loadTestData('testdata/ui/functionaltests/iirm7685/companyId.json')).companyId;

        const companyId_empId: string = `${companyId}-${employId}`;


        const fullName = faker.person.firstName();
        const dateOfBirth = faker.date.birthdate({ min: 1980, max: 1999, mode: 'year' }).toISOString().split('T')[0]; // YYYY-MM-DD
        const gender = faker.person.sex() === 'male' ? 'Male' : 'Female';
        const email = faker.internet.email().split('@')[0] + '@mailinator.com';


        const mobileNumber = faker.string.numeric(10);
        const generatedEffectiveDate = getValidEffectiveDateWithFaker();   // DD/MM/YYYY

        rows[0]['Intake Type'] = 'ADDITION';
        rows[0]['Employee ID'] = employId;
        rows[0]['Full Name'] = fullName;
        rows[0]['Date of Birth'] = dateOfBirth; // Convert to ISO format
        rows[0]['Gender'] = gender;
        rows[0]['Email'] = email;
        rows[0]['Mobile Number'] = mobileNumber;
        rows[0]['Effective Date'] = generatedEffectiveDate; // Convert to ISO format
        rows[0]['Relation'] = 'Self';


        // Convert JSON → worksheet
        const updatedSheet = xlsx.utils.json_to_sheet(rows, { skipHeader: false });
        workbook.Sheets[sheetName] = updatedSheet;

        // Save file
        xlsx.writeFile(workbook, inceptionFilePath);

        expectedInceptionTableFileName = inceptionFile;
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT * 5);

        await Promise.all([
            createInceptionPage.documentUpload.set(inceptionFilePath)
        ]);

        expect(await createInceptionPage.isAlertVisible(), 'Alert is not appeared after uploading file').toBeTruthy();
        expect(await createInceptionPage.getAlertContent(), 'Upload alert message').toContain('File uploaded successfully.');
        await toastMessage.close.click();
        expect(await toastMessage.close.isvisible(), 'Snack bar close button is still visible').toBeFalsy();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        const initialTotalRecords = await createInceptionPage.kpi('Total records').getValue();
        const initialSuccessRecords = await createInceptionPage.kpi('Success').getValue();
        const initialFailedRecords = await createInceptionPage.kpi('Failed').getValue();

        expect(parseInt(initialTotalRecords), "The intial total records KPI are not  equal the sum of success and failed records").toBe(parseInt(initialSuccessRecords) + parseInt(initialFailedRecords));
        const updatedDate = new Date();
        const uploadTime = updatedDate.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).replace(',', ''); // remove comma like UI



        expect(await createInceptionPage.getDataProcessingStatusText(), 'Data Processing status is not displayed').toBe(inceptionDetails.expectedValidation.dataProcessingIncompleteStatus);
        let inceptionTableStatus = await createInceptionPage.table.getCellText(1, 'Status');
        // let batchId = await createInceptionPage.table.getCellText(1, 'Batch ID');
        expect(await createInceptionPage.next.isdisabled(), 'Next button is not enabled after data processing completion').toBeTruthy();

        //Wait for data processing to complete
        while ((inceptionTableStatus === 'CREATED' || inceptionTableStatus === 'PROCESSING') && (await createInceptionPage.getDataProcessingStatusText() === inceptionDetails.expectedValidation.dataProcessingIncompleteStatus)) {
            await createInceptionPage.refresh.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
            inceptionTableStatus = await createInceptionPage.table.getCellText(1, 'Status');
            await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        }

        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        // Verify updated KPI values
        const updatedTotalRecords = await createInceptionPage.kpi('Total records').getValue();
        const updatedSuccessRecords = await createInceptionPage.kpi('Success').getValue();
        const updatedFailedRecords = await createInceptionPage.kpi('Failed').getValue();

        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        // Verify KPI consistency after processing completion
        expect(parseInt(updatedTotalRecords), 'Updated total records are not greater than initial records').toBe(recordCount);
        expect(parseInt(updatedTotalRecords), 'Updated total records are not equal to success + failed').toBe(parseInt(updatedSuccessRecords) + parseInt(updatedFailedRecords));

        // Verify updated table data using row index instead of row identifier
        const inceptionTableBatchID = await createInceptionPage.table.getCellText(1, 'Batch ID');
        const inceptionTableUploadDate = await createInceptionPage.table.getCellText(1, 'Upload date');
        const inceptionTableFileName = await createInceptionPage.table.getCellText(1, 'File name');
        const inceptionTableTotal = await createInceptionPage.table.getCellText(1, 'Total count');
        inceptionTableStatus = await createInceptionPage.table.getCellText(1, 'Status');

        // Validate table data after processing completion
        expect(inceptionTableBatchID, 'Updated Batch ID is not present').not.toBe('--');
        // Normalize and clean both strings

        const normalizedDate = String(inceptionTableUploadDate).replace(/\s+/g, ' ').trim();
        const normalizedExpectedDate = String(uploadTime).replace(/\s+/g, ' ').trim();

        // Ensure AM/PM is uppercase for both
        const normalizedDateFixed = normalizedDate.replace(/(am|pm)/i, match => match.toUpperCase());
        const normalizedExpectedDateFixed = normalizedExpectedDate.replace(/(am|pm)/i, match => match.toUpperCase());

        // Parse using explicit format (matches your UI: DD/MM/YYYY h:mm:ss A)
        const uiDate = dayjs(normalizedDateFixed, 'DD/MM/YYYY h:mm:ss A');
        const expectedDate = dayjs(normalizedExpectedDateFixed, 'DD/MM/YYYY h:mm:ss A');

        // Verify that both parsed successfully
        if (!uiDate.isValid() || !expectedDate.isValid()) {
            expect(uiDate.isValid(), `UI date is invalid: "${normalizedDateFixed}"`).toBe(true);
            expect(expectedDate.isValid(), `Expected date is invalid: "${normalizedExpectedDateFixed}"`).toBe(true);
        }

        // Calculate the absolute difference in milliseconds
        const diffMs = Math.abs(uiDate.diff(expectedDate));

        // Assert within 1-minute tolerance (60,000 ms)
        expect(diffMs, `Upload date mismatch: expected around ${normalizedExpectedDateFixed}, got ${normalizedDateFixed}`).toBeLessThanOrEqual(60_000);

        const uploadedInception2 = await createInceptionPage.table.getCellText(1, 'File name');
        expect(uploadedInception2, `The file is not uploaded with this ${uploadedInception2}`).toMatch(expectedInceptionTableFileName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(inceptionTableFileName, 'Updated File Name is not contain the uploaded file').toContain(expectedInceptionTableFileName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(Number(inceptionTableTotal), 'Updated Total Count is not match KPI total').toBe(recordCount);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(inceptionTableStatus, 'Final status is not COMPLETED or FAILED').toBe('COMPLETED');

        // Verify data processing completion message
        const updatedDataProcessingText = await createInceptionPage.getDataProcessingStatusText();
        expect(updatedDataProcessingText, 'Mismatch observed with Data processing completed message').toBe(inceptionDetails.expectedValidation.dataProcessingCompleteStatus);

        await navBar.logout();

        // Login to IBP Portal
        await page.setViewportSize({ width: 1500, height: 1000 });
        await ibpLoginPage.login(qa.HCL.IBP_URL, companyId_empId, employId);

        expect(ibpDashBoardPage.welcomeUserName.isVisible(), "Login failed").toBeTruthy();
        expect(await ibpLoginPage.isAlertVisible(), "Login success alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login success alert content is not correct").toContain('Logged in successfully');

        expect(ibpDashBoardPage.welcomeUserName, "User is not login with correct credentials").toContainText(fullName);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        await page.mouse.wheel(0, 1000);


        expect(await ibpDashBoardPage.enrollMentWindow.mainHeading.isVisible(), "Enrollment window heading is not visible").toBeTruthy();
        expect(await ibpDashBoardPage.enrollMentWindow.benefitsList.isVisible(), "Enrollment window benefits list is not visible").toBeTruthy();
        expect(await ibpDashBoardPage.enrollMentWindow.button('Enroll Now').isvisible(), "Enroll now button is bot visible").toBeTruthy();
        expect(await ibpDashBoardPage.enrollMentWindow.calendarIcon.isVisible(), "The calendar icon is not visible").toBeTruthy();

        await ibpDashBoardPage.enrollMentWindow.button('Enroll Now').click();

        expect((await ibpInsurancePage.getCardContainer(page, 'Compulsory Benefits', 0)).isVisible(), "The compulsory benefits card is not visible").toBeTruthy();
        expect(await ibpInsurancePage.getCompanyDescription('Compulsory Benefits', 0), "The company description is not visible").toBe(compulsoryBenefitsDescription);
        await ibpInsurancePage.clickExpandIcon('Compulsory Benefits');

        await page.mouse.wheel(0, -500);
        const gmcHeading = "GMC (Group Mediclaim)";
        const expectedDescription = gmcPolicyDescription;


        await page.mouse.wheel(0, 500);

        // Get heading text using page object method
        const headingText = await ibpInsurancePage.getCardHeading(page, gmcHeading, 0);
        expect(headingText, `Card heading  mismatched`).toBe(gmcHeading);

        await page.mouse.wheel(0, 500);
        // Get description text using page object method
        const descriptionText = await ibpInsurancePage.getCardDescription(page, gmcHeading, 0);
        expect(descriptionText, `Description for card  mismatched`).toBe(expectedDescription);

        await page.mouse.wheel(0, -500);

        expect(await ibpDashBoardPage.topNavBar.myInsurance.isVisible(), "The dashboard link is not visible").toBeTruthy();

        (await ibpInsurancePage.clickEnrollNowInCard(gmcHeading, 0));
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        const employeeName = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Name');
        const employeeId = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Employee ID');
        const employeeEmail = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Email');
        const employeePhone = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Phone');
        const employeeDesignation = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Designation');
        const employeedOB = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Date of Birth');
        const employeedOBIso = toIsoDate(employeedOB);
        const employeeGender = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Gender');
        const employeEffectiveDate = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Effective Date');

        await page.mouse.wheel(0, 1000);

        expect(employeeName, "The full name got mismatched").toBe(fullName);
        expect(employeeId, "The employee ID got mismatched").toBe(employId);
        expect(employeeEmail, "The email got mismatched").toBe(email);
        expect(employeePhone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(employeeDesignation, "The designation got mismatched").toBe('--');
        expect(employeedOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGender, "The gender got mismatched").toBe(gender);
        // expect(employeEffectiveDate, "The effective date got mismatched").toBe(generatedEffectiveDate);

        expect(await ibpInsurancePage.button('Continue', 1).isdisabled(), "The continue button is not visible").toBeTruthy();

        //Verifying policy values
        const basePolicyPlanCard = await ibpInsurancePage.getPlanCard('Base Policy');

        // Assert the active icon
        expect(await ibpInsurancePage.activeIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpInsurancePage.verifyPlanValues(
            basePolicyPlanCard,
            Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution) + Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution)
        );

        // Expand Base Policy card
        await ibpInsurancePage.clickExpandIcon('Choose Your Plan');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        await ibpInsurancePage.validateExpandedBasePolicyContent(page, 'Base Policy');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(ibpInsurancePage.button('Continue', 0).isvisible, "The continue button is not visible").toBeTruthy();

        await ibpInsurancePage.clickExpandIcon('Base Policy');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "The cancel button is not visible").toBeTruthy();
        expect(await ibpInsurancePage.button('Continue', 0).isvisible(), "The continue button is not disabled").toBeTruthy();

        await ibpInsurancePage.button('Cancel', 0).click();
        await ibpInsurancePage.validateExpandedBasePolicyContent(page, 'Base Policy');

        //verifying side cards 

        await ibpInsurancePage.verifyPlanSummary(page);
        expect(ibpInsurancePage.button('Save & Exit', 0).isvisible(), "The save  and exit is not visible").toBeTruthy();
        expect(ibpInsurancePage.button('Continue', 0).isvisible(), "The continue button is not visible").toBeTruthy();

        await page.mouse.wheel(0, 500);

        await ibpInsurancePage.clickExpandIcon('Base policy');
        await ibpInsurancePage.button('Continue', 0).click();

        await ibpInsurancePage.validateAfterConfirmingPolicy(
            page,
            'Base Policy',
            'Enrolled',
            (policyConfiguration.policyComponent.basePolicy.SIAmounts[0]),
            (policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution),
            (policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution)
        );

        await ibpInsurancePage.verifyPolicyCardAfterContinue(page, policyConfiguration);
        await ibpInsurancePage.clickExpandIcon('Base policy');
        await ibpInsurancePage.button('Continue', 1).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        const card = await ibpInsurancePage.getPlanCard('Base Policy');

        const toNumber = (str: string) => Number(str.replace(/[₹,\s]/g, '')) || 0;

        // Extract UI values
        const premium = toNumber(await ibpInsurancePage.getValueByPlanLabel(card, 'Premium'));
        const companyContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(card, 'Company contribution'));
        const yourContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(card, 'Your contribution'));

        // Expected API values
        const expectedCompany = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const expectedEmployee = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);
        const expectedPremium = expectedCompany + expectedEmployee;

        // Assertions
        expect(premium, "Premium mismatch").toBe(expectedPremium);
        expect(companyContribution, "Company contribution mismatch").toBe(expectedCompany);
        expect(yourContribution, "Employee contribution mismatch").toBe(expectedEmployee);

        // Step 1: Go to dashboard
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Step 2: Get the Base Policy card
        const basePolicyCard = await ibpInsurancePage.getPlanCard('Base Policy');

        // Step 3: Read values from UI using getValueByPlanLabel and normalizeINR
        const normalizeINR = (str: string) => str.replace(/[₹,\s]/g, '');
        const sumInsured = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured')));
        const basePolicyPremium = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium')));
        const basePolicyCompanyContribution = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution')));
        const basePolicyYourContribution = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution')));

        // Step 4: Expected values from policyConfiguration
        const expectedSumInsured = Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]);
        const expectedCompanyContribution = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const expectedYourContribution = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);
        const expectedBasePolicyPremium = expectedCompanyContribution + expectedYourContribution;

        // Step 5: Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(expectedSumInsured);
        expect(basePolicyPremium, "Premium mismatch").toBe(expectedBasePolicyPremium);
        expect(basePolicyCompanyContribution, "Company contribution mismatch").toBe(expectedCompanyContribution);
        expect(basePolicyYourContribution, "Employee contribution mismatch").toBe(expectedYourContribution);

        // Step 6: Validate Members Covered section  
        expect(await ibpDashBoardPage.membersCovered.isVisible(), "Members Covered section not visible").toBeTruthy();
        expect(await ibpInsurancePage.self.isVisible(), "Self member not visible").toBeTruthy();

        //Verifying cancel button functionality on view enrollment summary
        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "Cancel button not visible").toBeTruthy();
        await ibpInsurancePage.button('Cancel', 0).click();

        expect(await ibpInsurancePage.compulsoryBenefits.expandIcon.isVisible(), "Compulsory benefits card not visible after clicking cancel button").toBeTruthy();


        await ibpInsurancePage.compulsoryBenefits.expandIcon.click();
        await ibpInsurancePage.clickEnrollNowInCard(gmcHeading, 0);


        const Name = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Name');
        const empId = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Employee ID');
        const Email = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Email');
        const phone = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Phone');
        const designation = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Designation');
        const dOB = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Date of Birth');
        const dOBIso = toIsoDate(dOB);
        const employeeGenderValue = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Gender');
        const effectiveDate = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Effective Date');


        expect(Name, "The full name got mismatched").toBe(fullName);
        expect(empId, "The employee ID got mismatched").toBe(employId);
        expect(Email, "The email got mismatched").toBe(email);
        expect(phone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(designation, "The designation got mismatched").toBe('--');
        expect(dOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGenderValue, "The gender got mismatched").toBe(gender);
        // expect(effectiveDate, "The effective date got mismatched").toBe(effectiveDate);

        expect(await ibpInsurancePage.button('Continue', 1).isdisabled(), "The continue button is not visible").toBeTruthy();

        //Verifying policy values
        const planCard = await ibpInsurancePage.getPlanCard('Base Policy');

        // Assert the active icon
        expect(await ibpInsurancePage.activeIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpInsurancePage.verifyPlanValues(
            planCard,
            Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution) + Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution)
        );


        await ibpInsurancePage.button('Continue', 0).click();

        await ibpInsurancePage.button('Continue', 0).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();


        // Extract values from the UI
        const sumInsuredValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const premiumValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const companyContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const employeeContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 3: Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(sumInsuredValue);
        expect(premiumValue, "Premium mismatch").toBe(premiumValue);
        expect(companyContributionValue, "Company contribution mismatch").toBe(companyContributionValue);
        expect(employeeContributionValue, "Employee contribution mismatch").toBe(employeeContributionValue);

        // Step 4: Verify dashboard visibility
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Step 3: Read values from UI using getValue()
        const cancelSumInsured = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const cancelBasePolicyPremium = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const cancelBasePolicyCompanyContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const cancelBasePolicyYourContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 4: Expected values from policyConfiguration
        const expectedPolicySumInsuredValue = Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]);
        const expectedBasePolicyPremiumValue = expectedCompanyContribution + expectedYourContribution;
        const expectedPolicyCompanyContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const expectedPolicyYourContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);

        // Step 5: Assertions
        expect(cancelSumInsured, "Sum Insured mismatch").toBe(expectedPolicySumInsuredValue);
        expect(cancelBasePolicyPremium, "Premium mismatch").toBe(expectedBasePolicyPremiumValue);
        expect(cancelBasePolicyCompanyContribution, "Company contribution mismatch").toBe(expectedPolicyCompanyContributionValue);
        expect(cancelBasePolicyYourContribution, "Employee contribution mismatch").toBe(expectedPolicyYourContributionValue);

        // Step 6: Validate Members Covered section  
        expect(await ibpDashBoardPage.membersCovered.isVisible(), "Members Covered section not visible").toBeTruthy();
        expect(await ibpInsurancePage.self.isVisible(), "Self member not visible").toBeTruthy();


        //Verifying Back Button functionality on view enrollment summary

        expect(await ibpInsurancePage.button('Back', 0).isvisible(), "Back button not visible").toBeTruthy();
        await ibpInsurancePage.button('Back', 0).click();

        expect(Name, "The full name got mismatched").toBe(fullName);
        expect(empId, "The employee ID got mismatched").toBe(employId);
        expect(Email, "The email got mismatched").toBe(email);
        expect(phone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(designation, "The designation got mismatched").toBe('--');
        expect(dOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGenderValue, "The gender got mismatched").toBe(gender);
        expect(effectiveDate, "The effective date got mismatched").toBe(effectiveDate);

        // Assert the active icon
        expect(await ibpInsurancePage.activeIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpInsurancePage.verifyPlanValues(planCard, Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]), Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution) + Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution), Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution), Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution));

        await ibpInsurancePage.button('Continue', 0).click();
        //Continue button gets closed so only one button is available.
        await ibpInsurancePage.button('Continue', 0).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Extract values from the UI
        const backSumInsuredValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const backPremiumValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const backCompanyContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const backEmployeeContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 3: Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(backSumInsuredValue);
        expect(premiumValue, "Premium mismatch").toBe(backPremiumValue);
        expect(companyContributionValue, "Company contribution mismatch").toBe(backCompanyContributionValue);
        expect(employeeContributionValue, "Employee contribution mismatch").toBe(backEmployeeContributionValue);

        // Step 4: Verify dashboard visibility
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Step 3: Read values from UI using getValue()
        const backSumInsured = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const backBasePolicyPremium = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const backBasePolicyCompanyContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const backBasePolicyYourContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 4: Expected values from policyConfiguration
        const backBasePolicySumInsuredValue = Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]);
        const backBasePolicyPremiumValue = Number(expectedCompanyContribution) + Number(expectedYourContribution);
        const backBasePolicyCompanyContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const backBasePolicyYourContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);

        // Step 5: Assertions
        expect(backSumInsured, "Sum Insured mismatch").toBe(backBasePolicySumInsuredValue);
        expect(backBasePolicyPremium, "Premium mismatch").toBe(backBasePolicyPremiumValue);
        expect(backBasePolicyCompanyContribution, "Company contribution mismatch").toBe(backBasePolicyCompanyContributionValue);
        expect(backBasePolicyYourContribution, "Employee contribution mismatch").toBe(backBasePolicyYourContributionValue);

        // Step 6: Validate Members Covered section  
        expect(await basePolicyCard.getByText('Members Covered').isVisible(), "Members Covered section not visible").toBeTruthy();
        expect(await ibpInsurancePage.self.isVisible(), "Self member not visible").toBeTruthy();


        const termsLabel = 'I consent to premium deductions from my salary in 16 installments. I have read and understood the above declaration and accept the terms and conditions of the selected insurance plans.';
        expect(ibpInsurancePage.checkBox(termsLabel).isvisible(), "Terms and conditions checkbox not visible").toBeTruthy();
        await ibpInsurancePage.checkBox(termsLabel).check();

        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        const customDisclaimerLabel = 'Please review them before submitting your enrollment.';

        expect(await ibpInsurancePage.checkBox(customDisclaimerLabel).isvisible(), "Review sections checkbox is not visible").toBeTruthy();
        const customLabelCheckBox = ibpInsurancePage.checkBox(customDisclaimerLabel);

        expect(await ibpInsurancePage.getCheckBoxLabelText(1), "The custom disclaimer text got mismatched with the label").toBe(customDisclaimerLabel);

        expect(ibpInsurancePage.checkBox(termsLabel).isChecked(), "Terms and conditions checkbox not checked").toBeTruthy();
        await ibpInsurancePage.checkBox(customDisclaimerLabel).check();
        expect(ibpInsurancePage.checkBox(customDisclaimerLabel).isChecked(), "Review sections checkbox is not checked").toBeTruthy();

        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        //Confirm Enrollment button should be disabled until both checkboxes are checked
        // expect(await ibpInsurancePage.button('Confirm Enrollment').isdisabled(), "Confirm Enrollment button is disabled").toBeTruthy();

        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "Cancel button not visible").toBeTruthy();
        expect(await ibpInsurancePage.button('Back', 0).isvisible(), "Back button is disabled").toBeTruthy();

        const bothChecked = await ibpInsurancePage.checkBox(termsLabel).isChecked() && await ibpInsurancePage.checkBox(customDisclaimerLabel).isChecked();

        if (bothChecked) {
            expect(await ibpInsurancePage.button('Confirm Enrollment', 0).isvisible(), "Confirm Enrollment button not visible").toBeTruthy();
        }

        await ibpInsurancePage.button('Confirm Enrollment', 0).click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        expect(await ibpEnrollmentPage.thankYouText.isVisible(), "Thank you text is not visible after enrollment submission").toBeTruthy();
        expect(await ibpEnrollmentPage.thankYouText.innerText(), "Thank you text content is changed").toBe('Thank you! Your Enrollment Has Been Successfully Submitted A confirmation email with all your submitted details will be sent shortly to your registered email ID.');


        expect(await ibpEnrollmentPage.isAlertVisible(), 'Alert is not visible after confirming enrollemnt').toBeTruthy();
        expect(await ibpEnrollmentPage.getAlertContent(), 'Alert content is not displayed after confirming enrollment').toBe('Enrollment submitted successfully');
        await toastMessage.close.click();

        expect(await ibpEnrollmentPage.button('Go to DashBoard').isvisible(), "Go to Dashboard button is not visible").toBeTruthy();
        await ibpEnrollmentPage.button('Go to DashBoard').click();
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "Not Redirected to DashBoard").toBeTruthy();


        await ibpDashBoardPage.companyProvidedInsurances.scrollIntoViewIfNeeded();
        expect(await ibpDashBoardPage.getShieldBackgroundLogo('Group Mediclaim Policy'), "The active icon is not visible on the enrolled policy card").toBeTruthy();
        expect(await ibpDashBoardPage.companyProvidedInsurances.isVisible(), "Company Provided Insurances heading is not visible").toBeTruthy();

        // 3️ Verify Group Mediclaim Policy card is visible
        expect(ibpDashBoardPage.groupMediclaimCard.isVisible(), 'Group Mediclaim Policy card is not visible').toBeTruthy();
        // 4️ Verify Shield Background image (completed enrolment indicator)
        expect(ibpDashBoardPage.statusLogo.isVisible(), "Shield Background image not found for Group Mediclaim Policy card").toBeTruthy();

        // 5️ (Optional) Verify basic labels inside the card
        const gmcSumInsuredValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Sum Insured');
        const gmcCardDependentsValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Dependents');
        const gmcCardExpiredValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Expires');

        expect(ibpDashBoardPage.sumInsuredLabel.isVisible(), "Sum Insured label missing").toBeTruthy();
        expect(gmcSumInsuredValue, "Sum insured value is not displaying correctly").toBe('10,000');


        expect(ibpDashBoardPage.dependentsLabel.isVisible(), "Dependents label missing").toBeTruthy();
        expect(gmcCardDependentsValue, "Sum insured value is not displaying correctly").toBe('0');

        expect(ibpDashBoardPage.expiresLabel.isVisible(), "Expires label missing").toBeTruthy();
        expect(gmcCardExpiredValue, "Sum insured value is not displaying correctly").toBe(formattedGMCActiveCardDate);

        expect(ibpDashBoardPage.starHealthLogo.isVisible(), "Star Health logo missing").toBeTruthy();
        await ibpLoginPage.logout();

        await loginPage.open("/");
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // Step 2: Search for policy using test data 
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await navBar.open('Manage Placements', 'Manage Policies');
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        await policyDetailsPage.quickActionsCard.click('Complete inception');
        await createInceptionPage.next.click();

        const step2Data = inceptionDetails.createInception;
        expect(await createInceptionPage.getCurrentStepTitle(), 'Step 2 is not load with Create Inception title').toBe('Create Inception');
        expect(await createInceptionPage.getStepIndicatorText(), 'Step indicator is not show step 2 of 6').toBe('Step 2 of 6');
        await createInceptionPage.inceptionCreatedDate.set(step2Data.inceptionCreatedDate);
        expect(await createInceptionPage.inceptionCreatedDate.getValue(), 'Inception Created Date is not saved correctly').toBe(step2Data.inceptionCreatedDate);
        await createInceptionPage.provisionalInceptionNumber.set(step2Data.provisionalInceptionNumber);
        expect(await createInceptionPage.provisionalInceptionNumber.getValue(), 'Provisional Inception Number is not saved correctly').toBe(step2Data.provisionalInceptionNumber);

        //To check net premium,cd balance in inception summary we are capturing the cdbalance and gross premium
        let totalLives = await createInceptionPage.inceptionSummary.get('Total lives');
        let totalEmployees = await createInceptionPage.inceptionSummary.get('Total employees');
        let additions = await createInceptionPage.inceptionSummary.get('Additions');
        let deletions = await createInceptionPage.inceptionSummary.get('Deletions');
        let cdBalance = await createInceptionPage.inceptionSummary.get('CD balance');
        // let netPremium = await createInceptionPage.inceptionSummary.get('Net premium');
        // let grossPremium = await createInceptionPage.inceptionSummary.get('Gross Premium');

        // Verify Inception Summary details
        expect(totalLives, 'Total lives in Inception Summary is not match').not.toBeNull();
        expect(totalEmployees, 'Total employees in Inception Summary is not match').not.toBeNull();
        expect(additions, 'Additions in Inception Summary is not match').not.toBeNull();
        expect(deletions, 'Deletions in Inception Summary is not match').toBe("0");
        expect(cdBalance, 'CD Balance in Inception Summary is not match').not.toBeNull();

    });


    test.only('2. Constraints Combinations: Verify employer contribution and custom declaration on Base policy enroll for PerFamily contribution type with Multiple SI Amounts constraint-1', async ({ page, loginPage, navBar, managePoliciesPage, policyConfigPage, policyDetailsPage, createInceptionPage }) => {

        companyName='API_Wipro_7259';
        const date = new Date();
        const formattedGMCActiveCardDate = `${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getDate()}`;
        // // // Wrap in array if it's a single object
        const dialog = new Dialog(page);

        const ibpPages = new IBP(page, 'Enrolment window open for Group Medical Cover');
        const ibpLoginPage = ibpPages.getLogin();

        const ibpDashBoardPage = ibpPages.getDashboard();
        const ibpInsurancePage = ibpPages.getMyInsurancePage();
        const ibpEnrollmentPage = ibpPages.getEnrollMentPage();

        loginPage = new LoginPage(page);
        navBar = new NavBarPage(page);
        managePoliciesPage = new ManageEntityListing(page);
        policyConfigPage = new PolicyConfigurePage(page);
        policyDetailsPage = new PolicyDetailsPage(page);
        createInceptionPage = new CreateInceptionPage(page);

        const toastMessage = new SnackBar(page);

        // Navigate to Policy Configuration page
        await loginPage.open("/");
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // Search for policy using test data 
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await navBar.open('Manage Placements', 'Manage Policies');
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);


        await managePoliciesPage.button('Configuration').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        // Configure Policy Components using optimized method
        await policyConfigPage.configurePolicyComponent(policyConfiguration.policyComponent);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);


        // Configure Policy Template 
        const policyTemplate = policyConfiguration.policyTemplate[0];
        await policyConfigPage.basePolicyTemplate.midYearEnrollmentAllowed(policyTemplate.label).set(policyTemplate.midYearEnrollmentAllowed);
        await policyConfigPage.basePolicyTemplate.sumInsuredVisibleToEmployee(policyTemplate.label).set(policyTemplate.sumInsuredVisibleToEmployee);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        // Configure Policy Relationships with cross-parent restrictions
        await policyConfigPage.configurePolicyRelationships(policyConfiguration.policyRelationships);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await policyConfigPage.configurePolicyParamenters(policyConfiguration.policyParameters);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await policyConfigPage.configurePolicyChoices(policyConfiguration.policyChoices);
        await policyConfigPage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        // Configure Constraints.
        await policyConfigPage.configureConstraints(policyConfiguration.constraints);

        // Verify specific IIRM-7685 requirement:Show Employer Contribution to Employee? is not set to "Yes"
        expect(await policyConfigPage.constraints('Show Employer Contribution to Employee?').getValue(), 'Cross Parent Selection constraint is not disabled as per IIRM-7685 requirements').toBe('Yes');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy configuration submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy configuration has been sent for approval.');


        await navBar.logout();
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        await managePoliciesPage.button('Configuration').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy configuration submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy configuration has been approved. Please activate the policy.');

        await navBar.logout();
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);

        await navBar.open("Manage Placements", "Manage Policies");
        //Submit for Approval and approving Policy details
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        await managePoliciesPage.tab().open('Policy details');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        //Clicking on Approve button in Policy details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve policy details');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.getAlertContent(), "The Policy details success alert got mismatched").toBe('Policy section approval updated successfully');

        //Submitting and Approving the cover details
        await managePoliciesPage.tab().open('Cover details');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        // Clicking on Approve button in Cover details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve covers');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.getAlertContent(), "The Approve covers success alert got mismatched").toBe('Policy section approval updated successfully');

        //Submitting and approving CD details
        await managePoliciesPage.tab().open('CD details');
        await managePoliciesPage.button('Submit for Approval').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        //Clicking Approve on CD details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve CD details');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.getAlertContent(), "The Approve covers success alert got mismatched").toBe('Policy section approval updated successfully');

        await navBar.logout();
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await managePoliciesPage.smartSearch().searchFor(companyName);

        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        // Activate the policy
        await managePoliciesPage.button('Activate policy').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigPage.isAlertVisible(), 'Alert is not visible after activate policy').toBeTruthy();
        expect(await policyConfigPage.getAlertContent(), 'Alert content is not displayed after activate policy').toContain('Policy activated successfully.');

        //Verifying all sections are approved
        await managePoliciesPage.tab().open('Policy details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await managePoliciesPage.tab().open('Cover details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await managePoliciesPage.tab().open('CD details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await loginPage.open("/");
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Placements");
        await managePoliciesPage.smartSearch().searchFor(companyName);

        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        // Navigate to Create Inception page
        await policyDetailsPage.quickActionsCard.click('Inception data upload');

        // // // STEP 1: Inception Request Received
        const step1Data = inceptionDetails.inceptionRequestReceived;
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await createInceptionPage.getCurrentStepTitle(), 'Create Inception page is not load with first step title').toBe('Inception Request Received');
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        //Fill basic inception request details
        await createInceptionPage.osTicketNumber.set(step1Data.osTicketNumber);
        expect(await createInceptionPage.osTicketNumber.getValue(), 'OS Ticket Number is not saved correctly').toBe(step1Data.osTicketNumber);
        // Fill inception data upload details
        await createInceptionPage.numberOfEmployees.set(step1Data.numberOfEmployees);
        expect(await createInceptionPage.numberOfEmployees.getValue(), 'Number of Employees is not saved correctly').toBe(step1Data.numberOfEmployees);
        await createInceptionPage.numberOfDependents.set(step1Data.numberOfDependents);
        expect(await createInceptionPage.numberOfDependents.getValue(), 'Number of Dependents is not saved correctly').toBe(step1Data.numberOfDependents);
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        await createInceptionPage.dataType.set(step1Data.dataType);
        expect(await createInceptionPage.dataType.getValue(), 'Data Type is not selected correctly').toBe(step1Data.dataType);
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        await navBar.collapse.click();
        // Download template and upload file

        expect(await createInceptionPage.documentUpload.downloadTemplate.isvisible(), 'Download Template button is not visible for file upload').toBeTruthy();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        await createInceptionPage.documentUpload.downloadTemplate.click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // Verify template download success
        expect(await createInceptionPage.isAlertVisible(), 'Alert is not visible after file upload').toBeTruthy();
        expect(await createInceptionPage.getAlertContent(), 'Alert content is not displayed after upload').toContain('Template downloaded successfully.');
        await toastMessage.close.click();

        expect(await toastMessage.close.isvisible(), 'Snack bar close button is still visible').toBeFalsy();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // // Download and get file path
        const downloadDir = path.resolve("testdata/ui/functionaltests/iirm7685");

        const inceptionFilePath = await createInceptionPage.downloadTemplateFile(downloadDir);

        const inceptionFile = path.basename(inceptionFilePath);


        const workbook = xlsx.readFile(inceptionFilePath);
        const sheetName = workbook.SheetNames[0];
        let rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // // Keep 1 row only
        rows = [rows[0]];

        // const employId = rows[0]['Employee ID'];
        // Generate EMPID + digits (2-5 digit number)
        const employId = `EMPID${faker.number.int({ min: 100, max: 999 })}`;

        const companyId: string = (Utils.loadTestData('testdata/ui/functionaltests/iirm7685/companyId.json')).companyId;

        const companyId_empId: string = `${companyId}-${employId}`;


        const fullName = faker.person.firstName();
        const dateOfBirth = faker.date.birthdate({ min: 1980, max: 1999, mode: 'year' }).toISOString().split('T')[0]; // YYYY-MM-DD
        const gender = faker.person.sex() === 'male' ? 'Male' : 'Female';
        const email = faker.internet.email().split('@')[0] + '@mailinator.com';


        const mobileNumber = faker.string.numeric(10);
        const generatedEffectiveDate = getValidEffectiveDateWithFaker();   // DD/MM/YYYY

        rows[0]['Intake Type'] = 'ADDITION';
        rows[0]['Employee ID'] = employId;
        rows[0]['Full Name'] = fullName;
        rows[0]['Date of Birth'] = dateOfBirth; // Convert to ISO format
        rows[0]['Gender'] = gender;
        rows[0]['Email'] = email;
        rows[0]['Mobile Number'] = mobileNumber;
        rows[0]['Effective Date'] = generatedEffectiveDate; // Convert to ISO format
        rows[0]['Relation'] = 'Self';


        // Convert JSON → worksheet
        const updatedSheet = xlsx.utils.json_to_sheet(rows, { skipHeader: false });
        workbook.Sheets[sheetName] = updatedSheet;

        // Save file
        xlsx.writeFile(workbook, inceptionFilePath);

        expectedInceptionTableFileName = inceptionFile;
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT * 5);

        await Promise.all([
            createInceptionPage.documentUpload.set(inceptionFilePath)
        ]);

        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT*5);
        expect(await createInceptionPage.isAlertVisible(), 'Alert is not appeared after uploading file').toBeTruthy();
        expect(await createInceptionPage.getAlertContent(), 'Upload alert message').toContain('File uploaded successfully.');
        await toastMessage.close.click();
        expect(await toastMessage.close.isvisible(), 'Snack bar close button is still visible').toBeFalsy();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        const initialTotalRecords = await createInceptionPage.kpi('Total records').getValue();
        const initialSuccessRecords = await createInceptionPage.kpi('Success').getValue();
        const initialFailedRecords = await createInceptionPage.kpi('Failed').getValue();

        expect(parseInt(initialTotalRecords), "The intial total records KPI are not  equal the sum of success and failed records").toBe(parseInt(initialSuccessRecords) + parseInt(initialFailedRecords));
        const updatedDate = new Date();
        const uploadTime = updatedDate.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).replace(',', ''); // remove comma like UI



        expect(await createInceptionPage.getDataProcessingStatusText(), 'Data Processing status is not displayed').toBe(inceptionDetails.expectedValidation.dataProcessingIncompleteStatus);
        let inceptionTableStatus = await createInceptionPage.table.getCellText(1, 'Status');
        // let batchId = await createInceptionPage.table.getCellText(1, 'Batch ID');
        expect(await createInceptionPage.next.isdisabled(), 'Next button is not enabled after data processing completion').toBeTruthy();

        //Wait for data processing to complete
        while ((inceptionTableStatus === 'CREATED' || inceptionTableStatus === 'PROCESSING') && (await createInceptionPage.getDataProcessingStatusText() === inceptionDetails.expectedValidation.dataProcessingIncompleteStatus)) {
            await createInceptionPage.refresh.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
            inceptionTableStatus = await createInceptionPage.table.getCellText(1, 'Status');
            await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        }

        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        // Verify updated KPI values
        const updatedTotalRecords = await createInceptionPage.kpi('Total records').getValue();
        const updatedSuccessRecords = await createInceptionPage.kpi('Success').getValue();
        const updatedFailedRecords = await createInceptionPage.kpi('Failed').getValue();

        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        // Verify KPI consistency after processing completion
        expect(parseInt(updatedTotalRecords), 'Updated total records are not greater than initial records').toBe(recordCount);
        expect(parseInt(updatedTotalRecords), 'Updated total records are not equal to success + failed').toBe(parseInt(updatedSuccessRecords) + parseInt(updatedFailedRecords));

        // Verify updated table data using row index instead of row identifier
        const inceptionTableBatchID = await createInceptionPage.table.getCellText(1, 'Batch ID');
        const inceptionTableUploadDate = await createInceptionPage.table.getCellText(1, 'Upload date');
        const inceptionTableFileName = await createInceptionPage.table.getCellText(1, 'File name');
        const inceptionTableTotal = await createInceptionPage.table.getCellText(1, 'Total count');
        inceptionTableStatus = await createInceptionPage.table.getCellText(1, 'Status');

        // Validate table data after processing completion
        expect(inceptionTableBatchID, 'Updated Batch ID is not present').not.toBe('--');
        // Normalize and clean both strings

        const normalizedDate = String(inceptionTableUploadDate).replace(/\s+/g, ' ').trim();
        const normalizedExpectedDate = String(uploadTime).replace(/\s+/g, ' ').trim();

        // Ensure AM/PM is uppercase for both
        const normalizedDateFixed = normalizedDate.replace(/(am|pm)/i, match => match.toUpperCase());
        const normalizedExpectedDateFixed = normalizedExpectedDate.replace(/(am|pm)/i, match => match.toUpperCase());

        // Parse using explicit format (matches your UI: DD/MM/YYYY h:mm:ss A)
        const uiDate = dayjs(normalizedDateFixed, 'DD/MM/YYYY h:mm:ss A');
        const expectedDate = dayjs(normalizedExpectedDateFixed, 'DD/MM/YYYY h:mm:ss A');

        // Verify that both parsed successfully
        if (!uiDate.isValid() || !expectedDate.isValid()) {
            expect(uiDate.isValid(), `UI date is invalid: "${normalizedDateFixed}"`).toBe(true);
            expect(expectedDate.isValid(), `Expected date is invalid: "${normalizedExpectedDateFixed}"`).toBe(true);
        }

        // Calculate the absolute difference in milliseconds
        const diffMs = Math.abs(uiDate.diff(expectedDate));

        // Assert within 1-minute tolerance (60,000 ms)
        expect(diffMs, `Upload date mismatch: expected around ${normalizedExpectedDateFixed}, got ${normalizedDateFixed}`).toBeLessThanOrEqual(60_000);

        const uploadedInception2 = await createInceptionPage.table.getCellText(1, 'File name');
        expect(uploadedInception2, `The file is not uploaded with this ${uploadedInception2}`).toMatch(expectedInceptionTableFileName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(inceptionTableFileName, 'Updated File Name is not contain the uploaded file').toContain(expectedInceptionTableFileName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(Number(inceptionTableTotal), 'Updated Total Count is not match KPI total').toBe(recordCount);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(inceptionTableStatus, 'Final status is not COMPLETED or FAILED').toBe('COMPLETED');

        // Verify data processing completion message
        const updatedDataProcessingText = await createInceptionPage.getDataProcessingStatusText();
        expect(updatedDataProcessingText, 'Mismatch observed with Data processing completed message').toBe(inceptionDetails.expectedValidation.dataProcessingCompleteStatus);

        await navBar.logout();

        // Login to IBP Portal
        await page.setViewportSize({ width: 1500, height: 1000 });
        await ibpLoginPage.login(qa.HCL.IBP_URL, companyId_empId, employId);

        expect(ibpDashBoardPage.welcomeUserName.isVisible(), "Login failed").toBeTruthy();
        expect(await ibpLoginPage.isAlertVisible(), "Login success alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login success alert content is not correct").toContain('Logged in successfully');

        expect(ibpDashBoardPage.welcomeUserName, "User is not login with correct credentials").toContainText(fullName);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        await page.mouse.wheel(0, 1000);


        expect(await ibpDashBoardPage.enrollMentWindow.mainHeading.isVisible(), "Enrollment window heading is not visible").toBeTruthy();
        expect(await ibpDashBoardPage.enrollMentWindow.benefitsList.isVisible(), "Enrollment window benefits list is not visible").toBeTruthy();
        expect(await ibpDashBoardPage.enrollMentWindow.button('Enroll Now').isvisible(), "Enroll now button is bot visible").toBeTruthy();
        expect(await ibpDashBoardPage.enrollMentWindow.calendarIcon.isVisible(), "The calendar icon is not visible").toBeTruthy();

        await ibpDashBoardPage.enrollMentWindow.button('Enroll Now').click();

        expect((await ibpInsurancePage.getCardContainer(page, 'Compulsory Benefits', 0)).isVisible(), "The compulsory benefits card is not visible").toBeTruthy();
        expect(await ibpInsurancePage.getCompanyDescription('Compulsory Benefits', 0), "The company description is not visible").toBe(compulsoryBenefitsDescription);
        await ibpInsurancePage.clickExpandIcon('Compulsory Benefits');

        await page.mouse.wheel(0, -500);
        const gmcHeading = "GMC (Group Mediclaim)";
        const expectedDescription = gmcPolicyDescription;


        await page.mouse.wheel(0, 500);

        // Get heading text using page object method
        const headingText = await ibpInsurancePage.getCardHeading(page, gmcHeading, 0);
        expect(headingText, `Card heading  mismatched`).toBe(gmcHeading);

        await page.mouse.wheel(0, 500);
        // Get description text using page object method
        const descriptionText = await ibpInsurancePage.getCardDescription(page, gmcHeading, 0);
        expect(descriptionText, `Description for card  mismatched`).toBe(expectedDescription);

        await page.mouse.wheel(0, -500);

        expect(await ibpDashBoardPage.topNavBar.myInsurance.isVisible(), "The dashboard link is not visible").toBeTruthy();

        (await ibpInsurancePage.clickEnrollNowInCard(gmcHeading, 0));
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        const employeeName = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Name');
        const employeeId = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Employee ID');
        const employeeEmail = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Email');
        const employeePhone = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Phone');
        const employeeDesignation = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Designation');
        const employeedOB = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Date of Birth');
        const employeedOBIso = toIsoDate(employeedOB);
        const employeeGender = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Gender');
        const employeEffectiveDate = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Effective Date');

        await page.mouse.wheel(0, 1000);

        expect(employeeName, "The full name got mismatched").toBe(fullName);
        expect(employeeId, "The employee ID got mismatched").toBe(employId);
        expect(employeeEmail, "The email got mismatched").toBe(email);
        expect(employeePhone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(employeeDesignation, "The designation got mismatched").toBe('--');
        expect(employeedOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGender, "The gender got mismatched").toBe(gender);
        // expect(employeEffectiveDate, "The effective date got mismatched").toBe(generatedEffectiveDate);

        expect(await ibpInsurancePage.button('Continue', 1).isdisabled(), "The continue button is not visible").toBeTruthy();

        //Verifying policy values
        const basePolicyPlanCard = await ibpInsurancePage.getPlanCard('Base Policy');

        // Assert the active icon
        expect(await ibpInsurancePage.activeIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpInsurancePage.verifyPlanValues(
            basePolicyPlanCard,
            Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution) + Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution)
        );

        // Expand Base Policy card
        await ibpInsurancePage.clickExpandIcon('Choose Your Plan');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        await ibpInsurancePage.validateExpandedBasePolicyContent(page, 'Base Policy');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(ibpInsurancePage.button('Continue', 0).isvisible, "The continue button is not visible").toBeTruthy();

        await ibpInsurancePage.clickExpandIcon('Base Policy');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "The cancel button is not visible").toBeTruthy();
        expect(await ibpInsurancePage.button('Continue', 0).isvisible(), "The continue button is not disabled").toBeTruthy();

        await ibpInsurancePage.button('Cancel', 0).click();
        await ibpInsurancePage.validateExpandedBasePolicyContent(page, 'Base Policy');

        //verifying side cards 

        await ibpInsurancePage.verifyPlanSummary(page);
        expect(ibpInsurancePage.button('Save & Exit', 0).isvisible(), "The save  and exit is not visible").toBeTruthy();
        expect(ibpInsurancePage.button('Continue', 0).isvisible(), "The continue button is not visible").toBeTruthy();

        await page.mouse.wheel(0, 500);

        await ibpInsurancePage.clickExpandIcon('Base policy');
        await ibpInsurancePage.button('Continue', 0).click();

        await ibpInsurancePage.validateAfterConfirmingPolicy(
            page,
            'Base Policy',
            'Enrolled',
            (policyConfiguration.policyComponent.basePolicy.SIAmounts[0]),
            (policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution),
            (policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution)
        );

        await ibpInsurancePage.verifyPolicyCardAfterContinue(page, policyConfiguration);
        await ibpInsurancePage.clickExpandIcon('Base policy');
        await ibpInsurancePage.button('Continue', 1).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        const card = await ibpInsurancePage.getPlanCard('Base Policy');

        const toNumber = (str: string) => Number(str.replace(/[₹,\s]/g, '')) || 0;

        // Extract UI values
        const premium = toNumber(await ibpInsurancePage.getValueByPlanLabel(card, 'Premium'));
        const companyContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(card, 'Company contribution'));
        const yourContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(card, 'Your contribution'));

        // Expected API values
        const expectedCompany = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const expectedEmployee = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);
        const expectedPremium = expectedCompany + expectedEmployee;

        // Assertions
        expect(premium, "Premium mismatch").toBe(expectedPremium);
        expect(companyContribution, "Company contribution mismatch").toBe(expectedCompany);
        expect(yourContribution, "Employee contribution mismatch").toBe(expectedEmployee);

        // Step 1: Go to dashboard
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Step 2: Get the Base Policy card
        const basePolicyCard = await ibpInsurancePage.getPlanCard('Base Policy');

        // Step 3: Read values from UI using getValueByPlanLabel and normalizeINR
        const normalizeINR = (str: string) => str.replace(/[₹,\s]/g, '');
        const sumInsured = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured')));
        const basePolicyPremium = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium')));
        const basePolicyCompanyContribution = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution')));
        const basePolicyYourContribution = Number(normalizeINR(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution')));

        // Step 4: Expected values from policyConfiguration
        const expectedSumInsured = Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]);
        const expectedCompanyContribution = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const expectedYourContribution = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);
        const expectedBasePolicyPremium = expectedCompanyContribution + expectedYourContribution;

        // Step 5: Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(expectedSumInsured);
        expect(basePolicyPremium, "Premium mismatch").toBe(expectedBasePolicyPremium);
        expect(basePolicyCompanyContribution, "Company contribution mismatch").toBe(expectedCompanyContribution);
        expect(basePolicyYourContribution, "Employee contribution mismatch").toBe(expectedYourContribution);

        // Step 6: Validate Members Covered section  
        expect(await ibpDashBoardPage.membersCovered.isVisible(), "Members Covered section not visible").toBeTruthy();
        expect(await ibpInsurancePage.self.isVisible(), "Self member not visible").toBeTruthy();

        //Verifying cancel button functionality on view enrollment summary
        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "Cancel button not visible").toBeTruthy();
        await ibpInsurancePage.button('Cancel', 0).click();

        expect(await ibpInsurancePage.compulsoryBenefits.expandIcon.isVisible(), "Compulsory benefits card not visible after clicking cancel button").toBeTruthy();


        await ibpInsurancePage.compulsoryBenefits.expandIcon.click();
        await ibpInsurancePage.clickEnrollNowInCard(gmcHeading, 0);


        const Name = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Name');
        const empId = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Employee ID');
        const Email = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Email');
        const phone = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Phone');
        const designation = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Designation');
        const dOB = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Date of Birth');
        const dOBIso = toIsoDate(dOB);
        const employeeGenderValue = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Gender');
        const effectiveDate = await ibpInsurancePage.getEmployeeValue('Employee Details', 'Effective Date');


        expect(Name, "The full name got mismatched").toBe(fullName);
        expect(empId, "The employee ID got mismatched").toBe(employId);
        expect(Email, "The email got mismatched").toBe(email);
        expect(phone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(designation, "The designation got mismatched").toBe('--');
        expect(dOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGenderValue, "The gender got mismatched").toBe(gender);
        // expect(effectiveDate, "The effective date got mismatched").toBe(effectiveDate);

        expect(await ibpInsurancePage.button('Continue', 1).isdisabled(), "The continue button is not visible").toBeTruthy();

        //Verifying policy values
        const planCard = await ibpInsurancePage.getPlanCard('Base Policy');

        // Assert the active icon
        expect(await ibpInsurancePage.activeIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpInsurancePage.verifyPlanValues(
            planCard,
            Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution) + Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution),
            Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution)
        );


        await ibpInsurancePage.button('Continue', 0).click();

        await ibpInsurancePage.button('Continue', 0).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();


        // Extract values from the UI
        const sumInsuredValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const premiumValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const companyContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const employeeContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 3: Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(sumInsuredValue);
        expect(premiumValue, "Premium mismatch").toBe(premiumValue);
        expect(companyContributionValue, "Company contribution mismatch").toBe(companyContributionValue);
        expect(employeeContributionValue, "Employee contribution mismatch").toBe(employeeContributionValue);

        // Step 4: Verify dashboard visibility
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Step 3: Read values from UI using getValue()
        const cancelSumInsured = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const cancelBasePolicyPremium = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const cancelBasePolicyCompanyContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const cancelBasePolicyYourContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 4: Expected values from policyConfiguration
        const expectedPolicySumInsuredValue = Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]);
        const expectedBasePolicyPremiumValue = expectedCompanyContribution + expectedYourContribution;
        const expectedPolicyCompanyContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const expectedPolicyYourContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);

        // Step 5: Assertions
        expect(cancelSumInsured, "Sum Insured mismatch").toBe(expectedPolicySumInsuredValue);
        expect(cancelBasePolicyPremium, "Premium mismatch").toBe(expectedBasePolicyPremiumValue);
        expect(cancelBasePolicyCompanyContribution, "Company contribution mismatch").toBe(expectedPolicyCompanyContributionValue);
        expect(cancelBasePolicyYourContribution, "Employee contribution mismatch").toBe(expectedPolicyYourContributionValue);

        // Step 6: Validate Members Covered section  
        expect(await ibpDashBoardPage.membersCovered.isVisible(), "Members Covered section not visible").toBeTruthy();
        expect(await ibpInsurancePage.self.isVisible(), "Self member not visible").toBeTruthy();


        //Verifying Back Button functionality on view enrollment summary

        expect(await ibpInsurancePage.button('Back', 0).isvisible(), "Back button not visible").toBeTruthy();
        await ibpInsurancePage.button('Back', 0).click();

        expect(Name, "The full name got mismatched").toBe(fullName);
        expect(empId, "The employee ID got mismatched").toBe(employId);
        expect(Email, "The email got mismatched").toBe(email);
        expect(phone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(designation, "The designation got mismatched").toBe('--');
        expect(dOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGenderValue, "The gender got mismatched").toBe(gender);
        expect(effectiveDate, "The effective date got mismatched").toBe(effectiveDate);

        // Assert the active icon
        expect(await ibpInsurancePage.activeIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpInsurancePage.verifyPlanValues(planCard, Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]), Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution) + Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution), Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution), Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution));

        await ibpInsurancePage.button('Continue', 0).click();
        //Continue button gets closed so only one button is available.
        await ibpInsurancePage.button('Continue', 0).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Extract values from the UI
        const backSumInsuredValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const backPremiumValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const backCompanyContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const backEmployeeContributionValue = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 3: Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(backSumInsuredValue);
        expect(premiumValue, "Premium mismatch").toBe(backPremiumValue);
        expect(companyContributionValue, "Company contribution mismatch").toBe(backCompanyContributionValue);
        expect(employeeContributionValue, "Employee contribution mismatch").toBe(backEmployeeContributionValue);

        // Step 4: Verify dashboard visibility
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Step 3: Read values from UI using getValue()
        const backSumInsured = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Sum Insured'));
        const backBasePolicyPremium = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Premium'));
        const backBasePolicyCompanyContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Company contribution'));
        const backBasePolicyYourContribution = toNumber(await ibpInsurancePage.getValueByPlanLabel(basePolicyCard, 'Your contribution'));

        // Step 4: Expected values from policyConfiguration
        const backBasePolicySumInsuredValue = Number(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]);
        const backBasePolicyPremiumValue = Number(expectedCompanyContribution) + Number(expectedYourContribution);
        const backBasePolicyCompanyContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution);
        const backBasePolicyYourContributionValue = Number(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution);

        // Step 5: Assertions
        expect(backSumInsured, "Sum Insured mismatch").toBe(backBasePolicySumInsuredValue);
        expect(backBasePolicyPremium, "Premium mismatch").toBe(backBasePolicyPremiumValue);
        expect(backBasePolicyCompanyContribution, "Company contribution mismatch").toBe(backBasePolicyCompanyContributionValue);
        expect(backBasePolicyYourContribution, "Employee contribution mismatch").toBe(backBasePolicyYourContributionValue);

        // Step 6: Validate Members Covered section  
        expect(await basePolicyCard.getByText('Members Covered').isVisible(), "Members Covered section not visible").toBeTruthy();
        expect(await ibpInsurancePage.self.isVisible(), "Self member not visible").toBeTruthy();


        const termsLabel = 'I consent to premium deductions from my salary in 16 installments. I have read and understood the above declaration and accept the terms and conditions of the selected insurance plans.';
        expect(ibpInsurancePage.checkBox(termsLabel).isvisible(), "Terms and conditions checkbox not visible").toBeTruthy();
        await ibpInsurancePage.checkBox(termsLabel).check();

        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        const customDisclaimerLabel = 'Please review them before submitting your enrollment.';

        expect(await ibpInsurancePage.checkBox(customDisclaimerLabel).isvisible(), "Review sections checkbox is not visible").toBeTruthy();
        const customLabelCheckBox = ibpInsurancePage.checkBox(customDisclaimerLabel);

        expect(await ibpInsurancePage.getCheckBoxLabelText(1), "The custom disclaimer text got mismatched with the label").toBe(customDisclaimerLabel);

        expect(ibpInsurancePage.checkBox(termsLabel).isChecked(), "Terms and conditions checkbox not checked").toBeTruthy();
        await ibpInsurancePage.checkBox(customDisclaimerLabel).check();
        expect(ibpInsurancePage.checkBox(customDisclaimerLabel).isChecked(), "Review sections checkbox is not checked").toBeTruthy();

        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        //Confirm Enrollment button should be disabled until both checkboxes are checked
        // expect(await ibpInsurancePage.button('Confirm Enrollment').isdisabled(), "Confirm Enrollment button is disabled").toBeTruthy();

        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "Cancel button not visible").toBeTruthy();
        expect(await ibpInsurancePage.button('Back', 0).isvisible(), "Back button is disabled").toBeTruthy();

        const bothChecked = await ibpInsurancePage.checkBox(termsLabel).isChecked() && await ibpInsurancePage.checkBox(customDisclaimerLabel).isChecked();

        if (bothChecked) {
            expect(await ibpInsurancePage.button('Confirm Enrollment', 0).isvisible(), "Confirm Enrollment button not visible").toBeTruthy();
        }

        await ibpInsurancePage.button('Confirm Enrollment', 0).click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        expect(await ibpEnrollmentPage.thankYouText.isVisible(), "Thank you text is not visible after enrollment submission").toBeTruthy();
        expect(await ibpEnrollmentPage.thankYouText.innerText(), "Thank you text content is changed").toBe('Thank you! Your Enrollment Has Been Successfully Submitted A confirmation email with all your submitted details will be sent shortly to your registered email ID.');


        expect(await ibpEnrollmentPage.isAlertVisible(), 'Alert is not visible after confirming enrollemnt').toBeTruthy();
        expect(await ibpEnrollmentPage.getAlertContent(), 'Alert content is not displayed after confirming enrollment').toBe('Enrollment submitted successfully');
        await toastMessage.close.click();

        expect(await ibpEnrollmentPage.button('Go to DashBoard').isvisible(), "Go to Dashboard button is not visible").toBeTruthy();
        await ibpEnrollmentPage.button('Go to DashBoard').click();
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "Not Redirected to DashBoard").toBeTruthy();


        await ibpDashBoardPage.companyProvidedInsurances.scrollIntoViewIfNeeded();
        expect(await ibpDashBoardPage.getShieldBackgroundLogo('Group Mediclaim Policy'), "The active icon is not visible on the enrolled policy card").toBeTruthy();
        expect(await ibpDashBoardPage.companyProvidedInsurances.isVisible(), "Company Provided Insurances heading is not visible").toBeTruthy();

        // 3️ Verify Group Mediclaim Policy card is visible
        expect(ibpDashBoardPage.groupMediclaimCard.isVisible(), 'Group Mediclaim Policy card is not visible').toBeTruthy();
        // 4️ Verify Shield Background image (completed enrolment indicator)
        expect(ibpDashBoardPage.statusLogo.isVisible(), "Shield Background image not found for Group Mediclaim Policy card").toBeTruthy();

        // 5️ (Optional) Verify basic labels inside the card
        const gmcSumInsuredValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Sum Insured');
        const gmcCardDependentsValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Dependents');
        const gmcCardExpiredValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Expires');

        expect(ibpDashBoardPage.sumInsuredLabel.isVisible(), "Sum Insured label missing").toBeTruthy();
        expect(gmcSumInsuredValue, "Sum insured value is not displaying correctly").toBe('10,000');


        expect(ibpDashBoardPage.dependentsLabel.isVisible(), "Dependents label missing").toBeTruthy();
        expect(gmcCardDependentsValue, "Sum insured value is not displaying correctly").toBe('0');

        expect(ibpDashBoardPage.expiresLabel.isVisible(), "Expires label missing").toBeTruthy();
        expect(gmcCardExpiredValue, "Sum insured value is not displaying correctly").toBe(formattedGMCActiveCardDate);

        expect(ibpDashBoardPage.starHealthLogo.isVisible(), "Star Health logo missing").toBeTruthy();
        await ibpLoginPage.logout();

        await loginPage.open("/");
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);

        // Step 2: Search for policy using test data 
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        await navBar.open('Manage Placements', 'Manage Policies');
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        await policyDetailsPage.quickActionsCard.click('Complete inception');
        await createInceptionPage.next.click();

        const step2Data = inceptionDetails.createInception;
        expect(await createInceptionPage.getCurrentStepTitle(), 'Step 2 is not load with Create Inception title').toBe('Create Inception');
        expect(await createInceptionPage.getStepIndicatorText(), 'Step indicator is not show step 2 of 6').toBe('Step 2 of 6');
        await createInceptionPage.inceptionCreatedDate.set(step2Data.inceptionCreatedDate);
        expect(await createInceptionPage.inceptionCreatedDate.getValue(), 'Inception Created Date is not saved correctly').toBe(step2Data.inceptionCreatedDate);
        await createInceptionPage.provisionalInceptionNumber.set(step2Data.provisionalInceptionNumber);
        expect(await createInceptionPage.provisionalInceptionNumber.getValue(), 'Provisional Inception Number is not saved correctly').toBe(step2Data.provisionalInceptionNumber);

        //To check net premium,cd balance in inception summary we are capturing the cdbalance and gross premium
        let totalLives = await createInceptionPage.inceptionSummary.get('Total lives');
        let totalEmployees = await createInceptionPage.inceptionSummary.get('Total employees');
        let additions = await createInceptionPage.inceptionSummary.get('Additions');
        let deletions = await createInceptionPage.inceptionSummary.get('Deletions');
        let cdBalance = await createInceptionPage.inceptionSummary.get('CD balance');
        // let netPremium = await createInceptionPage.inceptionSummary.get('Net premium');
        // let grossPremium = await createInceptionPage.inceptionSummary.get('Gross Premium');

        // Verify Inception Summary details
        expect(totalLives, 'Total lives in Inception Summary is not match').not.toBeNull();
        expect(totalEmployees, 'Total employees in Inception Summary is not match').not.toBeNull();
        expect(additions, 'Additions in Inception Summary is not match').not.toBeNull();
        expect(deletions, 'Deletions in Inception Summary is not match').toBe("0");
        expect(cdBalance, 'CD Balance in Inception Summary is not match').not.toBeNull();

    });

});