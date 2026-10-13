import { type Locator, type Page } from '@playwright/test';
import { TextElement } from '../framework/text.element';
import { ButtonElement } from '../framework/button.element';
import { RichTextElement } from '../framework/richtext.element';
import { DateElement } from '../framework/date.element';
import { Address } from '../classes/Address';
import { GST } from '../classes/GST';
import { SelectElement } from '../framework/select.element';
import { Dialog } from '../appcomponents/Dialog.component';
import { Toast } from '../appcomponents/Toast.component';
import { SnackBar } from '../appcomponents/SnackBar.component';
import { TIMEOUTS } from '../env/timeouts';
import { BasePage } from './Base.page';

export class AddCompanyPage extends BasePage {
    readonly page: Page;

    // HEADER
    private breadcrumbs: Locator;
    progressIndicator: Locator;

    // BASIC
    readonly companyName: TextElement;
    readonly displayName: TextElement;
    readonly typeOfCompany: SelectElement;
    readonly industrySegment: SelectElement;
    readonly priority: SelectElement;
    readonly isGroupCompany: SelectElement;
    readonly parentCompanyName: SelectElement;
    readonly numberOfEmployees: TextElement;
    readonly companyWebsite: TextElement;
    readonly sourceType: SelectElement;
    readonly source: TextElement;
    readonly sentiment: SelectElement;
    readonly leadCRM: TextElement;
    readonly accountManager: SelectElement;
    readonly country: SelectElement;
    readonly status: SelectElement;

    // ADDRESS
    readonly addressType: SelectElement;
    readonly addressLine: TextElement;
    readonly addressLine2: TextElement;
    readonly addressArea: TextElement;
    readonly addressCountry: SelectElement;
    readonly addressState: SelectElement;
    readonly addressCity: SelectElement;
    readonly addressPinCode: TextElement;
    readonly addressPhoneNumber: TextElement;
    readonly addressEmailAddress: TextElement;
    readonly addressAlternatePhoneNumber: TextElement;
    readonly addressSupportNumber: TextElement;

    // KYC: FOR INDIA
    readonly registrationNumber: TextElement;
    readonly TAN: TextElement;
    readonly PANNumber: TextElement;
    readonly incorporationDate: DateElement;
    readonly currency: SelectElement;
    readonly annualPremium: TextElement;

    // KYC: FOR SRI LANKA
    readonly businesRegistrationNumber: TextElement;
    readonly svat: TextElement;
    readonly vat: TextElement;
    readonly taxIdentificationNumber: TextElement;
    readonly formedOn: DateElement;
    

    // PROFILE
    readonly companyHistory: RichTextElement;
    readonly majorProducts: RichTextElement;
    readonly keyCustomers: RichTextElement;
    readonly businessProcesses: RichTextElement;
    readonly remarks: RichTextElement;

    // STRATEGY
    // readonly addIntelligentData_btn: Locator;
    readonly whyThisAccount: RichTextElement;
    readonly ourCompetition: RichTextElement;
    readonly targetingReason: RichTextElement;
    readonly ourWeaknesses: RichTextElement;
    readonly actionPlan: RichTextElement;
    readonly potentialOpportunities: RichTextElement;
    readonly industryIntelligence: ButtonElement;
    readonly salesPitch: RichTextElement;
    readonly ourServicePlan: RichTextElement;
    readonly clientAcquisitionHistoryAndCurrentDynamics: RichTextElement;
    readonly currentBusinessProfile: RichTextElement;
    readonly ourServicePerformance: RichTextElement;

    // FOOTER
    readonly cancel: ButtonElement;
    readonly next: ButtonElement;
    readonly previous: ButtonElement;
    readonly saveAndExit: ButtonElement;
    readonly submit: ButtonElement;

    // DIALOG
    readonly removeSection: Dialog;
    readonly confirmRemoval: ButtonElement;

    // Toast
    readonly toast: Toast;

    // Snack Bar
    readonly snackBar: SnackBar;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.progressIndicator = page.getByTestId('progress-text');
        this.breadcrumbs = page.locator("//nav[@aria-label='breadcrumb']").locator('li');

