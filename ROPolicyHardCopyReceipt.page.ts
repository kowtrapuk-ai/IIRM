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
export class ROPolicyHardCopyReceiptPage {
    readonly page: Page;
    readonly insurerPolicyNo: TextElement;
    readonly hardCopyReceivedOn: DateElement;
    readonly anyDeviationsYes: RadioElement;
    readonly anyDeviationsNo: RadioElement;
    readonly deviationAddressedYes: RadioElement;
    readonly deviationAddressedNo: RadioElement;
    readonly resolution: SelectElement;
    readonly revisedHardCopyReceivedYes: RadioElement;
    readonly revisedHardCopyReceivedNo: RadioElement;
    readonly deviationFromPremiumAndBrokerageYes: RadioElement;
    readonly deviationFromPremiumAndBrokerageNo: RadioElement;
    readonly sumInsured: TextElement;
    readonly basicPremium: TextElement;
    readonly terrorismCommission: TextElement;
    readonly netPremium: TextElement;
    readonly gstPercentage: TextElement;
    readonly gstAmount: TextElement;
    readonly fee: TextElement;
    readonly otherAmount: TextElement;
    readonly totalPremium: TextElement;
    readonly basicBrokeragePercentage: TextElement;
    readonly terrorismBrokeragePercentage: TextElement;
    readonly totalBrokeragePercentage: TextElement;
    readonly basicBrokerageAmount: TextElement;
    readonly terrorismBrokerageAmount: TextElement;
    readonly totalBrokerageAmount: TextElement;
    readonly coverages: TextElement;
    readonly exclusions: TextElement;
    readonly deductibles: TextElement;
    readonly policyPlacedMultiple: RadioElement;
    readonly policyPlacedSingle: RadioElement;
    readonly selectLeadInsurer: SelectElement;
    readonly onlyLeadPaysYes: RadioElement;
    readonly onlyLeadPaysNo: RadioElement;
    readonly createDeviationTask: ButtonElement;
    readonly shareAndBrokerageForm: UniversalForm;
    readonly remarks: TextElement;
    readonly heldCoverNoteRemarks: TextElement;
    readonly documentType: SelectElement;
    readonly documentUpload: DocumentUploadElement;
    readonly completeActivity: ButtonElement;
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
    readonly tcBrokerageAmount: TextElement;

