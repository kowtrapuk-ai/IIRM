import { expect, Page, test } from '../../../fixtures/iwork';
import { loadEnvConfig, Utils } from '../../../utils/utils';
import { processDate, addDaysToCurrentDate, convertToDDMMM } from '../../../utils/dateutils';
import { SnackBar } from '../../../appcomponents/SnackBar.component';
import { LoginPage } from '../../../pages/Login.page';
import { ManageEntityListing } from '../../../pages/ManageEntityListing.template';
import { NavBarPage } from '../../../pages/Navbar.page';
import { DashboardPage } from '../../../pages/Dashboard.page';
import { ROActivities } from '../../../pages/ROActivities.page';
import { AddCompanyPage } from '../../../pages/AddCompany.page';
import { AddSOPage } from '../../../pages/AddSO.page';
import { NotificationElement } from '../../../framework/notification.element';
import { ro } from '@faker-js/faker/.';

const config: any = loadEnvConfig(process.env.ENV || 'qa');

const bdManagerLogin = Utils.loadTestData('testdata/setup/users.json').INDIA.BDMANAGER;
const bdExecutiveLogin = Utils.loadTestData('testdata/setup/users.json').INDIA.BDEXECUTIVE;
const bdBranchHeadLogin = Utils.loadTestData('testdata/setup/users.json').INDIA.BRANCHHEAD;
const isgManagerLogin = Utils.loadTestData('testdata/setup/users.json').INDIA.ISGMANAGER;
const isgManagerAssignLogin = Utils.loadTestData('testdata/setup/users.json').INDIA.ISGMANAGER_ASSIGNEE;
const isgExecutiveLogin = Utils.loadTestData('testdata/setup/users.json').INDIA.ISGEXECUTIVE;

const groupPolicyCases = [
    {
        policyName: 'Group Mediclaim Policy',
        activitiesData: Utils.loadTestData('testdata/ui/functionaltests/iirm8193/iirm8193_GMC.json'),
        isgActivitiesData: Utils.loadTestData('testdata/ui/functionaltests/iirm8315/iirm8315_GMC.json')
    },
    {
        policyName: 'Group Personal Accident Policy',
        activitiesData: Utils.loadTestData('testdata/ui/functionaltests/iirm8193/iirm8193_GPA.json'),
        isgActivitiesData: Utils.loadTestData('testdata/ui/functionaltests/iirm8315/iirm8315_GPA.json')
    },
    {
        policyName: 'Group Term Life Insurance (GTL)',
        activitiesData: Utils.loadTestData('testdata/ui/functionaltests/iirm8193/iirm8193_GTL.json'),
        isgActivitiesData: Utils.loadTestData('testdata/ui/functionaltests/iirm8315/iirm8315_GTL.json')
    }
];


groupPolicyCases.forEach(({ activitiesData, isgActivitiesData }) => {

    // Dynamically assign BD Planning stage dates, each 7 days apart per dataset
    activitiesData.roBDPlanning.rsrCreationDate = processDate(activitiesData.roBDPlanning.rsrCreationDate);
    activitiesData.roBDPlanning.kdmMeetingDate = processDate(activitiesData.roBDPlanning.kdmMeetingDate);
    activitiesData.roBDPlanning.mandateDetailsEntryDate = processDate(activitiesData.roBDPlanning.mandateDetailsEntryDate);
    activitiesData.roBDPlanning.rfpDataCollectionDate = processDate(activitiesData.roBDPlanning.rfpDataCollectionDate);
    activitiesData.roBDPlanning.rfpDetailsEntryDate = processDate(activitiesData.roBDPlanning.rfpDetailsEntryDate);
    // set kdmMeeting meetingDate dynamically
    activitiesData.renewalKDMMeeting.meetingDate = processDate(activitiesData.renewalKDMMeeting.meetingDate);

    // Set mandateDetailsEntry dates dynamically
    activitiesData.renewalMandateDetailsEntry.validFrom = processDate(activitiesData.renewalMandateDetailsEntry.validFrom);
    activitiesData.renewalMandateDetailsEntry.validTo = processDate(activitiesData.renewalMandateDetailsEntry.validTo);
    activitiesData.renewalMandateDetailsEntry.issuedOn = processDate(activitiesData.renewalMandateDetailsEntry.issuedOn);

    // Set rfpDetailsEntry targetQcrDate dynamically
    activitiesData.renewalRFPDetailsEntry.targetQcrDate = processDate(activitiesData.renewalRFPDetailsEntry.targetQcrDate);

    // // Dynamically assign BD Planning stage dates, each 7 days apart per dataset
    isgActivitiesData.roISGPlanning.brokingSlipGenerationDate = processDate(isgActivitiesData.roISGPlanning.brokingSlipGenerationDate);
    isgActivitiesData.roISGPlanning.enterQuoteDate = processDate(isgActivitiesData.roISGPlanning.enterQuoteDate);
    isgActivitiesData.roISGPlanning.qcrGenerationDate = processDate(isgActivitiesData.roISGPlanning.qcrGenerationDate);
    isgActivitiesData.roISGPlanning.meetingForFinalNegotiationDate = processDate(isgActivitiesData.roISGPlanning.meetingForFinalNegotiationDate);
    isgActivitiesData.roISGPlanning.placementSlipGenerationDate = processDate(isgActivitiesData.roISGPlanning.placementSlipGenerationDate);

    // set kdmMeeting meetingDate dynamically
    isgActivitiesData.roISGPlanning.premiumCalculationDate = processDate(isgActivitiesData.roISGPlanning.premiumCalculationDate);
    isgActivitiesData.roISGPlanning.heldCoverNoteDate = processDate(isgActivitiesData.roISGPlanning.heldCoverNoteDate);
    isgActivitiesData.roISGPlanning.policyHardCopyReceiptDate = processDate(isgActivitiesData.roISGPlanning.policyHardCopyReceiptDate);
    isgActivitiesData.roISGPlanning.policyDocketDate = processDate(isgActivitiesData.roISGPlanning.policyDocketDate);
    isgActivitiesData.roISGPlanning.handOverMeetDate = processDate(isgActivitiesData.roISGPlanning.handOverMeetDate);
    isgActivitiesData.roISGPlanning.policyConfirmationDate = processDate(isgActivitiesData.roISGPlanning.policyConfirmationDate);

    isgActivitiesData.roBrokingSlipGeneration.policyFrom = processDate(isgActivitiesData.roBrokingSlipGeneration.policyFrom);
    isgActivitiesData.roBrokingSlipGeneration.policyTo = processDate(isgActivitiesData.roBrokingSlipGeneration.policyTo);
    isgActivitiesData.roBrokingSlipGeneration.renewalDate = processDate(isgActivitiesData.roBrokingSlipGeneration.renewalDate);
    isgActivitiesData.roBrokingSlipGeneration.timelineForQuoteReceipt = processDate(isgActivitiesData.roBrokingSlipGeneration.timelineForQuoteReceipt);
    if (isgActivitiesData.roEnterQuote?.quotes) {
        isgActivitiesData.roEnterQuote.quotes.forEach((quote: any) => {
            if (quote.quoteReceivedOn) {
                quote.quoteReceivedOn = processDate(quote.quoteReceivedOn);
            }
        });
    }
});


// API variables
let opportunityId: string | string[];
let authenticationToken: string;
let loginResponse: any;
let opportunityResponse: any;
let contacts: any;
let displayName: string;
let existingData: any;
let filePath: any;

// Activity data variables
let bdPlanning: any;
let rsrCreation: any;
let kdmMeeting: any;
let renewalMandateDetailsEntry: any;
let renewalRFPDataCollection: any;
let renewalRFPDetailsEntry: any;
let isgPlanning: any;
let isgUser: any;
let brokingSlipGeneration: any;
let roEnterQuote: any;
let roQCRGeneration: any;
let roMeetingForFinalNegotiation: any;
let roPlacementSlipGeneration: any;
let roPremiumCalculation: any;
let heldCoverNote: any;
let policyHardCopy: any;
let policyDocket: any;
let handOverMeet: any;
let policyConfirmation: any;

// Expected participants variables
let expectedRSRParticipants: string[];
let expectedKDMMeetingParticipants: string[];
let expectedMandateDetailsEntryParticipants: string[];
let expectedRFPDataCollectionParticipants: string[];
let expectedRFPDetailsEntryParticipants: string[];
let expectedBrokingSlipGenerationParticipants: string[];
let expectedEnterQuoteParticipants: string[];
let expectedQCRGenerationParticipants: string[];
let expectedMeetingForFinalNegotiationParticipants: string[];
let expectedPlacementSlipGenerationParticipants: string[];
let expectedPremiumCalculationParticipants: string[];
let expectedHeldCoverNoteParticipants: string[];
let expectedPolicyHardCopyParticipants: string[];
let expectedPolicyDocketParticipants: string[];
let expectedHandOverMeetParticipants: string[];
let expectedPolicyConfirmationParticipants: string[];

// Assignee variables
let rsrCreationAssignee: string[];
let kdmMeetingAssignee: string[];
let renewalMandateDetailsEntryAssignee: string[];
let renewalRFPDataCollectionAssignee: string[];
let renewalRFPDetailsEntryAssignee: string[];
let isgPlanningAssignee: string[];
let brokingSlipGenerationAssignee: string[];
let enterQuoteAssignee: string[];
let qcrGenerationAssignee: string[];
let meetingForFinalNegotiationAssignee: string[];
let placementSlipGenerationAssignee: string[];
let premiumCalculationAssignee: string[];
let policyHardCopyAssignee: string[];
let policyDocketAssignee: string[];
let heldCoverNoteAssignee: string[];
let handOverMeetAssignee: string[];
let policyConfirmationAssignee: string[];


