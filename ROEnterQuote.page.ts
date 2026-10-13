import { Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { DateElement } from '../framework/date.element';
import { UniversalForm, TAX_DETAILS_CONFIG } from '../classes/commonServiceProvider';
import { TIMEOUTS } from '../env/timeouts';
import { QuoteDetails } from '../appcomponents/QuoteDetails.component';
import { DocumentUploadElement } from '../framework/documentupload.element';

export class ROEnterQuotePage {
  readonly page: Page;
  readonly selectInsurer: SelectElement;
  readonly insurerLocation: SelectElement;
  readonly quoteReceivedOnDate: DateElement;
  readonly basicPremium: TextElement;

  readonly terrorism: TextElement;
  readonly netPremium: TextElement;
  readonly brokeragePercentage: TextElement;
  readonly insurerRemarks: TextElement;
  readonly saveQuote: ButtonElement;
  readonly enterQuoteRemarks: TextElement;
  readonly addQuote: ButtonElement;
  readonly documentType: SelectElement;
  readonly fileUpload: DocumentUploadElement;
  readonly saveActivity: ButtonElement;
  readonly completeActivity: ButtonElement;

  // Sri Lanka Fields
  readonly srccPremiumAmount: TextElement;
  readonly tcPremiumAmount: TextElement;
  readonly totalNetPremium: TextElement;
  readonly adminCharges: TextElement;
  readonly stampDuty: TextElement;
  readonly cess: TextElement;
  readonly policyFee: TextElement;
  readonly vatPercentage: TextElement;
  readonly vatAmount: TextElement;
  readonly totalGrossPremium: TextElement;
  readonly basicBrokeragePercentage: TextElement;
  readonly srccBrokeragePercentage: TextElement;
  readonly tcBrokeragePercentage: TextElement;
  readonly basicBrokerageAmount: TextElement;
  readonly srccBrokerageAmount: TextElement;
  readonly tcBrokerageAmount: TextElement;
  readonly totalBrokerageAmount: TextElement;

  constructor(page: Page) {
    this.page = page;
    this.selectInsurer = new SelectElement(page, "form-field-selectFieldByApi-insurerId");
    this.insurerLocation = new SelectElement(page, "form-field-selectFieldByApi-insurerLocationId");
    this.quoteReceivedOnDate = new DateElement(page, page.getByTestId('form-field-date-quoteReceivedOn').locator('input'));
    this.basicPremium = new TextElement(page, page.getByTestId('form-field-number-basicPremium').locator('input'));

    this.srccPremiumAmount = new TextElement(page, page.getByTestId('form-field-number-srccAmount').locator('input'));
    this.tcPremiumAmount = new TextElement(page, page.getByTestId('form-field-number-terrorism').locator('input'));
    this.totalNetPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
    this.adminCharges = new TextElement(page, page.getByTestId('form-field-number-adminCharges').locator('input'));
    this.stampDuty = new TextElement(page, page.getByTestId('form-field-number-other').locator('input'));
    this.cess = new TextElement(page, page.getByTestId('form-field-number-cessAmount').locator('input'));
    this.policyFee = new TextElement(page, page.getByTestId('form-field-number-fee').locator('input'));
    this.vatPercentage = new TextElement(page, page.getByTestId('form-field-number-gstPercentage').locator('input'));
    this.vatAmount = new TextElement(page, page.getByTestId('form-field-number-gstAmount').locator('input'));
    this.totalGrossPremium = new TextElement(page, page.getByTestId('form-field-number-grossPremium').locator('input'));
    this.basicBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-basicBrokeragePercentage').locator('input'));
    this.srccBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-srccPercentage').locator('input'));
    this.tcBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-terrorismBrokeragePercentage').locator('input'));
    this.basicBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-basicBrokerageAmount').locator('input'));
    this.srccBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-srccBrokerageAmount').locator('input'));
    this.tcBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-tcBrokerageAmount').locator('input'));
    this.totalBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-totalBrokerageAmount').locator('input'));

    this.terrorism = new TextElement(page, page.getByTestId('form-field-number-terrorism').locator('input'));
    this.netPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
    this.brokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-brokeragePercent').locator('input'));
    this.insurerRemarks = new TextElement(page, page.getByTestId('form-field-textarea-insurerRemarks').locator('textarea').first());
    this.enterQuoteRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
    this.saveQuote = new ButtonElement(page, page.getByRole('button', { name: 'Save Quote' }));
    this.addQuote = new ButtonElement(page, page.getByRole('button', { name: 'Add Quote' }));
    this.documentType = new SelectElement(page, 'form-field-select-documentType');
    this.fileUpload = new DocumentUploadElement(
      page,
      page.getByTestId('form-field-select-documentType').locator('input').first(),
      page.locator('#fileUpload'),
      page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
    );
    // this.saveActivity = new ButtonElement(page, page.getByRole('button', { name: 'Save activity' }));
    this.completeActivity = new ButtonElement(page, page.getByRole('button', { name: 'Complete activity' }));
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
   * Fills out the Enter Quote form with the provided data.
   * Only sets fields present in the data object.
   * @param data Object with form values to set.
   */
  async set(data: any): Promise<void> {
    // Handle multiple quotes if provided in quotes array
    if (data.quotes && Array.isArray(data.quotes)) {
      for (const quote of data.quotes) {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        // Set fields for each quote
        if (quote.insurer) await this.selectInsurer.set(quote.insurer);
        if (quote.location) await this.insurerLocation.set(quote.location);
        if (quote.quoteReceivedOn) await this.quoteReceivedOnDate.set(quote.quoteReceivedOn);
        if (quote.basicPremium) await this.basicPremium.set(quote.basicPremium);
        if (quote.terrorism) await this.terrorism.set(quote.terrorism);
        if (quote.netPremium) await this.netPremium.set(quote.netPremium);

        if (quote.taxDetails?.length) {
          const taxDetailsForm = new UniversalForm(this.page, TAX_DETAILS_CONFIG);
          await taxDetailsForm.set(quote.taxDetails);
        }

        // Sri Lanka Fields
        if (quote.srccPremiumAmount) await this.srccPremiumAmount.set(quote.srccPremiumAmount);
        if (quote.tcPremiumAmount) await this.tcPremiumAmount.set(quote.tcPremiumAmount);
        if (quote.totalNetPremium) await this.totalNetPremium.set(quote.totalNetPremium);
        if (quote.adminCharges) await this.adminCharges.set(quote.adminCharges);
        if (quote.stampDuty) await this.stampDuty.set(quote.stampDuty);
        if (quote.cess) await this.cess.set(quote.cess);
        if (quote.policyFee) await this.policyFee.set(quote.policyFee);
        if (quote.vatPercentage) await this.vatPercentage.set(quote.vatPercentage);
        if (quote.vatAmount) await this.vatAmount.set(quote.vatAmount);
        if (quote.totalGrossPremium) await this.totalGrossPremium.set(quote.totalGrossPremium);
        if (quote.basicBrokeragePercentage) await this.basicBrokeragePercentage.set(quote.basicBrokeragePercentage);
        if (quote.srccBrokeragePercentage) await this.srccBrokeragePercentage.set(quote.srccBrokeragePercentage);
        if (quote.tcBrokeragePercentage) await this.tcBrokeragePercentage.set(quote.tcBrokeragePercentage);
        if (quote.basicBrokerageAmount) await this.basicBrokerageAmount.set(quote.basicBrokerageAmount);
        if (quote.srccBrokerageAmount) await this.srccBrokerageAmount.set(quote.srccBrokerageAmount);
        if (quote.tcBrokerageAmount) await this.tcBrokerageAmount.set(quote.tcBrokerageAmount);
        if (quote.totalBrokerageAmount) await this.totalBrokerageAmount.set(quote.totalBrokerageAmount);

        if (quote.netPremium) await this.netPremium.set(quote.netPremium);
        if (quote.brokeragePercentage) await this.brokeragePercentage.set(quote.brokeragePercentage);
        if (quote.insurerRemarks) await this.insurerRemarks.set(quote.insurerRemarks);
        if (quote.remarks) await this.enterQuoteRemarks.set(quote.remarks);

        // Add Quote button after filling each quote
        if (data.saveQuote) await this.saveQuote.click();
        if (quote.addQuote) await this.addQuote.click();
      }
    } else {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('networkidle');
      // Fallback: handle single quote at top level (backward compatibility)
      if (data.insurer) await this.selectInsurer.set(data.insurer);
      if (data.location) await this.insurerLocation.set(data.location);
      if (data.quoteReceivedOn) await this.quoteReceivedOnDate.set(data.quoteReceivedOn);
      if (data.basicPremium) await this.basicPremium.set(data.basicPremium);

      if (data.terrorism) await this.terrorism.set(data.terrorism);
      if (data.taxDetails?.length) {
        const taxDetailsForm = new UniversalForm(this.page, TAX_DETAILS_CONFIG);
        await taxDetailsForm.set(data.taxDetails);
      }
      // Sri Lanka Fields
      if (data.srccPremiumAmount) await this.srccPremiumAmount.set(data.srccPremiumAmount);
      if (data.tcPremiumAmount) await this.tcPremiumAmount.set(data.tcPremiumAmount);
      if (data.totalNetPremium) await this.totalNetPremium.set(data.totalNetPremium);
      if (data.adminCharges) await this.adminCharges.set(data.adminCharges);
      if (data.stampDuty) await this.stampDuty.set(data.stampDuty);
      if (data.cess) await this.cess.set(data.cess);
      if (data.policyFee) await this.policyFee.set(data.policyFee);
      if (data.vatPercentage) await this.vatPercentage.set(data.vatPercentage);
      if (data.vatAmount) await this.vatAmount.set(data.vatAmount);
      if (data.totalGrossPremium) await this.totalGrossPremium.set(data.totalGrossPremium);
      if (data.basicBrokeragePercentage) await this.basicBrokeragePercentage.set(data.basicBrokeragePercentage);
      if (data.srccBrokeragePercentage) await this.srccBrokeragePercentage.set(data.srccBrokeragePercentage);
      if (data.tcBrokeragePercentage) await this.tcBrokeragePercentage.set(data.tcBrokeragePercentage);
      if (data.basicBrokerageAmount) await this.basicBrokerageAmount.set(data.basicBrokerageAmount);
      if (data.srccBrokerageAmount) await this.srccBrokerageAmount.set(data.srccBrokerageAmount);
      if (data.tcBrokerageAmount) await this.tcBrokerageAmount.set(data.tcBrokerageAmount);
      if (data.totalBrokerageAmount) await this.totalBrokerageAmount.set(data.totalBrokerageAmount);

      if (data.netPremium) await this.netPremium.set(data.netPremium);
      if (data.brokeragePercentage) await this.brokeragePercentage.set(data.brokeragePercentage);
      if (data.insurerRemarks) await this.insurerRemarks.set(data.insurerRemarks);
      if (data.saveQuote) await this.saveQuote.click();
    }

    if (data.remarks) await this.enterQuoteRemarks.set(data.remarks);

    // Handle document upload (at activity level, not per quote)
    if (data.documentType && data.file && this.documentType && this.fileUpload) {
      for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
        await this.documentType.set(data.documentType[i]);
        await this.wait(TIMEOUTS.API_TIMEOUT);
        await this.fileUpload.fileUpload.set(data.file[i]);
        await this.wait(TIMEOUTS.API_TIMEOUT);
      }
    }

  }

  /**
   * Reads and returns all Enter Quote form values as an object.
   * Tries to get detailed quote info from multiple quote cards; falls back to basic data if not available.
   * @returns Object with current form values including data from all quote cards.
   */
  /**
 * Reads and returns all Enter Quote data in structured form
 */
  async get(): Promise<any> {
    const remarks = await this.enterQuoteRemarks.getValue();
    const documents = await this.fileUpload.listUploadedDocuments();
    
    await QuoteDetails.extractAllQuotes(this.page);
    await QuoteDetails.extractSummaryBlocks(this.page);

    return {
      remarks,
      documents
    };
  }


}