    constructor(page: Page) {
        this.page = page;
        this.insurerPolicyNo = new TextElement(page, page.getByTestId('form-field-text-insurerPolicyNo').locator('input'));
        this.hardCopyReceivedOn = new DateElement(page, page.getByTestId('form-field-date-hardCopyReceivedOn').locator('input'));
        this.anyDeviationsYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationCoveragesLid').getByText(/^yes$/i));
        this.anyDeviationsNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationCoveragesLid').getByText(/^no$/i));
        this.deviationAddressedYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationsAddressedLid').getByText(/^yes$/i));
        this.deviationAddressedNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationsAddressedLid').getByText(/^no$/i));
        this.resolution = new SelectElement(page, 'form-field-select-resolutionLid');
        this.revisedHardCopyReceivedYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyHardCopyReceivedLid').getByText(/^yes$/i));
        this.revisedHardCopyReceivedNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyHardCopyReceivedLid').getByText(/^no$/i));
        this.deviationFromPremiumAndBrokerageYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationsLid').getByText(/^yes$/i));
        this.deviationFromPremiumAndBrokerageNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-deviationsLid').getByText(/^no$/i));
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
        this.srccBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-srccBrokerageAmount').locator('input'));
        this.tcBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-tcBrokerageAmount').locator('input'));

        this.terrorismCommission = new TextElement(page, page.getByTestId('form-field-number-terrorism').locator('input'));
        this.netPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
        this.gstPercentage = new TextElement(page, page.getByTestId('form-field-number-gstPercentage').locator('input'));
        this.gstAmount = new TextElement(page, page.getByTestId('form-field-number-gstAmount').locator('input'));
        this.fee = new TextElement(page, page.getByTestId('form-field-number-fee').locator('input'));
        this.otherAmount = new TextElement(page, page.getByTestId('form-field-number-other').locator('input'));
        this.totalPremium = new TextElement(page, page.getByTestId('form-field-number-grossPremium').locator('input'));
        this.basicBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-basicBrokeragePercentage').locator('input'));
        this.terrorismBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-terrorismBrokeragePercentage').locator('input'));
        this.basicBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-basicBrokerageAmount').locator('input'));
        this.terrorismBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-tcBrokerageAmount').locator('input'));
        this.totalBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-totalBrokerageAmount').locator('input'));
        this.coverages = new TextElement(page, page.getByTestId('form-field-textarea-coverages').locator('textarea').first());
        this.exclusions = new TextElement(page, page.getByTestId('form-field-textarea-exclusions').locator('textarea').first());
        this.deductibles = new TextElement(page, page.getByTestId('form-field-textarea-deductibles').locator('textarea').first());
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.policyPlacedMultiple = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedLid').getByText(/^multiple$/i));
        this.policyPlacedSingle = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedLid').getByText(/^single$/i));
        this.selectLeadInsurer = new SelectElement(page, 'form-field-selectFieldByApi-leadInsurerId');
        this.onlyLeadPaysYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-onlyLeadInsurerPaysBrokerageLid').getByText(/^yes$/i));
        this.onlyLeadPaysNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-onlyLeadInsurerPaysBrokerageLid').getByText(/^no$/i));
        this.shareAndBrokerageForm = new UniversalForm(page, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG);
        this.heldCoverNoteRemarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.documentUpload = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-documentupload-documents').locator('input[type="file"]').first(),
            page.locator('#fileUpload'),
            page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
        );
        this.createDeviationTask = new ButtonElement(page, page.getByRole('button', { name: 'Create task for deviation' }));
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
     * Fills out the Policy Hard Copy Receipt form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     */
    async set(data: any, coversJson?: any): Promise<void> {
        if (data.insurerPolicyNo) await this.insurerPolicyNo.set(data.insurerPolicyNo);
        if (data.hardCopyReceivedOn) await this.hardCopyReceivedOn.set(data.hardCopyReceivedOn);
        // Always set anyDeviations and deviationAddressed if present
        if (data.anyDeviations) {
            if (String(data.anyDeviations).toLowerCase() === "yes") await this.anyDeviationsYes.click();
            else if (String(data.anyDeviations).toLowerCase() === "no") await this.anyDeviationsNo.click();
        }
        if (data.deviationAddressed) {
            if (String(data.deviationAddressed).toLowerCase() === "yes") await this.deviationAddressedYes.click();
            else if (String(data.deviationAddressed).toLowerCase() === "no") await this.deviationAddressedNo.click();
        }
        if (
            data.anyDeviations && String(data.anyDeviations).toLowerCase() === "yes" &&
            data.deviationAddressed && String(data.deviationAddressed).toLowerCase() === "yes"
        ) {
            if (data.resolution) await this.resolution.set(data.resolution);
            if (data.revisedHardCopyReceived == 'Yes') await this.revisedHardCopyReceivedYes.click();
            if (data.revisedHardCopyReceived == 'No') await this.revisedHardCopyReceivedNo.click();
            if (data.deviationFromPremiumAndBrokerage == "Yes") await this.deviationFromPremiumAndBrokerageYes.click();
            if (data.deviationFromPremiumAndBrokerage == "No") await this.deviationFromPremiumAndBrokerageNo.click();
            if (data.sumInsured) await this.sumInsured.set(data.sumInsured);
            if (data.basicPremium) await this.basicPremium.set(data.basicPremium);
            
            
            if (data.terrorismCommission) await this.terrorismCommission.set(data.terrorismCommission);
            if (data.netPremium) await this.netPremium.set(data.netPremium);
            if (data.gstPercentage) await this.gstPercentage.set(data.gstPercentage);
            if (data.gstAmount) await this.gstAmount.set(data.gstAmount);
            if (data.fee) await this.fee.set(data.fee);
            if (data.otherAmount) await this.otherAmount.set(data.otherAmount);
            if (data.totalPremium) await this.totalPremium.set(data.totalPremium);
            if (data.basicBrokeragePercentage) await this.basicBrokeragePercentage.set(data.basicBrokeragePercentage);
            if (data.terrorismBrokeragePercentage) await this.terrorismBrokeragePercentage.set(data.terrorismBrokeragePercentage);
            if (data.basicBrokerageAmount) await this.basicBrokerageAmount.set(data.basicBrokerageAmount);
            if (data.terrorismBrokerageAmount) await this.terrorismBrokerageAmount.set(data.terrorismBrokerageAmount);
            if (data.totalBrokerageAmount) await this.totalBrokerageAmount.set(data.totalBrokerageAmount);
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

            if (data.coverages) await this.coverages.set(data.coverages);
            if (data.exclusions) await this.exclusions.set(data.exclusions);
            if (data.deductibles) await this.deductibles.set(data.deductibles);
            if (data.policyPlacedType === 'Multiple') {
                await this.policyPlacedMultiple.click();
            }
            else if (data.policyPlacedType === 'Single') {
                await this.policyPlacedSingle.click();
            }
            if (data.basicCovers && coversJson) {
                for (const cover of data.basicCovers) {
                    await setCover(this.page, cover.name, cover.value, coversJson);
                }
            }
        }
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
     * Reads and returns all Policy Hard Copy Receipt form values as an object.
     * @returns Object with current form values.
     */
    async get(coversJson?: any): Promise<any> {
        /**
         * Checks if a radio button is selected by examining its data-testid attribute
         * @param radioButtonLocator - The locator for the radio button element
         * @returns Promise<boolean> - true if the radio button is selected, false otherwise
         */
        const isRadioButtonSelected = async (radioButton: RadioElement): Promise<boolean> => {
            const locator = (radioButton as any).element;
            await locator.waitFor({ state: 'attached', timeout: TIMEOUTS.API_TIMEOUT });
            const testId = await locator.getAttribute('data-testid');
            if (testId && testId.endsWith('-true')) return true;
            if (testId && testId.endsWith('-false')) return false;
        };

        // Get radio button selections
        const anyDeviationsYesSelected = await isRadioButtonSelected(this.anyDeviationsYes);
        const anyDeviationsNoSelected = await isRadioButtonSelected(this.anyDeviationsNo);
        const deviationAddressedYesSelected = await isRadioButtonSelected(this.deviationAddressedYes);
        const deviationAddressedNoSelected = await isRadioButtonSelected(this.deviationAddressedNo);
        const revisedHardCopyReceivedYesSelected = await isRadioButtonSelected(this.revisedHardCopyReceivedYes);
        const revisedHardCopyReceivedNoSelected = await isRadioButtonSelected(this.revisedHardCopyReceivedNo);
        const deviationFromPremiumAndBrokerageYesSelected = await isRadioButtonSelected(this.deviationFromPremiumAndBrokerageYes);
        const deviationFromPremiumAndBrokerageNoSelected = await isRadioButtonSelected(this.deviationFromPremiumAndBrokerageNo);
        const policyPlacedMultiple = await isRadioButtonSelected((this.policyPlacedMultiple as any).element);
        const policyPlacedSingle = await isRadioButtonSelected((this.policyPlacedSingle as any).element);
        const onlyLeadPaysYes = await isRadioButtonSelected((this.onlyLeadPaysYes as any).element);
        const onlyLeadPaysNo = await isRadioButtonSelected((this.onlyLeadPaysNo as any).element);

        // Get basic covers data
        let basicCoversData = {};
        if (coversJson) {
            basicCoversData = await getAllCovers(this.page, coversJson);
        }

        return {
            insurerPolicyNo: await this.insurerPolicyNo.getValue(),
            hardCopyReceivedOn: await this.hardCopyReceivedOn.getValue(),
            anyDeviations: anyDeviationsYesSelected ? 'Yes' : (anyDeviationsNoSelected ? 'No' : null),
            deviationAddressed: deviationAddressedYesSelected ? 'Yes' : (deviationAddressedNoSelected ? 'No' : null),
            resolution: await this.resolution.getValue(),
            revisedHardCopyReceived: revisedHardCopyReceivedYesSelected ? 'Yes' : (revisedHardCopyReceivedNoSelected ? 'No' : null),
            deviationFromPremiumAndBrokerage: deviationFromPremiumAndBrokerageYesSelected ? 'Yes' : (deviationFromPremiumAndBrokerageNoSelected ? 'No' : null),
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
            tcBrokerageAmount: await this.tcBrokerageAmount.getValue(),
            totalBrokerageAmount: await this.totalBrokerageAmount.getValue(),
            terrorismCommission: await this.terrorismCommission.getValue(),
            netPremium: await this.netPremium.getValue(),
            gstPercentage: await this.gstPercentage.getValue(),
            gstAmount: await this.gstAmount.getValue(),
            fee: await this.fee.getValue(),
            otherAmount: await this.otherAmount.getValue(),
            totalPremium: await this.totalPremium.getValue(),
            terrorismBrokeragePercentage: await this.terrorismBrokeragePercentage.getValue(),
            terrorismBrokerageAmount: await this.terrorismBrokerageAmount.getValue(),
            coverages: await this.coverages.getValue(),
            exclusions: await this.exclusions.getValue(),
            deductibles: await this.deductibles.getValue(),
            policyPlacedType: policyPlacedMultiple ? "Multiple Insurers" : (policyPlacedSingle ? "Single Insurer" : null),
            onlyLeadPays: onlyLeadPaysYes ? "Yes" : (onlyLeadPaysNo ? "No" : null),
            selectLeadInsurer: await this.selectLeadInsurer.getValue(),
            shareAndBrokerageDetails: await this.shareAndBrokerageForm.get(),
            basicCovers: makeQuotes(basicCoversData),
            remarks: await this.remarks.getValue(),
            documentType: await this.documentUpload.listUploadedDocuments(),
            filename: await this.documentUpload.listUploadedDocuments(),
        };
    }

}