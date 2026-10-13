import { test, expect, chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { loadEnvConfig, Utils } from '../../../utils/utils';
import { LoginPage } from '../../../pages/Login.page';
import { NavBarPage } from '../../../pages/Navbar.page';
import { ManageCompanyPage } from '../../../pages/ManageCompany.page';
import { WizardPage } from '../../../pages/Wizard.page';
import { AddSOPage } from '../../../pages/AddSO.page';
import { OptyStatusBar } from '../../../framework/steppercontrol.element';
import { QuickCreateCompanyPage } from '../../../pages/QuickCreate.page';
import { Dialog } from '../../../appcomponents/Dialog.component';
import { ManageEntityListing } from '../../../pages/ManageEntityListing.template';
import { OptyActivities } from '../../../pages/OptyActivities.page';
import { OptyHeader } from '../../../appcomponents/OptyHeaderCard.component';
import { Accordion } from '../../../framework/accordian.element';
import { SnackBar } from '../../../appcomponents/SnackBar.component';
import { TIMEOUTS } from '../../../env/timeouts';

const config = loadEnvConfig(process.env.ENV || 'qa');
const iirm4186_company: any = Utils.loadTestData("testdata/ui/functionaltests/iirm4186/iirm4186_company.json");
const iirm4186_contact: any = Utils.loadTestData("testdata/ui/functionaltests/iirm4186/iirm4186_contact.json");
const iirm4186_so: any = Utils.loadTestData("testdata/ui/functionaltests/iirm4186/iirm4186_so.json");
const iirm4186_activities: any = Utils.loadTestData("testdata/ui/functionaltests/iirm4186/iirm4186_activities.json");
let datesIncrementBy: number = 5;
let randomNum = Utils.getRandomNumber(1000, 9999);
const normalize = (arr: string[]) => arr.map(item => item.split(",")[0].trim());
// Helper: convert dd/mm/yyyy → Date
const toDate = (str: string): Date => {
    const [dd, mm, yyyy] = str.split('/').map(Number);
    return new Date(yyyy, mm - 1, dd); // <-- keep mm - 1 (JS Date is 0-based)
};
// Helper: verify dates increment by N days
// helper returns boolean
const verifyDatesIncrementBy = (dateStrings: string[], step: number = 5): boolean => {
    const dates = dateStrings.map(toDate);

    for (let i = 0; i < dates.length - 1; i++) {
        const diffInMs = dates[i + 1].getTime() - dates[i].getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays !== step) {
            return false; // fails at first mismatch
        }
    }
    return true; // all good
};

