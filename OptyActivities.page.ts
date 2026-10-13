import { Locator, type Page } from '@playwright/test';
import { DateElement } from '../framework/date.element';
import { MultiSelectElement } from '../framework/multiselect.element';
import { ButtonElement } from '../framework/button.element';
import { Accordion } from '../framework/accordian.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { RadioElement } from '../framework/radio.element';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { FileUploadElement } from '../framework/fileupload.element';
import { AddCompanyPage } from './AddCompany.page';
import { AddSOPage } from './AddSO.page';
import { TimePickerElement } from '../framework/timepicker.element';
// import { BasicCoversPage } from './basicCovers.page';
import { RichTextElement } from '../framework/richtext.element';
import { UniversalForm, SectionConfig, FormData } from "../classes/commonServiceProvider";
import { SnackBar } from '../appcomponents/SnackBar.component';
import { Details } from '../appcomponents/Details.component';
import {
    PREFERRED_INSURERS_CONFIG,
    PREFERRED_TPAS_CONFIG,
    EXCLUDED_INSURERS_CONFIG,
    EXCLUDED_TPAS_CONFIG,
    CREDIT_SHARING_CONFIG,
    TAX_DETAILS_CONFIG,
    INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG,
    INSURER_SERVICE_LEVEL_AGREEMENT_CONFIG,
    VARIATION_ISSUES_FROM_QCR,
    PLG_INSTALLMENTS_CONFIG,
    PLG_INSURER_DETAILS_CONFIG,
    PLG_TPA_DETAILS_CONFIG

} from "../classes/commonServiceProvider";
import { DynamicTextElement } from '../framework/dynamicText.element';
import { DynamicSelectElement } from '../framework/dynamicSelect.element';
import { QuoteComparisonHeaderPage } from './QuoteComparision.page';
/**
 *
 * @param locator of particular element
 * @returns boolean value saying the given value got selected or not
 */
const isEnabledOrNot = async (opt: Locator): Promise<boolean> => {
    await opt.waitFor({ state: 'attached' });
    const tid = await opt.getAttribute('data-testid');
    if (!tid) return false;
    return tid.endsWith('-true');
};

/**
 * user defined method to return json in key value format
 * @param obj 
 * @returns obj in key value format
 */