        this.companyName = new TextElement(page, page.getByTestId('form-field-text-companyName').locator('input'), page.getByTestId('form-field-text-companyName').locator('p').nth(1));
        this.displayName = new TextElement(page, page.getByTestId('form-field-text-displayName').locator('input'), page.getByTestId('form-field-text-displayName').locator('p').nth(1));
        this.typeOfCompany = new SelectElement(page, 'form-field-select-companyTypeLid');
        this.industrySegment = new SelectElement(page, 'form-field-select-industrySegmentLid');
        this.priority = new SelectElement(page, 'form-field-select-priorityLid');
        this.isGroupCompany = new SelectElement(page, 'form-field-select-groupCompanyLid');
        this.parentCompanyName = new SelectElement(page, 'form-field-selectFieldByApi-parentCompanyLid');
        this.numberOfEmployees = new TextElement(page, page.getByTestId('form-field-number-noOfEmployees').locator('input'), page.getByTestId('form-field-text-noOfEmployees').locator('p').nth(1));
        this.companyWebsite = new TextElement(page, page.getByTestId('form-field-text-website').locator('input'), page.getByTestId('form-field-text-website').locator('p').nth(1));
        this.sourceType = new SelectElement(page, 'form-field-select-sourceTypeLid');
        this.source = new TextElement(page, page.getByTestId('form-field-text-source').locator('input'), page.getByTestId('form-field-text-source').locator('p').nth(1));
        this.sentiment = new SelectElement(page, 'form-field-select-sentimentLid');
        this.leadCRM = new TextElement(page, page.getByTestId('form-field-text-leadCrm').locator('input'));
        this.accountManager = new SelectElement(page, 'form-field-selectFieldByApi-accountManager');
        this.country = new SelectElement(page, 'form-field-select-countryId');
        this.status = new SelectElement(page, 'form-field-select-status');

        this.registrationNumber = new TextElement(page, page.getByTestId('form-field-text-registrationNo').locator('input'), page.getByTestId('form-field-text-registrationNo').locator('p').nth(1));
        this.TAN = new TextElement(page, page.getByTestId('form-field-text-tanNumber').locator('input'), page.getByTestId('form-field-text-tanNumber').locator('p').nth(1));
        this.PANNumber = new TextElement(page, page.getByTestId('form-field-text-panCardNumber').locator('input'), page.getByTestId('form-field-text-panCardNumber').locator('p').nth(1));
        this.incorporationDate = new DateElement(page, page.getByTestId('form-field-date-dateOfIncorporation').locator('input'), page.getByTestId('form-field-date-dateOfIncorporation').locator('p').nth(1));
        this.currency = new SelectElement(page, 'form-field-select-currencyId');
        this.annualPremium = new TextElement(page, page.getByTestId('form-field-currency-annualPremium').locator('input'), page.getByTestId('form-field-currency-annualPremium').locator('p').nth(1));

        this.businesRegistrationNumber = new TextElement(page, page.getByText("Business registration number", { exact: true }).locator("..").locator("input"), page.getByText("Business registration number").locator("..").locator("p").nth(1));
        this.svat = new TextElement(page, page.getByText("SVAT", { exact: true }).locator("..").locator("input"), page.getByText("SVAT", { exact: true }).locator("..").locator("p").nth(1));
        this.svat = new TextElement(page, page.getByText("VAT", { exact: true }).locator("..").locator("input"), page.getByText("VAT", { exact: true }).locator("..").locator("p").nth(1));
        this.taxIdentificationNumber = new TextElement(page, page.getByText("Tax Identification No.", {  exact: true}).locator("..").locator("input"), page.getByText("Tax Identification No.", {  exact: true}).locator("..").locator("p").nth(1));
        this.formedOn = new DateElement(page, page.getByText("Formed On", { exact: true }).locator("..").locator("input"), page.getByText("Formed On", { exact: true }).locator("..").locator("p").nth(1));
        
        this.companyHistory = new RichTextElement(page, page.getByTestId('form-field-richtext-companyHistory').first(), page.getByTestId('form-field-richtext-companyHistory').locator('p').nth(1));
        this.majorProducts = new RichTextElement(page, page.getByTestId('form-field-richtext-majorProducts'), page.getByTestId('form-field-richtext-majorProducts').locator('p').nth(1));
        this.keyCustomers = new RichTextElement(page, page.getByTestId('form-field-richtext-keyCustomers'), page.getByTestId('form-field-richtext-keyCustomers').locator('p').nth(1));
        this.businessProcesses = new RichTextElement(page, page.getByTestId('form-field-richtext-businessProcesses'), page.getByTestId('form-field-richtext-businessProcesses').locator('p').nth(1));
        this.remarks = new RichTextElement(page, page.getByTestId('form-field-richtext-remarks'), page.getByTestId('form-field-richtext-remarks').locator('p').nth(1));
        
