import { Page } from '@playwright/test';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { TextElement } from '../framework/text.element';
import { ButtonElement } from '../framework/button.element';
import { SelectElement } from '../framework/select.element';
import { setAllCovers, getAllCovers, makeQuotes } from '../utils/coversUtils';
import { TIMEOUTS } from '../env/timeouts';

export class RenewalRFPDataCollectionPage {
    readonly remarks: TextElement;
    readonly previousYearPolicyUpload: DocumentUploadElement;
    readonly documentType: SelectElement;
    readonly documentUpload: DocumentUploadElement;
    readonly completeActivity: ButtonElement;
    readonly page: Page;
    readonly saveActivity: ButtonElement;
    readonly file: DocumentUploadElement;

    constructor(page: Page) {
        this.page = page;
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.previousYearPolicyUpload = new DocumentUploadElement(page, page.getByTestId('form-field-fileupload-file2').locator('input').first(), page.getByTestId('form-field-fileupload-file2').locator('input').first());
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.documentUpload = new DocumentUploadElement(page, page.getByTestId('form-field-fileupload-file2').locator('input').first(), page.getByTestId('form-field-fileupload-file2').locator('input').first());
         this.file = new DocumentUploadElement(
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

    /**
     * Fills out the RFP Data Collection form with the given data and submits it.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     */
    async set(data: any): Promise<void> {
        // Set all covers if basic covers are provided
        if (data.basicCovers) {
            await setAllCovers(this.page, data.basicCovers);
            await this.wait(TIMEOUTS.CLICK_TIMEOUT);
        }
        if (data.remarks) await this.remarks.set(data.remarks);
        if (data.documentType?.length && data.file?.length) {
            for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                await this.documentType.set(data.documentType[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
                await this.file.fileUpload.set(data.file[i]);
                await this.page.waitForLoadState('networkidle');    
                await this.page.waitForLoadState('domcontentloaded');
                await this.wait(TIMEOUTS.API_TIMEOUT);
            }
        }
        if(data.saveActivity) await this.saveActivity.click();
        if (data.completeActivity) await this.completeActivity.click();
    }


    /**
     * Reads and returns all RFP Data Collection form values as an object, using getAllCovers utility for basic covers.
     * @param coversJson The metadata JSON for basic covers (required)
     * @returns Object with current form values.
     */
    async get(coversJson?: any): Promise<any> {
        let basicCoversData = {};
        if (coversJson) {
            basicCoversData = await getAllCovers(this.page);
        } return {
            basicCovers: makeQuotes(basicCoversData),
            remarks: await this.remarks.getValue(),
            documentTypeAndFile: await this.file.listUploadedDocuments()
        };
    }
}
