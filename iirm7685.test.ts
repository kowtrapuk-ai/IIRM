import { test, expect } from '../../../fixtures/iwork';
import qa from "../../../env/qa.json";
import { TIMEOUTS } from '../../../env/timeouts';
import { Dialog } from '../../../appcomponents/Dialog.component';
import { loadEnvConfig, Utils } from '../../../utils/utils';
import { IBP } from '../../../pages/ibp/IBP';
import { SnackBar } from '../../../appcomponents/SnackBar.component';
//for generating random data 
import { faker } from '@faker-js/faker';
//For handling date formats and timestamps in the inception Table
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import dayjs from 'dayjs';
import path from 'path';
import fs from "fs";
import { addDaysToCurrentDate, getFutureDate } from '../../../utils/dateutils';
import { getCoversConfig } from '../../../utils/apiutils';

const config = loadEnvConfig(process.env.ENV || 'qa');
const baseURL: string = config.API.BASE_URL;
const authService: string = config.API.SERVICES.AUTH_SERVICE;
const opportunityService: string = config.API.SERVICES.OPPORTUNITY_SERVICE;
const orgService: string = config.API.SERVICES.ORG_SERVICE;
const randomNum: number = Utils.getRandomNumber(1000, 9999);

const companyContactOpportunityData: any = Utils.loadTestData("testdata/ui/functionaltests/iirm7685/companyContactOpportunity.json");

//Test data for opportunity activities from iirm7640
const bdPlanningData: any = Utils.loadTestData("testdata/api/iirm7640/bdPlanning.json");
const kdmMeetingData: any = Utils.loadTestData("testdata/api/iirm7640/kdmMeeting.json");
const mandateDetailsEntryData: any = Utils.loadTestData("testdata/api/iirm7640/mandateDetailsEntry.json");
const rfpDataCollectionData: any = Utils.loadTestData("testdata/api/iirm7640/rfpDataCollection.json");
const rfpDetailsEntryData: any = Utils.loadTestData("testdata/api/iirm7640/rfpDetailsEntry.json");
const isgPlanningData: any = Utils.loadTestData("testdata/api/iirm7640/isgPlanningData.json");
const versionData: any = Utils.loadTestData("testdata/api/iirm7640/version.json");
const brokingSlipGenerationData: any = Utils.loadTestData("testdata/api/iirm7640/brokingSlipGeneration.json");
const saveQuoteData: any = Utils.loadTestData("testdata/api/iirm7640/saveQuote.json");
const qcrGenerationData: any = Utils.loadTestData("testdata/api/iirm7640/qcrGeneration.json");
const meetingForFinalNegotiationData: any = Utils.loadTestData("testdata/api/iirm7640/meetingForFinalNegotiation.json");
const placementSlipGenerationData: any = Utils.loadTestData("testdata/api/iirm7640/placementSlipGeneration.json");

const gmcCoverData: any = Utils.loadTestData("testdata/api/iirm7640/gmc_covers.json");

const xlsx = require('xlsx');

const bdActivitiesOwnerId: number = 1332; // Ajay, Hyderabad
const closedStatusId: number = 4502; // Closed
const approvedStatusId: number = 4627 // Approved
const isgOwnerId: number = 5963; // Akhila, Delhi
const gmc: number = 3202; // Group Mediclaim Policy

const policyTypeId: number = gmc;
const coverData: any = gmcCoverData;

let policyConfigurationData2ApproveUser: string = "";
let activatePolicyUser: string = "";
let inceptionUser: string = "";

const companyName: string = companyContactOpportunityData.company.companyName + (randomNum ? `_${randomNum}` : '');
const activityID: number = 4;

const policyConfigurationData1: any = Utils.loadTestData("testdata/ui/functionaltests/iirm7685/iirm7685_policyConfiguration1.json");
const inceptionUploadData: any = Utils.loadTestData("testdata/ui/functionaltests/iirm7685/iirm7685_inception.json");

//Run this script using microsoft edge browser   
const policyType: string = policyConfigurationData1.policyConfiguration.policyType;

let { policyConfiguration } = policyConfigurationData1;
const { inceptionDetails } = inceptionUploadData;

let expectedInceptionTableFileName: string;

let recordCount: number = 1;

dayjs.extend(customParseFormat);

// 1. Generate a valid effective date → DD/MM/YYYY

export function getValidEffectiveDateWithFaker(format: string): string {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    const randomDate = faker.date.between({ from: today, to: maxDate });
    // MUST be DD-MM-YYYY → never use YYYY-MM-DD here
    return dayjs(randomDate).format(format);
}