        this.whyThisAccount = new RichTextElement(page, page.getByTestId('form-field-richtext-accountStrategy'), page.getByTestId('form-field-richtext-accountStrategy').locator('p').nth(1));
        this.ourCompetition = new RichTextElement(page, page.getByTestId('form-field-richtext-competitor'), page.getByTestId('form-field-richtext-competitor').locator('p').nth(1));
        this.targetingReason = new RichTextElement(page, page.getByTestId('form-field-richtext-targetingReason'), page.getByTestId('form-field-richtext-targetingReason').locator('p').nth(1));
        this.ourWeaknesses = new RichTextElement(page, page.getByTestId('form-field-richtext-weakness'), page.getByTestId('form-field-richtext-weakness').locator('p').nth(1));
        this.actionPlan = new RichTextElement(page, page.getByTestId('form-field-richtext-actionPlan'), page.getByTestId('form-field-richtext-actionPlan').locator('p').nth(1));
        this.potentialOpportunities = new RichTextElement(page, page.getByTestId('form-field-richtext-potentialOpportunity'), page.getByTestId('form-field-richtext-potentialOpportunity').locator('p').nth(1));
        this.industryIntelligence = new ButtonElement(page, page.getByRole("button", {name: "Industry Intelligence"}));
        this.salesPitch = new RichTextElement(page, page.getByTestId('form-field-richtext-salesPitch'), page.getByTestId('form-field-richtext-salesPitch').locator('p').nth(1));
        
        this.ourServicePlan = new RichTextElement(page, page.getByTestId('form-field-richtext-servicePlan'), page.getByTestId('form-field-richtext-servicePlan').locator('p').nth(1));
        this.clientAcquisitionHistoryAndCurrentDynamics = new RichTextElement(page, page.getByTestId('form-field-richtext-acquisitionHistory'), page.getByTestId('form-field-richtext-acquisitionHistory').locator('p').nth(1));
        this.currentBusinessProfile = new RichTextElement(page, page.getByTestId('form-field-richtext-bizProfile'), page.getByTestId('form-field-richtext-bizProfile').locator('p').nth(1));
        this.ourServicePerformance = new RichTextElement(page, page.getByTestId('form-field-richtext-servicePerformance'), page.getByTestId('form-field-richtext-servicePerformance').locator('p').nth(1));
        
        this.next = new ButtonElement(page, page.getByRole('button', { name: 'Next' }));
        this.previous = new ButtonElement(page, page.getByRole('button', { name: 'Previous' }));
        this.cancel = new ButtonElement(page, page.getByRole('button', { name: 'Cancel' }));
        this.saveAndExit = new ButtonElement(page, page.getByRole("button", { name: 'Save and Exit' }));
        this.submit = new ButtonElement(page,page.getByRole('button', { name: 'Submit' }));

        this.removeSection = new Dialog(page);
        this.confirmRemoval = this.removeSection.button("Remove");