// Plan date variables
let rsrCreationPlanDate: any;
let kdmMeetingPlanDate: any;
let renewalMandateDetailsEntryPlanDate: any;
let renewalRFPDataCollectionPlanDate: any;
let renewalRFPDetailsEntryPlanDate: any;
let brokingSlipGenerationPlanDate: any;
let enterQuotePlanDate: any;
let qcrGenerationPlanDate: any;
let meetingForFinalNegotiationPlanDate: any;
let placementSlipGenerationPlanDate: any;
let premiumCalculationPlanDate: any;
let heldCoverNotePlanDate: any;
let policyHardCopyPlanDate: any;
let policyDocketPlanDate: any;
let handOverMeetPlanDate: any;
let policyConfirmationPlanDate: any;

// Document upload variables
let uploadedRSRDocType: any;
let expectedRSRFilename: any;
let uploadedKDMMeetingDocType: any;
let expectedKDMMeetingFilename: any;
let uploadedMandateDetailsEntryDocType: any;
let expectedMandateDetailsEntryFilename: any;
let uploadedRFPDataCollectionDocType: any;
let expectedRFPDataCollectionFilename: any;
let uploadedRFPDetailsEntryDocType: any;
let expectedRFPDetailsEntryFilename: any;

let uploadedBrokingSlipDocType: any;
let expectedBrokingSlipFilename: any;
let uploadedMeetingForFinalNegotiationDocuments: any;
let expectedMeetingForFinalNegotiationFilename: any;

// Test utility variables
let roURL: string;
let accessNumber: number;
let companyName: string | string[];
let currentDate: string;
let formattedDate: string;
let sumInsuredValue: number;
let sumInsured: string;
let taskPanel: any;
let card: any;

let bdPlanningFilter: string[] = ["Renewal RFP Details Entry"];