test.describe('IIRM: Perform BD Opportunity Activties with privileged user', { tag: '@opty, @optyactivities' }, () => {
    let page: Page;
    let login: LoginPage;
    let browser: Browser;
    let addSO: AddSOPage;
    let snackBar: SnackBar;
    let wizard: WizardPage;
    let activityStagePanel: Accordion;
    let companyDialog: Dialog;
    let navBar: NavBarPage;
    let context: BrowserContext;
    let optyHeaderCard: OptyHeader;
    let stepperControl: OptyStatusBar;
    let optyActivities: OptyActivities;
    let manageOpty: ManageEntityListing;
    let manageCompany: ManageCompanyPage;
    let quickCompanyCreate: QuickCreateCompanyPage;

    test.beforeAll('Company, Contact and opty(GTL) Creation: ', async ({ }) => {
        browser = await chromium.launch();
        context = await browser.newContext();
        page = await context.newPage();

        login = new LoginPage(page);
        addSO = new AddSOPage(page);
        wizard = new WizardPage(page);
        companyDialog = new Dialog(page);
        navBar = new NavBarPage(page);
        manageOpty = new ManageEntityListing(page);
        manageCompany = new ManageCompanyPage(page);
        quickCompanyCreate = new QuickCreateCompanyPage(page);

        await login.open("/");
        await login.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);
        await wizard.wait(3000);

        await navBar.open('My Companies');

        await manageCompany.createNewCompany.click();
        await wizard.searchCompany(iirm4186_company.companyName + "_" + randomNum);
        await wizard.wait(2000);
        await wizard.quickCreate.click();
        await quickCompanyCreate.enterCompanyQuickCreateDetails(iirm4186_company, iirm4186_contact, randomNum);
        iirm4186_company.companyName = iirm4186_company.companyName + "_" + randomNum;
        iirm4186_company.displayName = iirm4186_company.displayName + "_" + randomNum;

        await quickCompanyCreate.submit.click();
        await quickCompanyCreate.wait(25000);

        // companyDialog appears when company creation is successful
        await companyDialog.button('Exit').click();
        
        await quickCompanyCreate.wait(2000);

        await navBar.open('My Sales Portfolio', 'My SO');
        await manageOpty.button('Create SO').click();

        await wizard.searchCompany(iirm4186_company.companyName);
        await wizard.wait(2000);
        await wizard.selectCompany(iirm4186_company.companyName, 'India');
        await wizard.wait(1000);
        await wizard.selectContact([iirm4186_contact[0].firstName + randomNum + " " + iirm4186_contact[0].lastName]);
        await wizard.wait(500);
        // opty creation starts
        await wizard.proceedToSO.click();
        await wizard.wait(3000);
        await addSO.enterData(iirm4186_so, randomNum);

        iirm4186_so.companyName = iirm4186_so.companyName + "_" + randomNum;
        iirm4186_so.displayName = iirm4186_so.displayName + "_" + randomNum;
        iirm4186_activities.kdmMeeting.companyContactPersons[0] = iirm4186_contact[0].firstName + randomNum + " " + iirm4186_contact[0].lastName;
        iirm4186_activities.mandateDetailsEntry.signedBy[0] = iirm4186_contact[0].firstName + randomNum + " " + iirm4186_contact[0].lastName;
        iirm4186_activities.rfpDetailsEntry.contact = iirm4186_contact[0].firstName + randomNum + " " + iirm4186_contact[0].lastName;
    });

    test("Opty BD Activities( 1 to 6 )", async () => {
        const today = new Date();
        snackBar = new SnackBar(page);
        optyHeaderCard = new OptyHeader(page);
        activityStagePanel = new Accordion(page);
        optyActivities = new OptyActivities(page);
        const formattedDate = today.toLocaleString("en-GB").split(',')[0]; // DD/MM/YYYY
        let expectedOwnerNames = normalize([iirm4186_company.leadCrm, ...iirm4186_activities.bdPlanning.dataValidationParticipants]);

        // Opty Header card validation.
        await page.waitForTimeout(1000);
        expect(await optyHeaderCard.getCompanyName(), "Company name displayed in Opty Header does not match expected").toBe(iirm4186_company.companyName);
        expect(await optyHeaderCard.getLeadCrm(), "Lead CRM displayed in Opty Header does not match expected").toBe(iirm4186_company.leadCrm);
        expect(await optyHeaderCard.getPolicyType(), "Policy type displayed in Opty Header does not match expected").toBe(iirm4186_so.policyType);
        expect(await optyHeaderCard.getOptyExpiryDate(), "Opty expiry date displayed in Opty Header does not match expected").toBe(iirm4186_so.soExpiryDate);
        expect(await optyHeaderCard.getOpportunityType(), "Opportunity type displayed in Opty Header does not match expected").toBe(iirm4186_so.soType);
        expect(await optyHeaderCard.getStartDate(), "Start date displayed in Opty Header does not match expected date").toBe(formattedDate);
        expect(await optyHeaderCard.getExpiryDate(), "Expiry date displayed in Opty Header does not match expected").toBe(iirm4186_so.soExpiryDate);
        expect(await optyHeaderCard.getPremiumAmount(), "Premium amount displayed in Opty Header does not match expected").toBe(`${Utils.formatNumber(iirm4186_so.premiumPaid,"INR")}`);
        expect(await optyHeaderCard.getBrokerageAmount(), "Brokerage amount displayed in Opty Header does not match expected").toBe(`${Utils.formatNumber(iirm4186_so.estimatedBrokerage,"INR")}`);
        expect((await optyHeaderCard.getOptyStatus()).statusText, "Opty status displayed in Opty Header is not 'Open'").toBe("Open");
        expect(await optyHeaderCard.activities().currentStage.textContent(), "Current stage in Opty Header is not 'BD Planning'").toBe("BD Planning");
        expect((await activityStagePanel.getContactNames("BD Planning"))[0], "First contact name in BD Planning does not match Lead CRM").toBe(iirm4186_company.leadCrm);

        // for BD Planning
        let bdData: any = await optyActivities.get("BD Planning");
        expect(
            verifyDatesIncrementBy([
                bdData.dataValidationDate,
                bdData.kdmMeetingDate,
                bdData.mandateDetailsEntryDate,
                bdData.rfpDataCollectionDate,
                bdData.rfpDetailsEntryDate
            ], datesIncrementBy),
            "BD Planning: Dates do not increment by expected number of days"
        ).toBeTruthy();
        await optyActivities.set("BD Planning", iirm4186_activities.bdPlanning);
        expect(await snackBar.getMessage(), "SnackBar message after BD Planning update is not as expected").toBe("Activities updated successfully");
        await snackBar.close.click();

        // checking for the data persisitence for BD Planning stage
        // assertion for the activityStagePanel is closed or opened.
        // expect(await activityStagePanel.status("BD Planning"), "BD Planning: Activity stage panel status is not 'closed' as expected").toBe("closed");
        await activityStagePanel.open("BD Planning");
        bdData = await optyActivities.get("BD Planning");
        // Define all participant arrays from UI (actual)
        const participantGroups = {
            dataValidation: bdData.dataValidationParticipants,
            kdmMeeting: bdData.kdmMeetingParticipants,
            mandateDetailsEntry: bdData.mandateDetailsEntryParticipants,
            rfpDataCollection: bdData.rfpDataCollectionParticipants,
            rfpDetailsEntry: bdData.rfpDetailsEntryParticipants
        };
        // Define all participant arrays from JSON (expected)
        const expectedGroups = {
            dataValidation: iirm4186_activities.bdPlanning.dataValidationParticipants,
            kdmMeeting: iirm4186_activities.bdPlanning.kdmMeetingParticipants,
            mandateDetailsEntry: iirm4186_activities.bdPlanning.mandateDetailsEntryParticipants,
            rfpDataCollection: iirm4186_activities.bdPlanning.rfpDataCollectionParticipants,
            rfpDetailsEntry: iirm4186_activities.bdPlanning.rfpDetailsEntryParticipants
        };
        // Iterate over each group and assert participants
        for (const key in participantGroups) {
            const actual = normalize(participantGroups[key]);
            const expected = normalize(expectedGroups[key]);

            expected.forEach(participant => {
                expect(actual, `BD Planning: Contact name '${participant}' not found in actual owner names for group '${key}'`).toContain(participant);
            });
        }
        expect(bdData.dataValidationDate, "BD Planning: Data Validation date does not match expected").toBe(iirm4186_activities.bdPlanning.dataValidationDate);
        expect(bdData.kdmMeetingDate, "BD Planning: KDM Meeting date does not match expected").toBe(iirm4186_activities.bdPlanning.kdmMeetingDate);
        expect(bdData.mandateDetailsEntryDate, "BD Planning: Mandate Details Entry date does not match expected").toBe(iirm4186_activities.bdPlanning.mandateDetailsEntryDate);
        expect(bdData.rfpDataCollectionDate, "BD Planning: RFP Data Collection date does not match expected").toBe(iirm4186_activities.bdPlanning.rfpDataCollectionDate);
        expect(bdData.rfpDetailsEntryDate, "BD Planning: RFP Details Entry date does not match expected").toBe(iirm4186_activities.bdPlanning.rfpDetailsEntryDate);

        // for data validation stage
        await activityStagePanel.open("Data Validation");
        expect(await optyActivities.completeActivity.isdisabled(), "Complete Activity button should be disabled in Data Validation stage when entering first time").toBeTruthy();
        expect(await activityStagePanel.getPlanDateText("Data Validation"), "Plan date in Data Validation stage does not match expected").toBe(`Plan date - ${iirm4186_activities.bdPlanning.dataValidationDate}`);
        let actualOwnerNames = normalize(await activityStagePanel.getContactNames("Data Validation"));
        expectedOwnerNames = normalize([iirm4186_company.leadCrm, ...iirm4186_activities.bdPlanning.dataValidationParticipants]);
        expectedOwnerNames.forEach(participant => {
            expect(actualOwnerNames, `Data Validation: Contact name '${participant}' not found in actual owner names`).toContain(participant);
        });
        await optyActivities.set("Data Validation", iirm4186_activities.dataValidation);
        // toast message verification
        expect(await snackBar.getMessage(), "SnackBar message after Data Validation update is not as expected").toBe("Opportunity activity saved successfully");
        await snackBar.close.click();

        // asserts whether the activityStagePanel is closed or not
        // expect(await activityStagePanel.status("Data Validation"), "Data Validation: Activity stage panel status is not 'closed' as expected").toBe("closed");
        await activityStagePanel.open("Data Validation");
        await page.waitForTimeout(1000);
        let dvData: any = await optyActivities.get("Data Validation");
        expect(dvData.remarks, "Data Validation: Remarks do not match expected").toBe(iirm4186_activities.dataValidation.remarks);
        for (let index = 0; index < dvData.documentType.length; index++) {
            expect(dvData.documentType[index], `Data Validation: Document type at index ${index} does not match expected`).toBe(iirm4186_activities.dataValidation.documentType[index]);
        }
        for (let index = 0; index < dvData.filename.length; index++) {
            expect(dvData.filename[index], `Data Validation: Filename at index ${index} does not match expected`).toBe(iirm4186_activities.dataValidation.file[index].split('/').pop());
        }

        // for KDM Meeting
        await activityStagePanel.open("KDM Meeting");
        expect(await activityStagePanel.getPlanDateText("KDM Meeting"), "KDM Meeting: Plan date does not match expected value").toBe(`Plan date - ${iirm4186_activities.bdPlanning.kdmMeetingDate}`);
        actualOwnerNames = normalize(await activityStagePanel.getContactNames("KDM Meeting"));
        expectedOwnerNames = normalize([iirm4186_company.leadCrm, ...iirm4186_activities.bdPlanning.kdmMeetingParticipants]);
        expectedOwnerNames.forEach(participant => {
            expect(actualOwnerNames, `KDM Meeting: Contact name '${participant}' not found in actual owner names`).toContain(participant);
        });
        await optyActivities.wait(1000);
        await optyActivities.set("KDM Meeting", iirm4186_activities.kdmMeeting);
        // toast message verification
        expect(await snackBar.getMessage()).toBe("Opportunity activity saved successfully");
        await snackBar.close.click();

        // asserts whether the activityStagePanel is open or closed
        // expect(await activityStagePanel.status("KDM Meeting"), "KDM Meeting: Activity stage panel status is not 'closed' as expected").toBe("closed");
        await activityStagePanel.open("KDM Meeting");
        await page.waitForTimeout(1000);
        // need to check for employee participants and company contact persons also
        let kdmData: any = await optyActivities.get("KDM Meeting");
        expect(kdmData.meetingDate, "KDM Meeting: Meeting date does not match expected").toBe(iirm4186_activities.kdmMeeting.meetingDate);
        expect(kdmData.availableFrom, "KDM Meeting: Available From time does not match expected").toBe(iirm4186_activities.kdmMeeting.availableFrom);
        expect(kdmData.availableTo, "KDM Meeting: Available To time does not match expected").toBe(iirm4186_activities.kdmMeeting.availableTo);
        expect(kdmData.meetingLocation, "KDM Meeting: Meeting location does not match expected").toBe(iirm4186_activities.kdmMeeting.location);
        expect(kdmData.agenda, "KDM Meeting: Agenda does not match expected").toBe(iirm4186_activities.kdmMeeting.agenda);
        expect(kdmData.remarks, "KDM Meeting: Remarks do not match expected").toBe(iirm4186_activities.kdmMeeting.remarks);

        const actual = [...kdmData.employeeParticipants].join(", ");
        const expected = [...iirm4186_activities.kdmMeeting.employeeParticipants].join(", ");
        expect(actual, "KDM Meeting: Employee participants do not match expected").toBe(expected);

        for (let index = 0; index < kdmData.companyContactPersons.length; index++) {
            expect(kdmData.companyContactPersons[index], `KDM Meeting: Company contact person at index ${index} does not match expected`).toBe(iirm4186_activities.kdmMeeting.companyContactPersons[index]);
        }
        for (let index = 0; index < kdmData.documentType.length; index++) {
            expect(kdmData.documentType[index], `KDM Meeting: Document type at index ${index} does not match expected`).toBe(iirm4186_activities.kdmMeeting.documentType[index]);
        }
        for (let index = 0; index < kdmData.filename.length; index++) {
            expect(kdmData.filename[index], `KDM Meeting: Filename at index ${index} does not match expected`).toBe(iirm4186_activities.kdmMeeting.file[index].split('/').pop());
        }

        // for mandate details entry
        await activityStagePanel.open("Mandate Details Entry");
        expect(await activityStagePanel.getPlanDateText("Mandate Details Entry"), "Mandate Details Entry: Plan date does not match expected").toBe(`Plan date - ${iirm4186_activities.bdPlanning.mandateDetailsEntryDate}`);
        actualOwnerNames = normalize(await activityStagePanel.getContactNames("Mandate Details Entry"));
        expectedOwnerNames = normalize([iirm4186_company.leadCrm, ...iirm4186_activities.bdPlanning.mandateDetailsEntryParticipants]);
        expectedOwnerNames.forEach(participant => {
            expect(actualOwnerNames, `Mandate Details Entry: Contact name '${participant}' not found in actual owner names`).toContain(participant);
        });
        await optyActivities.set("Mandate Details Entry", iirm4186_activities.mandateDetailsEntry);
        // toast message verification
        expect(await snackBar.getMessage(), "Mandate Details Entry: SnackBar message does not match expected").toBe("Opportunity activity saved successfully");
        await snackBar.close.click();

        // asserts whether the activityStagePanel is closed or not
        // expect(await activityStagePanel.status("Mandate Details Entry"), "Mandate Details Entry: Activity stage panel status is not 'closed' as expected").toBe("closed");
        await activityStagePanel.open("Mandate Details Entry");
        await page.waitForTimeout(1000);
        let mdeData: any = await optyActivities.get("Mandate Details Entry");
        expect(mdeData.fullMandate, "Mandate Details Entry: Full Mandate value does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.fullMandate);
        expect(mdeData.restrictedMandate, "Mandate Details Entry: Restricted Mandate value does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.restrictedMandate);
        expect(mdeData.validFrom, "Mandate Details Entry: Valid From date does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.validFrom);
        expect(mdeData.validTo, "Mandate Details Entry: Valid To date does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.validTo);
        expect(mdeData.brokeragePercentage, "Mandate Details Entry: Brokerage percentage does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.brokeragePercentage);
        expect(mdeData.brokerageFee, "Mandate Details Entry: Brokerage fee does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.brokerageFee);
        expect(mdeData.fixedFee, "Mandate Details Entry: Fixed fee does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.fixedFee);
        expect(mdeData.compensationPayable, "Mandate Details Entry: Compensation payable does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.compensationPayable);
        expect(mdeData.issuedOn, "Mandate Details Entry: Issued On date does not match expected").toBe(iirm4186_activities.mandateDetailsEntry.issuedOn);
        expect(mdeData.remarks, "Mandate Details Entry: Remarks do not match expected").toBe(iirm4186_activities.mandateDetailsEntry.remarks);
        for (let index = 0; index < mdeData.signedBy.length; index++) {
            expect(mdeData.signedBy[index], `Mandate Details Entry: Signed by at index ${index} does not match expected`).toBe(iirm4186_activities.mandateDetailsEntry.signedBy[index]);
        }
        for (let index = 0; index < mdeData.documentType.length; index++) {
            expect(mdeData.documentType[index], `Mandate Details Entry: Document type at index ${index} does not match expected`).toBe(iirm4186_activities.mandateDetailsEntry.documentType[index]);
        }
        for (let index = 0; index < mdeData.filename.length; index++) {
            expect(mdeData.filename[index], `Mandate Details Entry: Filename at index ${index} does not match expected`).toBe(iirm4186_activities.mandateDetailsEntry.file[index].split('/').pop());
        }

        // for RFP Data collection activity stage
        await activityStagePanel.open("RFP Data Collection");
        expect(await activityStagePanel.getPlanDateText("RFP Data Collection"), "RFP Data Collection: Plan date does not match expected").toBe(`Plan date - ${iirm4186_activities.bdPlanning.rfpDataCollectionDate}`);
        actualOwnerNames = normalize(await activityStagePanel.getContactNames("RFP Data Collection"));
        expectedOwnerNames = normalize([iirm4186_company.leadCrm, ...iirm4186_activities.bdPlanning.rfpDataCollectionParticipants]);
        expectedOwnerNames.forEach(participant => {
            expect(actualOwnerNames, `RFP Data Collection: Contact name '${participant}' not found in actual owner names`).toContain(participant);
        });
        await optyActivities.wait(500);
        await optyActivities.set("RFP Data Collection", iirm4186_activities.rfpDataCollection);
        // toast message verification
        expect(await snackBar.getMessage(), "RFP Data Collection: SnackBar message does not match expected").toBe("Opportunity activity saved successfully");
        await snackBar.close.click();

        // asserts whether the activityStagePanel is closed or not
        // expect(await activityStagePanel.status("RFP Data Collection"), "RFP Data Collection: Activity stage panel status is not 'closed' as expected").toBe("closed");
        await activityStagePanel.open("RFP Data Collection");
        await page.waitForTimeout(1000);
        let rfpData: any = await optyActivities.get("RFP Data Collection", iirm4186_activities.rfpDataCollection);
        // Dynamically verify all basicCovers fields directly from JSON
        for (const item of iirm4186_activities.rfpDataCollection.basicCovers) {
            expect(rfpData.basicCovers[item.name], `RFP Data Collection: Basic cover '${item.name}' value does not match expected`).toBe(item.value);
        }
        expect(rfpData.remarks, "RFP Data Collection: Remarks do not match expected").toBe(iirm4186_activities.rfpDataCollection.remarks);
        for (let index = 0; index < rfpData.documentType.length; index++) {
            expect(rfpData.documentType[index], `RFP Data Collection: Document type at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDataCollection.documentType[index]);
        }
        for (let index = 0; index < rfpData.filename.length; index++) {
            expect(rfpData.filename[index], `RFP Data Collection: Filename at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDataCollection.file[index].split('/').pop());
        }

        // for RFP details entry activity stage
        await activityStagePanel.open("RFP Details Entry");
        expect(await activityStagePanel.getPlanDateText("RFP Details Entry"), "RFP Details Entry: Plan date does not match expected").toBe(`Plan date - ${iirm4186_activities.bdPlanning.rfpDetailsEntryDate}`);
        actualOwnerNames = normalize(await activityStagePanel.getContactNames("RFP Details Entry"));
        expectedOwnerNames = normalize([iirm4186_company.leadCrm, ...iirm4186_activities.bdPlanning.rfpDetailsEntryParticipants]);
        expectedOwnerNames.forEach(participant => {
            expect(actualOwnerNames, `RFP Details Entry: Contact name '${participant}' not found in actual owner names`).toContain(participant);
        });
        await optyActivities.set("RFP Details Entry", iirm4186_activities.rfpDetailsEntry);
        // toast message verification
        expect(await snackBar.getMessage(), "RFP Details Entry: SnackBar message does not match expected").toBe("Opportunity activity saved successfully");
        await snackBar.close.click();

        // asserts whether the activityStagePanel is closed or not.
        // expect(await activityStagePanel.status("RFP Details Entry"), "RFP Details Entry: Activity stage panel status is not 'closed' as expected").toBe("closed");
        await activityStagePanel.open("RFP Details Entry");
        await page.waitForTimeout(1000);
        let rfpdeData: any = await optyActivities.get("RFP Details Entry");
        // need to do credit sharing, tpas and insurers.
        expect(rfpdeData.description, "RFP Details Entry: RFP details description does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.description);
        expect(rfpdeData.requirements, "RFP Details Entry: RFP details requirements do not match expected").toBe(iirm4186_activities.rfpDetailsEntry.requirements);
        expect(rfpdeData.preferredInsurers.length, "RFP Details Entry: Preferred insurers count does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.preferredInsurers.length);
        for (let index = 0; index < iirm4186_activities.rfpDetailsEntry.preferredInsurers.length; index++) {
            expect(rfpdeData.preferredInsurers[index].name, `RFP Details Entry: Preferred insurer name at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredInsurers[index].name);
            expect(rfpdeData.preferredInsurers[index].location, `RFP Details Entry: Preferred insurer location at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredInsurers[index].location);
            expect(rfpdeData.preferredInsurers[index].branch, `RFP Details Entry: Preferred insurer branch at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredInsurers[index].branch);
            if (iirm4186_activities.rfpDetailsEntry.preferredInsurers[index].contact === "") {
                expect(rfpdeData.preferredInsurers[index].contact, `RFP Details Entry: Preferred insurer contact at index ${index} should be null`).toBeNull();
            } else {
                expect(rfpdeData.preferredInsurers[index].contact, `RFP Details Entry: Preferred insurer contact at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredInsurers[index].contact);
            }
        }
        expect(rfpdeData.preferredTpas.length, "RFP Details Entry: Preferred TPAs count does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.preferredTpas.length);
        for (let index = 0; index < iirm4186_activities.rfpDetailsEntry.preferredTpas.length; index++) {
            expect(rfpdeData.preferredTpas[index].name, `RFP Details Entry: Preferred TPA name at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredTpas[index].name);
            expect(rfpdeData.preferredTpas[index].location, `RFP Details Entry: Preferred TPA location at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredTpas[index].location);
            expect(rfpdeData.preferredTpas[index].branch, `RFP Details Entry: Preferred TPA branch at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredTpas[index].branch);
            if (iirm4186_activities.rfpDetailsEntry.preferredTpas[index].contact === "") {
                expect(rfpdeData.preferredTpas[index].contact, `RFP Details Entry: Preferred TPA contact at index ${index} should be null`).toBeNull();
            } else {
                expect(rfpdeData.preferredTpas[index].contact, `RFP Details Entry: Preferred TPA contact at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.preferredTpas[index].contact);
            }
        }
        if (iirm4186_activities.rfpDetailsEntry.multipleBrokerInvolved) {
            expect(rfpdeData.multipleBrokerInvolvedYes, "RFP Details Entry: Multiple broker involved (Yes) does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.multipleBrokerInvolved);
        } else {
            expect(rfpdeData.multipleBrokerInvolvedNo, "RFP Details Entry: Multiple broker involved (No) does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.multipleBrokerInvolved);
        }
        if (iirm4186_activities.rfpDetailsEntry.isMarketAllocationDone) {
            expect(rfpdeData.isMarketAllocationDoneYes, "RFP Details Entry: Market allocation done (Yes) does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.isMarketAllocationDone);
        } else {
            expect(rfpdeData.isMarketAllocationDoneNo, "RFP Details Entry: Market allocation done (No) does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.isMarketAllocationDone);
        }
        expect(rfpdeData.contact, "RFP Details Entry: Contact does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.contact);
        // Check ultimateDecision items regardless of order, using the same style
        if (Array.isArray(iirm4186_activities.rfpDetailsEntry.ultimateDecision) && Array.isArray(rfpdeData.ultimateDecision)) {
            iirm4186_activities.rfpDetailsEntry.ultimateDecision.forEach(item => {
                expect(rfpdeData.ultimateDecision, `RFP Details Entry: Ultimate decision item '${item}' not found in actual data`).toContain(item);
            });
        }
        expect(rfpdeData.excludedTpas.length, "RFP Details Entry: Excluded TPAs count does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.excludedTpas.length);
        for (let index = 0; index < iirm4186_activities.rfpDetailsEntry.excludedTpas.length; index++) {
            expect(rfpdeData.excludedTpas[index].name, `RFP Details Entry: Excluded TPA name at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedTpas[index].name);
            expect(rfpdeData.excludedTpas[index].location, `RFP Details Entry: Excluded TPA location at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedTpas[index].location);
            expect(rfpdeData.excludedTpas[index].branch, `RFP Details Entry: Excluded TPA branch at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedTpas[index].branch);
            if (iirm4186_activities.rfpDetailsEntry.excludedTpas[index].contact === "") {
                expect(rfpdeData.excludedTpas[index].contact, `RFP Details Entry: Excluded TPA contact at index ${index} should be null`).toBeNull();
            } else {
                expect(rfpdeData.excludedTpas[index].contact, `RFP Details Entry: Excluded TPA contact at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedTpas[index].contact);
            }
        }
        expect(rfpdeData.expectedPremiumOfClient, "RFP Details Entry: Expected premium of client does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.expectedPremiumOfClient);
        expect(rfpdeData.excludedInsurers.length, "RFP Details Entry: Excluded insurers count does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.excludedInsurers.length);
        for (let index = 0; index < iirm4186_activities.rfpDetailsEntry.excludedInsurers.length; index++) {
            expect(rfpdeData.excludedInsurers[index].name, `RFP Details Entry: Excluded insurer name at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedInsurers[index].name);
            expect(rfpdeData.excludedInsurers[index].location, `RFP Details Entry: Excluded insurer location at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedInsurers[index].location);
            expect(rfpdeData.excludedInsurers[index].branch, `RFP Details Entry: Excluded insurer branch at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedInsurers[index].branch);
            if (iirm4186_activities.rfpDetailsEntry.excludedInsurers[index].contact === "") {
                expect(rfpdeData.excludedInsurers[index].contact, `RFP Details Entry: Excluded insurer contact at index ${index} should be null`).toBeNull();
            } else {
                expect(rfpdeData.excludedInsurers[index].contact, `RFP Details Entry: Excluded insurer contact at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.excludedInsurers[index].contact);
            }
        }
        expect(rfpdeData.clientExpectations, "RFP Details Entry: Client expectations do not match expected").toBe(iirm4186_activities.rfpDetailsEntry.clientExpectations);
        expect(rfpdeData.threatsFromExistingInsurer, "RFP Details Entry: Threats from existing insurer do not match expected").toBe(iirm4186_activities.rfpDetailsEntry.threatsFromExistingInsurer);
        expect(rfpdeData.threatsFromExistingBroker, "RFP Details Entry: Threats from existing broker do not match expected").toBe(iirm4186_activities.rfpDetailsEntry.threatsFromExistingBroker);
        expect(rfpdeData.extraneousFactorsAffectingClientDecision, "RFP Details Entry: Extraneous factors affecting client decision do not match expected").toBe(iirm4186_activities.rfpDetailsEntry.extraneousFactorsAffectingClientDecision);
        expect(rfpdeData.ourStrategyPlanForClosingDeal, "RFP Details Entry: Our strategy plan for closing deal does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.ourStrategyPlanForClosingDeal);
        expect(rfpdeData.targetQcrDate, "RFP Details Entry: Target QCR date does not match expected").toBe(iirm4186_activities.rfpDetailsEntry.targetQcrDate);
        expect(rfpdeData.rfpDetailsEntryRemarks, "RFP Details Entry: Remarks do not match expected").toBe(iirm4186_activities.rfpDetailsEntry.rfpDetailsEntryRemarks);
        for (let index = 0; index < rfpdeData.documentType.length; index++) {
            expect(rfpdeData.documentType[index], `RFP Details Entry: Document type at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.documentType[index]);
        }
        for (let index = 0; index < rfpdeData.filename.length; index++) {
            expect(rfpdeData.filename[index], `RFP Details Entry: Filename at index ${index} does not match expected`).toBe(iirm4186_activities.rfpDetailsEntry.file[index].split('/').pop());
        }

        await navBar.logout();
    })
});