        this.toast = new Toast(page);
        this.snackBar = new SnackBar(page);
    }

    async get_pageTitle() {
        return this.page.title();
    }

    async get_progressPercent() {
        return this.progressIndicator.textContent();
    }

    async get_breadcrumbs() {
        return this.breadcrumbs.textContent();
    }

    address(index: number) {
        return new Address(this.page, index);
    }

    gst(index: number) {
        return new GST(this.page, index);
    }

    async click_breadcrumb(label: string) {
        const element = this.breadcrumbs.locator('text=' + label);

            await element.click();
            await this.page.waitForLoadState('domcontentloaded');
    }
    
    async wait(timeout: number) {
        await this.page.waitForTimeout(timeout);
    }

    /**
     * Enters company data into the form fields and navigates through the multi-step company creation process.
     *
     * This method fills out the company details, address, registration information, and additional business information
     * based on the provided `companyData` object. The form adapts to different country codes ("IND" or "SLK") and
     * handles dynamic fields such as multiple addresses and GST entries. It also manages conditional logic for group companies
     * and disables/enables fields as required.
     *
     * @param companyData - An object containing all the necessary company information to be entered into the form.
     * @param randomNum - An optional random number used to generate unique values for certain fields.
     * @param country - The country code to determine which registration fields to fill. Defaults to "IND".
     * @throws Error if an invalid country code is provided.
     */
    async enterData(companyData: any, randomNum?: Number, country: string = "IND") {
        let index : number = 0;

        await this.displayName.enter(companyData.displayName + (randomNum ? `_${randomNum}` : ''));
        await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);  // Due to fetching data from the AI
        await this.typeOfCompany.set(companyData.companyType);
        await this.industrySegment.set(companyData.industrySegment);
        await this.priority.set(companyData.priority);
        if (await this.isGroupCompany.getValue() !== companyData.isGroupCompany) {
            await this.isGroupCompany.set(companyData.isGroupCompany);
        }
        if (companyData.isGroupCompany === 'Yes') {
            await this.parentCompanyName.set(companyData.parentCompanyName);
        }
        await this.numberOfEmployees.enter(companyData.numberOfEmployees);
        await this.companyWebsite.enter(companyData.website);
        await this.sourceType.set(companyData.sourceType);
        await this.source.enter(companyData.source);
        await this.sentiment.set(companyData.sentiment);
        await this.accountManager.set(companyData.accountManager);
        if (await this.status.getValue() !== companyData.status) {
            await this.status.set(companyData.status);
        }

        index = 0;
        for (let i = 0; i < companyData.address.length; i++) {
            await this.address(index).set(companyData.address[index], true, false);
            index++;
            if (index < companyData.address.length) {
                await this.address(index-1).addAddress.click();
            }            
        }

        await this.next.click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        if( country === "IND" ) {
            await this.registrationNumber.enter("U" + `${randomNum}` +"5AB" + `${randomNum}` +"PLC12" + (randomNum ? `${randomNum}` : ''));
            await this.TAN.enter("TANN0" + (randomNum ? `${randomNum}` : '') + 'A');
            await this.PANNumber.enter("AUTOM" + (randomNum ? `${randomNum}` : '') + 'A');
            await this.incorporationDate.set(companyData.KYCDetails.incorporationDate);
            await this.annualPremium.enter(companyData.KYCDetails.annualPremium);

            index = 0;
            for (var gstData in companyData.GST) {
                await this.gst(index).GSTState.set(companyData.GST[index].state);
                await this.gst(index).GSTCategory.set(companyData.GST[index].category);
                await this.gst(index).GSTNumber.enter("27AUTOM" + (randomNum ? `${randomNum}` : '')+"F1Z" + `${index}`);
                
                index++;
                if (index < companyData.GST.length) {
                    await this.gst(index).addGST.click();
                    await this.page.waitForLoadState('domcontentloaded');
                }
            }
        }
        else if(country === "SLK") {
            await this.businesRegistrationNumber.set(`${companyData.businesRegistrationNumber}${randomNum}`);
            await this.svat.set(`${companyData.svat}`);
            await this.vat.set(`${companyData.vat}`);
            await this.taxIdentificationNumber.set(`${companyData.taxIdentificationNo}${randomNum}`);
            await this.formedOn.set(companyData.formedOn);
            if( !(await this.currency.isdisabled()) ) {
                await this.currency.set(companyData.currency);
            }
            await this.annualPremium.set(companyData.annualPremium);
        }
        else {
            throw new Error("Invalid country code");
        }
        
        // await this.page.waitForTimeout(500);
        await this.next.click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        await this.companyHistory.click();
        await this.companyHistory.set(companyData.companyHistory);
        await this.majorProducts.click();
        await this.majorProducts.set(companyData.majorProducts);
        await this.keyCustomers.click();
        await this.keyCustomers.set(companyData.keyCustomers);
        await this.businessProcesses.click();
        await this.businessProcesses.set(companyData.businessProcesses);
        await this.remarks.click();
        await this.remarks.set(companyData.remarks);

        await this.next.click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);

        await this.whyThisAccount.click();
        await this.whyThisAccount.set(companyData.whyThisAccount);
        await this.ourCompetition.click();
        await this.ourCompetition.set(companyData.ourCompetition);
        await this.targetingReason.click();
        await this.targetingReason.set(companyData.targetingReason);
        await this.ourWeaknesses.click();
        await this.ourWeaknesses.set(companyData.ourWeaknesses);
        await this.actionPlan.click();
        await this.actionPlan.set(companyData.actionPlan);
        // NO NEED TO FILL THE BELOW FIELDS, THEY ARE AUTO FILLED BY AI AFTER CLICKING "Industry Intelligence" BUTTON
        // await this.potentialOpportunities.click();
        // await this.potentialOpportunities.set(companyData.potentialOpportunities);
        // await this.industryIntelligence.click();
        // await this.industryIntelligence.set(companyData.industryIntelligence);
        // await this.salesPitch.click();
        // await this.salesPitch.set(companyData.salesPitch);
        await this.ourServicePlan.click();
        await this.ourServicePlan.set(companyData.ourServicePlan);
        await this.clientAcquisitionHistoryAndCurrentDynamics.click();
        await this.clientAcquisitionHistoryAndCurrentDynamics.set(companyData.clientAcquisitionHistoryAndCurrentDynamics);
        await this.currentBusinessProfile.click();
        await this.currentBusinessProfile.set(companyData.currentBusinessProfile);
        await this.ourServicePerformance.click();
        await this.ourServicePerformance.set(companyData.ourServicePerformance);
    }
}