import { Page } from '@playwright/test';
import { Locator } from '@playwright/test';

import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { RadioElement } from '../framework/radio.element';
import { DateElement } from '../framework/date.element';
import { MultiSelectElement } from '../framework/multiselect.element';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { TIMEOUTS } from '../env/timeouts';

/**
 * Checks if a radio button is selected by examining its data-testid attribute
 * @param radioButtonLocator - The locator for the radio button element
 * @returns Promise<boolean> - true if the radio button is selected, false otherwise
 */
const isRadioButtonSelected = async (radioButtonLocator: Locator): Promise<boolean> => {
    await radioButtonLocator.waitFor({ state: 'attached' });
    const testId = await radioButtonLocator.getAttribute('data-testid');
    
    // Check if it ends with '-true' (selected) or '-false' (not selected)
    if (testId.endsWith('-true')) return true;
    if (testId.endsWith('-false')) return false;
};

export class RenewalMandateDetailsEntryPage {
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
    readonly documentType: SelectElement;
    readonly documentUpload: DocumentUploadElement;
    readonly completeActivity: ButtonElement;
    readonly page: Page;
    readonly saveActivity: ButtonElement;

    constructor(page: Page) {
        this.page = page;
        this.fullMandate = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-mandateTypeLid').locator('[data-testid^="segmented-control-option-"]', { hasText: /^Full Mandate$/i }));
        this.restrictedMandate = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-mandateTypeLid').locator('[data-testid^="segmented-control-option-"]', { hasText: /^Restricted Mandate$/i }));
        this.fetchExistingMandate = new ButtonElement(page, page.getByRole('button', { name: 'Fetch existing mandate' }));
        this.signedBy = new MultiSelectElement(page, page.getByTestId('form-field-multiSelectFieldByApi-mandateDetailsContacts'));
        this.validFrom = new DateElement(page, page.getByTestId('form-field-daterange-mandateDetails').locator('input[name="validFrom"]'));
        this.validTo = new DateElement(page, page.getByTestId('form-field-daterange-mandateDetails').locator('input[name="validTo"]'));
        this.brokeragePercentage = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-compensationTypeLid').locator('[data-testid^="segmented-control-option-"]', { hasText: /^Brokerage%$/i }));
        this.brokerageFee = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-compensationTypeLid').locator('[data-testid^="segmented-control-option-"]', { hasText: /^Brokerage Fee$/i }));
        this.fixedFee = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-compensationTypeLid').locator('[data-testid^="segmented-control-option-"]', { hasText: /^Fixed Fee$/i }));
        this.compensationPayable = new TextElement(page, page.getByTestId('form-field-number-compensationPayable').locator('input'));
        this.issuedOn = new DateElement(page, page.getByTestId('form-field-date-issuedOn').locator('input'));
        this.mandateRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.documentUpload = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-select-documentType').locator('input').first(),
            page.locator('#fileUpload'),
            page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
        );
        this.saveActivity=new ButtonElement(page,page.getByRole('button',{name:"Save activity"}));
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
     * Fills out the Renewal Mandate Details Entry form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     */
    async set(data: any): Promise<void> {
        if (data.fullMandate) await this.fullMandate.click();
        if (data.restrictedMandate) await this.restrictedMandate.click();
        if (data.signedBy?.length) await this.signedBy.set(data.signedBy);
        if (data.validFrom) await this.validFrom.set(data.validFrom);
        if (data.validTo) await this.validTo.set(data.validTo);
        if (data.brokeragePercentage) await this.brokeragePercentage.click();
        if (data.brokerageFee) await this.brokerageFee.click();
        if (data.fixedFee) await this.fixedFee.click();
        if (data.compensationPayable) await this.compensationPayable.set(data.compensationPayable);
        if (data.issuedOn) await this.issuedOn.set(data.issuedOn);
        if (data.remarks) await this.mandateRemarks.set(data.remarks);
        if (data.documentType?.length && data.file?.length) {
            for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                await this.documentType.set(data.documentType[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
                await this.documentUpload.fileUpload.set(data.file[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
            }
        }
        if (data.completeActivity) await this.completeActivity.click();
    }

    /**
     * Reads and returns all Renewal Mandate Details Entry form values as an object.
     * @returns Object with current form values.
     */
    async get(): Promise<any> {
        const fullMandate = await isRadioButtonSelected((this.fullMandate as any).element);
        const restrictedMandate = await isRadioButtonSelected((this.restrictedMandate as any).element);
        const brokeragePercentage = await isRadioButtonSelected((this.brokeragePercentage as any).element);
        const brokerageFee = await isRadioButtonSelected((this.brokerageFee as any).element);
        const fixedFee = await isRadioButtonSelected((this.fixedFee as any).element);

        return {
            fullMandate: fullMandate,
            restrictedMandate: restrictedMandate,
            signedBy: (await this.signedBy.get()) ?? [],
            validFrom: await this.validFrom.getValue(),
            validTo: await this.validTo.getValue(),
            brokeragePercentage: brokeragePercentage,
            brokerageFee: brokerageFee,
            fixedFee: fixedFee,
            compensationPayable: await this.compensationPayable.getValue(),
            issuedOn: await this.issuedOn.getValue(),
            remarks: await this.mandateRemarks.getValue(),
            documentTypeAndFileName:await this.documentUpload.listUploadedDocuments()
        };
    }
}