test.describe('ConstraintsCombinations: Verify employer contribution and custom declaration on Base policy enroll for PerFamily contribution type', { tag: '@ policyConfiguration,@iirm7685' }, () => {

    test.beforeAll('Creating company contact and opportunity via API', async ({ request }) => {

        const loginResponse: any = await (await request.post(`${baseURL}${authService}/login`, {
            data: {
                userName: config.LOGIN.USERNAME,
                password: config.LOGIN.PASSWORD
            }
        })).json();
        const authenticationToken: string = loginResponse.data.accessToken.accessToken;

        // CREATE COMPANY, COMPANY CONTACT AND OPPORTUNITY
        companyContactOpportunityData.company.companyName = companyName;
        companyContactOpportunityData.opportunity.expiryDate = addDaysToCurrentDate(100, "YYYY-MM-DD");
        companyContactOpportunityData.opportunity.policyTypeLid = policyTypeId;
        const companyCreationResponse = await (await request.post(`${baseURL}${orgService}/company/company-opportunity-create`,
            {
                headers: {
                    authorization: `Bearer ${authenticationToken}`
                },
                data: companyContactOpportunityData
            }
        )).json();

        const companyId: string = String(companyCreationResponse.data.companyId);
        const contactId: string = String(companyCreationResponse.data.contactIds[0]);
        const opportunityId: string = String(companyCreationResponse.data.opportunityId);

        // After companyId is set

        fs.writeFileSync('testdata/ui/functionaltests/iirm7685/companyData.json', JSON.stringify({ companyName: companyName, companyId: companyId }, null, 2));

        // SELECT ASSIGNEE FOR BD ACTIVITIES
        await (await request.post(`${baseURL}${opportunityService}/opportunity/assign-stage-owner`,
            {
                headers: {
                    authorization: `Bearer ${authenticationToken}`
                },
                data: {
                    "opportunityId": companyCreationResponse.data.opportunityId,
                    "ownerId": bdActivitiesOwnerId,
                    "roleKey": "ROLE_BD_EXECUTIVE"
                }
            }
        )).json();

        // COMPLETE BD PLANNING
        const activityIds: Map<string, number> = await getActivityIds(Number(opportunityId), authenticationToken);
        bdPlanningData.opportunityActivities[0].dueDate = addDaysToCurrentDate(5, "YYYY-MM-DD");
        bdPlanningData.opportunityActivities[1].dueDate = addDaysToCurrentDate(10, "YYYY-MM-DD");
        bdPlanningData.opportunityActivities[2].dueDate = addDaysToCurrentDate(15, "YYYY-MM-DD");
        bdPlanningData.opportunityActivities[3].dueDate = addDaysToCurrentDate(20, "YYYY-MM-DD");
        bdPlanningData.opportunityActivities[4].dueDate = addDaysToCurrentDate(25, "YYYY-MM-DD");
        bdPlanningData.opportunityActivities[0].opportunityActivityId = activityIds.get("Data Validation");
        bdPlanningData.opportunityActivities[1].opportunityActivityId = activityIds.get("KDM Meeting");
        bdPlanningData.opportunityActivities[2].opportunityActivityId = activityIds.get("Mandate Details Entry");
        bdPlanningData.opportunityActivities[3].opportunityActivityId = activityIds.get("RFP Data Collection");
        bdPlanningData.opportunityActivities[4].opportunityActivityId = activityIds.get("RFP Details Entry");
        await (await request.put(`${baseURL}${opportunityService}/opportunity/activity`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: bdPlanningData
        })).json();

        // COMPLETE DATA VALIDATION
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: {
                "opportunityActivityId": activityIds.get("Data Validation"),
                "remarks": {},
                "documents": [],
                "statusLid": closedStatusId
            }
        })).json();

        // COMPLETE KDM MEETING
        kdmMeetingData.opportunityActivityId = activityIds.get("KDM Meeting");
        kdmMeetingData.kdmMeetingFormFields.meetingDate = `${addDaysToCurrentDate(0, "YYYY-MM-DD")}T09:10:25.018Z`;
        kdmMeetingData.participants.companyContactPerson[0] = Number(contactId);
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: kdmMeetingData
        })).json();

        // COMPLETE MANDATE DETAILS ENTRY
        mandateDetailsEntryData.opportunityActivityId = activityIds.get("Mandate Details Entry");
        mandateDetailsEntryData.mandateDetailsFromFields.mandateDetailsContacts[0] = Number(contactId);
        mandateDetailsEntryData.mandateDetailsFromFields.validFrom = addDaysToCurrentDate(0, "YYYY-MM-DD");
        mandateDetailsEntryData.mandateDetailsFromFields.validTo = addDaysToCurrentDate(30, "YYYY-MM-DD");
        mandateDetailsEntryData.mandateDetailsFromFields.issuedOn = addDaysToCurrentDate(0, "YYYY-MM-DD");
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: mandateDetailsEntryData
        })).json();

        // COMPLETE RFP DATA COLLECTION
        rfpDataCollectionData.opportunityActivityId = activityIds.get("RFP Data Collection");
        rfpDataCollectionData.coversConfig = await getCoversConfig(request, Number(opportunityId), activityID, coverData, authenticationToken);
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: rfpDataCollectionData
        })).json();

        // COMPLETE RFP DETAILS ENTRY
        rfpDetailsEntryData.opportunityActivityId = activityIds.get("RFP Details Entry");
        rfpDetailsEntryData.clientContactDetails.contactId = Number(contactId);
        rfpDetailsEntryData.targetQcrDate.targetQcrDate = addDaysToCurrentDate(0, "YYYY-MM-DD");
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: rfpDetailsEntryData
        })).json();

        // APPROVE
        rfpDetailsEntryData.statusLid = approvedStatusId;
        await (await request.put(`${baseURL}${opportunityService}/opportunity/${activityIds.get("RFP Details Entry")}/activity-approval`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: rfpDetailsEntryData
        })).json();

        // SELECT ASSIGNEE FOR ISG ACTIVITIES
        await (await request.post(`${baseURL}${opportunityService}/opportunity/assign-stage-owner`,
            {
                headers: {
                    authorization: `Bearer ${authenticationToken}`
                },
                data: {
                    "opportunityId": opportunityId,
                    "ownerId": isgOwnerId,
                    "roleKey": "ROLE_ISG_EXECUTIVE"
                }
            }
        )).json();

        // COMPLETE ISG PLANNING
        isgPlanningData.opportunityActivities[0].opportunityActivityId = activityIds.get("Broking Slip Generation");
        isgPlanningData.opportunityActivities[1].opportunityActivityId = activityIds.get("Enter Quote");
        isgPlanningData.opportunityActivities[2].opportunityActivityId = activityIds.get("QCR Generation");
        isgPlanningData.opportunityActivities[3].opportunityActivityId = activityIds.get("Meeting for Final Negotiation");
        isgPlanningData.opportunityActivities[4].opportunityActivityId = activityIds.get("Placement Slip Generation");
        isgPlanningData.opportunityActivities[5].opportunityActivityId = activityIds.get("Premium Calculation");
        isgPlanningData.opportunityActivities[6].opportunityActivityId = activityIds.get("Held Cover Note");
        isgPlanningData.opportunityActivities[7].opportunityActivityId = activityIds.get("Policy Hard Copy Receipt");
        isgPlanningData.opportunityActivities[8].opportunityActivityId = activityIds.get("Policy Docket");
        isgPlanningData.opportunityActivities[9].opportunityActivityId = activityIds.get("Hand over Meet");
        isgPlanningData.opportunityActivities[10].opportunityActivityId = activityIds.get("Policy Confirmation");
        isgPlanningData.opportunityActivities[0].dueDate = addDaysToCurrentDate(30, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[1].dueDate = addDaysToCurrentDate(35, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[2].dueDate = addDaysToCurrentDate(40, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[3].dueDate = addDaysToCurrentDate(45, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[4].dueDate = addDaysToCurrentDate(50, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[5].dueDate = addDaysToCurrentDate(55, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[6].dueDate = addDaysToCurrentDate(60, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[7].dueDate = addDaysToCurrentDate(65, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[8].dueDate = addDaysToCurrentDate(70, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[9].dueDate = addDaysToCurrentDate(75, "YYYY-MM-DD");
        isgPlanningData.opportunityActivities[10].dueDate = addDaysToCurrentDate(80, "YYYY-MM-DD");
        const isgPlanningResponse = await (await request.put(`${baseURL}${opportunityService}/opportunity/activity`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: isgPlanningData
        })).json();

        // SAVE VERSION - BROKING SLIP GENERATION
        versionData.opportunityActivityId = activityIds.get("Broking Slip Generation");
        versionData.brokingSlipVersionDetails.formData.versionDetails.policyFrom = addDaysToCurrentDate(0, "YYYY-MM-DD");
        versionData.brokingSlipVersionDetails.formData.versionDetails.policyTo = addDaysToCurrentDate(100, "YYYY-MM-DD");
        versionData.brokingSlipVersionDetails.formData.versionDetails.renewalDate = addDaysToCurrentDate(100, "YYYY-MM-DD");
        versionData.brokingSlipVersionDetails.formData.versionDetails.quoteReceiptTimeline = addDaysToCurrentDate(50, "YYYY-MM-DD");
        versionData.brokingSlipVersionDetails.formData.coversConfig = await getCoversConfig(request, Number(opportunityId), activityID, coverData, authenticationToken);
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: versionData
        })).json();

        // SUBMIT FOR APPROVAL - BROKING SLIP GENERATION
        brokingSlipGenerationData.opportunityActivityId = activityIds.get("Broking Slip Generation");
        await (await request.put(`${baseURL}${opportunityService}/opportunity/activities/broking-slip/${activityIds.get("Broking Slip Generation")}`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: brokingSlipGenerationData
        })).json();

        // APPROVE - BROKING SLIP GENERATION
        brokingSlipGenerationData.statusLid = approvedStatusId;
        await (await request.put(`${baseURL}${opportunityService}/opportunity/${activityIds.get("Broking Slip Generation")}/activity-approval`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: brokingSlipGenerationData
        })).json();

        // GET VERSION ID
        const versionId: number = (await (await request.get(`${baseURL}${opportunityService}/opportunity/activities/broking-slip/versions/${opportunityId}`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            }
        })).json()).data[0].id;

        // SAVE QUOTE
        saveQuoteData.opportunityId = opportunityId;
        saveQuoteData.opportunityActivityId = activityIds.get("Enter Quote");
        saveQuoteData.brokingSlipId = versionId;
        saveQuoteData.quoteDetails.quoteReceivedOn = addDaysToCurrentDate(66, "YYYY-MM-DD");
        saveQuoteData.covers = await getCoversConfig(request, Number(opportunityId), activityID, coverData, authenticationToken);
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: saveQuoteData
        })).json();

        // COMPLETE ENTER QUOTE
        await (await request.put(`${baseURL}${opportunityService}/opportunity/quote/activity/${activityIds.get("Enter Quote")}`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: {
                "quoteStatusLid": closedStatusId,
                "remarksSection": {},
                "mainDocuments": []
            }
        })).json();

        // COMPLETE QCR GENERATION
        qcrGenerationData.opportunityActivityId = activityIds.get("QCR Generation");
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: qcrGenerationData
        })).json();

        // GET QUOTE ID
        const quoteId: number = (await (await request.get(`https://api.dev.indiainsure.com/iirm/opportunity-service/opportunity/quote/broking-slip/${versionId}`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            }
        })).json()).data.quotes[0].id;

        // COMPLETE MEETING FOR FINAL NEGOTIATION
        meetingForFinalNegotiationData.opportunityActivityId = activityIds.get("Meeting for Final Negotiation");
        meetingForFinalNegotiationData.meetingDetails.meetingDate = `${addDaysToCurrentDate(0, "YYYY-MM-DD")}T04:30:52.665Z`;
        meetingForFinalNegotiationData.participants.companyContactPerson[0] = Number(contactId);
        meetingForFinalNegotiationData.selectFinalisedQuote.finalizedVersionId = versionId;
        meetingForFinalNegotiationData.selectFinalisedQuote.finalizedQuoteId = quoteId;
        meetingForFinalNegotiationData.selectFinalisedQuote.quoteReceivedOn = addDaysToCurrentDate(66, "YYYY-MM-DD");
        meetingForFinalNegotiationData.covers = await getCoversConfig(request, Number(opportunityId), activityID, coverData, authenticationToken);
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: meetingForFinalNegotiationData
        })).json();

        // SUBMMIT FOR APPROVAL - PLACEMENT SLIP GENERATION
        placementSlipGenerationData.opportunityActivityId = activityIds.get("Placement Slip Generation");
        placementSlipGenerationData.policyDetails.policyFromDate = addDaysToCurrentDate(0, "YYYY-MM-DD");
        placementSlipGenerationData.policyDetails.policyToDate = addDaysToCurrentDate(30, "YYYY-MM-DD");
        placementSlipGenerationData.policyDetails.placementSlipDate = addDaysToCurrentDate(50, "YYYY-MM-DD");
        placementSlipGenerationData.coverDetails = await getCoversConfig(request, Number(opportunityId), activityID, coverData, authenticationToken);
        await (await request.post(`${baseURL}${opportunityService}/opportunity/activity-meta`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: placementSlipGenerationData
        })).json();

        // APPROVE - PLACEMENT SLIP GENERATION
        placementSlipGenerationData.statusLid = approvedStatusId;
        await (await request.put(`${baseURL}${opportunityService}/opportunity/${activityIds.get("Placement Slip Generation")}/activity-approval`, {
            headers: {
                authorization: `Bearer ${authenticationToken}`
            },
            data: placementSlipGenerationData
        })).json();

        // UTILITY FUNCTIONS

        /**
         * Retrieves activity IDs and their corresponding opportunity activity IDs for a given opportunity.
         * 
         * @param opportunityId - The unique identifier of the opportunity
         * @param authenticationToken - The bearer token for API authentication
         * @returns A Promise that resolves to either a Map where keys are activity IDs and values are opportunity activity IDs,
         *          or the error response body if the request fails
         * @throws May throw if the request fails in an unexpected way
         * 
         * @remarks
         * This function makes an API call to fetch opportunity activities and processes the response to extract
         * activity mappings from both BD and ISG sections. The function navigates through nested data structures
         * containing sections, stages, and activities.
         */
        async function getActivityIds(opportunityId: number, authenticationToken: string): Promise<Map<string, number> | any> {
            const opportunityResponse = await request.get(`${baseURL}${opportunityService}/opportunity/activities/${opportunityId}`, {
                headers: {
                    authorization: `Bearer ${authenticationToken}`
                },
            });

            if (opportunityResponse.ok()) {
                const responseBody = await opportunityResponse.json();
                const activitiesMap = new Map<number, number>();

                // Navigate through BD and ISG sections safely
                const data = responseBody?.data?.data;
                if (data) {
                    for (const sectionKey of Object.keys(data)) {
                        const stages = data[sectionKey];
                        for (const stage of stages) {
                            const activities = stage.activities || [];
                            for (const activity of activities) {
                                activitiesMap.set(activity.activityName, activity.opportunityActivityId);
                            }
                        }
                    }
                }

                return activitiesMap;
            } else {
                return await opportunityResponse.json();
            }
        }




    });


    test('1. ConstraintsCombinations: Verify employer contribution and custom declaration on Base policy enroll for PerFamily contribution type with single SI Amount constraint-1', async ({ createInceptionPage, loginPage, managePoliciesPage, navBar, page, policyConfigurePage, policyDetailsPage }) => {
        // For Comparing values from policy configuration json
        const premiumAmount: number = Number(Utils.formatToCountryCurrency(policyConfiguration.policyComponent.basePolicy.SIAmounts[0]));
        const premiumPerFamilyAmount: number = Number(Utils.formatToCountryCurrency(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution)) + Number(Utils.formatToCountryCurrency(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution));
        const companyContributionAmount: number = Number(Utils.formatToCountryCurrency(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution));
        const employeeContributionAmount: number = Number(Utils.formatToCountryCurrency(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution));

        //Credentials for IBP Login
        const companyId: string = (Utils.loadTestData('testdata/ui/functionaltests/iirm7685/companyData.json')).companyId;
        const employId: string = `EMPID${faker.number.int({ min: 1000, max: 9999 })}`;
        const companyId_empId: string = `${companyId}-${employId}`;

        const compulsoryBenefitsDescription: string = "These benefits allow you to structure and modify compulsory benefits components as per your requirements.";

        const gmcTitle: string = "GMC (Group Mediclaim)";
        const gmcPolicyDescription: string = "A Group Mediclaim health insurance policy covering hospitalization expenses for employees and dependents. Provides cashless treatment at network hospitals. Typically includes standard room rent limits, co-pay clauses, and sum insured based on company policy."

        //Texts for Custom Declaration
        const termsLabel: string = 'I consent to premium deductions from my salary in 16 installments. I have read and understood the above declaration and accept the terms and conditions of the selected insurance plans.';
        const customDisclaimerLabel: string = 'Please review them before submitting your enrollment.';

        //For comparing the date value in GMC Active Card
        const date = new Date();
        date.setUTCMonth(date.getUTCMonth() + 1);

        const gmcActiveCardDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;

        //  Wrap in array if it's a single object
        const dialog = new Dialog(page);

        // const ibpPages = new IBP(page, 'Enrolment window open for Group Medical Cover');
        const ibpPages = new IBP(page);
        const ibpLoginPage = ibpPages.getLogin();

        const ibpDashBoardPage = ibpPages.getDashboard();
        const ibpInsurancePage = ibpPages.getMyInsurancePage();
        const ibpEnrollmentPage = ibpPages.getEnrollmentPage();

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
        await policyConfigurePage.configurePolicyComponent(policyConfiguration.policyComponent);
        await policyConfigurePage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);


        // Configure Policy Template 
        const policyTemplate = policyConfiguration.policyTemplate[0];
        await policyConfigurePage.basePolicyTemplate.midYearEnrollmentAllowed(policyTemplate.label).set(policyTemplate.midYearEnrollmentAllowed);
        await policyConfigurePage.basePolicyTemplate.sumInsuredVisibleToEmployee(policyTemplate.label).set(policyTemplate.sumInsuredVisibleToEmployee);
        await policyConfigurePage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        // Configure Policy Relationships with cross-parent restrictions
        await policyConfigurePage.configurePolicyRelationships(policyConfiguration.policyRelationships);
        await policyConfigurePage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        // Configure Policy Parameters
        await policyConfigurePage.configurePolicyParamenters(policyConfiguration.policyParameters);
        await policyConfigurePage.next.click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        // Configure Policy Choices using optimized method
        await policyConfigurePage.configurePolicyChoices(policyConfiguration.policyChoices);
        await policyConfigurePage.next.click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        // Configure Policy Constraints.
        await policyConfigurePage.configureConstraints(policyConfiguration.constraints);

        // Verify specific IIRM-7685 requirement:Show Employer Contribution to Employee? is not set to "Yes"
        expect(await policyConfigurePage.constraints('Show Employer Contribution to Employee?').getValue(), 'Cross Parent Selection constraint is not disabled as per IIRM-7685 requirements').toBe('Yes');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        expect(await policyConfigurePage.isAlertVisible(), 'Alert is not visible after policy configuration submission').toBeTruthy();
        expect(await policyConfigurePage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy configuration has been sent for approval.');


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
        expect(await policyConfigurePage.isAlertVisible(), 'Alert is not visible after policy configuration submission').toBeTruthy();
        expect(await policyConfigurePage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy configuration has been approved. Please activate the policy.');

        await navBar.logout();

        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        //Submit for Approval and approving Policy details
        await managePoliciesPage.smartSearch().searchFor(companyName);
        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
        await policyDetailsPage.tabList.open('Policy details');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigurePage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigurePage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        //Clicking on Approve button in Policy details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve policy details');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigurePage.getAlertContent(), "The Policy details success alert got mismatched").toBe('Policy section approval updated successfully');

        //Submitting and Approving the cover details
        await policyDetailsPage.tabList.open('Cover details');
        await managePoliciesPage.button('Submit For Approval').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        expect(await policyConfigurePage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigurePage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        // Clicking on Approve button in Cover details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve covers');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigurePage.getAlertContent(), "The Approve covers success alert got mismatched").toBe('Policy section approval updated successfully');

        //Submitting and approving CD details
        await policyDetailsPage.tabList.open('CD details');
        await managePoliciesPage.button('Submit for Approval').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigurePage.isAlertVisible(), 'Alert is not visible after policy details submission').toBeTruthy();
        expect(await policyConfigurePage.getAlertContent(), 'Alert content is not displayed after submission').toContain('Policy section submitted successfully');

        //Clicking Approve on CD details tab
        await managePoliciesPage.button('Approve').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await dialog.getTitle(), "The dialog title got mismatched").toBe('Approve CD details');
        await dialog.button('Save').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigurePage.getAlertContent(), "The Approve covers success alert got mismatched").toBe('Policy section approval updated successfully');

        await navBar.logout();
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await managePoliciesPage.smartSearch().searchFor(companyName);

        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        // Activate the policy
        await managePoliciesPage.button('Activate policy').click();
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await policyConfigurePage.isAlertVisible(), 'Alert is not visible after activate policy').toBeTruthy();
        expect(await policyConfigurePage.getAlertContent(), 'Alert content is not displayed after activate policy').toContain('Policy activated successfully.');

        //Verifying all sections are approved
        await policyDetailsPage.tabList.open('Policy details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await policyDetailsPage.tabList.open('Cover details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await policyDetailsPage.tabList.open('CD details');
        expect(await managePoliciesPage.button('Approved').isdisabled(), "Policy details are not approved").toBeTruthy();

        await loginPage.open("/");
        await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
        await navBar.open("Manage Placements", "Manage Policies");
        await managePoliciesPage.smartSearch().searchFor(companyName);

        await managePoliciesPage.table().click_on_old('Policy type', policyType);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        // Navigate to Create Inception page
        await policyDetailsPage.quickActionsCard.click('Inception data upload');

        // STEP 1: Inception Request Received
        const step1Data = inceptionDetails.inceptionRequestReceived;
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        expect(await createInceptionPage.getCurrentStepTitle(), 'Create Inception page is not load with first step title').toBe('Inception Request Received');
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

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

        // Download and get file path
        const downloadDir = path.resolve("testdata/ui/functionaltests/iirm7685");
        const inceptionFilePath = await createInceptionPage.downloadTemplateFile(downloadDir);
        const inceptionFile = path.basename(inceptionFilePath);


        const workbook = xlsx.readFile(inceptionFilePath);
        const sheetName = workbook.SheetNames[0];
        let rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Keep 1 row only
        const templateRow = rows[0];
        rows = [templateRow];

        const fullName = faker.person.firstName();
        const dateOfBirth = faker.date.birthdate({ min: 1980, max: 1999, mode: 'year' }).toISOString().split('T')[0]; // YYYY-MM-DD
        const gender = faker.person.sex() === 'male' ? 'Male' : 'Female';
        const email = faker.internet.email().split('@')[0] + '@mailinator.com';
        const mobileNumber = faker.string.numeric(10);
        const generatedEffectiveDate = getValidEffectiveDateWithFaker('YYYY-MM-DD');

        rows[0]['Intake Type'] = 'ADDITION';
        rows[0]['Employee ID'] = employId;
        rows[0]['Full Name'] = fullName;
        rows[0]['Date of Birth'] = dateOfBirth; // Convert to ISO format
        rows[0]['Gender'] = gender;
        rows[0]['email'] = email;
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

        await Promise.all([createInceptionPage.documentUpload.set(inceptionFilePath)]);

        expect(await createInceptionPage.isAlertVisible(), 'Alert is not appeared after uploading file').toBeTruthy();
        expect(await createInceptionPage.getAlertContent(), 'Upload alert message').toContain('File uploaded successfully.');
        await toastMessage.close.click();
        expect(await toastMessage.close.isvisible(), 'Toast message is still visible').toBeFalsy();
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

        // Wait for data processing to complete
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
        await ibpLoginPage.login(qa.IBP.BASE_URL, companyId_empId, employId);

        expect(ibpDashBoardPage.welcomeUserName.isVisible(), "Login failed").toBeTruthy();
        expect(await ibpLoginPage.isAlertVisible(), "Login success alert is not visible").toBeTruthy();
        expect(await ibpLoginPage.getAlertContent(), "Login success alert content is not correct").toContain('Logged in successfully');

        expect(ibpDashBoardPage.welcomeUserName, "User is not login with correct credentials").toContainText(fullName);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(await ibpDashBoardPage.enrollMentWindow.button('Enroll Now').isvisible(), "Enroll now button is bot visible").toBeTruthy();

        await ibpDashBoardPage.enrollMentWindow.button('Enroll Now').click();

        expect((await ibpInsurancePage.getCard(page, 'Compulsory Benefits', 0)).isVisible(), "The compulsory benefits card is not visible").toBeTruthy();
        expect(await ibpInsurancePage.getDescription(page, 'Compulsory Benefits', 0), "The company description is not visible").toBe(compulsoryBenefitsDescription);
        await ibpInsurancePage.clickExpandIcon('Compulsory Benefits');


        // Get description text using page object method
        const descriptionText = await ibpInsurancePage.getDescription(page, gmcTitle, 0);
        expect(descriptionText, `Description for card  mismatched`).toBe(gmcPolicyDescription);

        expect(await ibpDashBoardPage.topNavBar.myInsurance.isVisible(), "The dashboard link is not visible").toBeTruthy();

        await ibpInsurancePage.clickEnrollNowInCard(gmcTitle, 0);
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        const employeeName = await ibpEnrollmentPage.getEmployeeDetails('Name');
        const employeeId = await ibpEnrollmentPage.getEmployeeDetails('Employee ID');
        const employeeEmail = await ibpEnrollmentPage.getEmployeeDetails('Email');
        const employeePhone = await ibpEnrollmentPage.getEmployeeDetails('Phone');
        const employeeDesignation = await ibpEnrollmentPage.getEmployeeDetails('Designation');
        const employeedOB = await ibpEnrollmentPage.getEmployeeDetails('Date of Birth');
        const employeedOBIso = getFutureDate(0, employeedOB, 'DD/MM/YYYY', 'YYYY-MM-DD');
        const employeeGender = await ibpEnrollmentPage.getEmployeeDetails('Gender');
        const employeeEffectiveDate = await ibpEnrollmentPage.getEmployeeDetails('Effective Date');

        const dateFormat = getFutureDate(0, generatedEffectiveDate, 'YYYY-MM-DD', 'DD/MM/YYYY');

        expect(employeeName, "The full name got mismatched").toBe(fullName);
        expect(employeeId, "The employee ID got mismatched").toBe(employId);
        expect(employeeEmail, "The email got mismatched").toBe(email);
        expect(employeePhone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(employeeDesignation, "The designation got mismatched").toBe('--');
        expect(employeedOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGender, "The gender got mismatched").toBe(gender);
        expect(employeeEffectiveDate, "The effective date got mismatched").toBe(dateFormat);

        expect(await ibpInsurancePage.button('Continue', 1).isdisabled(), "The continue button is not visible").toBeTruthy();


        // Assert the active icon
        expect(await ibpInsurancePage.activePolicyIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values

        const basePolicyPlanCard = await ibpEnrollmentPage.getPlanCard('Base Policy', 0);

        expect(await ibpEnrollmentPage.getPlanCard('Base Policy', 0), "The plan card title is not matched").toBe(policyConfiguration.policyComponent.basePolicy.displayLabel);

        await ibpEnrollmentPage.verifyPlanValues(basePolicyPlanCard, premiumAmount, premiumPerFamilyAmount, companyContributionAmount, employeeContributionAmount);

        // Expand Base Policy card
        await ibpInsurancePage.clickExpandIcon('Choose Your Plan');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        await ibpEnrollmentPage.validateExpandedBasePolicyValues(page, 'Base Policy');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(ibpInsurancePage.button('Continue', 0).isvisible, "The continue button is not visible").toBeTruthy();

        await ibpInsurancePage.clickExpandIcon('Base Policy');
        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "The cancel button is not visible").toBeTruthy();
        expect(await ibpInsurancePage.button('Continue', 0).isvisible(), "The continue button is not disabled").toBeTruthy();

        await ibpInsurancePage.button('Cancel', 0).click();
        await ibpEnrollmentPage.validateExpandedBasePolicyValues(page, 'Base Policy');

        //verifying right side card values

        const planSelected = Number(await ibpEnrollmentPage.getPlanSummaryDetails('Plan(s) selected'));
        const membersCovered = Number(await ibpEnrollmentPage.getPlanSummaryDetails('Members covered'));
        const totalPremium = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanSummaryDetails('Total premium')));
        const planCompanyContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanSummaryDetails('Company contribution')));
        const planYourContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanSummaryDetails('Your contribution')));

        expect(planSelected, "The plan selected got mismatched after continue").toBe(0);
        expect(membersCovered, "The members covered got mismatched after continue").toBe(1);
        expect(totalPremium, "The total premium got mismatched after continue").toBe(Number(Utils.formatToCountryCurrency("0")));
        expect(planCompanyContribution, "The company contribution got mismatched after continue").toBe(Number(Utils.formatToCountryCurrency("0")));
        expect(planYourContribution, "The employee contribution got mismatched after continue").toBe(Number(Utils.formatToCountryCurrency("0")));

        expect(ibpInsurancePage.button('Save & Exit', 0).isvisible(), "The save  and exit is not visible").toBeTruthy();
        expect(ibpInsurancePage.button('Continue', 0).isvisible(), "The continue button is not visible").toBeTruthy();

        await ibpInsurancePage.clickExpandIcon('Base policy');
        await ibpInsurancePage.button('Continue', 0).click();

        await ibpEnrollmentPage.validateAfterConfirmingPolicy(page, 'Base Policy', 'Enrolled', premiumAmount.toString(), companyContributionAmount.toString(), employeeContributionAmount.toString());

        await ibpEnrollmentPage.verifyPolicyCardAfterContinue(page, policyConfiguration);
        await ibpInsurancePage.clickExpandIcon('Base policy');
        await ibpInsurancePage.button('Continue', 1).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        const card = await ibpEnrollmentPage.getPlanCard('Base Policy');

        // Extract UI values
        const premium = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(card, 'Premium')));
        const companyContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(card, 'Company contribution')));
        const yourContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(card, 'Your contribution')));

        // Expected API values
        const expectedCompany = Number(Utils.formatToCountryCurrency(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].companyContribution));
        const expectedEmployee = Number(Utils.formatToCountryCurrency(policyConfiguration.policyChoices[0].availablePolicyChoices[0].configuration[0].employeeContribution));
        const expectedPremium = Number(Utils.formatToCountryCurrency(expectedCompany + expectedEmployee));

        // Assertions
        expect(premium, "Premium mismatch").toBe(expectedPremium);
        expect(companyContribution, "Company contribution mismatch").toBe(expectedCompany);
        expect(yourContribution, "Employee contribution mismatch").toBe(expectedEmployee);

        // Go to dashboard
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Get the Base Policy card
        const basePolicyCard = await ibpEnrollmentPage.getPlanCard('Base Policy');

        // Read values from UI using getPlanDetails 
        const sumInsured = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Sum Insured')));
        const basePolicyPremium = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Premium')));
        const basePolicyCompanyContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Company contribution')));
        const basePolicyYourContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Your contribution')));


        // Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(premiumAmount);
        expect(basePolicyPremium, "Premium mismatch").toBe(companyContributionAmount + employeeContributionAmount);
        expect(basePolicyCompanyContribution, "Company contribution mismatch").toBe(employeeContributionAmount);
        expect(basePolicyYourContribution, "Employee contribution mismatch").toBe(companyContributionAmount);

        // Validate View Enrollment Summary  
        expect(await ibpDashBoardPage.topNavBar.dashboard.isEnabled(), "The dashboard link is not visible").toBeTruthy();

        // Verifying cancel button functionality on view enrollment summary
        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "Cancel button not visible").toBeTruthy();
        await ibpInsurancePage.button('Cancel', 0).click();

        expect(await ibpInsurancePage.compulsoryBenefits.expandIcon.isVisible(), "Compulsory benefits card not visible after clicking cancel button").toBeTruthy();

        await ibpInsurancePage.compulsoryBenefits.expandIcon.click();
        await ibpInsurancePage.clickEnrollNowInCard(gmcTitle, 0);

        const name = await ibpEnrollmentPage.getEmployeeDetails('Name');
        const empId = await ibpEnrollmentPage.getEmployeeDetails('Employee ID');
        const Email = await ibpEnrollmentPage.getEmployeeDetails('Email');
        const phone = await ibpEnrollmentPage.getEmployeeDetails('Phone');
        const designation = await ibpEnrollmentPage.getEmployeeDetails('Designation');
        const dOB = await ibpEnrollmentPage.getEmployeeDetails('Date of Birth');
        const dOBIso = getFutureDate(0, dOB, 'DD/MM/YYYY', 'YYYY-MM-DD');
        const employeeGenderValue = await ibpEnrollmentPage.getEmployeeDetails('Gender');
        const effectiveDate = await ibpEnrollmentPage.getEmployeeDetails('Effective Date');


        expect(name, "The full name got mismatched").toBe(fullName);
        expect(empId, "The employee ID got mismatched").toBe(employId);
        expect(Email, "The email got mismatched").toBe(email);
        expect(phone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(designation, "The designation got mismatched").toBe('--');
        expect(dOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGenderValue, "The gender got mismatched").toBe(gender);
        expect(effectiveDate, "The effective date got mismatched").toBe(dateFormat);

        expect(await ibpInsurancePage.button('Continue', 1).isdisabled(), "The continue button is not visible").toBeTruthy();

        // Assert the active icon
        expect(await ibpInsurancePage.activePolicyIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpEnrollmentPage.verifyPlanValues(basePolicyPlanCard, premiumAmount, premiumPerFamilyAmount, companyContributionAmount, employeeContributionAmount);
        await ibpInsurancePage.button('Continue', 0).click();
        await ibpInsurancePage.button('Continue', 0).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Extract values from the UI
        const sumInsuredValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Sum Insured')));
        const premiumValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Premium')));
        const companyContributionValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Company contribution')));
        const employeeContributionValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Your contribution')));

        //  Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(sumInsuredValue);
        expect(premiumAmount, "Premium mismatch").toBe(premiumValue);
        expect(companyContributionAmount, "Company contribution mismatch").toBe(companyContributionValue);
        expect(employeeContributionAmount, "Employee contribution mismatch").toBe(employeeContributionValue);

        // Verify dashboard visibility
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Read values from UI using getValue()
        const cancelSumInsured = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Sum Insured')));
        const cancelBasePolicyPremium = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Premium')));
        const cancelBasePolicyCompanyContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Company contribution')));
        const cancelBasePolicyYourContribution = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Your contribution')));

        // Expected values from policyConfiguration
        const expectedPolicySumInsuredValue = premiumAmount;
        const expectedBasePolicyPremiumValue = companyContributionAmount + employeeContributionAmount;
        const expectedPolicyCompanyContributionValue = companyContributionAmount;
        const expectedPolicyYourContributionValue = employeeContributionAmount;

        // Assertions
        expect(cancelSumInsured, "Sum Insured mismatch").toBe(expectedPolicySumInsuredValue);
        expect(cancelBasePolicyPremium, "Premium mismatch").toBe(expectedBasePolicyPremiumValue);
        expect(cancelBasePolicyCompanyContribution, "Company contribution mismatch").toBe(expectedPolicyCompanyContributionValue);
        expect(cancelBasePolicyYourContribution, "Employee contribution mismatch").toBe(expectedPolicyYourContributionValue);

        // Step 6: Validate Members Covered section  
        expect(await ibpDashBoardPage.topNavBar.dashboard.isEnabled(), "The dashboard link is not enabled").toBeTruthy();
        /*Verifying Back Button functionality on view enrollment summary*/

        expect(await ibpInsurancePage.button('Back', 0).isvisible(), "Back button not visible").toBeTruthy();
        await ibpInsurancePage.button('Back', 0).click();

        expect(name, "The full name got mismatched").toBe(fullName);
        expect(empId, "The employee ID got mismatched").toBe(employId);
        expect(Email, "The email got mismatched").toBe(email);
        expect(phone, "The phone got mismatched").toBe(mobileNumber.toString());
        expect(designation, "The designation got mismatched").toBe('--');
        expect(dOBIso, "The date of birth got mismatched").toBe(dateOfBirth);
        expect(employeeGenderValue, "The gender got mismatched").toBe(gender);
        expect(effectiveDate, "The effective date got mismatched").toBe(dateFormat);

        // Assert the active icon
        expect(await ibpInsurancePage.activePolicyIcon.isVisible(), "The active icon is visible on the card").toBeTruthy();

        // Verify plan values
        await ibpEnrollmentPage.verifyPlanValues(basePolicyPlanCard, premiumAmount, premiumPerFamilyAmount, companyContributionAmount, employeeContributionAmount);
        await ibpInsurancePage.button('Continue', 0).click();

        //Continue button gets closed so only one button is available.
        await ibpInsurancePage.button('Continue', 0).click();

        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Extract values from the UI
        const backSumInsuredValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Sum Insured')));
        const backPremiumValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Premium')));
        const backCompanyContributionValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Company contribution')));
        const backEmployeeContributionValue = Number(Utils.formatToCountryCurrency(await ibpEnrollmentPage.getPlanDetails(basePolicyCard, 'Your contribution')));

        // Assertions
        expect(sumInsured, "Sum Insured mismatch").toBe(backSumInsuredValue);
        expect(premiumValue, "Premium mismatch").toBe(backPremiumValue);
        expect(companyContributionValue, "Company contribution mismatch").toBe(backCompanyContributionValue);
        expect(employeeContributionValue, "Employee contribution mismatch").toBe(backEmployeeContributionValue);

        // Verify dashboard visibility
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "The dashboard link is not visible").toBeTruthy();

        // Assertions
        expect(backSumInsuredValue, "Sum Insured mismatch").toBe(expectedPolicySumInsuredValue);
        expect(backPremiumValue, "Premium mismatch").toBe(expectedBasePolicyPremiumValue);
        expect(backCompanyContributionValue, "Company contribution mismatch").toBe(expectedPolicyCompanyContributionValue);
        expect(backEmployeeContributionValue, "Employee contribution mismatch").toBe(expectedPolicyYourContributionValue);

        expect(ibpEnrollmentPage.checkBox(termsLabel).isvisible(), "Terms and conditions checkbox not visible").toBeTruthy();
        await ibpEnrollmentPage.checkBox(termsLabel).check();
        expect(ibpEnrollmentPage.checkBox(termsLabel).isChecked(), "Terms and conditions checkbox not checked").toBeTruthy();
        await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
        expect(await ibpEnrollmentPage.checkBox(customDisclaimerLabel).isvisible(), "Review sections checkbox is not visible").toBeTruthy();
        expect(await ibpEnrollmentPage.getDeclarationAndTermsLabel(1), "The custom disclaimer text got mismatched with the label").toBe(customDisclaimerLabel);
        expect(await ibpInsurancePage.button('Confirm Enrollment', 0).isdisabled(), "Confirm Enrollment button is disabled").toBeTruthy();

        await ibpEnrollmentPage.checkBox(customDisclaimerLabel).check();
        expect(ibpEnrollmentPage.checkBox(customDisclaimerLabel).isChecked(), "Review sections checkbox is not checked").toBeTruthy();

        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);


        expect(await ibpInsurancePage.button('Cancel', 0).isvisible(), "Cancel button not visible").toBeTruthy();
        expect(await ibpInsurancePage.button('Back', 0).isvisible(), "Back button is disabled").toBeTruthy();

        // Confirm Enrollment button should be disabled until both checkboxes are checked
        const bothChecked = await ibpEnrollmentPage.checkBox(termsLabel).isChecked() && await ibpEnrollmentPage.checkBox(customDisclaimerLabel).isChecked();

        if (bothChecked) {
            expect(await ibpInsurancePage.button('Confirm Enrollment', 0).isvisible(), "Confirm Enrollment button not visible").toBeTruthy();
        }

        await ibpInsurancePage.button('Confirm Enrollment', 0).click();
        await page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);

        expect(await ibpEnrollmentPage.thankYouText.isVisible(), "Thank you text is not visible after enrollment submission").toBeTruthy();
        expect(await ibpEnrollmentPage.thankYouText.innerText(), "Thank you text content is changed").toBe('Thank You! Your Enrollment Has Been Successfully Submitted A confirmation email with all your submitted details will be sent shortly to your registered email ID.');

        expect(await ibpEnrollmentPage.isAlertVisible(), 'Alert is not visible after confirming enrollemnt').toBeTruthy();
        expect(await ibpEnrollmentPage.getAlertContent(), 'Alert content is not displayed after confirming enrollment').toBe('Enrollment submitted successfully');
        await toastMessage.close.click();

        await page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        expect(await ibpEnrollmentPage.button('Go to Dashboard').isvisible(), "Go to Dashboard button is not visible").toBeTruthy();

        await ibpEnrollmentPage.button('Go to Dashboard').click();
        expect(await ibpDashBoardPage.topNavBar.dashboard.isVisible(), "Not Redirected to DashBoard").toBeTruthy();


        await ibpDashBoardPage.companyProvidedInsurances.scrollIntoViewIfNeeded();
        expect(await ibpDashBoardPage.getPolicyStatus('Group Mediclaim Policy'), "The active icon is not visible on the enrolled policy card").toBeTruthy();
        expect(await ibpDashBoardPage.companyProvidedInsurances.isVisible(), "Company Provided Insurances heading is not visible").toBeTruthy();

        // Verify Group Mediclaim Policy card is visible
        expect(ibpDashBoardPage.groupMediclaimCard.isVisible(), 'Group Mediclaim Policy card is not visible').toBeTruthy();
        // Verify Shield Background image (completed enrolment indicator)
        expect(ibpDashBoardPage.statusLogo.isVisible(), "Shield Background image not found for Group Mediclaim Policy card").toBeTruthy();

        // (Optional) Verify basic labels inside the card
        const gmcSumInsuredValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Sum Insured');
        const gmcBalanceValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Balance');
        const gmcCardDependentsValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Dependents');
        const gmcCardExpiredValue = await ibpDashBoardPage.getInsuranceCardValue('Group Mediclaim Policy', 'Expires');

        expect(ibpDashBoardPage.sumInsuredLabel.isVisible(), "Sum Insured label missing").toBeTruthy();
        expect(Number(gmcSumInsuredValue), "Sum insured value is not displaying correctly").toBe(premiumAmount);

        expect(ibpDashBoardPage.balanceLabel.isVisible(), "Policy Number label missing").toBeTruthy();
        expect(Number(gmcBalanceValue), "Policy Number value is not displaying correctly").toBe(premiumAmount);

        expect(ibpDashBoardPage.dependentsLabel.isVisible(), "Dependents label missing").toBeTruthy();
        expect(gmcCardDependentsValue, "Sum insured value is not displaying correctly").toBe("0");

        expect(ibpDashBoardPage.expiresLabel.isVisible(), "Expires label missing").toBeTruthy();
        expect(gmcCardExpiredValue, "Sum insured value is not displaying correctly").toBe(gmcActiveCardDate);

        expect(ibpDashBoardPage.starHealthLogo.isVisible(), "Star Health logo missing").toBeTruthy();

        await ibpDashBoardPage.topNavBar.myInsurance.click();
        await ibpInsurancePage.clickExpandIcon('Compulsory Benefits');

        expect(await ibpInsurancePage.enrolled.isVisible(), "Enrolled label is not visible").toBeTruthy();
        expect(await ibpInsurancePage.editEnroll.isVisible(), "Edit Enroll button is not visible").toBeTruthy();
        await ibpLoginPage.logout();

        //Login to IIRM to verify the inception details after completing enrollment in IBP

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

        await policyDetailsPage.quickActionsCard.click('Complete inception');
        await createInceptionPage.next.click();

        const step2Data = inceptionDetails.createInception;
        expect(await createInceptionPage.getCurrentStepTitle(), 'Step 2 is not load with Create Inception title').toBe('Create Inception');
        expect(await createInceptionPage.getStepIndicatorText(), 'Step indicator is not show step 2 of 6').toBe('Step 2 of 6');
        await createInceptionPage.inceptionCreatedDate.set(step2Data.inceptionCreatedDate);
        expect(await createInceptionPage.inceptionCreatedDate.getValue(), 'Inception Created Date is not saved correctly').toBe(step2Data.inceptionCreatedDate);
        await createInceptionPage.provisionalInceptionNumber.set(step2Data.provisionalInceptionNumber);
        expect(await createInceptionPage.provisionalInceptionNumber.getValue(), 'Provisional Inception Number is not saved correctly').toBe(step2Data.provisionalInceptionNumber);

        //To check total lives, employees, additions, deletions in inception summary after ibp login
        let totalLives = await createInceptionPage.inceptionSummary.get('Total lives');
        let totalEmployees = await createInceptionPage.inceptionSummary.get('Total employees');
        let additions = await createInceptionPage.inceptionSummary.get('Additions');
        let deletions = await createInceptionPage.inceptionSummary.get('Deletions');

        // Verify Inception Summary details
        expect(totalLives, 'Total lives in Inception Summary got mismatched').toBe("1");
        expect(totalEmployees, 'Total employees in Inception Summary got mismatched').toBe("1");
        expect(additions, 'Additions in Inception Summary got mismatched').toBe("1");
        expect(deletions, 'Deletions in Inception Summary got mismatched').toBe("0");
    });

});
