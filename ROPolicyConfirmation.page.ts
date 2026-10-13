import { Page, Locator } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { RadioElement } from '../framework/radio.element';
import { SelectElement } from '../framework/select.element';
import { TextElement } from '../framework/text.element';
import { TIMEOUTS } from '../env/timeouts';
import { INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG, UniversalForm } from '../classes/commonServiceProvider';

export class ROPolicyConfirmationPage {
    readonly page: Page;
    readonly anyDeviationsYes: RadioElement;
    readonly anyDeviationsNo: RadioElement;
    readonly enterDeviations: TextElement;
    readonly deviationAddressedYes: RadioElement;
    readonly deviationAddressedNo: RadioElement;
    readonly resolution: SelectElement;
    readonly sumInsured: TextElement;

    readonly terrorismCommission: TextElement;
    readonly netPremium: TextElement;
    readonly brokeragePercentage: TextElement;
    readonly brokerageAmount: TextElement;
    readonly gstPercentage: TextElement;
    readonly gstAmount: TextElement;
    readonly fee: TextElement;
    readonly otherAmount: TextElement;
    readonly grossPremium: TextElement;
    readonly basicBrokeragePercentage: TextElement;
    readonly terrorismBrokeragePercentage: TextElement;
    readonly basicBrokerageAmount: TextElement;
    readonly tcBrokerageAmount: TextElement;
    readonly totalBrokerageAmount: TextElement;
    readonly policyPlacedMultiple: RadioElement;
    readonly policyPlacedSingle: RadioElement;
    readonly selectLeadInsurer: SelectElement;
    readonly onlyLeadPaysYes: RadioElement;
    readonly onlyLeadPaysNo: RadioElement;
    readonly shareAndBrokerageForm: UniversalForm;
    readonly remarks: TextElement;
    readonly documentType: SelectElement;
    readonly documentUpload: DocumentUploadElement;
    readonly completeActivity: ButtonElement;

    // Sri Lanka fields
    readonly basicPremium: TextElement;
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
        this.anyDeviationsYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyDataWrongLid').getByText('yes'));
        this.anyDeviationsNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyDataWrongLid').getByText('no'));
        this.enterDeviations = new TextElement(page, page.getByTestId('form-field-textarea-deviations').locator('textarea').nth(0));
        this.deviationAddressedYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyDataRectifiedLid').getByText('yes'));
        this.deviationAddressedNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyDataRectifiedLid').getByText('no'));
        this.resolution = new SelectElement(page, 'form-field-select-resolutionLid');
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

