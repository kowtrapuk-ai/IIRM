import { Locator, Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { MultiSelectElement } from '../framework/multiselect.element';
import { DateElement } from '../framework/date.element';
import { RadioElement } from '../framework/radio.element';
import { CREDIT_SHARING_CONFIG, EXCLUDED_INSURERS_CONFIG, EXCLUDED_TPAS_CONFIG, PREFERRED_INSURERS_CONFIG, PREFERRED_TPAS_CONFIG, UniversalForm } from '../classes/commonServiceProvider';
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

export class RenewalRFPDetailsEntryPage {
    readonly page: Page;
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

    readonly documentType: SelectElement;
    readonly file: DocumentUploadElement;
    readonly approve: ButtonElement;
    readonly saveActivity: ButtonElement;
    readonly completeActivity: ButtonElement;
    readonly documentUpload: DocumentUploadElement;

    constructor(page: Page) {
        this.page = page;
        this.rfpDetailsDescription = new TextElement(page, page.getByTestId('form-field-textarea-description').locator('textarea').first());
        this.rfpDetailsRequirements = new TextElement(page, page.getByTestId('form-field-textarea-requirements').locator('textarea').first());
        this.multipleBrokerInvolvedYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-multipleBrokerInvolved').getByText(/^yes$/i));
        this.multipleBrokerInvolvedNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-multipleBrokerInvolved').getByText(/^no$/i));
        this.isMarketAllocationDoneYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isMarketAllocationDone').getByText(/^yes$/i));
        this.isMarketAllocationDoneNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isMarketAllocationDone').getByText(/^no$/i));
        this.contact = new SelectElement(page, 'form-field-selectFieldByApi-contactId');
        this.ultimateDecision = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-decisionInfluencers'), page.locator('ul[role="listbox"]'));
        this.expectedPremiumOfClient = new TextElement(page, page.getByTestId('form-field-number-expectedPremium').locator('input'));
        this.clientExpectations = new TextElement(page, page.getByTestId('form-field-textarea-clientConsiderations').locator('textarea:not([aria-hidden="true"])'));
        this.threatsFromExistingInsurer = new TextElement(page, page.getByTestId('form-field-textarea-threatsFromExistingInsurer').locator('textarea:not([aria-hidden="true"])'));
        this.threatsFromExistingBroker = new TextElement(page, page.getByTestId('form-field-textarea-threatsFromExistingBroker').locator('textarea:not([aria-hidden="true"])'));
        this.extraneousFactorsAffectingClientDecision = new TextElement(page, page.getByTestId('form-field-textarea-extraneousFactors').locator('textarea:not([aria-hidden="true"])'));
        this.ourStrategyPlanForClosingDeal = new TextElement(page, page.getByTestId('form-field-textarea-planForClosingDetail').locator('textarea:not([aria-hidden="true"])'));
        this.targetQcrDate = new DateElement(page, page.getByTestId('form-field-date-targetQcrDate').locator('input'));
        this.rfpDetailsEntryRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.documentUpload = new DocumentUploadElement(page, page.getByTestId('form-field-fileupload-file2').locator('input').first(), page.getByTestId('form-field-fileupload-file2').locator('input').first());
        this.file = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-select-documentType').locator('input').first(),
            page.locator('#fileUpload'),
            page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
        );
        this.approve = new ButtonElement(page, page.getByRole('button', { name: 'Approve' }));
        this.submitForApproval = new ButtonElement(page, page.getByRole('button', { name: 'Submit for approval' }));
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
     * Fills out the Renewal RFP Details Entry form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     */
    async set(data: any): Promise<void> {
        if (data.description) await this.rfpDetailsDescription.set(data.description);
        if (data.requirements) await this.rfpDetailsRequirements.set(data.requirements);
        if (data.preferredInsurers?.length) {
            const form = new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG);
            await form.set(data.preferredInsurers as FormData[]);
        }
        if (data.preferredTpas?.length) {
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
        if (data.excludedInsurers?.length) {
            const form = new UniversalForm(this.page, EXCLUDED_INSURERS_CONFIG);
            await form.set(data.excludedInsurers as FormData[]);
        }
        if (data.excludedTpas?.length) {
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
        if (data.documentType?.length && data.file?.length) {
            for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                await this.documentType.set(data.documentType[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
                await this.file.fileUpload.set(data.file[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
            }
        }
        if (data.submitForApproval) await this.submitForApproval.click();
    }

    /**
     * Reads and returns all Renewal RFP Details Entry form values as an object.
     * @returns Object with current form values.
     */
    async get(): Promise<any> {
        const multipleBrokerInvolvedYes = await isRadioButtonSelected((this.multipleBrokerInvolvedYes as any).element);
        const multipleBrokerInvolvedNo = await isRadioButtonSelected((this.multipleBrokerInvolvedNo as any).element);
        const isMarketAllocationDoneYes = await isRadioButtonSelected((this.isMarketAllocationDoneYes as any).element);
        const isMarketAllocationDoneNo = await isRadioButtonSelected((this.isMarketAllocationDoneNo as any).element);
        const preferredInsurers = await new UniversalForm(this.page, PREFERRED_INSURERS_CONFIG).get();
        await this.wait(TIMEOUTS.API_TIMEOUT);
        const preferredTpas = await new UniversalForm(this.page, PREFERRED_TPAS_CONFIG).get();
        await this.wait(TIMEOUTS.API_TIMEOUT);
        const excludedInsurers = await new UniversalForm(this.page, EXCLUDED_INSURERS_CONFIG).get();
        await this.wait(TIMEOUTS.API_TIMEOUT);
        const excludedTpas = await new UniversalForm(this.page, EXCLUDED_TPAS_CONFIG).get();
        await this.wait(TIMEOUTS.API_TIMEOUT);
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
            ultimateDecision: (await this.ultimateDecision.get()) ?? [],
            expectedPremiumOfClient: await this.expectedPremiumOfClient.getValue(),
            clientExpectations: await this.clientExpectations.getValue(),
            threatsFromExistingInsurer: await this.threatsFromExistingInsurer.getValue(),
            threatsFromExistingBroker: await this.threatsFromExistingBroker.getValue(),
            extraneousFactorsAffectingClientDecision: await this.extraneousFactorsAffectingClientDecision.getValue(),
            ourStrategyPlanForClosingDeal: await this.ourStrategyPlanForClosingDeal.getValue(),
            targetQcrDate: await this.targetQcrDate.getValue(),
            remarks: await this.rfpDetailsEntryRemarks.getValue(),
            documentType: await (this.file).listUploadedDocuments()
        };
    }

    async getAssignee(): Promise<string> {
        // Find the assignee within the expanded RFP Details Entry accordion panel
        // Scope to Root-Accordion that is expanded (Mui-expanded class)
        const assigneeText = await this.page
            .locator('[data-testid="Root-Accordion"].Mui-expanded')
            .locator('div', { hasText: 'ISG activities assigned to' })
            .locator('b')
            .textContent();

        return assigneeText?.trim() || '';
    }



}