const InspectCustom = Symbol.for('nodejs.util.inspect.custom');
const makeQuotes = (obj: Record<string, string>) => {
    const out: Record<string, string> = { ...obj } as any;
    (out as any)[InspectCustom] = () => {
        const esc = (s: string) => String(s).replace(/'/g, "\\'");
        const parts = Object.entries(obj).map(([k, v]) => `'${esc(k)}': '${esc(v)}'`);
        return `{ ${parts.join(', ')} }`;
    };
    return out;
};

type Stage = 'BD Planning' | 'Data Validation' | 'KDM Meeting' | 'Mandate Details Entry' | 'RFP Data Collection' | 'RFP Details Entry' | 'ISG Planning' | 'Broking Slip Generation' | 'Enter Quote' | 'QCR Generation' | 'Meeting for Final Negotiation' | 'Placement Slip Generation' | 'Premium Calculation' | 'Held Cover Note' | 'Policy Hard Copy Receipt' | 'Policy Docket' | 'Hand over Meet' | 'Policy Confirmation';
export class OptyActivities {

    readonly page: Page;
    readonly addCompanyPage: AddCompanyPage;
    readonly addSoPage: AddSOPage;
    readonly snackBar: SnackBar;
    // === Locators for BD Planning ===
    readonly dataValidationDate: DateElement;
    readonly kdmMeetingDate: DateElement;
    readonly mandateDetailsEntryDate: DateElement;
    readonly rfpDataCollectionDate: DateElement;
    readonly rfpDetailsEntryDate: DateElement;
    readonly dataValidationParticipants: MultiSelectElement;
    readonly kdmMeetingParticipants: MultiSelectElement;
    readonly mandateDetailsEntryParticipants: MultiSelectElement;
    readonly rfpDataCollectionParticipants: MultiSelectElement;
    readonly rfpDetailsEntryParticipants: MultiSelectElement;
    readonly completePlanning: ButtonElement;
    // === Locators for Data Validation ===
    readonly validateCompanyDetails: ButtonElement;
    readonly validateOpportunityDetails: ButtonElement;
    readonly dvremarks: TextElement;
    readonly dvDocumentType: SelectElement;
    readonly fileUpload: DocumentUploadElement;
    readonly dvSave: ButtonElement;
    readonly completeActivity: ButtonElement;
    readonly saveAndExit: ButtonElement;
    // === Locators for KDM Meeting ===
    readonly newMeeting: RadioElement;
    readonly existingMeeting: ButtonElement;
    readonly selectMeeting: SelectElement;
    readonly meetingDate: DateElement;
    readonly availableFrom: TimePickerElement;
    readonly availableTo: TimePickerElement;
    readonly typeOfMeeting: SelectElement;
    readonly meetingLocation: SelectElement;
    readonly companyContactPersons: MultiSelectElement;
    readonly employeeParticipants: MultiSelectElement;
    readonly agenda: TextElement;
    readonly kdmremarks: TextElement;
    readonly selectAssignee: SelectElement;
    readonly sendSelectUser: ButtonElement;

    // === Locators for Mandate Details Entry ===
    readonly fullMandate: RadioElement;
    readonly restrictedMandate: RadioElement;
    readonly fetchExistingMandate: ButtonElement;
    readonly signedBy: MultiSelectElement;
    readonly validFrom: DateElement;
    readonly validTo: DateElement;
    readonly brokeragePercentage: RadioElement;
    readonly brokerageFee: RadioElement;
    readonly fixedFee: RadioElement;
    readonly compensationPayable: TextElement;
    readonly issuedOn: DateElement;
    readonly mandateRemarks: TextElement;
    //Rfp Data Collection
    readonly previousYearPolicyUpload: FileUploadElement;
    // readonly coversAndAssets: BasicCoversPage;
    readonly description: TextElement;
    readonly requirements: TextElement;
    readonly rfpRemarks: TextElement;
    //Rfp Details Entry
    readonly rfpDetailsDescription: TextElement;
    readonly rfpDetailsRequirements: TextElement;
    readonly multipleBrokerInvolvedYes: RadioElement;
    readonly multipleBrokerInvolvedNo: RadioElement;
    readonly isMarketAllocationDoneYes: RadioElement;
    readonly isMarketAllocationDoneNo: RadioElement;
    readonly contact: SelectElement;
    readonly ultimateDecision: MultiSelectElement;
    readonly expectedPremiumOfClient: TextElement;
    readonly clientExpectations: TextElement;
    readonly threatsFromExistingInsurer: TextElement;
    readonly threatsFromExistingBroker: TextElement;
    readonly extraneousFactorsAffectingClientDecision: TextElement;
    readonly ourStrategyPlanForClosingDeal: TextElement;
    readonly targetQcrDate: DateElement;
    readonly rfpDetailsEntryRemarks: TextElement;
    readonly submitForApproval: ButtonElement;
    //ISG Planning
    readonly brokingSlipGenerationDate: DateElement;
    readonly brokingSlipGenerationParticipants: MultiSelectElement;
    readonly enterQuoteDate: DateElement;
    readonly enterQuoteParticipants: MultiSelectElement;
    readonly qcrGenerationDate: DateElement;
    readonly qcrGenerationParticipants: MultiSelectElement;
    readonly meetingForFinalNegotiationDate: DateElement;
    readonly meetingForFinalNegotiationParticipants: MultiSelectElement;
    readonly placementSlipGenerationDate: DateElement;
    readonly placementSlipGenerationParticipants: MultiSelectElement;
    readonly premiumCalculationDate: DateElement;
    readonly premiumCalculationParticipants: MultiSelectElement;
    readonly heldCoverNoteDate: DateElement;
    readonly heldCoverNoteParticipants: MultiSelectElement;
    readonly policyHardCopyReceiptDate: DateElement;
    readonly policyHardCopyReceiptParticipants: MultiSelectElement;
    readonly policyDocketDate: DateElement;
    readonly policyDocketParticipants: MultiSelectElement;
    readonly handOverMeetDate: DateElement;
    readonly handOverMeetParticipants: MultiSelectElement;
    readonly policyConfirmationDate: DateElement;
    readonly policyConfirmationParticipants: MultiSelectElement;
    // === Broking Slip Generation ===
    readonly brokenSlipsumInsured: TextElement;
    readonly brokenSlipbrokeragePercentage: TextElement;
    readonly policyFrom: DateElement;
    readonly policyTo: DateElement;
    readonly renewalDate: DateElement;
    readonly timelineForQuoteReceipt: DateElement;
    readonly businessActivitiesOfCompany: TextElement;
    readonly addNewVersion: ButtonElement;
    readonly saveVersion: ButtonElement;
    readonly approve: ButtonElement;
    readonly reject: ButtonElement;
    readonly duplicateBtn: ButtonElement;
    readonly deleteBtn: ButtonElement;
    readonly otherRiskMitigationFeatures: RichTextElement;
    readonly otherClauses: TextElement;
    readonly insurerRemarks: TextElement;
    readonly bsgRemarks: TextElement;
    //Enter Quote
    readonly enterQuoteSelectInsurer: SelectElement;
    readonly enterQuoteLocation: SelectElement;
    readonly quoteRecievedOnDate: DateElement;
    readonly basicPremium: TextElement;
    readonly terrorism: TextElement;
    readonly netPremium: TextElement;
    readonly enterQuotebrokeragePercentage: TextElement;
    readonly enterQuoteInsurerRemarks: TextElement;
    readonly saveQuoteBtn: ButtonElement;
    readonly enterQuoteRemarks: TextElement;
    readonly addQuote: ButtonElement;

    //QCR GENERATION
    readonly insuranceMarket: TextElement;
    readonly clientSpecific: TextElement;
    readonly issuesFacedByUs: TextElement;
    readonly industryBenchMarkingComments: TextElement;
    readonly ourAnalysisAndRecommendation: TextElement;
    readonly overallComments: TextElement;
    readonly qcrRemarks: TextElement;
    readonly generateQuoteComparision: ButtonElement;
    //Meeting for final Negotiation
    readonly insurerParticipants: SelectElement;
    readonly insurerContactPerson: MultiSelectElement;
    readonly tpaParticipants: SelectElement;
    readonly tpaContactPerson: MultiSelectElement;
    readonly multipleInsurers: RadioElement;
    readonly singleInsurer: RadioElement;
    readonly selectLeadInsurer: SelectElement;
    readonly onlyLeadInsurerPaysBrokerageYes: RadioElement;
    readonly onlyLeadInsurerPaysBrokerageNo: RadioElement;
    readonly meetingForFinalNegotiationBrokeragePercentage: TextElement;
    readonly finalisedVersionQuote: SelectElement;
    readonly finalisedQuote: SelectElement;
    readonly editQuoteYes: RadioElement;
    readonly editQuoteNo: RadioElement;
    readonly selectInsurer: SelectElement;
    readonly selectInsurerLocation: SelectElement;
    readonly quoteReleasedOn: DateElement;
    readonly meetingForFinalNegotiationRemarks: TextElement;
    readonly otherCommentsFromInsurer: TextElement;
    readonly deviations: TextElement;
    // === Placement Slip Generation ===
    readonly plgPolicyFrom: DateElement;
    readonly plgPolicyTo: DateElement;
    readonly plgSumInsured: TextElement;
    readonly plgBasicPremium: TextElement;
    readonly premiumInstallmentYes: RadioElement;
    readonly PremiumInstallmentNo: RadioElement;
    readonly installmentsForm: UniversalForm;
    readonly fee: TextElement;
    readonly feeInstallmentYes: RadioElement;
    readonly feeInstallmentNo: RadioElement;
    readonly terrorismBrokeragePercentage: TextElement;
    readonly serviceTaxPercentage: TextElement;
    readonly serviceTaxCalculated: TextElement;
    readonly others: TextElement;
    readonly totalPremium: TextElement;
    readonly placementSlipDate: DateElement;
    // Repeating party sections
    readonly insurerDetailsForm: UniversalForm;
    readonly tpaDetailsForm: UniversalForm;
    // Additional placement attributes
    readonly maxAgeOfDependents: TextElement;
    readonly brokeragePercent: TextElement;
    readonly brokerageAmount: TextElement;
    readonly policyPlacedMultiple: RadioElement;
    readonly policyPlacedSingle: RadioElement;
    readonly onlyLeadPaysYes: RadioElement;
    readonly onlyLeadPaysNo: RadioElement;
    readonly LeadInsurer: SelectElement;
    readonly plgShareAndBrokerageForm: UniversalForm;

    readonly paymentType: SelectElement;
    readonly cdAccountExisting: RadioElement;
    readonly cdAccountNew: RadioElement;
    readonly selectCdAccount: SelectElement;
    readonly accountName: TextElement;
    readonly openBalance: TextElement;
    readonly cdAccountNumber: TextElement;
    readonly transactionType: SelectElement;
    readonly chequeDate: DateElement;
    readonly chequeAmount: TextElement;
    readonly chequeNumber: TextElement;
    readonly bankName: TextElement;
    readonly plgRemarks: TextElement;
    // === Premium Calculation ===
    readonly natureOfProperty: DynamicTextElement;
    readonly totalSumInsured: DynamicTextElement;
    readonly basisOfValuation: DynamicSelectElement;
    readonly claimStatus: DynamicTextElement;
    readonly pcRemarks: TextElement;
    // === Held Cover Note ===
    readonly anyDeviationsYes: RadioElement;
    readonly anyDeviationsNo: RadioElement;
    readonly enterDeviations: TextElement;
    readonly deviationAddressedYes: RadioElement;
    readonly deviationAddressedNo: RadioElement;
    readonly resolution: SelectElement;
    readonly revisedHcnReceivedYes: RadioElement;
    readonly revisedHcnReceivedNo: RadioElement;
    readonly acknowledgementBy: SelectElement;
    readonly receiptDate: DateElement;
    readonly receiptNo: TextElement;
    readonly allDocsReceivedOn: DateElement;
    readonly createDeviationTask: ButtonElement;
    readonly hcnRemarks: TextElement;
    // === Policy Hard Copy Receipt ===
    readonly insurerPolicyNo: TextElement;
    readonly hardCopyReceivedOn: DateElement;
    readonly devFromPremBrokerageYes: RadioElement;
    readonly devFromPremBrokerageNo: RadioElement;
    readonly phcBasicPremium: TextElement;
    readonly phcBrokeragePercentage: TextElement;
    readonly phcBrokerageAmount: TextElement;
    readonly phcAnyDeviationsYes: RadioElement;
    readonly phcAnyDeviationsNo: RadioElement;
    readonly coverages: TextElement;
    readonly exclusions: TextElement;
    readonly deductibles: TextElement;
    readonly phcCreateDeviationTask: ButtonElement;
    readonly phcDeviationAddressedYes: RadioElement;
    readonly phcDeviationAddressedNo: RadioElement;
    readonly phcResolution: SelectElement;
    readonly revisedHardCopyReceivedYes: RadioElement;
    readonly revisedHardCopyReceivedNo: RadioElement;
    readonly phcRemarks: TextElement;
    // === Policy Docket ===
    readonly dateOfIssuance: DateElement;
    readonly heldCoverNoteDays: TextElement;
    readonly policyDocumentDays: TextElement;
    readonly policyDocketDays: TextElement;
    readonly endorsementDays: TextElement;
    readonly healthClaimsDays: TextElement;
    readonly nonHealthClaimsDays: TextElement;
    readonly mirDays: TextElement;
    readonly monthlyMeetingDays: TextElement;
    readonly quarterlyMeetingDays: TextElement;
    readonly renewalNoticeDays: TextElement;
    readonly dataCollectionDays: TextElement;
    readonly pdRemarks: TextElement;
    // === Policy Confirmation ===
    readonly policyDataWrongYes: RadioElement;
    readonly policyDataWrongNo: RadioElement;
    readonly pconfEnterDeviations: TextElement;
    readonly pconfCreateDeviationTask: ButtonElement;
    readonly policyDataRectifiedYes: RadioElement;
    readonly policyDataRectifiedNo: RadioElement;
    readonly pconfResolution: SelectElement;
    readonly pconfRemarks: TextElement;


    constructor(page: Page) {
        this.page = page;
        this.addCompanyPage = new AddCompanyPage(page);
        this.addSoPage = new AddSOPage(page);
        this.snackBar = new SnackBar(page);
        // BD Planning
        this.dataValidationDate = new DateElement(page, page.locator('input[name="stagedRows[0].activities[0].date"]'));
        this.kdmMeetingDate = new DateElement(page, page.locator('input[name="stagedRows[1].activities[0].date"]'));
        this.mandateDetailsEntryDate = new DateElement(page, page.locator('input[name="stagedRows[2].activities[0].date"]'));
        this.rfpDataCollectionDate = new DateElement(page, page.locator('input[name="stagedRows[3].activities[0].date"]'));
        this.rfpDetailsEntryDate = new DateElement(page, page.locator('input[name="stagedRows[3].activities[1].date"]'));
        this.dataValidationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-data-validation').getByTestId("ArrowDropDownIcon"));
        this.kdmMeetingParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-kdm-meeting'));
        this.mandateDetailsEntryParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-mandate-details-entry'));
        this.rfpDataCollectionParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-rfp-data-collection'));
        this.rfpDetailsEntryParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-rfp-details-entry'));
        this.completePlanning = new ButtonElement(page, page.getByRole('button', { name: 'Complete planning' }));
        this.selectAssignee = new SelectElement(page, page.getByTestId('ArrowDropDownIcon'));
        this.sendSelectUser = new ButtonElement(page, page.getByRole('button', { name: 'Send selected user' }));
        // Data Validation
        this.validateCompanyDetails = new ButtonElement(page, page.getByRole('button', { name: 'Validate Company Details' }));
        this.validateOpportunityDetails = new ButtonElement(page, page.getByRole('button', { name: 'Validate Opportunity Details' }));
        this.dvremarks = new TextElement(page, page.getByTestId('form-field-textarea-description').locator('textarea').first());
        this.dvDocumentType = new SelectElement(page, 'form-field-select-documentType');
        this.fileUpload = new DocumentUploadElement(page, page.getByTestId('form-field-select-documentType').locator('input').first(), page.locator('#fileUpload'), page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first());
        this.completeActivity = new ButtonElement(page, page.getByRole('button', { name: 'Complete activity' }));
        this.saveAndExit = new ButtonElement(page, page.getByRole('button', { name: 'Save and Exit' }));
        //KDM meeting
        this.newMeeting = new RadioElement(page, page.getByTestId('segmented-control-option-true'));
        this.existingMeeting = new ButtonElement(page, page.getByRole('button', { name: 'Existing Meeting' }));
        this.selectMeeting = new SelectElement(page, 'form-field-select-selectMeeting');
        this.meetingDate = new DateElement(page, page.getByTestId('form-field-date-meetingDate').locator('input'));
        this.availableFrom = new TimePickerElement(page, page.getByTestId('availableFrom-time-picker').locator('input'), page.getByTestId("time-picker-dropdown"));
        this.availableTo = new TimePickerElement(page, page.getByTestId('availableTo-time-picker').locator('input'), page.getByTestId("time-picker-dropdown"));
        this.typeOfMeeting = new SelectElement(page, 'form-field-select-meetingTypeLid');
        this.meetingLocation = new SelectElement(page, 'form-field-select-locationTypeLid');
        this.companyContactPersons = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-companyContactPerson'));
        this.employeeParticipants = new MultiSelectElement(page, page.getByTestId('form-field-multiSelectFieldByApi-employees'));
        this.agenda = new TextElement(page, page.getByTestId('form-field-textarea-mom').locator('textarea').first());
        this.kdmremarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        //Mandate Details Entry
        const mandateTypeGroup = page.getByTestId('form-field-segmentedcontrol-mandateTypeLid');
        this.fullMandate = new RadioElement(page, mandateTypeGroup.locator('[data-testid^="segmented-control-option-"]', { hasText: /^Full Mandate$/i }));
        this.restrictedMandate = new RadioElement(page, mandateTypeGroup.locator('[data-testid^="segmented-control-option-"]', { hasText: /^Restricted Mandate$/i }));
        this.fetchExistingMandate = new ButtonElement(page, page.getByRole('button', { name: 'Fetch existing mandate' }))
        this.signedBy = new MultiSelectElement(page, page.getByTestId('form-field-multiSelectFieldByApi-mandateDetailsContacts'));
        this.validFrom = new DateElement(page, page.getByTestId('form-field-daterange-mandateDetails').locator('input[name="validFrom"]'));
        this.validTo = new DateElement(page, page.getByTestId('form-field-daterange-mandateDetails').locator('input[name="validTo"]'));
        const compensationTypeGroup = page.getByTestId('form-field-segmentedcontrol-compensationTypeLid');
        this.brokeragePercentage = new RadioElement(page, compensationTypeGroup.locator('[data-testid^="segmented-control-option-"]', { hasText: /^Brokerage%$/i }));
        this.brokerageFee = new RadioElement(page, compensationTypeGroup.locator('[data-testid^="segmented-control-option-"]', { hasText: /^Brokerage Fee$/i }));
        this.fixedFee = new RadioElement(page, compensationTypeGroup.locator('[data-testid^="segmented-control-option-"]', { hasText: /^Fixed Fee$/i }));
        this.compensationPayable = new TextElement(page, page.getByTestId('form-field-number-compensationPayable').locator('input'));
        this.issuedOn = new DateElement(page, page.getByTestId('form-field-date-issuedOn').locator('input'));
        this.mandateRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        //Rfp data collection
        this.coversAndAssets = new BasicCoversPage(page);
        this.rfpRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.previousYearPolicyUpload = new FileUploadElement(page, page.getByTestId('form-field-fileupload-file2').locator('input').first());
        //Rfp Details Entry
        this.rfpDetailsDescription = new TextElement(page, page.getByTestId('form-field-textarea-description').locator('textarea').first());
        this.rfpDetailsRequirements = new TextElement(page, page.getByTestId('form-field-textarea-requirements').locator('textarea').first());
        const mbContainer = page.getByTestId('form-field-segmentedcontrol-multipleBrokerInvolved');
        this.multipleBrokerInvolvedYes = new RadioElement(page, mbContainer.getByText(/^yes$/i));
        this.multipleBrokerInvolvedNo = new RadioElement(page, mbContainer.getByText(/^no$/i));
        const maContainer = page.getByTestId('form-field-segmentedcontrol-isMarketAllocationDone');
        this.isMarketAllocationDoneYes = new RadioElement(page, maContainer.getByText(/^yes$/i));
        this.isMarketAllocationDoneNo = new RadioElement(page, maContainer.getByText(/^no$/i));
        this.contact = new SelectElement(page, "form-field-selectFieldByApi-contactId");
        this.ultimateDecision = new MultiSelectElement(page, page.getByTestId("form-field-multiselect-decisionInfluencers").locator('[role="combobox"]'), page.locator('ul[role="listbox"]'));
        this.expectedPremiumOfClient = new TextElement(page, page.getByTestId('form-field-number-expectedPremium').locator('input'));
        this.clientExpectations = new TextElement(page, page.getByTestId("form-field-textarea-clientConsiderations").locator('textarea:not([aria-hidden="true"])'));
        this.threatsFromExistingInsurer = new TextElement(page, page.getByTestId("form-field-textarea-threatsFromExistingInsurer").locator('textarea:not([aria-hidden="true"])'));
        this.threatsFromExistingBroker = new TextElement(page, page.getByTestId("form-field-textarea-threatsFromExistingBroker").locator('textarea:not([aria-hidden="true"])'));
        this.extraneousFactorsAffectingClientDecision = new TextElement(page, page.getByTestId("form-field-textarea-extraneousFactors").locator('textarea:not([aria-hidden="true"])'));
        this.ourStrategyPlanForClosingDeal = new TextElement(page, page.getByTestId("form-field-textarea-planForClosingDetail").locator('textarea:not([aria-hidden="true"])'));
        this.targetQcrDate = new DateElement(page, page.getByTestId("form-field-date-targetQcrDate").locator('input'));
        this.rfpDetailsEntryRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.submitForApproval = new ButtonElement(page, page.getByRole('button', { name: 'Submit for approval' }));
        // === ISG Planning ===
        this.brokingSlipGenerationDate = new DateElement(page, page.locator('input[name="stagedRows[0].activities[0].date"]'));
        this.brokingSlipGenerationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-broking-slip-generation'));
        this.enterQuoteDate = new DateElement(page, page.locator('input[name="stagedRows[1].activities[0].date"]'));
        this.enterQuoteParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-enter-quote'));
        this.qcrGenerationDate = new DateElement(page, page.locator('input[name="stagedRows[1].activities[1].date"]'));
        this.qcrGenerationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-qcr-generation'));
        this.meetingForFinalNegotiationDate = new DateElement(page, page.locator('input[name="stagedRows[2].activities[0].date"]'));
        this.meetingForFinalNegotiationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-meeting-for-final-negotiation'));
        this.placementSlipGenerationDate = new DateElement(page, page.locator('input[name="stagedRows[3].activities[0].date"]'));
        this.placementSlipGenerationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-placement-slip-generation'));
        this.premiumCalculationDate = new DateElement(page, page.locator('input[name="stagedRows[3].activities[1].date"]'));
        this.premiumCalculationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-premium-calculation'));
        this.heldCoverNoteDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[0].date"]'));
        this.heldCoverNoteParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-held-cover-note'));
        this.policyHardCopyReceiptDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[1].date"]'));
        this.policyHardCopyReceiptParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-policy-hard-copy-receipt'));
        this.policyDocketDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[2].date"]'));
        this.policyDocketParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-policy-docket'));
        this.handOverMeetDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[3].date"]'));
        this.handOverMeetParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-hand-over-meet'));
        this.policyConfirmationDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[4].date"]'));
        this.policyConfirmationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-policy-confirmation'));
        this.completePlanning = new ButtonElement(page, page.getByRole('button', { name: 'Complete planning' }));
        // === Broking Slip Generation ===
        this.brokenSlipsumInsured = new TextElement(page, page.getByTestId('form-field-number-sumInsured').locator('input'));
        this.brokenSlipbrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-brokeragePercentage').locator('input'));
        this.policyFrom = new DateElement(page, page.getByTestId('form-field-date-policyFrom').locator('input'));
        this.policyTo = new DateElement(page, page.getByTestId('form-field-date-policyTo').locator('input'));
        this.renewalDate = new DateElement(page, page.getByTestId('form-field-date-renewalDate').locator('input'));
        this.timelineForQuoteReceipt = new DateElement(page, page.getByTestId('form-field-date-quoteReceiptTimeline').locator('input'));
        this.businessActivitiesOfCompany = new TextElement(page, page.getByTestId('form-field-textarea-businessActivity').locator('textarea').first());
        this.addNewVersion = new ButtonElement(page, page.getByTitle('Add new version').first());
        this.saveVersion = new ButtonElement(page, page.getByRole('button', { name: 'Save version' }));
        this.approve = new ButtonElement(page, page.getByRole('button', { name: 'Approve' }));
        this.reject = new ButtonElement(page, page.getByRole('button', { name: 'Reject' }));
        this.otherRiskMitigationFeatures = new RichTextElement(page, page.getByTestId('form-field-richtext-riskMitigationFeatures'));
        this.otherClauses = new TextElement(page, page.getByTestId('form-field-textarea-clauses').locator('textarea').first());
        this.insurerRemarks = new TextElement(page, page.getByTestId('form-field-textarea-insurerRemarks').locator('textarea').first());
        this.bsgRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        //Enter Quote
        this.enterQuoteSelectInsurer = new SelectElement(page, "form-field-selectFieldByApi-insurerId");
        this.enterQuoteLocation = new SelectElement(page, "form-field-selectFieldByApi-insurerLocationId");
        this.quoteRecievedOnDate = new DateElement(page, page.getByTestId('form-field-date-quoteReceivedOn').locator('input'));
        this.basicPremium = new TextElement(page, page.getByTestId('form-field-number-basicPremium').locator('input'));
        this.terrorism = new TextElement(page, page.getByTestId('form-field-number-terrorism').locator('input'));
        this.netPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
        this.enterQuotebrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-brokeragePercent').locator('input'));
        this.enterQuoteInsurerRemarks = new TextElement(page, page.getByTestId('form-field-textarea-insurerRemarks').locator('textarea').first());
        this.enterQuoteRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.saveQuoteBtn = new ButtonElement(page, page.getByRole('button', { name: 'Save Quote' }));
        //QCR Generation
        this.insuranceMarket = new TextElement(page, page.getByTestId('form-field-textarea-insuranceMarket').locator('textarea').first());
        this.clientSpecific = new TextElement(page, page.getByTestId('form-field-textarea-clientSpecific').locator('textarea').first());
        this.issuesFacedByUs = new TextElement(page, page.getByTestId('form-field-textarea-issuesFaced').locator('textarea').first());
        this.industryBenchMarkingComments = new TextElement(page, page.getByTestId('form-field-textarea-industryBenchmarkingComments').locator('textarea').first());
        this.ourAnalysisAndRecommendation = new TextElement(page, page.getByTestId('form-field-textarea-analysisRecommendation').locator('textarea').first());
        this.overallComments = new TextElement(page, page.getByTestId('form-field-textarea-overallComments').locator('textarea').first());
        this.qcrRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.generateQuoteComparision = new ButtonElement(page, page.getByRole('button', { name: 'Generate Quote Comparison' }));
        //Meeting for final negotiation
        this.insurerParticipants = new SelectElement(page, 'form-field-selectFieldByApi-insurerId');
        this.insurerContactPerson = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-insurerContactPerson'));
        this.tpaParticipants = new SelectElement(page, 'form-field-selectFieldByApi-tpaId');
        this.tpaContactPerson = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-tpaContactPerson'));
        const policyContainer = page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid');
        this.multipleInsurers = new RadioElement(page, policyContainer.getByText(/^Multiple Insurers$/i));
        this.singleInsurer = new RadioElement(page, policyContainer.getByText(/^Single Insurer$/i));
        this.selectLeadInsurer = new SelectElement(page, 'form-field-selectFieldByApi-leadInsurerId');
        const onlyLeadInsurerPaysBrokerageContainer = page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommissionLid');
        this.onlyLeadInsurerPaysBrokerageYes = new RadioElement(page, onlyLeadInsurerPaysBrokerageContainer.getByText(/^yes$/i));
        this.onlyLeadInsurerPaysBrokerageNo = new RadioElement(page, onlyLeadInsurerPaysBrokerageContainer.getByText(/^No$/i));
        this.meetingForFinalNegotiationBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-brokeragePercentage').locator('input'));
        this.finalisedVersionQuote = new SelectElement(page, 'form-field-select-finalizedVersionId');
        this.finalisedQuote = new SelectElement(page, 'form-field-select-finalizedQuoteId');
        const editQuote = page.getByTestId('form-field-segmentedcontrol-isQuoteEdited');
        this.editQuoteYes = new RadioElement(page, editQuote.getByText(/^yes$/i));
        this.editQuoteNo = new RadioElement(page, editQuote.getByText(/^No$/i));
        this.selectInsurer = new SelectElement(page, 'form-field-selectFieldByApi-insurerId');
        this.selectInsurerLocation = new SelectElement(page, 'form-field-selectFieldByApi-insurerLocationId');
        this.quoteRecievedOnDate = new DateElement(page, page.getByTestId('form-field-date-quoteReceivedOn').locator('input'));
        this.meetingForFinalNegotiationRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.deviations = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.otherCommentsFromInsurer = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        // === Placement Slip Generation ===
        this.plgPolicyFrom = new DateElement(page, page.locator('input[name="policyFromDate"]'));
        this.plgPolicyTo = new DateElement(page, page.locator('input[name="policyToDate"]'));
        this.plgSumInsured = new TextElement(page, page.getByTestId('form-field-number-sumInsured').locator('input'));
        this.plgBasicPremium = new TextElement(page, page.getByTestId('form-field-number-basicPremium').locator('input'));
        {
            const premInst = page.getByTestId('form-field-segmentedcontrol-isPremiumInstallmentBased');
            this.premiumInstallmentYes = new RadioElement(page, premInst.getByText(/^yes$/i));
            this.PremiumInstallmentNo = new RadioElement(page, premInst.getByText(/^no$/i));
        }
        this.installmentsForm = new UniversalForm(page, PLG_INSTALLMENTS_CONFIG);

        this.fee = new TextElement(page, page.getByTestId('form-field-number-fee').locator('input'));
        {
            const feeInst = page.getByTestId('form-field-segmentedcontrol-isFeeInInstallment');
            this.feeInstallmentYes = new RadioElement(page, feeInst.getByText(/^yes$/i));
            this.feeInstallmentNo = new RadioElement(page, feeInst.getByText(/^no$/i));
        }

        this.terrorismBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-terrorismCommissionPercentage').locator('input'));
        this.serviceTaxPercentage = new TextElement(page, page.getByTestId('form-field-number-serviceTaxPercentage').locator('input'));
        this.serviceTaxCalculated = new TextElement(page, page.getByTestId('form-field-number-serviceTaxAmount').locator('input'));
        this.others = new TextElement(page, page.getByTestId('form-field-text-other').locator('input'));
        this.totalPremium = new TextElement(page, page.getByTestId('form-field-number-totalPremium').locator('input'));
        this.placementSlipDate = new DateElement(page, page.getByTestId('form-field-date-placementSlipDate').locator('input'));
        this.insurerDetailsForm = new UniversalForm(page, PLG_INSURER_DETAILS_CONFIG);
        this.tpaDetailsForm = new UniversalForm(page, PLG_TPA_DETAILS_CONFIG);
        this.maxAgeOfDependents = new TextElement(page, page.getByTestId('form-field-number-maxAgeOfDependents').locator('input'));
        this.brokeragePercent = new TextElement(page, page.getByTestId('form-field-number-brokeragePercentage').locator('input'));
        this.brokerageAmount = new TextElement(page, page.getByTestId('form-field-number-retArray.0.brokerageAmount').locator('input'));
        const policyPlacedType = page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid');
        this.policyPlacedMultiple = new RadioElement(page, policyPlacedType.getByText(/^Multiple Insurers$/i));
        this.policyPlacedSingle = new RadioElement(page, policyPlacedType.getByText(/^Single Insurer$/i));
        const onlyLead = page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommission');
        this.LeadInsurer = new SelectElement(page, 'form-field-selectFieldByApi-leadInsurerId');
        this.onlyLeadPaysYes = new RadioElement(page, onlyLead.getByText(/^yes$/i));
        this.onlyLeadPaysNo = new RadioElement(page, onlyLead.getByText(/^no$/i));
        this.plgShareAndBrokerageForm = new UniversalForm(page, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG);
        this.paymentType = new SelectElement(page, 'form-field-select-paymentTypeLid');
        const cdType = page.getByTestId('form-field-segmentedcontrol-cdAccountTypeLid');
        this.cdAccountExisting = new RadioElement(page, cdType.getByText(/^Existing Account*$/i));
        this.cdAccountNew = new RadioElement(page, cdType.getByText(/^New Account\s*$/i));
        this.selectCdAccount = new SelectElement(page, 'form-field-selectFieldByApi-selectCdAccount');
        this.accountName = new TextElement(page, page.getByTestId('form-field-text-accountName').locator('input'));
        this.openBalance = new TextElement(page, page.getByTestId('form-field-number-openBalance').locator('input'));
        this.cdAccountNumber = new TextElement(page, page.getByTestId('form-field-text-accountNumber').locator('input'));
        this.transactionType = new SelectElement(page, 'form-field-select-transactionTypeLid');
        this.chequeDate = new DateElement(page, page.getByTestId('form-field-date-chequeDate').locator('input'));
        this.chequeAmount = new TextElement(page, page.getByTestId('form-field-number-chequeAmount').locator('input'));
        this.chequeNumber = new TextElement(page, page.getByTestId('form-field-text-chequeNumber').locator('input'));
        this.bankName = new TextElement(page, page.getByTestId('form-field-text-bankName').locator('input'));
        this.plgRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        // === Premium Calculation ===
        const fieldByLabel = (labelRegex: RegExp) =>
            page.locator('[data-testid^="form-field-"]').filter({ has: page.getByText(labelRegex) });

        // === Premium Calculation (dynamic / label-anchored) ===
        // this.natureOfProperty = new DynamicTextElement(
        //     page,
        //     fieldByLabel(/^Nature of property to be covered\b/i).locator('textarea').first()
        // );

        // this.totalSumInsured = new DynamicTextElement(
        //     page,
        //     fieldByLabel(/^Total Sum Insured\b/i).locator('textarea').first()
        // );

        // this.basisOfValuation = new DynamicSelectElement(
        //     page,
        //     fieldByLabel(/^Basis of valuation\b/i).locator('[role="combobox"]')   // MUI Autocomplete input
        // );

        // this.claimStatus = new DynamicTextElement(
        //     page,
        //     fieldByLabel(/^Claim Status\b/i).locator('textarea').first()
        // );

        this.pcRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        // === Held Cover Note ===
        const anyDeviations = page.getByTestId('form-field-segmentedcontrol-placementSlipDeviationsLid');
        this.anyDeviationsYes = new RadioElement(page, anyDeviations.getByText(/^yes$/i));
        this.anyDeviationsNo = new RadioElement(page, anyDeviations.getByText(/^no$/i));
        this.enterDeviations = new TextElement(page, page.getByTestId('form-field-text-deviations').locator('textarea').first());
        const deviationAddressed = page.getByTestId('form-field-segmentedcontrol-deviationsAddressedLid');
        this.deviationAddressedYes = new RadioElement(page, deviationAddressed.getByText(/^yes$/i));
        this.deviationAddressedNo = new RadioElement(page, deviationAddressed.getByText(/^no$/i));
        this.resolution = new SelectElement(page, 'form-field-select-resolutionLid');
        const revisedHcnReceived = page.getByTestId('form-field-segmentedcontrol-revisedHeldCoverNoteLid');
        this.revisedHcnReceivedYes = new RadioElement(page, revisedHcnReceived.getByText(/^yes$/i));
        this.revisedHcnReceivedNo = new RadioElement(page, revisedHcnReceived.getByText(/^no$/i));
        this.acknowledgementBy = new SelectElement(page, 'form-field-selectFieldByApi-acknowledgedBy');
        this.receiptDate = new DateElement(page, page.getByTestId('form-field-date-receiptDate').locator('input'));
        this.receiptNo = new TextElement(page, page.getByTestId('form-field-text-receiptNo').locator('input').first());
        this.allDocsReceivedOn = new DateElement(page, page.getByTestId('form-field-date-allDocumentsReceivedDate').locator('input'));
        this.createDeviationTask = new ButtonElement(page, page.getByRole('button', { name: 'Create task for deviation' }));
        this.hcnRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());


        // === Policy Hard Copy Receipt ===
        this.insurerPolicyNo = new TextElement(
            page,
            page.getByTestId('form-field-text-insurerPolicyNo').locator('input')
        );

        this.hardCopyReceivedOn = new DateElement(
            page,
            page.getByTestId('form-field-date-hardCopyReceivedOn').locator('input')
        );

        // Any deviations from premium and brokerage *
        {
            const grp = page.getByTestId('form-field-segmentedcontrol-deviationsLid');
            this.devFromPremBrokerageYes = new RadioElement(page, grp.getByText(/^yes$/i));
            this.devFromPremBrokerageNo = new RadioElement(page, grp.getByText(/^no$/i));
        }

        this.phcBasicPremium = new TextElement(
            page,
            page.getByTestId('form-field-number-premium').locator('input')
        );
        this.phcBrokeragePercentage = new TextElement(
            page,
            page.getByTestId('form-field-number-brokeragePercentage').locator('input')
        );
        this.phcBrokerageAmount = new TextElement(
            page,
            page.getByTestId('form-field-number-brokerageAmount').locator('input')
        );

        // Any deviations *
        {
            const grp = page.getByTestId('form-field-segmentedcontrol-deviationCoveragesLid');
            this.phcAnyDeviationsYes = new RadioElement(page, grp.getByText(/^yes$/i));
            this.phcAnyDeviationsNo = new RadioElement(page, grp.getByText(/^no$/i));
        }

        this.coverages = new TextElement(
            page,
            page.getByTestId('form-field-textarea-coverages').locator('textarea').first()
        );
        this.exclusions = new TextElement(
            page,
            page.getByTestId('form-field-textarea-exclusions').locator('textarea').first()
        );
        this.deductibles = new TextElement(
            page,
            page.getByTestId('form-field-textarea-deductibles').locator('textarea').first()
        );

        this.phcCreateDeviationTask = new ButtonElement(
            page,
            page.getByRole('button', { name: 'Create task for deviation' })
        );

        // Deviation addressed * + Resolution *
        {
            const grp = page.getByTestId('form-field-segmentedcontrol-deviationsAddressedLid');
            this.phcDeviationAddressedYes = new RadioElement(page, grp.getByText(/^yes$/i));
            this.phcDeviationAddressedNo = new RadioElement(page, grp.getByText(/^no$/i));
        }
        this.phcResolution = new SelectElement(page, 'form-field-select-resolutionLid');

        // Revised policy hard copy received *
        {
            const grp = page.getByTestId('form-field-segmentedcontrol-policyHardCopyReceivedLid');
            this.revisedHardCopyReceivedYes = new RadioElement(page, grp.getByText(/^yes$/i));
            this.revisedHardCopyReceivedNo = new RadioElement(page, grp.getByText(/^no$/i));
        }
        this.phcRemarks = new TextElement(
            page,
            page.getByTestId('form-field-textarea-remarks').locator('textarea').first()
        );
        // === Policy Docket ===
        this.dateOfIssuance = new DateElement(
            page,
            page.getByTestId('form-field-date-issuanceDate').locator('input')
        );
        this.heldCoverNoteDays = new TextElement(page, page.getByTestId('form-field-number-heldCoverNote').locator('input'));
        this.policyDocumentDays = new TextElement(page, page.getByTestId('form-field-number-policyDocument').locator('input'));
        this.policyDocketDays = new TextElement(page, page.getByTestId('form-field-number-policyDocket').locator('input'));
        this.endorsementDays = new TextElement(page, page.getByTestId('form-field-number-endorsement').locator('input'));
        this.healthClaimsDays = new TextElement(page, page.getByTestId('form-field-number-healthClaims').locator('input'));
        this.nonHealthClaimsDays = new TextElement(page, page.getByTestId('form-field-number-nonHealthClaims').locator('input'));
        this.mirDays = new TextElement(page, page.getByTestId('form-field-number-mir').locator('input'));
        this.monthlyMeetingDays = new TextElement(page, page.getByTestId('form-field-number-monthlyMeeting').locator('input'));
        this.quarterlyMeetingDays = new TextElement(page, page.getByTestId('form-field-number-quarterlyMeeting').locator('input'));
        this.renewalNoticeDays = new TextElement(page, page.getByTestId('form-field-number-renewalNotice').locator('input'));
        this.dataCollectionDays = new TextElement(page, page.getByTestId('form-field-number-dataCollection').locator('input'));
        this.pdRemarks = new TextElement(
            page,
            page.getByTestId('form-field-textarea-remarks').locator('textarea').first()
        );
        // === Policy Confirmation ===
        {
            const isPolicyDataWrong = page.getByTestId('form-field-segmentedcontrol-isPolicyDataWrong');
            this.policyDataWrongYes = new RadioElement(page, isPolicyDataWrong.getByText(/^yes$/i));
            this.policyDataWrongNo = new RadioElement(page, isPolicyDataWrong.getByText(/^no$/i));
        }

        this.pconfEnterDeviations = new TextElement(
            page,
            page.getByTestId('form-field-textarea-deviations').locator('textarea').first()
        );

        this.pconfCreateDeviationTask = new ButtonElement(
            page,
            page.getByRole('button', { name: 'Create task for deviation' })
        );

        {
            const isPolicyDataRectified = page.getByTestId('form-field-segmentedcontrol-isPolicyDataRectified');
            this.policyDataRectifiedYes = new RadioElement(page, isPolicyDataRectified.getByText(/^yes$/i));
            this.policyDataRectifiedNo = new RadioElement(page, isPolicyDataRectified.getByText(/^no$/i));
        }

        this.pconfResolution = new SelectElement(page, 'form-field-select-resolutionLid');

        this.pconfRemarks = new TextElement(
            page,
            page.getByTestId('form-field-textarea-remarks').locator('textarea').first()
        );


    }

    /**
     * 
     * @param values - StageName(As in UI),Json Data.
     * @description-Sets all feilds in Respective stages.
     * @usage - await oppurtunityActivities.set("BD Planning", data.bdPlanning);
     * The input Stage Name should be same as in the UI
     */
    async set(stage: Stage, data: any): Promise<void> {
        if (!data) throw new Error(`No data provided for stage "${stage}"`);

        switch (stage) {
            case 'BD Planning':
                if (data.dataValidationDate) await this.dataValidationDate.set(data.dataValidationDate);
                if (data.dataValidationParticipants?.length) await this.dataValidationParticipants.set(data.dataValidationParticipants);
                if (data.kdmMeetingDate) await this.kdmMeetingDate.set(data.kdmMeetingDate);
                if (data.kdmMeetingParticipants?.length) await this.kdmMeetingParticipants.set(data.kdmMeetingParticipants);
                if (data.mandateDetailsEntryDate) await this.mandateDetailsEntryDate.set(data.mandateDetailsEntryDate);
                if (data.mandateDetailsEntryParticipants?.length) await this.mandateDetailsEntryParticipants.set(data.mandateDetailsEntryParticipants);
                if (data.rfpDataCollectionDate) await this.rfpDataCollectionDate.set(data.rfpDataCollectionDate);
                if (data.rfpDataCollectionParticipants?.length) await this.rfpDataCollectionParticipants.set(data.rfpDataCollectionParticipants);
                if (data.rfpDetailsEntryDate) await this.rfpDetailsEntryDate.set(data.rfpDetailsEntryDate);
                if (data.rfpDetailsEntryParticipants?.length) await this.rfpDetailsEntryParticipants.set(data.rfpDetailsEntryParticipants);
                if (data.completePlanning) await this.completePlanning.click();
                break;

            case 'Data Validation': {
                if (data.validateCompanyDetails) {
                    await this.validateCompanyDetails.click();
                    await this.page.waitForTimeout(2000);
                    await this.addCompanyPage.saveAndExit.click();
                }
                if (data.validateOpportunityDetails) {
                    await this.validateOpportunityDetails.click();
                    await this.page.waitForTimeout(2000);
                    await this.addSoPage.saveAndExit.click();
                }
                if (data.remarks) await this.dvremarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.completeActivity) await this.completeActivity.click();
                break;
            }
            case 'KDM Meeting': {
                if (data.meeting == "New Meeting") {
                    await this.newMeeting.click();
                }
                if (data.meeting == "Existing Meeting") {
                    await this.existingMeeting.click();
                    await this.selectMeeting.set(data.selectMeeting);
                }
                if (data.meetingDate) await this.meetingDate.set(data.meetingDate);
                if (data.availableFrom) await this.availableFrom.set(data.availableFrom);
                if (data.availableTo) await this.availableTo.set(data.availableTo);
                if (data.typeOfMeeting) await this.typeOfMeeting.set(data.typeOfMeeting);
                if (data.location) await this.meetingLocation.set(data.location);
                if (data.companyContactPersons) await this.companyContactPersons.set(data.companyContactPersons);
                if (data.employeeParticipants) await this.employeeParticipants.set(data.employeeParticipants);
                if (data.agenda) await this.agenda.set(data.agenda);
                if (data.remarks) await this.kdmremarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.completeActivity) await this.completeActivity.click();
                break;
            }

            case "Mandate Details Entry": {
                if (data.mandateType == "Full Mandate") await this.fullMandate.click();
                if (data.mandateType == "Restricted Mandate") await this.restrictedMandate.click();
                if (data.signedBy?.length) await this.signedBy.set(data.signedBy);
                if (data.validFrom) await this.validFrom.set(data.validFrom);
                if (data.validTo) await this.validTo.set(data.validTo);
                if (data.compensationType == "Brokerage%") await this.brokeragePercentage.click();
                if (data.compensationType == "Brokerage Fee") await this.brokerageFee.click();
                if (data.compensationType == "Fixed Fee") await this.fixedFee.click();
                if (data.compensationPayable) await this.compensationPayable.set(data.compensationPayable);
                if (data.issuedOn) await this.issuedOn.set(data.issuedOn);
                if (data.remarks) await this.mandateRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.completeActivity) await this.completeActivity.click();
                break;
            }

            case "RFP Data Collection":
                await this.coversAndAssets.enterData(data.basicCovers);
                if (data.remarks) await this.rfpRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.completeActivity) await this.completeActivity.click();
                break;

            case "RFP Details Entry": {
                if (data.description) await this.rfpDetailsDescription.set(data.description);
                if (data.requirements) await this.rfpDetailsRequirements.set(data.requirements);
                if (data.preferredInsurers.length) {
                    const form = new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG);
                    await form.set(data.preferredInsurers as FormData[]);
                }
                if (data.preferredTpas.length) {
                    const form = new UniversalForm(this.page, PREFERRED_TPAS_CONFIG);
                    await form.set(data.preferredTpas as FormData[]);
                }

                if (data.multipleBrokerInvolved) {
                    await this.multipleBrokerInvolvedYes.click();
                } else {
                    await this.multipleBrokerInvolvedNo.click();
                }
                if (data.isMarketAllocationDone) {
                    await this.isMarketAllocationDoneYes.click();
                } else {
                    await this.isMarketAllocationDoneNo.click();
                }
                if (data.contact) {
                    await this.contact.set(data.contact);
                }
                if (data.ultimateDecision?.length) {
                    await this.ultimateDecision.set(data.ultimateDecision);
                }
                if (data.excludedInsurers.length) {
                    const form = new UniversalForm(this.page, EXCLUDED_INSURERS_CONFIG);
                    await form.set(data.excludedInsurers as FormData[]);
                }

                if (data.excludedTpas.length) {
                    const form = new UniversalForm(this.page, EXCLUDED_TPAS_CONFIG);
                    await form.set(data.excludedTpas as FormData[]);
                }
                if (data.expectedPremiumOfClient) {
                    await this.expectedPremiumOfClient.set(data.expectedPremiumOfClient);
                }
                if (data.clientExpectations) {
                    await this.clientExpectations.set(data.clientExpectations);
                }
                if (data.threatsFromExistingInsurer) {
                    await this.threatsFromExistingInsurer.set(data.threatsFromExistingInsurer);
                }
                if (data.threatsFromExistingBroker) {
                    await this.threatsFromExistingBroker.set(data.threatsFromExistingBroker);
                }
                if (data.extraneousFactorsAffectingClientDecision) {
                    await this.extraneousFactorsAffectingClientDecision.set(data.extraneousFactorsAffectingClientDecision);
                }
                if (data.ourStrategyPlanForClosingDeal) {
                    await this.ourStrategyPlanForClosingDeal.set(data.ourStrategyPlanForClosingDeal);
                }
                if (data.targetQcrDate) {
                    await this.targetQcrDate.set(data.targetQcrDate);
                }
                if (data.creditSharing) {
                    const form = new UniversalForm(this.page, CREDIT_SHARING_CONFIG);
                    await form.set(data.creditSharing as FormData[]);
                }
                if (data.remarks) {
                    await this.rfpDetailsEntryRemarks.set(data.remarks);
                }
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.submitForApproval) await this.submitForApproval.click();
                break;
            }
            case 'ISG Planning': {
                if (data.brokingSlipGenerationDate) await this.brokingSlipGenerationDate.set(data.brokingSlipGenerationDate);
                if (data.brokingSlipGenerationParticipants?.length) await this.brokingSlipGenerationParticipants.set(data.brokingSlipGenerationParticipants);

                if (data.enterQuoteDate) await this.enterQuoteDate.set(data.enterQuoteDate);
                if (data.enterQuoteParticipants?.length) await this.enterQuoteParticipants.set(data.enterQuoteParticipants);

                if (data.qcrGenerationDate) await this.qcrGenerationDate.set(data.qcrGenerationDate);
                if (data.qcrGenerationParticipants?.length) await this.qcrGenerationParticipants.set(data.qcrGenerationParticipants);

                if (data.meetingForFinalNegotiationDate) await this.meetingForFinalNegotiationDate.set(data.meetingForFinalNegotiationDate);
                if (data.meetingForFinalNegotiationParticipants?.length) await this.meetingForFinalNegotiationParticipants.set(data.meetingForFinalNegotiationParticipants);

                if (data.placementSlipGenerationDate) await this.placementSlipGenerationDate.set(data.placementSlipGenerationDate);
                if (data.placementSlipGenerationParticipants?.length) await this.placementSlipGenerationParticipants.set(data.placementSlipGenerationParticipants);

                if (data.premiumCalculationDate) await this.premiumCalculationDate.set(data.premiumCalculationDate);
                if (data.premiumCalculationParticipants?.length) await this.premiumCalculationParticipants.set(data.premiumCalculationParticipants);

                if (data.heldCoverNoteDate) await this.heldCoverNoteDate.set(data.heldCoverNoteDate);
                if (data.heldCoverNoteParticipants?.length) await this.heldCoverNoteParticipants.set(data.heldCoverNoteParticipants);

                if (data.policyHardCopyReceiptDate) await this.policyHardCopyReceiptDate.set(data.policyHardCopyReceiptDate);
                if (data.policyHardCopyReceiptParticipants?.length) await this.policyHardCopyReceiptParticipants.set(data.policyHardCopyReceiptParticipants);

                if (data.policyDocketDate) await this.policyDocketDate.set(data.policyDocketDate);
                if (data.policyDocketParticipants?.length) await this.policyDocketParticipants.set(data.policyDocketParticipants);

                if (data.handOverMeetDate) await this.handOverMeetDate.set(data.handOverMeetDate);
                if (data.handOverMeetParticipants?.length) await this.handOverMeetParticipants.set(data.handOverMeetParticipants);

                if (data.policyConfirmationDate) await this.policyConfirmationDate.set(data.policyConfirmationDate);
                if (data.policyConfirmationParticipants?.length) await this.policyConfirmationParticipants.set(data.policyConfirmationParticipants);
                if (data.completePlanning) await this.completePlanning.click();
                break;
            }
            case 'Broking Slip Generation': {
                if (data.sumInsured) await this.brokenSlipsumInsured.set(data.sumInsured);
                if (data.brokeragePercentage) await this.brokenSlipbrokeragePercentage.set(data.brokeragePercentage);
                if (data.policyFrom) await this.policyFrom.set(data.policyFrom);
                if (data.policyTo) await this.policyTo.set(data.policyTo);
                if (data.renewalDate) await this.renewalDate.set(data.renewalDate);
                if (data.timelineForQuoteReceipt) await this.timelineForQuoteReceipt.set(data.timelineForQuoteReceipt);
                if (data.businessActivitiesOfCompany) await this.businessActivitiesOfCompany.set(data.businessActivitiesOfCompany);
                if (data.basiccovers) await this.coversAndAssets.enterData(data.basicCovers);
                if (this.saveVersion) await this.saveVersion.click();
                if (data.preferredInsurers.length) {
                    const form = new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG);
                    await form.set(data.preferredInsurers as FormData[]);
                }
                if (data.preferredTpas.length) {
                    const form = new UniversalForm(this.page, PREFERRED_TPAS_CONFIG);
                    await form.set(data.preferredTpas as FormData[]);
                }
                if (data.otherRiskMitigationFeatures) await this.otherRiskMitigationFeatures.set(data.otherRiskMitigationFeatures);
                if (data.otherClauses) await this.otherClauses.set(data.otherClauses);
                if (data.insurerRemarks) await this.insurerRemarks.set(data.insurerRemarks);
                if (data.remarks) await this.bsgRemarks.set(data.bsgRemarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.submitForApproval) await this.submitForApproval.click();
                break;
            }
            case 'Enter Quote': {
                if (data.insurer) await this.enterQuoteSelectInsurer.set(data.insurer);
                if (data.location) await this.enterQuoteLocation.set(data.location);
                if (data.quoteReceivedOn) await this.quoteRecievedOnDate.set(data.quoteReceivedOn);
                if (data.basicPremium) await this.basicPremium.set(data.basicPremium);
                if (data.terrorism) await this.terrorism.set(data.terrorism);
                if (data.taxDetails.length) {
                    const taxDetailsForm = new UniversalForm(this.page, TAX_DETAILS_CONFIG);
                    await taxDetailsForm.set(data.taxDetails as FormData[]);
                }
                if (data.netPremium) await this.netPremium.set(data.netPremium);
                if (data.brokeragePercentage) await this.enterQuotebrokeragePercentage.set(data.brokeragePercentage);
                if (data.insurerRemarks) await this.enterQuoteInsurerRemarks.set(data.insurerRemarks);
                if (data.saveQuote !== false) await this.saveQuoteBtn.click();
                if (data.remarks) await this.enterQuoteRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.completeActivity) await this.completeActivity.click();
                break;
            }
            case 'QCR Generation': {
                if (data.insuranceMarket) await this.insuranceMarket.set(data.insuranceMarket);
                if (data.clientSpecific) await this.clientSpecific.set(data.clientSpecific);
                if (data.issuesFacedByUs) await this.issuesFacedByUs.set(data.issuesFacedByUs);
                if (data.industryBenchMarkingComments) {
                    await this.industryBenchMarkingComments.set(data.industryBenchMarkingComments);
                }
                if (data.ourAnalysisAndRecommendation) {
                    await this.ourAnalysisAndRecommendation.set(data.ourAnalysisAndRecommendation);
                }
                if (data.overallComments) await this.overallComments.set(data.overallComments);
                if (data.qcrRemarks) await this.qcrRemarks.set(data.qcrRemarks);
                if (data.generateQuoteComparision) {
                    await this.generateQuoteComparision.click();
                }

                if (data.completeActivity) await this.completeActivity.click();
                break;
            }
            case 'Meeting for Final Negotiation': {
                if (data.meeting == "New Meeting") {
                    await this.newMeeting.click();
                }
                if (data.meeting == "Existing Meeting") {
                    await this.existingMeeting.click();
                    await this.selectMeeting.set(data.selectMeeting);
                }
                if (data.meetingDate) await this.meetingDate.set(data.meetingDate);
                if (data.availableFrom) await this.availableFrom.set(data.availableFrom);
                if (data.availableTo) await this.availableTo.set(data.availableTo);
                if (data.typeOfMeeting) await this.typeOfMeeting.set(data.typeOfMeeting);
                if (data.location) await this.meetingLocation.set(data.location);
                if (data.companyContactPersons) await this.companyContactPersons.set(data.companyContactPersons);
                if (data.employeeParticipants) await this.employeeParticipants.set(data.employeeParticipants);
                if (data.insurerParticipants) await this.insurerParticipants.set(data.insurerParticipants);
                if (data.insurerContactPerson) await this.insurerContactPerson.set(data.insurerContactPerson);
                if (data.tpaParticipants) await this.tpaParticipants.set(data.tpaParticipants);
                if (data.tpaContactPerson) await this.tpaContactPerson.set(data.tpaContactPerson);
                if (data.agenda) await this.agenda.set(data.agenda);
                if (data.policyPlacedType == "Multiple Insurers") await this.multipleInsurers.click();
                if (data.policyPlacedType == "Single Insurer") await this.singleInsurer.click();
                if (data.selectLeadInsurer) await this.selectLeadInsurer.click();
                if (data.onlyLeadInsurerPaysBrokerage == "Yes") await this.onlyLeadInsurerPaysBrokerageYes.click();
                if (data.onlyLeadInsurerPaysBrokerage == "No") await this.onlyLeadInsurerPaysBrokerageNo.click();
                if (data.netPremium) await this.netPremium.set(data.netPremium);
                if (data.brokeragePercentage) await this.brokeragePercent.set(data.brokeragePercentage);
                if (data.insurerRemarks) await this.insurerRemarks.set(data.insurerRemarks);

                if (data.finalisedVersionQuote) await this.finalisedVersionQuote.set(data.finalisedVersionQuote);
                if (data.finalisedQuote) await this.finalisedQuote.set(data.finalisedQuote);
                if (data.editQuote == "Yes") {
                    await this.editQuoteYes.click();
                } else {
                    await this.editQuoteNo.click();
                }
                if (data.selectInsurer) await this.selectInsurer.set(data.selectInsurer);
                if (data.selectInsurerLocation) await this.selectInsurerLocation.set(data.selectInsurerLocation);
                if (data.quoteRecievedOnDate) await this.quoteRecievedOnDate.set(data.quoteRecievedOnDate);
                if (data.basicPremium) await this.basicPremium.set(data.basicPremium);
                if (data.terrorism) await this.terrorism.set(data.terrorism);
                if (data.taxDetails.length) {
                    const taxDetailsForm = new UniversalForm(this.page, TAX_DETAILS_CONFIG);
                    await taxDetailsForm.set(data.taxDetails as FormData[]);
                }
                if (data.insurerShareAndBrokerageDetails.length) {
                    const insurerAndBrokerage = new UniversalForm(this.page, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG);
                    await insurerAndBrokerage.set(data.insurerShareAndBrokerageDetails as FormData[]);
                }
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.basicCovers) {
                    await this.coversAndAssets.enterData(data.basicCovers);
                }
                if (data.otherCommentsFromInsurer) await this.otherCommentsFromInsurer.set(data.otherCommentsFromInsurer);
                if (data.deviations) await this.deviations.set(data.deviations);
                if (data.insurerServiceLevelAgreement.length) {
                    const insurerServiceLevelAgreement = new UniversalForm(this.page, INSURER_SERVICE_LEVEL_AGREEMENT_CONFIG);
                    await insurerServiceLevelAgreement.set(data.insurerServiceLevelAgreement as FormData[]);
                }
                if (data.remarks) await this.meetingForFinalNegotiationRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.completeActivity) await this.completeActivity.click();
            }
            case 'Placement Slip Generation': {
                if (data.policyFrom) await this.plgPolicyFrom.set(data.policyFrom);
                if (data.policyTo) await this.plgPolicyTo.set(data.policyTo);
                if (data.sumInsured) await this.plgSumInsured.set(data.sumInsured);
                if (data.basicPremium) await this.plgBasicPremium.set(data.basicPremium);
                if (data.premiumInstallmentBased === "Yes") await this.premiumInstallmentYes.click();
                else if (data.premiumInstallmentBased === "No") await this.PremiumInstallmentNo.click();
                if (data.installments.length) {
                    await this.installmentsForm.set(data.installments as FormData[]);
                }
                if (data.fee) await this.fee.set(data.fee);
                if (data.feeInstallmentBased == "Yes") await this.feeInstallmentYes.click();
                else if (data.feeInstallmentBased == "No") await this.feeInstallmentNo.click();
                if (data.terrorismBrokeragePercent) await this.terrorismBrokeragePercentage.set(data.terrorismBrokeragePercent);
                if (data.serviceTaxPercent) await this.serviceTaxPercentage.set(data.serviceTaxPercent);
                if (data.serviceTaxCalculated) await this.serviceTaxCalculated.set(data.serviceTaxCalculated);
                if (data.others) await this.others.set(data.others);
                if (data.totalPremium) await this.totalPremium.set(data.totalPremium);
                if (data.placementSlipDate) await this.placementSlipDate.set(data.placementSlipDate);
                if (data.insurerDetails.length) {
                    await this.insurerDetailsForm.set(data.insurerDetails as FormData[]);
                }
                if (data.tpaDetails.length) {
                    await this.tpaDetailsForm.set(data.tpaDetails as FormData[]);
                }
                if (data.maxAgeOfDependents) await this.maxAgeOfDependents.set(data.maxAgeOfDependents);
                if (data.brokeragePercent) await this.brokeragePercent.set(data.brokeragePercent);
                if (data.brokerageAmount) await this.brokerageAmount.set(data.brokerageAmount);
                if (data.policyPlacedType == 'Multiple Insurers') {
                    await this.policyPlacedMultiple.click();
                } else if (data.policyPlacedType == 'Single Insurer') {
                    await this.policyPlacedSingle.click();
                }
                if (data.onlyLeadPays == "Yes") await this.onlyLeadPaysYes.click();
                else if (data.onlyLeadPays == "No") await this.onlyLeadPaysNo.click();
                if (data.leadInsurer) await this.LeadInsurer.set(data.leadInsurer);
                if (data.insurerShareAndBrokerageDetails.length) {
                    await this.plgShareAndBrokerageForm.set(data.insurerShareAndBrokerageDetails as FormData[]);
                }
                if (data.cdAccount == "Existing Account") {
                    await this.cdAccountExisting.click();
                    if (data.selectCdAccount) await this.selectCdAccount.set(data.selectCdAccount);
                }
                else if (data.cdAccount == "New Account") {
                    await this.cdAccountNew.click();
                }
                if (data.accountName) await this.accountName.set(data.accountName);
                if (data.openBalance) await this.openBalance.set(data.openBalance);
                if (data.cdAccountNumber) await this.cdAccountNumber.set(data.cdAccountNumber);
                if (data.transactionType) await this.transactionType.set(data.transactionType);
                if (data.paymentType) await this.paymentType.set(data.paymentType);
                if (data.chequeDate) await this.chequeDate.set(data.chequeDate);
                if (data.chequeAmount) await this.chequeAmount.set(data.chequeAmount);
                if (data.chequeNumber) await this.chequeNumber.set(data.chequeNumber);
                if (data.bankName) await this.bankName.set(data.bankName);
                if (data.remarks) await this.plgRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(300);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(300);
                    }
                }
                if (data.submitForApproval) this.submitForApproval.click();
                break;
            }
            case 'Premium Calculation': {
                await this.coversAndAssets.enterData(data.assests);
                if (data.remarks) await this.pcRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(300);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(300);
                    }
                }
                await this.completeActivity.click();
                break;
            }

            case 'Held Cover Note': {
                if (data.anyDeviations == 'Yes') await this.anyDeviationsYes.click();
                if (data.anyDeviations == "No") await this.anyDeviationsNo.click();
                if (data.enterDeviations) {
                    await this.enterDeviations.set(data.enterDeviations);
                }
                if (data.deviationAddressed == 'Yes') await this.deviationAddressedYes.click()
                if (data.deviationAddressed == "No") await this.deviationAddressedNo.click();
                if (data.resolution) {
                    await this.resolution.set(data.resolution);
                }
                if (data.revised == "Yes") await this.revisedHardCopyReceivedYes.click();
                if (data.revised == "No") await this.revisedHardCopyReceivedNo.click();
                if (data.acknowledgementBy) {
                    await this.acknowledgementBy.set(data.acknowledgementBy);
                }
                if (data.receiptDate) {
                    await this.receiptDate.set(data.receiptDate);
                }
                if (data.receiptNo) {
                    await this.receiptNo.set(data.receiptNo);
                }
                if (data.allDocsReceivedOn) {
                    await this.allDocsReceivedOn.set(data.allDocsReceivedOn);
                }
                if (data.remarks) await this.hcnRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(300);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(300);
                    }
                }
                if (data.submitForApproval) await this.submitForApproval.click();
                break;
            }
            case 'Policy Hard Copy Receipt': {
                if (data.insurerPolicyNo) await this.insurerPolicyNo.set(data.insurerPolicyNo);
                if (data.hardCopyReceivedOn) await this.hardCopyReceivedOn.set(data.hardCopyReceivedOn);
                if (data.anyDeviations == "yes") {
                    if (data.deviationAddressed == "Yes") {
                        if (data.resolution) await this.phcResolution.set(data.resolution);
                        if (data.revisedHardCopyReceived == 'Yes') await this.revisedHardCopyReceivedYes.click();
                        if (data.revisedHardCopyReceived == 'No') await this.revisedHardCopyReceivedNo.click();
                        if (data.devFromPremBrokerage == "Yes") await this.devFromPremBrokerageYes.click();
                        if (data.devFromPremBrokerage == "No") await this.devFromPremBrokerageNo.click();
                        if (data.basicPremium) await this.phcBasicPremium.set(data.basicPremium);
                        if (data.brokeragePercentage) await this.phcBrokeragePercentage.set(data.brokeragePercentage);
                        if (data.brokerageAmount) await this.phcBrokerageAmount.set(data.brokerageAmount);
                        if (data.coverages) await this.coverages.set(data.coverages);
                        if (data.exclusions) await this.exclusions.set(data.exclusions);
                        if (data.deductibles) await this.deductibles.set(data.deductibles);
                        if (data.basicCovers) await this.coversAndAssets.enterData(data.basicCovers);
                    }
                }
                if (data.remarks) await this.phcRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(300);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(300);
                    }
                }

                if (data.completeActivity) await this.completeActivity.click();
                break;
            }
            case 'Policy Docket': {
                if (data.dateOfIssuance) await this.dateOfIssuance.set(data.dateOfIssuance);
                if (data.heldCoverNoteDays) await this.heldCoverNoteDays.set(data.heldCoverNoteDays);
                if (data.policyDocumentDays) await this.policyDocumentDays.set(data.policyDocumentDays);
                if (data.policyDocketDays) await this.policyDocketDays.set(data.policyDocketDays);
                if (data.endorsementDays) await this.endorsementDays.set(data.endorsementDays);
                if (data.healthClaimsDays) await this.healthClaimsDays.set(data.healthClaimsDays);
                if (data.nonHealthClaimsDays) await this.nonHealthClaimsDays.set(data.nonHealthClaimsDays);
                if (data.mirDays) await this.mirDays.set(data.mirDays);
                if (data.monthlyMeetingDays) await this.monthlyMeetingDays.set(data.monthlyMeetingDays);
                if (data.quarterlyMeetingDays) await this.quarterlyMeetingDays.set(data.quarterlyMeetingDays);
                if (data.renewalNoticeDays) await this.renewalNoticeDays.set(data.renewalNoticeDays);
                if (data.dataCollectionDays) await this.dataCollectionDays.set(data.dataCollectionDays);
                if (data.remarks) await this.pdRemarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(300);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(300);
                    }
                }
                if (data.submitForApproval) await this.submitForApproval.click();
                break;
            }
            case 'Hand over Meet': {
                if (data.meeting == "New Meeting") {
                    await this.newMeeting.click();
                }
                if (data.meeting == "Existing Meeting") {
                    await this.existingMeeting.click();
                    await this.selectMeeting.set(data.selectMeeting);
                }
                if (data.meetingDate) await this.meetingDate.set(data.meetingDate);
                if (data.availableFrom) await this.availableFrom.set(data.availableFrom);
                if (data.availableTo) await this.availableTo.set(data.availableTo);
                if (data.typeOfMeeting) await this.typeOfMeeting.set(data.typeOfMeeting);
                if (data.location) await this.meetingLocation.set(data.location);
                if (data.companyContactPersons) await this.companyContactPersons.set(data.companyContactPersons);
                if (data.employeeParticipants) await this.employeeParticipants.set(data.employeeParticipants);
                if (data.agenda) await this.agenda.set(data.agenda);
                if (data.remarks) await this.kdmremarks.set(data.remarks);
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(1000);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(1000);
                    }
                }
                if (data.submitForApproval) await this.submitForApproval.click();
                break;
            }
            case 'Policy Confirmation': {
                if (data.anyDeviations == "Yes") {
                    await this.anyDeviationsYes.click();
                    if (data.enterDeviations) {
                        await this.pconfEnterDeviations.set(data.enterDeviations);
                    }
                    if (data.deviationAddressed == "Yes") {
                        await this.deviationAddressedYes.click();
                        if (data.resolution) {
                            await this.pconfResolution.set(data.resolution);
                        }
                        if (data.brokeragePercentage) await this.brokeragePercent.set(data.brokeragePercentage);
                        if (data.brokerageAmount) await this.brokerageAmount.set(data.brokerageAmount);

                    }
                    if (data.deviationAddressed == "No") await this.deviationAddressedNo.click();
                }
                if (data.anyDeviations == "No") await this.anyDeviationsNo.click();
                if (data.remarks) {
                    await this.pconfRemarks.set(data.remarks);
                }
                if (data.documentType && data.file) {
                    for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                        await this.dvDocumentType.set(data.documentType[i]);
                        await this.page.waitForTimeout(300);
                        await this.fileUpload.fileUpload.set(data.file[i]);
                        await this.page.waitForTimeout(300);
                    }
                }

                if (data.completeActivity) await this.completeActivity.click();
                break;
            }
            default:
                throw new Error(`Unknown stage "${stage}"`);
        }
    }

    /**
     *@description - get(stage: Stage) returns an Json Object with all values of feilds for respective Stage.
     *@returns -a Json Object
     *@param values - StageName.
     *@usage - const actualBdplanning = await oppurtunityActivities.get("BD Planning");
     *!!The input Stage Name should be same as in the UI
     */
    async get(stage: Stage, data?: any, Id?: number): Promise<any> {
        switch (stage) {
            case 'BD Planning':
                return {
                    dataValidationDate: await this.dataValidationDate.getValue(),
                    dataValidationParticipants: (await (this.dataValidationParticipants).get("select-participants-data-validation")) ?? [],
                    kdmMeetingDate: await this.kdmMeetingDate.getValue(),
                    kdmMeetingParticipants: (await (this.kdmMeetingParticipants).get("select-participants-kdm-meeting")) ?? [],
                    mandateDetailsEntryDate: await this.mandateDetailsEntryDate.getValue(),
                    mandateDetailsEntryParticipants: (await (this.mandateDetailsEntryParticipants).get("select-participants-mandate-details-entry")) ?? [],
                    rfpDataCollectionDate: await this.rfpDataCollectionDate.getValue(),
                    rfpDataCollectionParticipants: (await (this.rfpDataCollectionParticipants).get("select-participants-rfp-data-collection")) ?? [],
                    rfpDetailsEntryDate: await this.rfpDetailsEntryDate.getValue(),
                    rfpDetailsEntryParticipants: (await (this.rfpDetailsEntryParticipants).get("select-participants-rfp-details-entry")) ?? [],
                };
            case 'Data Validation':
                return {
                    remarks: await this.dvremarks.getValue(),
                    documentType: await (this.fileUpload).getAllUploadedFilesWithTypes("doctypes"),
                    filename: await (this.fileUpload).getAllUploadedFilesWithTypes("filenames")
                };

            case 'KDM Meeting': {
                const isNewMeeting =
                    (await (this.newMeeting as any).isSelected?.()) ??
                    (await (this.newMeeting as any).isChecked?.()) ?? true;

                return {
                    isNewMeeting,
                    isExistingMeeting: !isNewMeeting,
                    selectMeeting: !isNewMeeting ? await this.selectMeeting.getValue() : null,
                    meetingDate: await this.meetingDate.getValue(),
                    availableFrom: await this.availableFrom.getValue(),
                    availableTo: await this.availableTo.getValue(),
                    meetingLocation: await this.meetingLocation.getValue(),
                    companyContactPersons:
                        (await this.companyContactPersons.get('form-field-multiselect-companyContactPerson')) ?? [],
                    employeeParticipants:
                        (await this.employeeParticipants.get('form-field-multiSelectFieldByApi-employees')) ?? [],

                    agenda: await this.agenda.getValue(),
                    remarks: await this.kdmremarks.getValue(),
                    documentType: await (this.fileUpload).getAllUploadedFilesWithTypes("doctypes"),
                    filename: await (this.fileUpload).getAllUploadedFilesWithTypes("filenames")
                };
            }

            case 'Mandate Details Entry': {
                const fullMandate = await isEnabledOrNot((this.fullMandate as any).element);
                const restrictedMandate = await isEnabledOrNot((this.restrictedMandate as any).element);
                const brokeragePercentage = await isEnabledOrNot((this.brokeragePercentage as any).element);
                const brokerageFee = await isEnabledOrNot((this.brokerageFee as any).element);
                const fixedFee = await isEnabledOrNot((this.fixedFee as any).element);

                return {
                    fullMandate,
                    restrictedMandate,
                    signedBy: (await this.signedBy.get('form-field-multiSelectFieldByApi-mandateDetailsContacts')) ?? [],
                    validFrom: await this.validFrom.getValue(),
                    validTo: await this.validTo.getValue(),
                    brokeragePercentage,
                    brokerageFee,
                    fixedFee,
                    compensationPayable: await this.compensationPayable.getValue(),
                    issuedOn: await this.issuedOn.getValue(),
                    remarks: await this.mandateRemarks.getValue(),
                    documentType: await (this.fileUpload).getAllUploadedFilesWithTypes("doctypes"),
                    filename: await (this.fileUpload).getAllUploadedFilesWithTypes("filenames")
                };
            }

            case 'RFP Data Collection': {
                if (!data?.basicCovers?.length) {
                    throw new Error('get("RFP Data Collection", data) expects data.basicCovers: {name,type,value}[]');
                }

                const coversMap: Record<string, string> = {};
                for (const { name } of data.basicCovers) {
                    const val = await this.coversAndAssets.get(name);
                    coversMap[name] = (val ?? '').trim();
                }
                return {
                    basicCovers: makeQuotes(coversMap),
                    remarks: await this.rfpRemarks.getValue(),
                    documentType: await (this.fileUpload).getAllUploadedFilesWithTypes("doctypes"),
                    filename: await (this.fileUpload).getAllUploadedFilesWithTypes("filenames")
                };
            }

            case 'RFP Details Entry': {
                const multipleBrokerInvolvedYes = await isEnabledOrNot((this.multipleBrokerInvolvedYes as any).element);
                const multipleBrokerInvolvedNo = await isEnabledOrNot((this.multipleBrokerInvolvedNo as any).element);
                const isMarketAllocationDoneYes = await isEnabledOrNot((this.isMarketAllocationDoneYes as any).element);
                const isMarketAllocationDoneNo = await isEnabledOrNot((this.isMarketAllocationDoneNo as any).element);
                const preferredInsurers = await new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG).get();
                const preferredTpas = await new UniversalForm(this.page, PREFERRED_TPAS_CONFIG).get();
                const excludedInsurers = await new UniversalForm(this.page, EXCLUDED_INSURERS_CONFIG).get();
                const excludedTpas = await new UniversalForm(this.page, EXCLUDED_TPAS_CONFIG).get();
                return {
                    description: await this.rfpDetailsDescription.getValue(),
                    requirements: await this.rfpDetailsRequirements.getValue(),
                    preferredInsurers,
                    preferredTpas,
                    excludedInsurers,
                    excludedTpas,
                    multipleBrokerInvolvedYes,
                    multipleBrokerInvolvedNo,
                    isMarketAllocationDoneYes,
                    isMarketAllocationDoneNo,
                    contact: await this.contact.getValue(),
                    ultimateDecision:
                        (await this.ultimateDecision.get('form-field-multiselect-decisionInfluencers')) ?? [],

                    expectedPremiumOfClient: await this.expectedPremiumOfClient.getValue(),
                    clientExpectations: await this.clientExpectations.getValue(),
                    threatsFromExistingInsurer: await this.threatsFromExistingInsurer.getValue(),
                    threatsFromExistingBroker: await this.threatsFromExistingBroker.getValue(),
                    extraneousFactorsAffectingClientDecision: await this.extraneousFactorsAffectingClientDecision.getValue(),
                    ourStrategyPlanForClosingDeal: await this.ourStrategyPlanForClosingDeal.getValue(),
                    targetQcrDate: await this.targetQcrDate.getValue(),
                    remarks: await this.rfpDetailsEntryRemarks.getValue(),
                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames')
                };
            }
            case 'ISG Planning':
                return {
                    brokingSlipGenerationDate: await this.brokingSlipGenerationDate.getValue(),
                    brokingSlipGenerationParticipants: (await this.brokingSlipGenerationParticipants.get('select-participants-broking-slip-generation')) ?? [],

                    enterQuoteDate: await this.enterQuoteDate.getValue(),
                    enterQuoteParticipants: (await this.enterQuoteParticipants.get('select-participants-enter-quote')) ?? [],

                    qcrGenerationDate: await this.qcrGenerationDate.getValue(),
                    qcrGenerationParticipants: (await this.qcrGenerationParticipants.get('select-participants-qcr-generation')) ?? [],

                    meetingForFinalNegotiationDate: await this.meetingForFinalNegotiationDate.getValue(),
                    meetingForFinalNegotiationParticipants:
                        (await this.meetingForFinalNegotiationParticipants.get('select-participants-meeting-for-final-negotiation')) ?? [],

                    placementSlipGenerationDate: await this.placementSlipGenerationDate.getValue(),
                    placementSlipGenerationParticipants:
                        (await this.placementSlipGenerationParticipants.get('select-participants-placement-slip-generation')) ?? [],

                    premiumCalculationDate: await this.premiumCalculationDate.getValue(),
                    premiumCalculationParticipants: (await this.premiumCalculationParticipants.get('select-participants-premium-calculation')) ?? [],

                    heldCoverNoteDate: await this.heldCoverNoteDate.getValue(),
                    heldCoverNoteParticipants: (await this.heldCoverNoteParticipants.get('select-participants-held-cover-note')) ?? [],

                    policyHardCopyReceiptDate: await this.policyHardCopyReceiptDate.getValue(),
                    policyHardCopyReceiptParticipants: (await this.policyHardCopyReceiptParticipants.get('select-participants-policy-hard-copy-receipt')) ?? [],

                    policyDocketDate: await this.policyDocketDate.getValue(),
                    policyDocketParticipants: (await this.policyDocketParticipants.get('select-participants-policy-docket')) ?? [],

                    handOverMeetDate: await this.handOverMeetDate.getValue(),
                    handOverMeetParticipants: (await this.handOverMeetParticipants.get('select-participants-hand-over-meet')) ?? [],

                    policyConfirmationDate: await this.policyConfirmationDate.getValue(),
                    policyConfirmationParticipants: (await this.policyConfirmationParticipants.get('select-participants-policy-confirmation')) ?? [],
                };
            case 'Broking Slip Generation': {
                const preferredInsurers = await new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG).get();
                const preferredTpas = await new UniversalForm(this.page, PREFERRED_TPAS_CONFIG).get();
                return {
                    sumInsured: await this.brokenSlipsumInsured.getValue(),
                    brokeragePercentage: await this.brokenSlipbrokeragePercentage.getValue(),
                    policyFrom: await this.policyFrom.getValue(),
                    policyTo: await this.policyTo.getValue(),
                    renewalDate: await this.renewalDate.getValue(),
                    timelineForQuoteReceipt: await this.timelineForQuoteReceipt.getValue(),
                    businessActivitiesOfCompany: await this.businessActivitiesOfCompany.getValue(),
                    preferredInsurers,
                    preferredTpas,
                    otherRiskMitigationFeatures: await this.otherRiskMitigationFeatures.getValue(),
                    otherClauses: await this.otherClauses.getValue(),
                    insurerRemarks: await this.insurerRemarks.getValue(),
                    bsgRemarks: await this.bsgRemarks.getValue(),
                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames'),
                };
            }
            case 'Enter Quote': {
                const basicQuoteData = {
                    remarks: await this.enterQuoteRemarks.getValue(),
                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames'),
                };
                try {
                    const quoteDetails = new Details(this.page, "Enter quotations");
                    const additionalQuoteDetails = {

                        selectedInsuer: await quoteDetails.get("Selected insurer"),
                        quoteRecievedOn: await quoteDetails.get("Quote received on"),
                        basicPremium: await quoteDetails.get("Basic Premium"),
                        terrorism: await quoteDetails.get("Terrorism"),
                        netPremium: await quoteDetails.get("Net premium"),
                        brokerage: await quoteDetails.get("Brokerage"),
                    };
                    return {
                        ...basicQuoteData,
                        ...additionalQuoteDetails
                    };
                } catch (error) {
                    console.warn('Quote Details section not found, returning basic quote data only:', error);
                    return basicQuoteData;
                }
            }
            case 'QCR Generation': {
                return {
                    insuranceMarket: await this.insuranceMarket.getValue(),
                    clientSpecific: await this.clientSpecific.getValue(),
                    issuesFacedByUs: await this.issuesFacedByUs.getValue(),
                    industryBenchMarkingComments: await this.industryBenchMarkingComments.getValue(),
                    ourAnalysisAndRecommendation: await this.ourAnalysisAndRecommendation.getValue(),
                    overallComments: await this.overallComments.getValue(),
                    qcrRemarks: await this.qcrRemarks.getValue(),
                };

            }
            case 'Placement Slip Generation': {
                const premiumInstallmentYes =
                    await isEnabledOrNot((this.premiumInstallmentYes as any).element);
                const PremiumInstallmentNo =
                    await isEnabledOrNot((this.PremiumInstallmentNo as any).element);

                const feeInstallmentYes =
                    await isEnabledOrNot((this.feeInstallmentYes as any).element);
                const feeInstallmentNo =
                    await isEnabledOrNot((this.feeInstallmentNo as any).element);

                const policyPlacedMultiple =
                    await isEnabledOrNot((this.policyPlacedMultiple as any).element);
                const policyPlacedSingle =
                    await isEnabledOrNot((this.policyPlacedSingle as any).element);

                const onlyLeadPaysYes =
                    await isEnabledOrNot((this.onlyLeadPaysYes as any).element);
                const onlyLeadPaysNo =
                    await isEnabledOrNot((this.onlyLeadPaysNo as any).element);

                return {
                    // Policy basics
                    policyFrom: await this.plgPolicyFrom.getValue(),
                    policyTo: await this.plgPolicyTo.getValue(),
                    sumInsured: await this.plgSumInsured.getValue(),
                    basicPremium: await this.plgBasicPremium.getValue(),

                    // Installment flags + rows
                    premiumInstallmentYes,
                    PremiumInstallmentNo,
                    installments: await this.installmentsForm.get(),

                    // Fees
                    fee: await this.fee.getValue(),
                    feeInstallmentYes,
                    feeInstallmentNo,

                    // Tax & totals
                    terrorismBrokeragePercent: await this.terrorismBrokeragePercentage.getValue(),
                    serviceTaxPercent: await this.serviceTaxPercentage.getValue(),
                    serviceTaxCalculated: await this.serviceTaxCalculated.getValue(),
                    others: await this.others.getValue(),
                    totalPremium: await this.totalPremium.getValue(),
                    placementSlipDate: await this.placementSlipDate.getValue(),

                    // Party details repeaters
                    insurerDetails: await this.insurerDetailsForm.get(),
                    tpaDetails: await this.tpaDetailsForm.get(),

                    // Additional attributes
                    maxAgeOfDependents: await this.maxAgeOfDependents.getValue(),
                    brokeragePercent: await this.brokeragePercent.getValue(),
                    brokerageAmount: await this.brokerageAmount.getValue(),
                    policyPlacedMultiple,
                    policyPlacedSingle,
                    onlyLeadPaysYes,
                    onlyLeadPaysNo,
                    leadInsurer: await this.LeadInsurer.getValue(),

                    insurerShareAndBrokerageDetails: await this.plgShareAndBrokerageForm.get(),

                    // Payment & CD account
                    paymentType: await this.paymentType.getValue(),
                    cdAccountExisting: await isEnabledOrNot((this.cdAccountExisting as any).element),
                    cdAccountNew: await isEnabledOrNot((this.cdAccountNew as any).element),
                    selectCdAccount: await this.selectCdAccount.getValue(),
                    accountName: await this.accountName.getValue(),
                    openBalance: await this.openBalance.getValue(),
                    cdAccountNumber: await this.cdAccountNumber.getValue(),
                    transactionType: await this.transactionType.getValue(),
                    chequeDate: await this.chequeDate.getValue(),
                    chequeAmount: await this.chequeAmount.getValue(),
                    chequeNumber: await this.chequeNumber.getValue(),
                    bankName: await this.bankName.getValue(),
                    // Remarks
                    remarks: await this.plgRemarks.getValue(),

                    // Uploaded docs
                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames'),
                };
            }
            case 'Premium Calculation': {
                return {
                    natureOfProperty: await this.natureOfProperty.get(),
                    totalSumInsured: await this.totalSumInsured.get(),
                    basisOfValuation: await this.basisOfValuation.get(),
                    claimStatusNatureOfClaims: await this.claimStatus.get(),
                    remarks: await this.pcRemarks.getValue,
                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames'),
                };
            }
            case 'Held Cover Note': {
                const revisedYes = await isEnabledOrNot((this.revisedHcnReceivedYes as any).element);
                const devYes = await isEnabledOrNot((this.anyDeviationsYes as any).element);
                const addressedYes = await isEnabledOrNot((this.deviationAddressedYes as any).element);
                return {
                    revisedHcnReceived: revisedYes,
                    acknowledgementBy: await this.acknowledgementBy.getValue(),
                    receiptDate: await this.receiptDate.getValue(),
                    receiptNo: await this.receiptNo.getValue(),
                    allDocsReceivedOn: await this.allDocsReceivedOn.getValue(),

                    anyDeviations: devYes,
                    enterDeviations: await this.enterDeviations.getValue(),
                    deviationAddressed: addressedYes,
                    resolution: await this.resolution.getValue(),
                };
            }
            case 'Policy Hard Copy Receipt': {
                const devFromPremBrokerageYes =
                    await isEnabledOrNot((this.devFromPremBrokerageYes as any).element);
                const anyDeviationsYes =
                    await isEnabledOrNot((this.phcAnyDeviationsYes as any).element);
                const deviationAddressedYes =
                    await isEnabledOrNot((this.phcDeviationAddressedYes as any).element);
                const revisedHardCopyReceivedYes =
                    await isEnabledOrNot((this.revisedHardCopyReceivedYes as any).element);

                return {
                    insurerPolicyNo: await this.insurerPolicyNo.getValue(),
                    hardCopyReceivedOn: await this.hardCopyReceivedOn.getValue(),
                    devFromPremBrokerage: devFromPremBrokerageYes,
                    basicPremium: await this.phcBasicPremium.getValue(),
                    brokeragePercentage: await this.phcBrokeragePercentage.getValue(),
                    brokerageAmount: await this.phcBrokerageAmount.getValue(),

                    anyDeviations: anyDeviationsYes,
                    coverages: await this.coverages.getValue(),
                    exclusions: await this.exclusions.getValue(),
                    deductibles: await this.deductibles.getValue(),
                    deviationAddressed: deviationAddressedYes,
                    resolution: await this.phcResolution.getValue(),
                    revisedHardCopyReceived: revisedHardCopyReceivedYes,
                    remarks: await this.phcRemarks.getValue(),
                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames'),
                };
            }
            case 'Policy Docket': {
                return {
                    dateOfIssuance: await this.dateOfIssuance.getValue(),
                    heldCoverNoteDays: await this.heldCoverNoteDays.getValue(),
                    policyDocumentDays: await this.policyDocumentDays.getValue(),
                    policyDocketDays: await this.policyDocketDays.getValue(),
                    endorsementDays: await this.endorsementDays.getValue(),
                    healthClaimsDays: await this.healthClaimsDays.getValue(),
                    nonHealthClaimsDays: await this.nonHealthClaimsDays.getValue(),
                    mirDays: await this.mirDays.getValue(),
                    monthlyMeetingDays: await this.monthlyMeetingDays.getValue(),
                    quarterlyMeetingDays: await this.quarterlyMeetingDays.getValue(),
                    renewalNoticeDays: await this.renewalNoticeDays.getValue(),
                    dataCollectionDays: await this.dataCollectionDays.getValue(),
                    remarks: await this.pdRemarks.getValue(),
                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames')
                };
            }
            case 'Policy Confirmation': {
                const policyDataWrongYes = await isEnabledOrNot((this.policyDataWrongYes as any).element);
                const policyDataRectifiedYes = await isEnabledOrNot((this.policyDataRectifiedYes as any).element);
                return {
                    isPolicyDataWrong: policyDataWrongYes,
                    enterDeviations: await this.pconfEnterDeviations.getValue(),
                    isPolicyDataRectified: policyDataRectifiedYes,
                    resolution: await this.pconfResolution.getValue(),
                    remarks: await this.pconfRemarks.getValue(),

                    documentType: await this.fileUpload.getAllUploadedFilesWithTypes('doctypes'),
                    filename: await this.fileUpload.getAllUploadedFilesWithTypes('filenames'),
                };
            }
            default:
                throw new Error(`Unknown stage "${stage}"`);
        }
    }

    async wait(timeout: number) {
        await this.page.waitForTimeout(timeout);
    }

    accordian() {
        return new Accordion(this.page);
    }
    quoteComparision(){
        return new QuoteComparisonHeaderPage(this.page);
    }

}