        this.terrorismCommission = new TextElement(page, page.getByTestId('form-field-number-terrorismCommission').locator('input'));
        this.netPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
        this.gstPercentage = new TextElement(page, page.getByTestId('form-field-number-gstPercentage').locator('input'));
        this.gstAmount = new TextElement(page, page.getByTestId('form-field-number-gstAmount').locator('input'));
        this.fee = new TextElement(page, page.getByTestId('form-field-number-fee').locator('input'));
        this.otherAmount = new TextElement(page, page.getByTestId('form-field-number-otherAmount').locator('input'));
        this.grossPremium = new TextElement(page, page.getByTestId('form-field-number-grossPremium').locator('input'));
        this.basicBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-basicBrokeragePercentage').locator('input'));
        this.terrorismBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-terrorismBrokeragePercentage').locator('input'));
        this.basicBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-basicBrokerageAmount').locator('input'));
        this.tcBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-tcBrokerageAmount').locator('input'));
        this.totalBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-totalBrokerageAmount').locator('input'));
        this.policyPlacedMultiple = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlaced').getByText('multiple'));
        this.policyPlacedSingle = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlaced').getByText('single'));
        this.selectLeadInsurer = new SelectElement(page, 'form-field-select-leadInsurer');
        this.onlyLeadPaysYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-onlyLeadPays').getByText('yes'));
        this.onlyLeadPaysNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-onlyLeadPays').getByText('no'));
        this.shareAndBrokerageForm = new UniversalForm(page, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG);
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').nth(0));
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.documentUpload = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-select-documentType').locator('input').first(),
            page.locator('#fileUpload'),
            page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
        );
        this.completeActivity = new ButtonElement(page, page.getByRole('button', { name: 'Complete activity' }));
    }

    /**
     * Waits for the given timeout (useful for debug or controlled waits)
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<void>}
     */
    async wait(timeout: number): Promise<void> {
        await this.page.waitForTimeout(timeout);
    }

    /**
     * Fills out the Policy Confirmation form with the given data.
     * Only fills fields present in the data object.
     * @param data Form values to set.
     */
    async set(data: any): Promise<void> {
        if (data.anyDeviations === 'Yes') {
            await this.anyDeviationsYes.click();
            await this.enterDeviations.set(data.enterDeviations);
            if (data.deviationAddressed === 'Yes') {
                await this.deviationAddressedYes.click();
                if (data.resolution) await this.resolution.set(data.resolution);
                if (data.sumInsured) await this.sumInsured.set(data.sumInsured);
                if (data.basicPremium) await this.basicPremium.set(data.basicPremium);
                if (data.terrorismCommission) await this.terrorismCommission.set(data.terrorismCommission);
                if (data.netPremium) await this.netPremium.set(data.netPremium);
                if (data.gstPercentage) await this.gstPercentage.set(data.gstPercentage);
                if (data.gstAmount) await this.gstAmount.set(data.gstAmount);
                if (data.fee) await this.fee.set(data.fee);
                if (data.otherAmount) await this.otherAmount.set(data.otherAmount);
                if (data.grossPremium) await this.grossPremium.set(data.grossPremium);
                if (data.basicBrokeragePercentage) await this.basicBrokeragePercentage.set(data.basicBrokeragePercentage);
                if (data.terrorismBrokeragePercentage) await this.terrorismBrokeragePercentage.set(data.terrorismBrokeragePercentage);
                if (data.basicBrokerageAmount) await this.basicBrokerageAmount.set(data.basicBrokerageAmount);
                if (data.tcBrokerageAmount) await this.tcBrokerageAmount.set(data.tcBrokerageAmount);
                if (data.totalBrokerageAmount) await this.totalBrokerageAmount.set(data.totalBrokerageAmount);
                if (data.brokeragePercentage) await this.brokeragePercentage.set(data.brokeragePercentage);
                if (data.brokerageAmount) await this.brokerageAmount.set(data.brokerageAmount);
                //Sri Lanka fields
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
            }

            else if (data.deviationAddressed === 'No') {
                await this.deviationAddressedNo.click();
            }
        }
        else if (data.anyDeviations === 'No') {
            await this.anyDeviationsNo.click();
        }

        if (data.remarks) await this.remarks.set(data.remarks);
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
     * Reads and returns all Policy Confirmation form values as an object.
     * @returns Object with current form values.
     */
    async get(): Promise<any> {
        /**
         * Checks if a radio button is selected by examining its data-testid attribute
         * @param radioButton - The RadioElement instance
         * @returns Promise<boolean> - true if the radio button is selected, false otherwise
         */
        const isRadioButtonSelected = async (radioButton: RadioElement): Promise<boolean> => {
            const locator = (radioButton as any).element;
            await locator.waitFor({ state: 'attached', timeout: TIMEOUTS.API_TIMEOUT });
            const testId = await locator.getAttribute('data-testid');

            if (testId && testId.endsWith('-true')) return true;
            if (testId && testId.endsWith('-false')) return false;
        };

        const anyDeviationsYesSelected = await isRadioButtonSelected(this.anyDeviationsYes);
        const anyDeviationsNoSelected = await isRadioButtonSelected(this.anyDeviationsNo);
        const deviationAddressedYesSelected = await isRadioButtonSelected(this.deviationAddressedYes);
        const deviationAddressedNoSelected = await isRadioButtonSelected(this.deviationAddressedNo);

        return {
            anyDeviations: anyDeviationsYesSelected ? 'Yes' : (anyDeviationsNoSelected ? 'No' : null),
            enterDeviations: await this.enterDeviations.getValue(),
            deviationAddressed: deviationAddressedYesSelected ? 'Yes' : (deviationAddressedNoSelected ? 'No' : null),
            resolution: await this.resolution.getValue(),
            brokeragePercentage: await this.brokeragePercentage.getValue(),
            brokerageAmount: await this.brokerageAmount.getValue(),
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
            remarks: await this.remarks.getValue(),
            documentType: await this.documentUpload.listUploadedDocuments(),
            filename: await this.documentUpload.listUploadedDocuments(),
        };
    }
}