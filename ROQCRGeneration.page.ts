import { Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { TIMEOUTS } from '../env/timeouts';

export class ROQCRGenerationPage {
  readonly page: Page;
  readonly insuranceMarket: TextElement;
  readonly clientSpecific: TextElement;
  readonly issuesFacedByUs: TextElement;
  readonly industryBenchMarkingComments: TextElement;
  readonly ourAnalysisAndRecommendation: TextElement;
  readonly overallComments: TextElement;
  readonly remarks: TextElement;
  readonly generateQuoteComparison: ButtonElement;
  readonly documentType: SelectElement;
  readonly fileUpload: DocumentUploadElement;
  readonly saveActivity: ButtonElement;
  readonly completeActivity: ButtonElement;

  constructor(page: Page) {
    this.page = page;
    this.insuranceMarket = new TextElement(page, page.getByTestId('form-field-textarea-insuranceMarket').locator('textarea').first());
    this.clientSpecific = new TextElement(page, page.getByTestId('form-field-textarea-clientSpecific').locator('textarea').first());
    this.issuesFacedByUs = new TextElement(page, page.getByTestId('form-field-textarea-issuesFaced').locator('textarea').first());
    this.industryBenchMarkingComments = new TextElement(page, page.getByTestId('form-field-textarea-industryBenchmarkingComments').locator('textarea').first());
    this.ourAnalysisAndRecommendation = new TextElement(page, page.getByTestId('form-field-textarea-analysisRecommendation').locator('textarea').first());
    this.overallComments = new TextElement(page, page.getByTestId('form-field-textarea-overallComments').locator('textarea').first());
    this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
    this.generateQuoteComparison = new ButtonElement(page, page.getByRole('button', { name: 'Generate Quote Comparison' }));
    this.documentType = new SelectElement(page, 'form-field-select-documentType');
    this.fileUpload = new DocumentUploadElement(
      page,
      page.getByTestId('form-field-select-documentType').locator('input').first(),
      page.locator('#fileUpload'),
      page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
    );
    this.saveActivity = new ButtonElement(page, page.getByRole('button', { name: 'Save activity' }));
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

  async set(data: any): Promise<void> {
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
    if (data.qcrRemarks) await this.remarks.set(data.qcrRemarks);
    if (data.generateQuoteComparision) {
      await this.generateQuoteComparison.click();
    }
    if (data.documentType && data.file) {
      for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
        await this.documentType.set(data.documentType[i]);
        await this.wait(TIMEOUTS.API_TIMEOUT);
        await this.fileUpload.fileUpload.set(data.file[i]);
        await this.wait(TIMEOUTS.API_TIMEOUT);
      }
    }
    if (data.completeActivity) await this.completeActivity.click();
  }

  async get(): Promise<any> {
    return {
      insuranceMarket: await this.insuranceMarket.getValue(),
      clientSpecific: await this.clientSpecific.getValue(),
      issuesFacedByUs: await this.issuesFacedByUs.getValue(),
      industryBenchMarkingComments: await this.industryBenchMarkingComments.getValue(),
      ourAnalysisAndRecommendation: await this.ourAnalysisAndRecommendation.getValue(),
      overallComments: await this.overallComments.getValue(),
      remarks: await this.remarks.getValue(),
    };
  }

}
