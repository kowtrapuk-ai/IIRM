import { Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { RichTextElement } from '../framework/richtext.element';
import { DateElement } from '../framework/date.element';
import { PREFERRED_INSURERS_CONFIG, PREFERRED_TPAS_CONFIG, UniversalForm } from '../classes/commonServiceProvider';
import { TIMEOUTS } from '../env/timeouts';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { getAllCovers, makeQuotes } from '../utils/coversUtils';

export class ROBrokingSlipGenerationPage {
  readonly page: Page;
  readonly brokingSlipSumInsured: TextElement;
  readonly brokingSlipBasicPremium: TextElement;
  readonly brokingSlipBrokeragePercentage: TextElement;
  readonly brokingSlipBrokerageAmount: TextElement;
  readonly policyFrom: DateElement;
  readonly policyTo: DateElement;
  readonly renewalDate: DateElement;
  readonly timelineForQuoteReceipt: DateElement;
  readonly businessActivitiesOfCompany: TextElement;
  readonly addNewVersion: ButtonElement;
  readonly saveVersion: ButtonElement;
  readonly approve: ButtonElement;
  readonly reject: ButtonElement;
  readonly duplicate: ButtonElement;
  readonly delete: ButtonElement;
  readonly otherRiskMitigationFeatures: TextElement;
  readonly otherClauses: TextElement;
  readonly insurerRemarks: TextElement;
  readonly bsgRemarks: TextElement;
  readonly documentType: SelectElement;
  readonly documentUpload: DocumentUploadElement;
  readonly saveActivity: ButtonElement;
  readonly submitForApproval: ButtonElement;

  constructor(page: Page) {
    this.page = page;
    this.brokingSlipSumInsured = new TextElement(page, page.getByTestId('form-field-number-sumInsured').locator('input'));
    this.brokingSlipBasicPremium = new TextElement(page, page.getByTestId('form-field-number-basicPremium').locator('input'));
    this.brokingSlipBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-brokeragePercentage').locator('input'));
    this.brokingSlipBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-brokerageAmount').locator('input'));
    this.policyFrom = new DateElement(page, page.getByTestId('form-field-date-policyFrom').locator('input'));
    this.policyTo = new DateElement(page, page.getByTestId('form-field-date-policyTo').locator('input'));
    this.renewalDate = new DateElement(page, page.getByTestId('form-field-date-renewalDate').locator('input'));
    this.timelineForQuoteReceipt = new DateElement(page, page.getByTestId('form-field-date-quoteReceiptTimeline').locator('input'));
    this.businessActivitiesOfCompany = new TextElement(page, page.getByTestId('form-field-textarea-businessActivity').locator('textarea').first());
    this.addNewVersion = new ButtonElement(page, page.getByTitle('Add new version').first());
    this.saveVersion = new ButtonElement(page, page.getByRole('button', { name: 'Save version' }));
    this.approve = new ButtonElement(page, page.getByRole('button', { name: 'Approve' }));
    this.reject = new ButtonElement(page, page.getByRole('button', { name: 'Reject' }));
    this.duplicate = new ButtonElement(page, page.getByRole('button', { name: 'Duplicate' }));
    this.delete = new ButtonElement(page, page.getByRole('button', { name: 'Delete' }));
    this.otherRiskMitigationFeatures = new TextElement(page, page.getByTestId('form-field-textarea-riskMitigationFeatures').locator('textarea').first());
    this.otherClauses = new TextElement(page, page.getByTestId('form-field-textarea-clauses').locator('textarea').first());
    this.insurerRemarks = new TextElement(page, page.getByTestId('form-field-textarea-insurerRemarks').locator('textarea').first());
    this.bsgRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
    this.documentType = new SelectElement(page, 'form-field-select-documentType');
    this.documentUpload = new DocumentUploadElement(
      page,
      page.getByTestId('form-field-select-documentType').locator('input').first(),
      page.locator('#fileUpload'),
      page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
    );
    this.saveActivity = new ButtonElement(page, page.getByRole('button', { name: 'Save Activity' }));
    this.submitForApproval = new ButtonElement(page, page.getByRole('button', { name: 'Submit for approval' }));
  }

  /**
   * Waits for the given timeout (useful for debug or controlled waits)
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async wait(timeout: number) {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Fills out the Broking Slip form with the given data and submits it.
   * Only fills fields present in the data object.
   * @param data Form values to set.
   */
  async set(data: any): Promise<void> {
    if (data.sumInsured) await this.brokingSlipSumInsured.set(data.sumInsured);
    if(data.basicPremium) await this.brokingSlipBasicPremium.set(data.basicPremium);
    if (data.brokeragePercentage) await this.brokingSlipBrokeragePercentage.set(data.brokeragePercentage);
    if( data.brokerageAmount) await this.brokingSlipBrokerageAmount.set(data.brokerageAmount);
    if (data.policyFrom) await this.policyFrom.set(data.policyFrom);
    if (data.policyTo) await this.policyTo.set(data.policyTo);
    if (data.renewalDate) await this.renewalDate.set(data.renewalDate);
    if (data.timelineForQuoteReceipt) await this.timelineForQuoteReceipt.set(data.timelineForQuoteReceipt);
    if (data.businessActivitiesOfCompany) await this.businessActivitiesOfCompany.set(data.businessActivitiesOfCompany);
    await this.saveVersion.click();
    if (data.preferredInsurers?.length) {
      const form = new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG);
      await form.set(data.preferredInsurers);
    }
    if (data.preferredTpas?.length) {
      const form = new UniversalForm(this.page, PREFERRED_TPAS_CONFIG);
      await form.set(data.preferredTpas);
    }
    if (data.otherRiskMitigationFeatures) await this.otherRiskMitigationFeatures.set(data.otherRiskMitigationFeatures);
    if (data.otherClauses) await this.otherClauses.set(data.otherClauses);
    if (data.insurerRemarks) await this.insurerRemarks.set(data.insurerRemarks);
    if (data.bsgRemarks) await this.bsgRemarks.set(data.bsgRemarks);
    if (data.documentType?.length && data.file?.length) {
      for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
        await this.documentType.set(data.documentType[i]);
        await this.wait(TIMEOUTS.API_TIMEOUT);
        await this.documentUpload.fileUpload.set(data.file[i]);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');
        await this.wait(TIMEOUTS.API_TIMEOUT);
      }
    }
    if (data.submitForApproval) await this.submitForApproval.click();
  }

  /**
   * Reads and returns all Broking Slip form values as an object.
   * @param coversJson The metadata JSON for basic covers (required)
   * @returns Object with current form values.
   */
  async get(coversJson?: any): Promise<any> {
    await this.wait(TIMEOUTS.API_TIMEOUT);
    const preferredInsurers = await new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG).get();
    await this.wait(TIMEOUTS.API_TIMEOUT);
    const preferredTpas = await new UniversalForm(this.page, PREFERRED_TPAS_CONFIG).get();
    await this.wait(TIMEOUTS.API_TIMEOUT);
    let basicCoversData = {};
    if (coversJson) {
      basicCoversData = await getAllCovers(this.page);
    }
    return {
      basicCovers: makeQuotes(basicCoversData),
      sumInsured: await this.brokingSlipSumInsured.getValue(),
      basicPremium: await this.brokingSlipBasicPremium.getValue(),
      brokerageAmount: await this.brokingSlipBrokerageAmount.getValue(),
      brokeragePercentage: await this.brokingSlipBrokeragePercentage.getValue(),
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
      documentType: await this.documentUpload.listUploadedDocuments(),
      filename: await this.documentUpload.listUploadedDocuments(),
    };
  }
}