// Run tests for each policy type
groupPolicyCases.forEach(({ policyName, activitiesData, isgActivitiesData }) => {

    test.describe(`IIRM-8315: RO Activities for ${policyName}`, { tag: ['@ro', '@iirm8315'] }, () => {

        const defaultFilter: string[] = isgActivitiesData.roDefaultFilter;
        const isgPlanningFilter: string[] = ["Enter Quote"];
        const currentPolicyName: string = policyName;

        test.skip(`IIRM: RO: Perform ISG Opportunity Activities with privileged user - Extracting contact through API for ${policyName}`, async ({ request, browser }) => {

            // Filter variables 

            filePath = 'testdata/ui/functionaltests/iirm8193/iirm8193_GMC.json';

            const context = await browser.newContext();
            const page = await context.newPage();

            const addCompanyPage = new AddCompanyPage(page);

            const dashBoardPage = new DashboardPage(page);
            const addSOPage = new AddSOPage(page);
            const loginPage = new LoginPage(page);
            const navBar = new NavBarPage(page);
            const manageROPage = new ManageEntityListing(page);
            const roActivities = new ROActivities(page);
            const notification = new NotificationElement(page);

            // Login
            await loginPage.open('/');
            await loginPage.login(bdBranchHeadLogin.USERNAME, bdBranchHeadLogin.PASSWORD);

            // Navigate + filter
            await navBar.open("My Sales Portfolio");

            await manageROPage.smartSearch().filter.click();
            await manageROPage.smartSearch().policyType.set(currentPolicyName);

            await manageROPage.smartSearch().roActivity.click();
            await manageROPage.smartSearch().roActivity.set(isgPlanningFilter);

            await manageROPage.smartSearch().run.click();
            await manageROPage.smartSearch().collapse.click();

            companyName = await manageROPage.frozenAgGrid.getCellContent('Company name', 0);
            opportunityId = await manageROPage.frozenAgGrid.getCellContent('Opportunity ID', 0);

            // open opportunity
            await manageROPage.frozenAgGrid.clickOn('Policy type', 0);

            // LOGIN
            loginResponse = await (await request.post(`${config.API.BASE_URL}${config.API.SERVICES.AUTH_SERVICE}/login`, {
                data: {
                    userName: bdBranchHeadLogin.USERNAME,
                    password: bdBranchHeadLogin.PASSWORD
                }
            })).json();

            authenticationToken = loginResponse.data.accessToken.accessToken;
            await manageROPage.button('Edit').click();

            await page.reload({ waitUntil: 'load' });
            await Promise.all([
                await page.waitForResponse(async (resp) => {
                    return resp.status() === 200;
                })
            ])

            // GET OPPORTUNITY DETAILS
            opportunityResponse = await (await request.get(
                `${config.API.BASE_URL}${config.API.SERVICES.OPPORTUNITY_SERVICE}/opportunity/${opportunityId}`,
                {
                    headers: {
                        authorization: `Bearer ${authenticationToken}`
                    }
                }
            )).json();

            // PARSE CONTACTS
            contacts = opportunityResponse?.data?.contacts;
            sumInsuredValue = opportunityResponse?.data?.sumInsured;

            if (!contacts || contacts.length === 0) {
                throw new Error("No contacts returned from Opportunity API");
            }

            displayName = contacts[0]?.displayName;

            // update JSON WITHOUT mutating original data
            const fs = require("fs");

            // 1. Load existing JSON
            existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));

            // 2. Update only required fields
            existingData.renewalRFPDetailsEntry.contact = displayName;
            existingData.renewalMandateDetailsEntry.signedBy = [displayName];
            existingData.renewalKDMMeeting.companyContactPersons = [displayName];

            // 3. Write back only updated fields
            fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

            // 4. Update in-memory activitiesData with API-fetched contact
            activitiesData.renewalRFPDetailsEntry.contact = displayName;
            activitiesData.renewalMandateDetailsEntry.signedBy = [displayName];
            activitiesData.renewalKDMMeeting.companyContactPersons = [displayName];
            activitiesData.renewalRFPDetailsEntry.selectContact = [displayName];
        });

        test(`IIRM: RO: Perform RO BD and ISG Opportunity Activities for ${policyName}`, async ({ browser }) => {

            const browserContext = await browser.newContext();
            const page = await browserContext.newPage();

            const addCompanyPage = new AddCompanyPage(page);
            const dashBoardPage = new DashboardPage(page);
            const addSOPage = new AddSOPage(page);
            const loginPage = new LoginPage(page);
            const navBar = new NavBarPage(page);
            const manageROPage = new ManageEntityListing(page);
            const roActivities = new ROActivities(page);

            // For verifying toast messages
            const toastMessage = new SnackBar(page);

            // Login with Branch Head user to assign the activities
            await loginPage.open('/');
            await loginPage.login(isgExecutiveLogin.USERNAME, isgExecutiveLogin.PASSWORD);
            await navBar.collapseSideNavbar();

            // // Open My RO tab from NavBar
            // await navBar.open("My Sales Portfolio");
            // await manageROPage.smartSearch().filter.click();

            // await manageROPage.smartSearch().policyType.set(currentPolicyName);
            // await manageROPage.smartSearch().roActivity.click();
            // await manageROPage.smartSearch().roActivity.set(isgPlanningFilter);
            // await manageROPage.smartSearch().roStatus.click();
            // await manageROPage.smartSearch().roStatus.set(defaultFilter);

            // await manageROPage.smartSearch().run.click();
            // await manageROPage.smartSearch().collapse.click();

            // // For clicking the card with companyname in Approvals tab
            // let companyNameRaw: string | string[] = await manageROPage.frozenAgGrid.getCellContent('Company name', 0);
            // companyName = Array.isArray(companyNameRaw) ? companyNameRaw.join(' ').trim() : companyNameRaw.trim();

            // await manageROPage.frozenAgGrid.clickOn('Policy type', 0);
            // await manageROPage.table().click_on_old('Policy type', currentPolicyName);
            await page.goto("https://iwork.dev.indiainsure.com/opportunities/1108781")
            await page.waitForLoadState('domcontentloaded');
            await page.waitForLoadState('networkidle');

            roURL = await page.url();
            accessNumber = await roActivities.getAccessNumber();

            // // For comparing the Assignee names in BD,ISG Planning stages        
            const rsrCreationAssigneeName: string = getAssigneeName(activitiesData.roBDPlanning.rsrCreationParticipants);
            const kdmMeetingAssigneeName: string = getAssigneeName(activitiesData.roBDPlanning.kdmMeetingParticipants);
            const mandateDetailsAssigneeName: string = getAssigneeName(activitiesData.roBDPlanning.mandateDetailsEntryParticipants);
            const rfpDataCollectionAssigneeName: string = getAssigneeName(activitiesData.roBDPlanning.rfpDataCollectionParticipants);
            const rfpDetailsEntryAssigneeName: string = getAssigneeName(activitiesData.roBDPlanning.rfpDetailsEntryParticipants);


            // 1. Filling BD Planning stage using ROActivities.page.ts set method

            // await page.waitForLoadState('domcontentloaded');
            // await roActivities.roBDPlanning().then(p => p.setAssignee(activitiesData.roBDPlanning.selectAssignee));
            // await verifyToastMessage(toastMessage, "User assigned successfully", "RO BD planning Select assignee");

            // await roActivities.roBDPlanning().then(p => p.set(activitiesData.roBDPlanning));
            // await verifyToastMessage(toastMessage, "Activities updated successfully", "RO BD planning Complete planning");

            // // Verifying the submitted data in BD Planning stage
            // await roActivities.open("BD Planning");
            // expect(await roActivities.isStageDisabled("BD Planning"), "BD Planning stage is not disabled").toBe(true);

            // let bdPlanningAssignee: string[] = await roActivities.accordion.getOwners("BD Planning");

            // if (!bdPlanningAssignee.includes(activitiesData.roBDPlanning.selectAssignee)) {
            //     await page.reload({ waitUntil: 'load' });
            //     await page.waitForLoadState('networkidle');
            // }

            // // Extracting the assignees from each stage 
            // await roActivities.open("BD Planning");
            // bdPlanningAssignee = await roActivities.accordion.getOwners("BD Planning");
            // expect(bdPlanningAssignee.join(" "), "Assignee got mismatched").toContain(getAssigneeName(activitiesData.roBDPlanning.selectAssignee));

            // // For verifying the Assignee in each stage with expected participants
            // expectedRSRParticipants = [...bdPlanningAssignee, rsrCreationAssigneeName];
            // expectedKDMMeetingParticipants = [...bdPlanningAssignee, kdmMeetingAssigneeName];
            // expectedMandateDetailsEntryParticipants = [...bdPlanningAssignee, mandateDetailsAssigneeName];
            // expectedRFPDataCollectionParticipants = [...bdPlanningAssignee, rfpDataCollectionAssigneeName];
            // expectedRFPDetailsEntryParticipants = [...bdPlanningAssignee, rfpDetailsEntryAssigneeName];

            // bdPlanning = await (await roActivities.roBDPlanning()).get();
            // expect(bdPlanning.rsrCreationDate, "RO BD Planning: The RSR Creation Date got mismatched").toContain(activitiesData.roBDPlanning.rsrCreationDate);
            // expect(bdPlanning.rsrCreationParticipants.join(" "), "RO BD Planning: The RSR Creation Participants got mismatched").toContain(rsrCreationAssigneeName);
            // expect(bdPlanning.kdmMeetingDate, "RO BD Planning: The renewal KDM Meeting Date got mismatched").toBe(activitiesData.roBDPlanning.kdmMeetingDate);
            // expect(bdPlanning.kdmMeetingParticipants.join(" "), "RO BD Planning: The Renewal KDM meeting Participants got mismatched").toContain(kdmMeetingAssigneeName);
            // expect(bdPlanning.mandateDetailsEntryDate, "RO BD Planning: The renewal Mandate Details Entry Date got mismatched").toBe(activitiesData.roBDPlanning.mandateDetailsEntryDate);
            // expect(bdPlanning.mandateDetailsEntryParticipants.join(" "), "RO BD Planning: The renewal Mandate Details Entry Participants got mismatched").toContain(mandateDetailsAssigneeName);
            // expect(bdPlanning.rfpDataCollectionDate, "RO BD Planning: The renewal RFP Data Collection Date got mismatched").toBe(activitiesData.roBDPlanning.rfpDataCollectionDate);
            // expect(bdPlanning.rfpDataCollectionParticipants.join(" "), "RO BD Planning: The renewal RFP Data Collection Participants got mismatched").toContain(rfpDataCollectionAssigneeName);
            // expect(bdPlanning.rfpDetailsEntryDate, "RO BD Planning: The renewal RFP Details Entry Date got mismatched").toBe(activitiesData.roBDPlanning.rfpDetailsEntryDate);
            // expect(bdPlanning.rfpDetailsEntryParticipants.join(" "), "RO BD Planning: The renewal RFP Details Entry Participants got mismatched").toContain(rfpDetailsEntryAssigneeName);

            // await navBar.logout();

            // 2. Filling all the other fields in the RO RSR Creation Stage
            // await loginPage.open('/');
            // await loginPage.login(bdExecutiveLogin.USERNAME, bdExecutiveLogin.PASSWORD);

            // // await notification.openNotification('IIRM Opportunity Participant Invite', accessNumber)
            // await navBar.open("My Sales Portfolio");

            // await manageROPage.smartSearch().filter.click();
            // await manageROPage.smartSearch().policyType.set(currentPolicyName);

            // await manageROPage.smartSearch().roActivity.click();
            // await manageROPage.smartSearch().roActivity.set(bdPlanningFilter);

            // await manageROPage.smartSearch().run.click();
            // await manageROPage.smartSearch().collapse.click();

            // await manageROPage.table().click_on('Policy type', currentPolicyName);
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');

            // await (await roActivities.rsrCreation()).set(activitiesData.rsrCreation_ValidateCompanyDetails);
            // await addCompanyPage.saveAndExit.click();
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');

            // await (await roActivities.rsrCreation()).set(activitiesData.rsrCreation_ValidateRODetails);
            // await addSOPage.saveAndExit.click();
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');

            // await (await roActivities.rsrCreation()).set(activitiesData.rsrCreation);

            // await Promise.all([
            //     page.waitForResponse(async (resp) => {
            //         return resp.status() === 200;
            //     }),
            //     await (await roActivities.renewalRFPDataCollection()).saveActivity.click()
            // ]);
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');
            // await verifyToastMessage(toastMessage, "Activity has been saved successfully.", "RO RSR Creation Save Activity");

            // await Promise.all([
            //     page.waitForResponse(async (resp) => {
            //         return resp.status() === 200;
            //     }),
            //     await (await roActivities.rsrCreation()).completeActivity.click()
            // ]);
            // await verifyToastMessage(toastMessage, "Activity has been completed successfully.", "RO RSR Creation Complete Activity");

            // // Verifying the submitted data in RSR Creation stage Data

            // await roActivities.open("RSR Creation");
            // rsrCreationAssignee = await roActivities.accordion.getOwners("RSR Creation");

            // // rsrCreationPlanDate = await roActivities.accordion.getPlanDate("RSR Creation");
            // // expect(rsrCreationPlanDate, "RO RSR Creation: The RSR Creation Plan date got mismatched").toContain(activitiesData.roBDPlanning.rsrCreationDate);

            // // expect(rsrCreationAssignee, "RSR Creation Owners got mismatched").toEqual(expectedRSRParticipants);

            // rsrCreation = await (await roActivities.rsrCreation()).get();
            // uploadedRSRDocType = rsrCreation.documentTypeAndFileName[0];
            // expectedRSRFilename = activitiesData.rsrCreation.file[0].split('/').pop();

            // expect(rsrCreation.remarks, "RO RSR Creation: The remarks got mismatched").toBe(activitiesData.rsrCreation.remarks);
            // expect(uploadedRSRDocType.documentType, "RO RSR Creation: The document type got mismatched").toBe(activitiesData.rsrCreation.documentType[0]);
            // expect(uploadedRSRDocType.filename, "RO RSR Creation: The RSR uploaded File got mismatched").toContain(expectedRSRFilename);

            // expect(await (await roActivities.rsrCreation()).completeActivity.isdisabled(), "The Complete planning is not disabled").toBeTruthy();

            // // 3. Filling Renewal KDM Meeting stage using ROActivities.page.ts set method
            // await roActivities.open("Renewal KDM Meeting");
            // await (await roActivities.renewalKDMMeeting()).set(activitiesData.renewalKDMMeeting);
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');

            // await (await roActivities.renewalKDMMeeting()).saveActivity.click()
            // await verifyToastMessage(toastMessage, "Activity has been saved successfully.", "Renewal KDM Meeting Save Activity");

            // await Promise.all([
            //     page.waitForResponse(async (resp) => {
            //         return resp.status() === 200;
            //     }),
            //     await (await roActivities.renewalKDMMeeting()).completeActivity.click()
            // ]);
            // await verifyToastMessage(toastMessage, "Activity has been completed successfully.", "Renewal KDM Meeting Complete Activity");

            // // Verifying the submitted data in Renewal KDM Meeting stage Data 
            // await roActivities.open("Renewal KDM Meeting");
            // kdmMeetingAssignee = await roActivities.accordion.getOwners("Renewal KDM Meeting");

            // kdmMeetingPlanDate = await roActivities.accordion.getPlanDate("Renewal KDM Meeting");
            // // expect(kdmMeetingPlanDate, "The KDM Meeting Plan Date got mismatched").toContain(activitiesData.roBDPlanning.kdmMeetingDate);

            // // expect(kdmMeetingAssignee, "Assignee got mismatched").toEqual(expectedKDMMeetingParticipants);

            // kdmMeeting = await (await roActivities.renewalKDMMeeting()).get();
            // uploadedKDMMeetingDocType = kdmMeeting.documentTypeAndFilename[0];
            // expectedKDMMeetingFilename = activitiesData.renewalKDMMeeting.file[0].split('/').pop();

            // expect(kdmMeeting.isNewMeeting, "Renewal KDM Meeting: The Is New Meeting got mismatched").toBe(activitiesData.renewalKDMMeeting.isNewMeeting);
            // expect(kdmMeeting.meetingDate, "Renewal KDM Meeting: The Meeting Date got mismatched").toBe(activitiesData.renewalKDMMeeting.meetingDate);
            // expect(kdmMeeting.availableFrom, "Renewal KDM Meeting: The Available From date got mismatched").toBe(activitiesData.renewalKDMMeeting.availableFrom);
            // expect(kdmMeeting.availableTo, "Renewal KDM Meeting: The Available To date got mismatched").toBe(activitiesData.renewalKDMMeeting.availableTo);
            // expect(kdmMeeting.meetingLocation, "Renewal KDM Meeting: The Meeting Location got mismatched").toBe(activitiesData.renewalKDMMeeting.location);
            // expect(kdmMeeting.companyContactPersons, "Renewal KDM Meeting: The Company Contact Persons got mismatched").toEqual(activitiesData.renewalKDMMeeting.companyContactPersons);
            // expect(kdmMeeting.employeeParticipants, "Renewal KDM Meeting: Employee partciipants got mismatched").toEqual(activitiesData.renewalKDMMeeting.employeeParticipants);
            // expect(kdmMeeting.agenda, "Renewal KDM Meeting: The Agenda got mismatched").toBe(activitiesData.renewalKDMMeeting.agenda);
            // expect(kdmMeeting.remarks, "Renewal KDM Meeting : The Remarks got mismatched").toBe(activitiesData.renewalKDMMeeting.remarks);
            // expect([uploadedKDMMeetingDocType.documentType], "Renewal KDM Meeting: The document type got mismatched").toEqual(activitiesData.renewalKDMMeeting.documentType);
            // expect(uploadedKDMMeetingDocType.filename, "Renewal KDM Meeting: The uploaded File got mismatched").toContain(expectedKDMMeetingFilename);

            // expect(await (await roActivities.renewalKDMMeeting()).completeActivity.isdisabled(), "The Complete planning is not disabled").toBeTruthy();

            // // 4. Filling Renewal Mandate Details Entry stage using ROActivities.page.ts set method
            // await roActivities.accordion.open("Renewal Mandate Details Entry");

            // await (await roActivities.renewalMandateDetailsEntry()).set(activitiesData.renewalMandateDetailsEntry);

            // await Promise.all([
            //     page.waitForResponse(async (resp) => {
            //         return resp.status() === 200;
            //     }),
            //     await (await roActivities.renewalMandateDetailsEntry()).saveActivity.click(),
            // ]);
            // await verifyToastMessage(toastMessage, "Activity has been saved successfully.", "RO Renewal Mandate Details Entry Save Activity");

            // await Promise.all([
            //     page.waitForResponse(async (res) => {
            //         return res.status() === 200;
            //     }),
            //     await (await roActivities.renewalMandateDetailsEntry()).completeActivity.click()
            // ]);
            // await verifyToastMessage(toastMessage, "Activity has been completed successfully.", "RO  Renewal Mandate Details Entry Complete Activity");


            // // Verifying the submitted data in Renewal Mandate Details Entry stage
            // await roActivities.open("Renewal Mandate Details Entry");

            // renewalMandateDetailsEntryAssignee = await roActivities.accordion.getOwners("Renewal Mandate Details Entry");

            // // Verifying Plan Date and participants
            // renewalMandateDetailsEntryPlanDate = await roActivities.accordion.getPlanDate("Renewal Mandate Details Entry");
            // // expect(renewalMandateDetailsEntryPlanDate, "The Plan date got mismatched").toContain(activitiesData.roBDPlanning.mandateDetailsEntryDate);

            // // expect(renewalMandateDetailsEntryAssignee, "Renewal Mandate Details Entry Assignee got mismatched").toEqual(expectedMandateDetailsEntryParticipants);

            // renewalMandateDetailsEntry = await (await roActivities.renewalMandateDetailsEntry()).get();

            // uploadedMandateDetailsEntryDocType = renewalMandateDetailsEntry.documentTypeAndFileName[0];
            // expectedMandateDetailsEntryFilename = activitiesData.renewalMandateDetailsEntry.file[0].split('/').pop();

            // expect(renewalMandateDetailsEntry.fullMandate, "Renewal Mandate Details Entry: Full Mandate got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.fullMandate);
            // expect(renewalMandateDetailsEntry.restrictedMandate, "Renewal Mandate Details Entry: The Restricted Mandate got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.restrictedMandate);
            // expect(renewalMandateDetailsEntry.signedBy, "Renewal Mandate Details Entry: The Signed By got mismatched").toEqual(activitiesData.renewalMandateDetailsEntry.signedBy);
            // expect(renewalMandateDetailsEntry.validFrom, "Renewal Mandate Details Entry: The Valid From date got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.validFrom);
            // expect(renewalMandateDetailsEntry.validTo, "Renewal Mandate Details Entry: The Valid To date got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.validTo);
            // expect(renewalMandateDetailsEntry.brokeragePercentage, "Renewal Mandate Details Entry: The Brokerage Percentage got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.brokeragePercentage);
            // expect(renewalMandateDetailsEntry.brokerageFee, "Renewal Mandate Details Entry: The Brokerage Fee got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.brokerageFee);
            // expect(renewalMandateDetailsEntry.fixedFee, "Renewal Mandate Details Entry: The Fixed Fee got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.fixedFee);
            // expect(renewalMandateDetailsEntry.compensationPayable, "Renewal Mandate Details Entry: The Compensation Payable got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.compensationPayable);
            // expect(renewalMandateDetailsEntry.issuedOn, "Renewal Mandate Details Entry: The Issued On date got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.issuedOn);
            // expect(renewalMandateDetailsEntry.remarks, "Renewal Mandate Details Entry: The Remarks got mismatched").toBe(activitiesData.renewalMandateDetailsEntry.remarks);
            // expect([uploadedMandateDetailsEntryDocType.documentType], "Renewal Mandate Details Entry: The document type got mismatched").toEqual(activitiesData.renewalMandateDetailsEntry.documentType);
            // expect(uploadedMandateDetailsEntryDocType.filename, "Renewal Mandate Details Entry: The uploaded File got mismatched").toContain(expectedMandateDetailsEntryFilename);

            // expect(await (await roActivities.renewalMandateDetailsEntry()).completeActivity.isdisabled(), "The Complete planning is not disabled").toBeTruthy();

            // // 5. Filling Renewal RFP Data Collection stage using ROActivities.page.ts set method
            // await roActivities.open("Renewal RFP Data Collection");
            // await (await roActivities.renewalRFPDataCollection()).set(activitiesData.rfpDataCollection);

            // await Promise.all([
            //     page.waitForResponse(async (res) => {
            //         return res.status() === 200;
            //     }),
            //     await (await roActivities.renewalRFPDataCollection()).saveActivity.click(),
            // ]);
            // await verifyToastMessage(toastMessage, "Activity has been saved successfully.", "RO Renewal RFP Data Collection Save Activity");

            // await Promise.all([
            //     page.waitForResponse(async (res) => {
            //         return res.status() === 200;
            //     }),
            //     await (await roActivities.renewalRFPDataCollection()).completeActivity.click(),
            // ]);

            // await verifyToastMessage(toastMessage, "Activity has been completed successfully.", "RO Renewal RFP Data Collection Complete Activity");

            // // Verifying the submitted data in Renewal RFP Data Collection stage
            // await roActivities.open("Renewal RFP Data Collection");

            // renewalRFPDataCollectionAssignee = await roActivities.accordion.getOwners("Renewal RFP Data Collection");
            // // Verifying Plan Date and participants
            // // renewalRFPDataCollectionPlanDate = await roActivities.accordion.getPlanDate("Renewal RFP Data Collection");
            // // expect(renewalRFPDataCollectionPlanDate, "The Plan date got mismatched").toContain(activitiesData.roBDPlanning.rfpDataCollectionDate);

            // // expect(renewalRFPDataCollectionAssignee, "RFP Data collection Creation Owners got mismatched").toEqual(expectedRFPDataCollectionParticipants);

            // renewalRFPDataCollection = await (await roActivities.renewalRFPDataCollection()).get();
            // uploadedRFPDataCollectionDocType = renewalRFPDataCollection.documentTypeAndFile[0];
            // expectedRFPDataCollectionFilename = activitiesData.rfpDataCollection.file[0].split('/').pop();

            // expect(renewalRFPDataCollection.basicCoversData, "Renewal RFP Data Collection: The Basic Covers Data got mismatched").toBe(activitiesData.rfpDataCollection.basicCoversData);
            // expect(renewalRFPDataCollection.description, "Renewal RFP Data Collection: The Description got mismatched").toBe(activitiesData.rfpDataCollection.description);
            // expect(renewalRFPDataCollection.requirements, "Renewal RFP Data Collection: The Requirements got mismatched").toBe(activitiesData.rfpDataCollection.requirements);
            // expect([uploadedRFPDataCollectionDocType.documentType], "Renewal RFP Data Collection: The document type got mismatched").toEqual(activitiesData.rfpDataCollection.documentType);
            // expect(uploadedRFPDataCollectionDocType.filename, "Renewal RFP Data Collection: The uploaded File got mismatched").toContain(expectedRFPDataCollectionFilename);
            // expect(await (await roActivities.renewalRFPDataCollection()).completeActivity.isdisabled(), "The Complete planning is not disabled").toBeTruthy();

            // // 6. Filling Renewal Mandate Details Entry stage using ROActivities.page.ts set method
            // await roActivities.accordion.open("Renewal RFP Details Entry");
            // await (await roActivities.renewalRFPDetailsEntry()).set(activitiesData.renewalRFPDetailsEntry);

            // // Verifying the submitted data in Renewal RFP Details Entry stage
            // await roActivities.open("Renewal RFP Details Entry");
            // renewalRFPDetailsEntryAssignee = await roActivities.accordion.getOwners("Renewal RFP Details Entry");

            // // Verifying Plan Date and participants
            // // renewalRFPDetailsEntryPlanDate = await roActivities.accordion.getPlanDate("Renewal RFP Details Entry");
            // // expect(renewalRFPDetailsEntryPlanDate, "The Plan date got mismatched").toContain(activitiesData.roBDPlanning.rfpDetailsEntryDate);
            // // expect(renewalRFPDetailsEntryAssignee, "Assignee got mismatched").toEqual(expectedRFPDetailsEntryParticipants);

            // renewalRFPDetailsEntry = await (await roActivities.renewalRFPDetailsEntry()).get();

            // uploadedRFPDetailsEntryDocType = renewalRFPDetailsEntry.documentType[0];
            // expectedRFPDetailsEntryFilename = activitiesData.renewalRFPDetailsEntry.file[0].split('/').pop();

            // expect(renewalRFPDetailsEntry.description, "Renewal RFP Details Entry: The Description got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.description);
            // expect(renewalRFPDetailsEntry.requirements, "Renewal RFP Details Entry: The Requirement got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.requirements);
            // expect(renewalRFPDetailsEntry.preferredInsurers, "Renewal RFP Details Entry: The Prefered Insurers got mismatched").toMatchObject(activitiesData.renewalRFPDetailsEntry.preferredInsurers);
            // expect(renewalRFPDetailsEntry.preferredTpas, "Renewal RFP Details Entry: The Prefered TPAs got mismatched")
            //     .toEqual(expect.arrayContaining([
            //         expect.objectContaining({
            //             "TPA name": activitiesData.renewalRFPDetailsEntry.preferredTpas[0]["TPA name"],
            //             "Location": activitiesData.renewalRFPDetailsEntry.preferredTpas[0]["Location"],
            //             "Branch": activitiesData.renewalRFPDetailsEntry.preferredTpas[0]["Branch"]
            //         })
            //     ]));

            // expect(renewalRFPDetailsEntry.multipleBrokerInvolvedYes, "Renewal RFP Details Entry: The multiple broker involved yes got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.multipleBrokerInvolved);
            // expect(renewalRFPDetailsEntry.isMarketAllocationDoneYes, "Renewal RFP Details Entry: The Is Market Allocation Done Yes got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.isMarketAllocationDone);
            // expect(renewalRFPDetailsEntry.contact, "Renewal RFP Details Entry: The Contact got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.contact);
            // expect(renewalRFPDetailsEntry.ultimateDecision, "Renewal RFP Details Entry: The Ultimate Decision got mismatched").toEqual(activitiesData.renewalRFPDetailsEntry.ultimateDecision);
            // expect(parseFloat(renewalRFPDetailsEntry.expectedPremiumOfClient), "Renewal RFP Details Entry: The Expected Premium Of Client got mismatched").toBe(parseFloat(activitiesData.renewalRFPDetailsEntry.expectedPremiumOfClient));
            // // The Excluded TPAs comparison is skipped as the UI shows null value but JSON was provided with data.
            // expect(renewalRFPDetailsEntry.excludedTpas, "Renewal RFP Details Entry: The Excluded TPAs got mismatched").toMatchObject(activitiesData.renewalRFPDetailsEntry.excludedTpas);
            // expect(renewalRFPDetailsEntry.excludedInsurers, "Renewal RFP Details Entry: The Excluded Insurers got mismatched").toEqual(expect.arrayContaining([expect.objectContaining({
            //     "Insurer name": activitiesData.renewalRFPDetailsEntry.excludedInsurers[0]["Insurer name"],
            //     "Location": activitiesData.renewalRFPDetailsEntry.excludedInsurers[0]["Location"],
            //     "Branch": activitiesData.renewalRFPDetailsEntry.excludedInsurers[0]["Branch"]
            //     // Skip Contact since it's null in UI but "" in JSON
            // })
            // ]));

            // expect(renewalRFPDetailsEntry.clientExpectations, "Renewal RFP Details Entry:The Client Expectations got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.clientExpectations);
            // expect(renewalRFPDetailsEntry.threatsFromExistingInsurer, "Renewal RFP Details Entry:The Threats from existing insurer got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.threatsFromExistingInsurer);
            // expect(renewalRFPDetailsEntry.threatsFromExistingBroker, "Renewal RFP Details Entry:The Threats from existing broker got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.threatsFromExistingBroker);
            // expect(renewalRFPDetailsEntry.extraneousFactors, "Renewal RFP Details Entry:The Extraneous Factors got  mismatched").toBe(activitiesData.renewalRFPDetailsEntry.extraneousFactors);
            // expect(renewalRFPDetailsEntry.ourStrategyPlanForClosingDeal, "Renewal RFP Details Entry:The Our Strategy Plan For Closing Deal got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.ourStrategyPlanForClosingDeal);
            // expect(renewalRFPDetailsEntry.targetQcrDate, "Renewal RFP Details Entry:The Target QCR Date got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.targetQcrDate);
            // expect(renewalRFPDetailsEntry.remarks, "Renewal RFP Details Entry:The Remarks got mismatched").toBe(activitiesData.renewalRFPDetailsEntry.remarks);
            // expect([uploadedRFPDetailsEntryDocType.documentType], "Renewal RFP Details Entry:The document type got mismatched").toEqual(activitiesData.renewalRFPDetailsEntry.documentType);
            // expect(uploadedRFPDetailsEntryDocType.filename, "Renewal RFP Details Entry:The RSR uploaded File got mismatched").toContain(expectedRFPDetailsEntryFilename);

            // expect(await roActivities.getApprovalStatus(), "The approval status got mismatched").toContain(`Waiting for activity approval by ${bdManagerLogin.USERNAME}`);
            // await navBar.logout();


            // await approve(page, bdManagerLogin, companyName, "RFP details entry - Approval for Opportunity ID:" + accessNumber);
            // await roActivities.open("Renewal RFP Details Entry");
            // expect(await roActivities.isStageDisabled("Renewal RFP Details Entry"), "The stage is not disabled").toBe(true);


            const brokingSlipGenerationAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.brokingSlipGenerationParticipants);
            const enterQuoteAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.enterQuoteParticipants);
            const qcrGenerationAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.qcrGenerationParticipants);
            const meetingForFinalNegotiationAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.meetingForFinalNegotiationParticipants);
            const placementSlipGenerationAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.placementSlipGenerationParticipants);
            const premiumCalculationAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.premiumCalculationParticipants);
            const heldCoverNoteAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.heldCoverNoteParticipants);
            const policyHardCopyAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.policyHardCopyReceiptParticipants);
            const policyDocketAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.policyDocketParticipants);
            const handOverMeetAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.handOverMeetParticipants);
            const policyConfirmationAssigneeName: string = getAssigneeName(isgActivitiesData.roISGPlanning.policyConfirmationParticipants);

            // await loginPage.open('/');
            // await loginPage.login(isgManagerAssignLogin.USERNAME, isgManagerAssignLogin.PASSWORD);

            // await navBar.open("My Sales Portfolio");
            // await manageROPage.smartSearch().filter.click();
            // await manageROPage.smartSearch().policyType.set(policyName);
            // await manageROPage.smartSearch().period.clear();
            // await manageROPage.smartSearch().roStatus.click();
            // await manageROPage.smartSearch().roStatus.remove(defaultFilter);
            // await manageROPage.smartSearch().roStatus.set(isgPlanningFilter);

            // await manageROPage.smartSearch().run.click();
            // await manageROPage.smartSearch().collapse.click();

            // await manageROPage.table().click_on('Policy type', policyName);

            // await navBar.open('My Approvals');
            // await manageROPage.tab().open('Assignments');

            // taskPanel = dashBoardPage.panel(page, "Next 7 Days");
            // await taskPanel.openMeetingCard(
            //     companyName,
            //     addDaysToCurrentDate(1, "DD MMM"),
            //     "ISG Assignment Task"
            // );
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');
            // await roActivities.wait(TIMEOUTS.PAGE_LOADING_TIMEOUT);

            // await roActivities.roISGPlanning().then(p => p.setAssignee(isgActivitiesData.roISGPlanning.selectAssignee));
            // await verifyToastMessage(toastMessage, "User assigned successfully", "RO ISG planning Select assignee");

            // const isgAssignee = await (await roActivities.roISGPlanning()).getAssignee();
            // expect(isgAssignee.join(" "), "ISG Planning: Assignee got mismatched").toBe(getAssigneeName(isgActivitiesData.roISGPlanning.selectAssignee));

            // await navBar.logout();

            // await loginPage.open('/');
            // await loginPage.login(isgExecutiveLogin.USERNAME, isgExecutiveLogin.PASSWORD);

            // taskPanel = dashBoardPage.panel(page, "Next 7 Days");
            // await taskPanel.openMeetingCard(
            //     companyName,                    // company
            //     addDaysToCurrentDate(1, "DD MMM"),
            //     "ISG Planning Task"       // stage (secondary info for ISG Planning Task)
            // );

            // await navBar.open("My Sales Portfolio");
            // await manageROPage.smartSearch().filter.click();

            // await manageROPage.smartSearch().policyType.set(policyName);
            // await manageROPage.smartSearch().period.clear();
            // await manageROPage.smartSearch().roActivity.click();
            // await manageROPage.smartSearch().roActivity.set(isgPlanningFilter);

            // await manageROPage.smartSearch().run.click();
            // await manageROPage.smartSearch().collapse.click();
            // await manageROPage.table().click_on('Policy type', policyName);

            //Filling ISG Planning stage using SOActivities.page.ts set method
            // await (await roActivities.roISGPlanning()).set(isgActivitiesData.roISGPlanning);
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');

            // await roActivities.roISGPlanning().then(p => p.completePlanning.click()),
            //     await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');
            // await verifyToastMessage(toastMessage, "Activities updated successfully", "RO ISG Planning Complete planning");

            // await roActivities.open("ISG Planning");
            // isgPlanningAssignee = await roActivities.accordion.getOwners("ISG Planning");

            // if (isgPlanningAssignee !== isgActivitiesData.roISGPlanning.selectAssignee) {

            //     // Select Assignee is assigned the API call is sent and then by performing some actions it will reflect the assignee name in ISG planning stage 
            //     await page.reload({ waitUntil: 'load' });
            //     await page.waitForLoadState('networkidle');
            // }

            // const isgPlanning: any = await (await roActivities.roISGPlanning()).get();
            // expect(isgPlanningAssignee.join(" "), "Assignee got mismatched").toContain(getAssigneeName(isgActivitiesData.roISGPlanning.selectAssignee));
            // expect(isgPlanning.brokingSlipGenerationDate, "RO ISG Planning : The broking Slip Generation Date got mismatched").toContain(isgActivitiesData.roISGPlanning.brokingSlipGenerationDate);
            // expect(isgPlanning.brokingSlipGenerationParticipants.join(" "), "RO ISG Planning : The broking Slip Generation Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanning.brokingSlipGenerationParticipants));

            // expect(isgPlanning.enterQuoteDate, "RO Planning : The enter quote Date got mismatched").toBe(isgActivitiesData.roISGPlanning.enterQuoteDate);
            // expect(isgPlanning.enterQuoteParticipants.join(" "), "RO ISG Planning : The enter quote Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanning.enterQuoteParticipants));

            // expect(isgPlanning.qcrGenerationDate, "RO ISG Planning : The  qcr generation date got mismatched").toBe(isgActivitiesData.roISGPlanning.qcrGenerationDate);
            // expect(isgPlanning.qcrGenerationParticipants.join(" "), "RO ISG Planning : The qcr generation Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanning.qcrGenerationParticipants));

            // expect(isgPlanning.meetingForFinalNegotiationDate, "RO ISG Planning : The meeting for final negotiation date got mismatched").toBe(isgActivitiesData.roISGPlanningmeetingForFinalNegotiationDate);
            // expect(isgPlanning.meetingForFinalNegotiationParticipants.join(" "), "RO ISG Planning : The meeting for final negotiation Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanningmeetingForFinalNegotiationParticipants));

            // expect(isgPlanning.placementSlipGenerationDate, "RO ISG Planning : The placement slip generation date got mismatched").toBe(isgActivitiesData.roISGPlanningplacementSlipGenerationDate);
            // expect(isgPlanning.placementSlipGenerationParticipants.join(" "), "RO ISG Planning : The placement slip generation Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanningplacementSlipGenerationParticipants));

            // expect(isgPlanning.premiumCalculationDate, "RO ISG Planning : The premium calculation date got mismatched").toContain(getAssigneeName(isgActivitiesData.roISGPlanningpremiumCalculationDate));
            // expect(isgPlanning.premiumCalculationParticipants.join(" "), "RO ISG Planning : The premium calculation participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanningpremiumCalculationParticipants));

            // expect(isgPlanning.heldCoverNoteDate, "RO ISG Planning : The Held Cover Note Date got mismatched").toBe(isgActivitiesData.roISGPlanningheldCoverNoteDate);
            // expect(isgPlanning.heldCoverNoteParticipants.join(" "), "RO ISG Planning : The Held Cover Note Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanningheldCoverNoteParticipants));

            // expect(isgPlanning.policyHardCopyReceiptDate, "RO ISG Planning : The policy hard copy receipt Date got mismatched").toBe(isgActivitiesData.roISGPlanningpolicyHardCopyReceiptDate);
            // expect(isgPlanning.policyHardCopyReceiptParticipants.join(" "), "RO ISG Planning : The policy hard copy receipt Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanningpolicyHardCopyReceiptParticipants));

            // expect(isgPlanning.policyDocketDate, "RO ISG Planning : The policy docket date got mismatched").toBe(isgActivitiesData.roISGPlanningpolicyDocketDate);
            // expect(isgPlanning.policyDocketParticipants.join(" "), "RO ISG Planning : The policy docket Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanningpolicyDocketParticipants));

            // expect(isgPlanning.handOverMeetDate, "RO ISG Planning : The Hand over meet date got mismatched").toBe(isgActivitiesData.roISGPlanninghandOverMeetDate);
            // expect(isgPlanning.handOverMeetParticipants.join(" "), "RO ISG Planning : The Hand over meet Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanninghandOverMeetParticipants));

            // expect(isgPlanning.policyConfirmationDate, "RO ISG Planning : The policy confirmation date got mismatched").toBe(isgActivitiesData.roISGPlanningpolicyConfirmationDate);
            // expect(isgPlanning.policyConfirmationParticipants.join(" "), " RO ISG Planning : The policy confirmation Participants got mismatched").toMatch(getAssigneeName(isgActivitiesData.roISGPlanningpolicyConfirmationParticipants));

            // Filling Broking Slip Generation stage using SOActivities.page.ts set method
            // await roActivities.open("Broking Slip Generation");

            // await (await roActivities.roBrokingSlipGeneration()).set(isgActivitiesData.roBrokingSlipGeneration);
            // await verifyToastMessage(toastMessage, "Activity has been submitted for approval successfully.", "RO Broking Slip Generation Submit for approval");
            // await navBar.logout();

            // await loginPage.open('/');
            // await loginPage.login(isgManagerLogin.USERNAME, isgManagerLogin.PASSWORD);

            // await navBar.open("My Approvals");
            // await page.waitForLoadState('domcontentloaded');
            // taskPanel = dashBoardPage.panel(page, "Next 7 Days");
            // await taskPanel.openMeetingCard(
            //     companyName,
            //     addDaysToCurrentDate(1, "DD MMM"),
            //     "Broking slip generation - Approval"
            // );
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');

            // await roActivities.approve.click();
            // await verifyToastMessage(toastMessage, "Activity has been approved successfully.", "RO Broking Slip Generation Activity Approval");
            // await navBar.logout();

            // await loginPage.open("/");
            // await loginPage.login(isgExecutiveLogin.USERNAME, isgExecutiveLogin.PASSWORD);

            // 2. Filling Broking Slip Generation stage using ROActivities.page.ts set method

            // await navBar.open("My Sales Portfolio");
            // await manageROPage.smartSearch().filter.click();
            // await manageROPage.smartSearch().policyType.set(policyName);
            // await manageROPage.smartSearch().period.clear();
            // await manageROPage.smartSearch().roActivity.click();
            // // await manageROPage.smartSearch().roActivity.remove(defaultFilter);
            // await manageROPage.smartSearch().roActivity.set(isgPlanningFilter);

            // await manageROPage.smartSearch().run.click();
            // await manageROPage.smartSearch().collapse.click();

            // await manageROPage.table().click_on('Policy type', policyName);

            // await roActivities.open("Broking Slip Generation");

            // brokingSlipGenerationPlanDate = await roActivities.accordion.getPlanDate("Broking Slip Generation");
            // expect(brokingSlipGenerationPlanDate, "The Broking slip generation Plan Date got mismatched").toContain(isgActivitiesData.roISGPlanning.brokingSlipGenerationDate);

            // brokingSlipGenerationAssignee = await roActivities.accordion.getOwners("Broking Slip Generation");
            // expectedBrokingSlipGenerationParticipants = [...isgPlanningAssignee, brokingSlipGenerationAssigneeName];
            // expect(brokingSlipGenerationAssignee, "Assignee got mismatched").toContain(getAssigneeName(expectedBrokingSlipGenerationParticipants));

            // brokingSlipGeneration = await (await roActivities.roBrokingSlipGeneration()).get();
            // uploadedBrokingSlipDocType = brokingSlipGeneration.documentType[0];
            // expectedBrokingSlipFilename = isgActivitiesData.roBrokingSlipGeneration.file[0].split('/').pop();

            // expect(brokingSlipGeneration.sumInsured, "RO Broking Slip Generation : The Sum Insured got mismatched").toContain(isgActivitiesData.roBrokingSlipGeneration.sumInsured);
            // expect(brokingSlipGeneration.basicPremium, "RO Broking Slip Generation : The Basic premium got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.basicPremium);
            // expect(brokingSlipGeneration.brokeragePercentage, "RO Broking Slip Generation : The Brokerage Percentage got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.brokeragePercentage);
            // expect(brokingSlipGeneration.brokerageAmount, "RO Broking Slip Generation : The Brokerage Amount got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.brokerageAmount);
            // expect(brokingSlipGeneration.policyFrom, "RO Broking Slip Generation : The Policy from date got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.policyFrom);
            // expect(brokingSlipGeneration.policyTo, "RO Broking Slip Generation : The Policy to date got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.policyTo);
            // expect(brokingSlipGeneration.renewalDate, "RO Broking Slip Generation : The Renewal Date got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.renewalDate);
            // expect(brokingSlipGeneration.timelineForQuoteReceipt, "RO Broking Slip Generation : The timeline quote for the receipt got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.timelineForQuoteReceipt);
            // expect(brokingSlipGeneration.businessActivitiesOfCompany, "RO Broking Slip Generation : The Business activities mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.businessActivitiesOfCompany);
            // expect(brokingSlipGeneration.preferredTpas, "RO Broking Slip Generation : The Prefered TPA s got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.preferredTpas);
            // expect(brokingSlipGeneration.preferredInsurers, "RO Broking Slip Generation : The Prefered Insurer details got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.preferredInsurers);
            // expect(brokingSlipGeneration.otherRiskMitigationFeatures, "RO Broking Slip Generation : The Other risk mitigation features got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.otherRiskMitigationFeatures);
            // expect(brokingSlipGeneration.otherClauses, "RO Broking Slip Generation : The other clauses got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.otherClauses);
            // expect(brokingSlipGeneration.insurerRemarks, "RO Broking Slip Generation : The insurer remarks got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.insurerRemarks);
            // expect(brokingSlipGeneration.bsgRemarks, "RO Broking Slip Generation : The remarks got mismatched").toBe(isgActivitiesData.roBrokingSlipGeneration.bsgRemarks);
            // expect([uploadedBrokingSlipDocType.documentType], "RO Broking Slip Generation : The document type got mismatched").toEqual(isgActivitiesData.roBrokingSlipGeneration.documentType);
            // expect(uploadedBrokingSlipDocType.filename, "RO Broking Slip Generation : The uploaded File got mismatched").toContain(expectedBrokingSlipFilename);

            // await (await roActivities.roBrokingSlipGeneration()).saveActivity.click();
            // await verifyToastMessage(toastMessage, "Activity has been saved successfully.", "RO Broking Slip Generation Save Activity");

            // await (await roActivities.roBrokingSlipGeneration()).submitForApproval.click();
            // expect(await roActivities.getApprovalStatus(), "ISG Manager name got mismatched").toBe(`Waiting for Approval by ${isgManagerLogin.USERNAME}`);

            // Approve Enter Quote as a ISG manager 

            // await roActivities.open("Enter Quote");
            // await page.waitForLoadState('domcontentloaded');
            // await page.waitForLoadState('networkidle');
            // await navBar.collapseSideNavbar();

            // if (isgActivitiesData.roEnterQuote?.quotes?.length) {

            //     const roEnterQuote = await roActivities.roEnterQuote();
            //     const quotes = isgActivitiesData.roEnterQuote.quotes;

            //     for (let index = 0; index < quotes.length; index++) {

            //         // Wait until quote form is ready
            //         await page.waitForLoadState('domcontentloaded');
            //         await page.waitForLoadState('networkidle');

            //         // Fill quote data
            //         await roEnterQuote.set(quotes[index]);

            //         await roEnterQuote.saveQuote.click();
            //         await page.waitForLoadState('networkidle');

            //         // Verify toast
            //         await verifyToastMessage( toastMessage, "Quote added successfully.", "RO Enter Quote Add Quote" );

            //         // If there are more quotes, click Add Quote
            //         if (index < quotes.length - 1) {
            //             await roEnterQuote.addQuote.click();

            //             // Wait for new empty quote form
            //             await page.waitForLoadState('networkidle');
            //             await page.waitForLoadState('domcontentloaded');

            //         }
            //     }
            // }


            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');

            // await (await roActivities.roEnterQuote()).completeActivity.click();
            // await page.waitForLoadState('networkidle');
            // await page.waitForLoadState('domcontentloaded');
            // await verifyToastMessage(toastMessage, "Quote updated successfully", "RO Enter Quote Complete Activity");

            await roActivities.open("Enter Quote");

            // enterQuotePlanDate = await roActivities.accordion.getPlanDate("Enter Quote");
            // expect(enterQuotePlanDate, "The Enter Quote Plan Date got mismatched").toContain(isgActivitiesData.roISGPlanningenterQuoteDate);

            // enterQuoteAssignee = await roActivities.accordion.getOwners("Enter Quote");
            // expectedEnterQuoteParticipants = [...isgPlanningAssignee, enterQuoteAssigneeName];
            // expect(enterQuoteAssignee, "Enter Quote Assignee got mismatched").toContain(getAssigneeName(expectedEnterQuoteParticipants));

            roEnterQuote = await (await roActivities.roEnterQuote()).get();

            const policyFrom = isgActivitiesData.roBrokingSlipGeneration.policyFrom;
            const policyTo = await addDaysToCurrentDate(1, isgActivitiesData.roBrokingSlipGeneration.policyTo);

            const expectedPolicyPeriod = `${policyFrom} - ${policyTo}`;

            // summary (top section)
            expect(roEnterQuote['Created on'], "RO Enter Quote:Quote Created on got mismatched").toBe(policyFrom);
            expect(roEnterQuote['Sum insured'], "RO Enter Quote: The Sum insured got mismatched").toBe(isgActivitiesData.roEnterQuote.sumInsured);
            expect(roEnterQuote['Policy From & To'], "RO Enter Quote: The Policy From & To got mismatched").toBe(expectedPolicyPeriod);

            // first (or only) quote
            for (let index = 0; index < roEnterQuote.quotes.length; index++) {
 
                const quote = roEnterQuote.quotes[index];

                expect(quote['Selected insurer'], "RO Enter Quote: The Selected insurer got mismatched").toBe(isgActivitiesData.roEnterQuote.insurer);
                expect(quote['Quote received on'], "RO Enter Quote: The Quote received on got mismatched").toBe(isgActivitiesData.roEnterQuote.quoteRecievedon);
                expect(quote['Basic premium'], "RO Enter Quote: The Basic premium got mismatched").toBe(isgActivitiesData.roEnterQuote.basicPremium);
                expect(quote['Terrorism'], "RO Enter Quote: The Terrorism got mismatched").toBe(isgActivitiesData.roEnterQuote.terrorism);
                expect(quote['Net premium'], "RO Enter Quote: The Net premium got mismatched").toBe(isgActivitiesData.roEnterQuote.netPremium);
                expect(quote['Brokerage'], "RO Enter Quote: The Brokerage got mismatched").toBe(isgActivitiesData.roEnterQuote.brokerageAmount);
            }
            // QCR Generation
            await roActivities.open("QCR Generation");

            // qcrGenerationPlanDate = await roActivities.accordion.getPlanDate("QCR Generation");
            // expect(qcrGenerationPlanDate, "The QCR Generation Plan Date got mismatched").toContain(isgActivitiesData.roISGPlanning.qcrGenerationDate);

            // qcrGenerationAssignee = await roActivities.accordion.getOwners("QCR Generation");
            // expectedQCRGenerationParticipants = [...isgPlanningAssignee, qcrGenerationAssigneeName];
            // expect(qcrGenerationAssignee, "QCR Generation Assignee got mismatched").toContain(getAssigneeName(expectedQCRGenerationParticipants));

            await (await roActivities.roQCRGeneration()).set(activitiesData.roQCRGeneration);

            await (await roActivities.roQCRGeneration()).saveActivity.click();
            await verifyToastMessage(toastMessage, "Activity has been saved successfully.", "RO QCR Generation Save Activity");

            await (await roActivities.roQCRGeneration()).completeActivity.click();
            await verifyToastMessage(toastMessage, "Activity has been completed successfully.", "RO QCR Generation Complete Activity");

            roQCRGeneration = await (await roActivities.roQCRGeneration()).get();
            expect(roQCRGeneration.qcrDocumentTypeAndFile[0].documentType, "RO QCR Generation: The QCR Document Type got mismatched").toBe(isgActivitiesData.roQCRGeneration.documentType);

            // Meeting for Final Negotiation
            await roActivities.open("Meeting for Final Negotiation");
            // meetingForFinalNegotiationPlanDate = await roActivities.accordion.getPlanDate("Meeting for Final Negotiation");
            // expect(meetingForFinalNegotiationPlanDate, "The Meeting for Final Negotiation Plan Date got mismatched").toContain(isgActivitiesData.roISGPlanning.meetingForFinalNegotiationDate);
            // meetingForFinalNegotiationAssignee = await roActivities.accordion.getOwners("Meeting for Final Negotiation");
            // expectedMeetingForFinalNegotiationParticipants = [...isgPlanningAssignee, meetingForFinalNegotiationAssigneeName];
            // expect(meetingForFinalNegotiationAssignee, "Meeting for Final Negotiation Assignee got mismatched").toContain(getAssigneeName(expectedMeetingForFinalNegotiationParticipants));

            await (await roActivities.roMeetingForFinalNegotiation()).set(isgActivitiesData.meetingForFinalNegotiation);

            await (await roActivities.roMeetingForFinalNegotiation()).saveActivity.click();
            await verifyToastMessage(toastMessage, "Activity has been saved successfully.", "RO Meeting for Final Negotiation Save Activity");

            await (await roActivities.roMeetingForFinalNegotiation()).completeActivity.click();
            await verifyToastMessage(toastMessage, "Activity has been completed successfully.", "RO Meeting for Final Negotiation Complete Activity");

            roMeetingForFinalNegotiation = await (await roActivities.roMeetingForFinalNegotiation()).get();
            uploadedMeetingForFinalNegotiationDocuments = roMeetingForFinalNegotiation.documentTypeAndFileName[0];
            expectedMeetingForFinalNegotiationFilename = isgActivitiesData.meetingForFinalNegotiation.file[0].split('/').pop();

            expect(roMeetingForFinalNegotiation.isNewMeeting, "RO Meeting for Final Negotiation: The new Meeitng got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.isNewMeeting);
            expect(roMeetingForFinalNegotiation.selectMeeting, "RO Meeting for Final Negotiation: The Select Meeting got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.selectMeeting);
            expect(roMeetingForFinalNegotiation.meetingDate, "RO Meeting for Final Negotiation: The Insurer Selected got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.meetingDate);
            expect(roMeetingForFinalNegotiation.availableFrom, "RO Meeting for Final Negotiation: The available from time got mismatched").toMatch((isgActivitiesData.meetingForFinalNegotiation.availableFrom));
            expect(roMeetingForFinalNegotiation.availableTo, "RO Meeting for Final Negotiation: The available to time got mismatched").toMatch((isgActivitiesData.meetingForFinalNegotiation.availableTo));
            expect(roMeetingForFinalNegotiation.location, "RO Meeting for Final Negotiation: The location got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.location);
            expect(roMeetingForFinalNegotiation.companyContactPersons, "RO Meeting for Final Negotiation: The company contact persons got mismatched").toEqual(isgActivitiesData.meetingForFinalNegotiation.companyContactPersons);
            expect(roMeetingForFinalNegotiation.employeeParticipants, "RO Meeting for Final Negotiation: The Employee participants got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.employeeParticipants);
            expect(roMeetingForFinalNegotiation.insurerParticipants, "RO Meeting for Final Negotiation: The Insurer participants got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.insurerParticipants);
            expect(roMeetingForFinalNegotiation.insurerContactPersons, "RO Meeting for Final Negotiation: The insurer contact persons got mismatched").toEqual(isgActivitiesData.meetingForFinalNegotiation.insurerContactPerson);
            expect(roMeetingForFinalNegotiation.agenda, "RO Meeting for Final Negotiation: The Agenda got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.agenda);
            expect(roMeetingForFinalNegotiation.singleInsurers, "RO Meeting for Final Negotiation: The single insurers got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.singleInsurer);
            expect(roMeetingForFinalNegotiation.selectLeadInsurer, "RO Meeting for Final Negotiation: The Select Lead insurer got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.selectedLeadInsuer);
            expect(roMeetingForFinalNegotiation.onlyLeadInsurerPaysBrokerageYes, "RO Meeting for Final Negotiation: The Only lead insurer pays brokerage yes got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.onlyLeadInsurerPaysBrokerageYes);
            expect(roMeetingForFinalNegotiation.onlyLeadInsurerPaysBrokerageNo, "RO Meeting for Final Negotiation: The Only Lead insurer pays brokerage no got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.onlyLeadInsurerPaysBrokerageNo);
            expect(roMeetingForFinalNegotiation.finalisedVersionQuote, "RO Meeting for Final Negotiation: The Finalised version quote got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.finalisedVersionQuote);
            expect(roMeetingForFinalNegotiation.finalisedQuote, "RO Meeting for Final Negotiation: The Finalised Quote got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.finalisedQuote);
            expect(roMeetingForFinalNegotiation.editQuoteYes, " RO Meeting for Final Negotiation: The Edit quote yes got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.editQuoteYes);
            expect(roMeetingForFinalNegotiation.editQuoteNo, " RO Meeting for Final Negotiation: The Edit quote no got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.editQuoteNo);
            expect(roMeetingForFinalNegotiation.selectInsurer, "RO Meeting for Final Negotiation: The Select insurer got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.selectInsurer);
            expect(roMeetingForFinalNegotiation.selectedInsuerLocation, "RO Meeting for Final Negotiation: The Meeting remarks got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.selectedInsurerLocation);
            expect(roMeetingForFinalNegotiation.quoteReceivedOn, "RO Meeting for Final Negotiation: The Quote received on got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.quoteReceivedOn);
            expect(roMeetingForFinalNegotiation.basicPremium, "RO Meeting for Final Negotiation: The Basic Premium got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.basicPremium);
            expect(roMeetingForFinalNegotiation.terrorism, "RO Meeting for Final Negotiation: The Terrorism got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.terrorism);
            expect(roMeetingForFinalNegotiation.netPremium, "RO Meeting for Final Negotiation: The Net Premium got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.netPremium);
            expect(roMeetingForFinalNegotiation.brokeragePercentage, "RO Meeting for Final Negotiation: The Brokerage Percentage got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.brokeragePercentage);
            expect(roMeetingForFinalNegotiation.brokerageAmount, "RO Meeting for Final Negotiation: The Brokerage Amount got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.brokerageAmount);
            expect(roMeetingForFinalNegotiation.taxDetails, "RO Meeting for Final Negotiation: The Tax Details got mismatched").toMatchObject(isgActivitiesData.meetingForFinalNegotiation.taxDetails);
            expect(roMeetingForFinalNegotiation.insurerShareAndBrokerageDetails, "RO Meeting for Final Negotiation: The Insurer Share and Brokerage Details got mismatched").toMatchObject(isgActivitiesData.meetingForFinalNegotiation.insurerShareAndBrokerageDetails);
            expect(roMeetingForFinalNegotiation.insurerServiceLevelAgreement, "RO Meeting for Final Negotiation: The Insurer service level agreement got mismatched").toMatchObject(isgActivitiesData.meetingForFinalNegotiation.insurerServiceLevelAgreement);
            expect(roMeetingForFinalNegotiation.remarks, "RO Meeting for Final Negotiation: The remarks got mismatched").toBe(isgActivitiesData.meetingForFinalNegotiation.remarks);
            expect(uploadedMeetingForFinalNegotiationDocuments.documentType, "RO Meeting for Final Negotiation: The document type got mismatched").toEqual(isgActivitiesData.meetingForFinalNegotiation.documentType);
            expect(uploadedMeetingForFinalNegotiationDocuments.filename, "RO Meeting for Final Negotiation: The uploaded File got mismatched").toContain(expectedMeetingForFinalNegotiationFilename);


            // Placement Slip Generation
            await roActivities.open("Placement Slip Generation");
            // placementSlipGenerationAssignee = await roActivities.accordion.getOwners("Placement Slip Generation");
            // expectedPlacementSlipGenerationParticipants = [...isgPlanningAssignee, placementSlipGenerationAssignee];
            expect(placementSlipGenerationAssignee, "Placement Slip Generation Assignee got mismatched").toContain(getAssigneeName(expectedPlacementSlipGenerationParticipants));
            roPlacementSlipGeneration = await (await roActivities.roPlacementSlipGeneration()).get();
            // expect(roPlacementSlipGeneration.policyFrom, "RO Placement Slip Generation:The Placement Slip Policy From date got mismatched").toBe(isgActivitiesData.placementSlipGeneration.placementSlipRemarks);

            // // Premium Calculation
            await roActivities.open("Premium Calculation");
            // premiumCalculationAssignee = await roActivities.accordion.getOwners("Premium Calculation");
            // expectedPremiumCalculationParticipants = [...isgPlanningAssignee, premiumCalculationAssignee];
            // expect(premiumCalculationAssignee, "Premium Calculation Assignee got mismatched").toContain(getAssigneeName(expectedPremiumCalculationParticipants));

            // // Held Cover Note
            await roActivities.open("Held Cover Note");
            // heldCoverNoteAssignee = await roActivities.accordion.getOwners("Held Cover Note");
            // expectedHeldCoverNoteParticipants = [...isgPlanningAssignee, heldCoverNoteAssignee];
            // expect(heldCoverNoteAssignee, "Held Cover Note Assignee got mismatched").toContain(getAssigneeName(expectedHeldCoverNoteParticipants));

            // // Policy Hard Copy Receipt
            await roActivities.open("Policy Hard Copy Receipt");
            // policyHardCopyAssignee = await roActivities.accordion.getOwners("Policy Hard Copy Receipt");
            // expectedPolicyHardCopyParticipants = [...isgPlanningAssignee, policyHardCopyAssignee];
            // expect(policyHardCopyAssignee, "Policy Hard Copy Receipt Assignee got mismatched").toContain(getAssigneeName(expectedPolicyHardCopyParticipants));

            // // Policy Docket
            await roActivities.open("Policy Docket");
            // policyDocketAssignee = await roActivities.accordion.getOwners("Policy Docket");
            // expectedPolicyDocketParticipants = [...isgPlanningAssignee, policyDocketAssignee];
            // expect(policyDocketAssignee, "Policy Docket Assignee got mismatched").toContain(getAssigneeName(expectedPolicyDocketParticipants));

            // // Hand over Meet
            await roActivities.open("Hand over Meet");
            // handOverMeetAssignee = await roActivities.accordion.getOwners("Hand over Meet");
            // expectedHandOverMeetParticipants = [...isgPlanningAssignee, handOverMeetAssignee];
            // expect(handOverMeetAssignee, "Hand over Meet Assignee got mismatched").toContain(getAssigneeName(expectedHandOverMeetParticipants));

            // // Policy Confirmation
            await roActivities.open("Policy Confirmation");
            // policyConfirmationAssignee = await roActivities.accordion.getOwners("Policy Confirmation");
            // expectedPolicyConfirmationParticipants = [...isgPlanningAssignee, policyConfirmationAssignee];
            // expect(policyConfirmationAssignee, "Policy Confirmation Assignee got mismatched").toContain(getAssigneeName(expectedPolicyConfirmationParticipants));


        });
    });


    //Function to verify the alert messages
    async function verifyToastMessage(snackBar: SnackBar, expectedToastMessage: string, context: string) {

        expect(await snackBar.isvisible(), `The ${context} toast is not visible`).toBeTruthy();

        const toastMessage = await snackBar.getMessage();
        expect(toastMessage, `The ${context} toast message should match`).toBe(expectedToastMessage);

        await snackBar.close.click();

        expect(await snackBar.isvisible(), `The ${context} toast is not closed`).toBeFalsy();
    }


    // Function to get name only from any stage having assignee, participants etc., having format "Name, Location" Ex: Dhruv, Mumbai
    function getAssigneeName(value: string | string[]): string {
        if (Array.isArray(value)) {
            return value.map(v => v.split(', ')[0].trim()).join(" "); // join array into string
        }
        return value.split(',')[0].trim();
    }


    // Approve RFP Details Entry as a manager using loginData from JSON
    async function approve(page, userLogin, companyName, stageName) {

        const toastMessage = new SnackBar(page);
        const loginPage = new LoginPage(page);
        const navBar = new NavBarPage(page);
        const dashboardPage = new DashboardPage(page);
        const roActivities = new ROActivities(page);

        await loginPage.open('/');
        await loginPage.login(userLogin.USERNAME, userLogin.PASSWORD);

        await navBar.open("My Approvals");

        const taskPanel = dashboardPage.panel(page, "Next 7 Days");

        currentDate = addDaysToCurrentDate(1, "DD/MM/YYYY");
        formattedDate = convertToDDMMM(currentDate);


        try {
            // Attempt to open the card
            card = await taskPanel.openMeetingCard({
                company: companyName,
                date: formattedDate,
                stage: stageName,
                accessNumber: String(accessNumber)
            });
        }
        catch (err) {
            // Card not found → go to URL
            await page.goto(roURL);
        }

        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('domcontentloaded');
        await roActivities.approve.click();

        await verifyToastMessage(toastMessage, "Activity has been approved successfully.", `Approve ${stageName} as Manager`);

        await roActivities.open("Renewal RFP Details Entry");

        const approvalStatus = await roActivities.getApprovalStatus();
        expect(approvalStatus, "The approval status got mismatched").toContain(`This activity was approved by ${bdManagerLogin.USERNAME}`);

    }

});

