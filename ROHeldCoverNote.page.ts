import { Locator, Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { DateElement } from '../framework/date.element';
import { RadioElement } from '../framework/radio.element';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { TIMEOUTS } from '../env/timeouts';
import { setCover, getAllCovers, makeQuotes } from '../utils/utils';
import { INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG, UniversalForm } from '../classes/commonServiceProvider';

export class ROHeldCoverNotePage {
    readonly page: Page;
    readonly anyDeviationsYes: RadioElement;
    readonly anyDeviationsNo: RadioElement;
    readonly enterDeviations: TextElement;
    readonly deviationAddressedYes: RadioElement;
    readonly deviationAddressedNo: RadioElement;
    readonly resolution: SelectElement;
    readonly revisedHeldCoverNoteReceivedYes: RadioElement;
    readonly revisedHeldCoverNoteReceivedNo: RadioElement;
    readonly acknowledgementBy: SelectElement;
    readonly receiptDate: DateElement;
    readonly receiptNo: TextElement;
    readonly allDocsReceivedOn: DateElement;
    readonly sumInsured: TextElement;
    readonly basicPremium: TextElement;

    readonly terrorismAmount: TextElement;
    readonly netPremium: TextElement;
    readonly gstPercentage: TextElement;
    readonly gstAmount: TextElement;
    readonly fee: TextElement;
    readonly otherAmount: TextElement;
    readonly grossPremium: TextElement;
    readonly basicBrokeragePercentage: TextElement;
    readonly terrorismBrokeragePercentage: TextElement;
    readonly basicBrokerageAmount: TextElement;
    readonly tCBrokerageAmount: TextElement;
    readonly totalBrokerageAmount: TextElement;
    readonly policyPlacedMultiple: RadioElement;
    readonly policyPlacedSingle: RadioElement;
    readonly selectLeadInsurer: SelectElement;
    readonly onlyLeadPaysYes: RadioElement;
    readonly onlyLeadPaysNo: RadioElement;
    readonly remarks: TextElement;
    readonly documentType: SelectElement;
    readonly fileUpload: DocumentUploadElement;
    readonly submitForApproval: ButtonElement;
    readonly approve: ButtonElement;
    readonly shareAndBrokerageForm: UniversalForm;

    // Sri Lanka fields
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
    readonly srccBrokeragePercentage: TextElement;
    readonly tcBrokeragePercentage: TextElement;
    readonly srccBrokerageAmount: TextElement;

    constructor(page: Page) {
        this.page = page;
        this.anyDeviationsYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-placementSlipDeviationsLid').getByText(/^yes$/i));
        this.anyDeviationsNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-placementSlipDeviationsLid').getByText(/^no$/i));
        this.enterDeviations = new TextElement(page, page.getByTestId('form-field-text-deviations').locator('textarea').first());
        this.deviationAddressedYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationsAddressedLid').getByText(/^yes$/i));
        this.deviationAddressedNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationsAddressedLid').getByText(/^no$/i));
        this.resolution = new SelectElement(page, 'form-field-select-resolutionLid');
        this.revisedHeldCoverNoteReceivedYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-revisedHeldCoverNoteLid').getByText(/^yes$/i));
        this.revisedHeldCoverNoteReceivedNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-revisedHeldCoverNoteLid').getByText(/^no$/i));
        this.acknowledgementBy = new SelectElement(page, 'form-field-selectFieldByApi-acknowledgedBy');
        this.receiptDate = new DateElement(page, page.getByTestId('form-field-date-receiptDate').locator('input'));
        this.receiptNo = new TextElement(page, page.getByTestId('form-field-text-receiptNo').locator('input').first());
        this.allDocsReceivedOn = new DateElement(page, page.getByTestId('form-field-date-allDocumentsReceivedDate').locator('input'));
        this.sumInsured = new TextElement(page, page.getByTestId('form-field-number-sumInsured').locator('input'));
        this.basicPremium = new TextElement(page, page.getByTestId('form-field-number-basicPremium').locator('input'));

        // Sri Lanka Fields
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
        this.srccBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-srccPercentage').locator('input'));
        this.tcBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-terrorismBrokeragePercentage').locator('input'));
        this.basicBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-basicBrokerageAmount').locator('input'));
        this.srccBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-srccBrokerageAmount').locator('input'));

        this.terrorismAmount = new TextElement(page, page.getByTestId('form-field-number-terrorism').locator('input'));
        this.netPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
        this.gstPercentage = new TextElement(page, page.getByTestId('form-field-number-gstPercentage').locator('input'));
        this.gstAmount = new TextElement(page, page.getByTestId('form-field-number-gstAmount').locator('input'));
        this.fee = new TextElement(page, page.getByTestId('form-field-number-fee').locator('input'));
        this.otherAmount = new TextElement(page, page.getByTestId('form-field-number-other').locator('input'));
        this.grossPremium = new TextElement(page, page.getByTestId('form-field-number-grossPremium').locator('input'));
        this.basicBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-basicBrokeragePercentage').locator('input'));
        this.terrorismBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-terrorismBrokeragePercentage').locator('input'));
        this.basicBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-basicBrokerageAmount').locator('input'));
        this.tCBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-tcBrokerageAmount').locator('input'));
        this.totalBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-totalBrokerageAmount').locator('input'));

        this.policyPlacedMultiple = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid').getByText(/^Multiple Insurers$/i));
        this.policyPlacedSingle = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid').getByText(/^Single Insurer$/i));
        this.selectLeadInsurer = new SelectElement(page, 'form-field-select-leadInsurerLid');
        this.onlyLeadPaysYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommission').getByText(/^yes$/i));
        this.onlyLeadPaysNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommission').getByText(/^no$/i));
        this.shareAndBrokerageForm = new UniversalForm(page, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG);
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.fileUpload = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-select-documentType').locator('input').first(),
            page.locator('#fileUpload'),
            page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
        );
        this.submitForApproval = new ButtonElement(page, page.getByRole('button', { name: 'Submit for approval' }));
        this.approve = new ButtonElement(page, page.getByRole("button", { name: "Approve" }));

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
     * Fills out the Held Cover Note form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
    */
    async set(data: any, coversJson?: any): Promise<void> {
        if (data.basicCovers && coversJson) {
            for (const cover of data.basicCovers) {
                await setCover(this.page, cover.name, cover.value, coversJson);
            }
        }

        if (data.anyDeviations === 'Yes') {
            await this.anyDeviationsYes.click();
            if (data.enterDeviations) await this.enterDeviations.set(data.enterDeviations);

            if (data.deviationAddressed === 'Yes') {
                await this.deviationAddressedYes.click();

                if (data.resolution) await this.resolution.set(data.resolution);

                if (data.revisedHeldCoverNoteReceived === 'Yes') {
                    await this.revisedHeldCoverNoteReceivedYes.click();

                    if (data.acknowledgementBy) await this.acknowledgementBy.set(data.acknowledgementBy);
                    if (data.receiptDate) await this.receiptDate.set(data.receiptDate);
                    if (data.receiptNo) await this.receiptNo.set(data.receiptNo);
                    if (data.allDocsReceivedOn) await this.allDocsReceivedOn.set(data.allDocsReceivedOn);

                    if (data.policyPlacedType === 'Multiple') {
                        await this.policyPlacedMultiple.click();
                    } else if (data.policyPlacedType === 'Single') {
                        await this.policyPlacedSingle.click();
                    }
                } else if (data.revisedHeldCoverNoteReceived === 'No') {
                    await this.revisedHeldCoverNoteReceivedNo.click();
                }
            } else if (data.deviationAddressed === 'No') {
                await this.deviationAddressedNo.click();
            }
        } else if (data.anyDeviations === 'No') {
            await this.anyDeviationsNo.click();
        }
    }


    /**
     * Reads and returns all Held Cover Note form values as an object.
     * @returns Object with current form values.
    */
    async get(coversJson?: any): Promise<any> {
        /**
         * Checks if a radio button is selected by examining its data-testid attribute
         * @param radioButtonLocator - The locator for the radio button element
         * @returns Promise<boolean> - true if the radio button is selected, false otherwise
         */
        const isRadioButtonSelected = async (radioButtonLocator: Locator): Promise<boolean> => {
            await this.wait(TIMEOUTS.API_TIMEOUT);
            const testId = await radioButtonLocator.getAttribute('data-testid');

            // Check if it ends with '-true' (selected) or '-false' (not selected)
            if (testId.endsWith('-true')) return true;
            if (testId.endsWith('-false')) return false;
        };

        const policyPlacedMultiple = await isRadioButtonSelected((this.policyPlacedMultiple as any).element);
        const policyPlacedSingle = await isRadioButtonSelected((this.policyPlacedSingle as any).element);
        const isRevisedHeldCoverNoteReceivedYes = await isRadioButtonSelected((this.revisedHeldCoverNoteReceivedYes as any).element);
        const isRevisedHeldCoverNoteReceivedNo = await isRadioButtonSelected((this.revisedHeldCoverNoteReceivedNo as any).element);
        const isAnyDeviationsYes = await isRadioButtonSelected((this.anyDeviationsYes as any).element);
        const isAnyDeviationsNo = await isRadioButtonSelected((this.anyDeviationsNo as any).element);
        const isDeviationAddressedYes = await isRadioButtonSelected((this.deviationAddressedYes as any).element);
        const isDeviationAddressedNo = await isRadioButtonSelected((this.deviationAddressedNo as any).element);
        // Use getAllCovers utility for basic covers if coversJson is provided
        let basicCoversData = {};
        if (coversJson) {
            basicCoversData = await getAllCovers(this.page, coversJson);
        }

        return {
            anyDeviations: isAnyDeviationsYes ? "Yes" : (isAnyDeviationsNo ? "No" : null),
            enterDeviations: await this.enterDeviations.getValue(),
            deviationAddressed: isDeviationAddressedYes ? "Yes" : (isDeviationAddressedNo ? "No" : null),
            resolution: await this.resolution.getValue(),
            revisedHeldCoverNoteReceived: isRevisedHeldCoverNoteReceivedYes ? "Yes" : (isRevisedHeldCoverNoteReceivedNo ? "No" : null),
            acknowledgementBy: await this.acknowledgementBy.getValue(),
            receiptDate: await this.receiptDate.getValue(),
            receiptNo: await this.receiptNo.getValue(),
            allDocsReceivedOn: await this.allDocsReceivedOn.getValue(),
            sumInsured: await this.sumInsured.getValue(),
            basicPremium: await this.basicPremium.getValue(),
            srccPremiumAmount: await this.srccPremiumAmount.getValue(),
            tcPremiumAmount: await this.tcPremiumAmount.getValue(),
            totalNetPremium: await this.totalNetPremium.getValue(),
            adminCharges: await this.adminCharges.getValue(),
            stampDuty: await this.stampDuty.getValue(),
            cess: await this.cess.getValue(),
            policyFee: await this.policyFee.getValue(),
            vatPercentage: await this.vatPercentage.getValue(),
            vatAmount: await this.vatAmount.getValue(),
            totalGrossPremium: await this.totalGrossPremium.getValue(),
            basicBrokeragePercentage: await this.basicBrokeragePercentage.getValue(),
            srccBrokeragePercentage: await this.srccBrokeragePercentage.getValue(),
            tcBrokeragePercentage: await this.tcBrokeragePercentage.getValue(),
            basicBrokerageAmount: await this.basicBrokerageAmount.getValue(),
            srccBrokerageAmount: await this.srccBrokerageAmount.getValue(),
            totalBrokerageAmount: await this.totalBrokerageAmount.getValue(),
            terrorismAmount: await this.terrorismAmount.getValue(),
            netPremium: await this.netPremium.getValue(),
            gstPercentage: await this.gstPercentage.getValue(),
            gstAmount: await this.gstAmount.getValue(),
            fee: await this.fee.getValue(),
            otherAmount: await this.otherAmount.getValue(),
            grossPremium: await this.grossPremium.getValue(),
            tCBrokerageAmount: await this.tCBrokerageAmount.getValue(),
            policyPlacedType: policyPlacedMultiple ? "Multiple" : (policyPlacedSingle ? "Single" : null),
            selectLeadInsurer: await this.selectLeadInsurer.getValue(),
            onlyLeadPays: await isRadioButtonSelected((this.onlyLeadPaysYes as any).element) ? "Yes" : (await isRadioButtonSelected((this.onlyLeadPaysNo as any).element) ? "No" : null),
            insurerShareAndBrokerageDetails: await this.shareAndBrokerageForm.get(),
            basicCovers: makeQuotes(basicCoversData),
            remarks: await this.remarks.getValue(),
            documentType: await this.fileUpload.listUploadedDocuments(),
            filename: await this.fileUpload.listUploadedDocuments(),
        };
    }
}