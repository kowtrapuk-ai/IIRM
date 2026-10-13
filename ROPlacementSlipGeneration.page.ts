import { toCapitalise } from '../utils/utils';
import { Page, Locator } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { RadioElement } from '../framework/radio.element';
import { DateElement } from '../framework/date.element';
import { UniversalForm, PLG_INSTALLMENTS_CONFIG, PLG_INSURER_DETAILS_CONFIG, PLG_TPA_DETAILS_CONFIG, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG } from '../classes/commonServiceProvider';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { TIMEOUTS } from '../env/timeouts';

export class ROPlacementSlipGenerationPage {
    readonly documentType: SelectElement;
    readonly page: Page;
    readonly policyFrom: DateElement;
    readonly policyTo: DateElement;
    readonly placementSlipDate: DateElement;
    readonly sumInsured: TextElement;
    readonly basicPremium: TextElement;

    readonly terrorism: TextElement;
    readonly netPremium: TextElement;
    readonly gstPercentage: TextElement;
    readonly gstAmount: TextElement;
    readonly fee: TextElement;
    readonly otherAmount: TextElement;
    readonly grossPremium: TextElement;
    readonly basicBrokeragePercentage: TextElement;
    readonly terrorismBrokeragePercentage: TextElement;
    readonly basicBrokerageAmount: TextElement;
    readonly terrorismBrokerageAmount: TextElement;
    readonly totalBrokerageAmount: TextElement;
    readonly premiumInstallmentYes: RadioElement;
    readonly premiumInstallmentNo: RadioElement;
    readonly installmentsForm: UniversalForm;
    readonly feeInstallmentYes: RadioElement;
    readonly feeInstallmentNo: RadioElement;
    readonly policyPlacedMultiple: RadioElement;
    readonly policyPlacedSingle: RadioElement;
    readonly selectLeadInsurer: SelectElement;
    readonly others: TextElement;
    readonly totalPremium: TextElement;
    readonly insurerDetailsForm: UniversalForm;
    readonly tpaDetailsForm: UniversalForm;
    readonly maxAgeOfDependents: TextElement;
    readonly brokeragePercent: TextElement;
    readonly brokerageAmount: TextElement;
    readonly onlyLeadPaysYes: RadioElement;
    readonly onlyLeadPaysNo: RadioElement;
    readonly leadInsurer: SelectElement;
    readonly shareAndBrokerageForm: UniversalForm;
    readonly paymentType: SelectElement;
    readonly cdAccountExisting: RadioElement;
    readonly cdAccountNew: RadioElement;
    readonly chequeDate: DateElement;
    readonly selectCdAccount: SelectElement;
    readonly chequeAmount: TextElement;
    readonly chequeNumber: TextElement;
    readonly bankName: TextElement;
    readonly accountName: TextElement;
    readonly openBalance: TextElement;
    readonly cdAccountNumber: TextElement;
    readonly transactionType: SelectElement;
    readonly remarks: TextElement;
    readonly documentUpload: DocumentUploadElement;
    readonly completeActivity: ButtonElement;
    readonly submitForApproval: ButtonElement;

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
    readonly sriLankaBasicBrokeragePercentage: TextElement;
    readonly srccBrokeragePercentage: TextElement;
    readonly tcBrokeragePercentage: TextElement;
    readonly sriLankaBasicBrokerageAmount: TextElement;
    readonly srccBrokerageAmount: TextElement;
    readonly tcBrokerageAmount: TextElement;
    readonly sriLankaTotalBrokerageAmount: TextElement;


    constructor(page: Page) {
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.page = page;
        this.policyFrom = new DateElement(page, page.locator('input[name="policyFromDate"]'));
        this.policyTo = new DateElement(page, page.locator('input[name="policyToDate"]'));
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

        this.terrorism = new TextElement(page, page.getByTestId('form-field-number-terrorism').locator('input'));
        this.netPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
        this.gstPercentage = new TextElement(page, page.getByTestId('form-field-number-gstPercentage').locator('input'));
        this.gstAmount = new TextElement(page, page.getByTestId('form-field-number-gstAmount').locator('input'));
        this.fee = new TextElement(page, page.getByTestId('form-field-number-fee').locator('input'));
        this.others = new TextElement(page, page.getByTestId('form-field-text-other').locator('input'));
        this.grossPremium = new TextElement(page, page.getByTestId('form-field-number-grossPremium').locator('input'));
        this.basicBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-basicBrokeragePercentage').locator('input'));
        this.terrorismBrokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-terrorismBrokeragePercentage').locator('input'));
        this.basicBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-basicBrokerageAmount').locator('input'));
        this.terrorismBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-tcBrokerageAmount').locator('input'));
        this.totalBrokerageAmount = new TextElement(page, page.getByTestId('form-field-number-totalBrokerageAmount').locator('input'));
        this.premiumInstallmentYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isPremiumInstallmentBased').getByText(/^yes$/i));
        this.premiumInstallmentNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isPremiumInstallmentBased').getByText(/^no$/i));
        this.installmentsForm = new UniversalForm(page, PLG_INSTALLMENTS_CONFIG);
        this.feeInstallmentYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isFeeInInstallment').getByText(/^yes$/i));
        this.feeInstallmentNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isFeeInInstallment').getByText(/^no$/i));
        this.placementSlipDate = new DateElement(page, page.getByTestId('form-field-date-placementSlipDate').locator('input'));
        this.insurerDetailsForm = new UniversalForm(page, PLG_INSURER_DETAILS_CONFIG);
        this.tpaDetailsForm = new UniversalForm(page, PLG_TPA_DETAILS_CONFIG);
        this.maxAgeOfDependents = new TextElement(page, page.getByTestId('form-field-number-maxAgeOfDependents').locator('input'));
        this.brokeragePercent = new TextElement(page, page.getByTestId('form-field-number-brokeragePercentage').locator('input'));
        this.brokerageAmount = new TextElement(page, page.getByTestId('form-field-number-retArray.0.brokerageAmount').locator('input'));
        this.policyPlacedMultiple = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid').getByText(/^Multiple Insurers$/i));
        this.policyPlacedSingle = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid').getByText(/^Single Insurer$/i));
        this.leadInsurer = new SelectElement(page, 'form-field-selectFieldByApi-leadInsurerId');
        this.onlyLeadPaysYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommission').getByText(/^yes$/i));
        this.onlyLeadPaysNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommission').getByText(/^no$/i));
        this.shareAndBrokerageForm = new UniversalForm(page, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG);
        this.paymentType = new SelectElement(page, 'form-field-select-paymentTypeLid');
        this.cdAccountExisting = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-cdAccountTypeLid').getByText(/^Existing Account*$/i));
        this.cdAccountNew = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-cdAccountTypeLid').getByText(/^New Account\s*$/i));
        this.selectCdAccount = new SelectElement(page, 'form-field-selectFieldByApi-selectCdAccount');
        this.accountName = new TextElement(page, page.getByTestId('form-field-text-accountName').locator('input'));
        this.openBalance = new TextElement(page, page.getByTestId('form-field-number-openBalance').locator('input'));
        this.cdAccountNumber = new TextElement(page, page.getByTestId('form-field-text-accountNumber').locator('input'));
        this.transactionType = new SelectElement(page, 'form-field-select-transactionTypeLid');
        this.chequeDate = new DateElement(page, page.getByTestId('form-field-date-chequeDate').locator('input'));
        this.chequeAmount = new TextElement(page, page.getByTestId('form-field-number-chequeAmount').locator('input'));
        this.chequeNumber = new TextElement(page, page.getByTestId('form-field-text-chequeNumber').locator('input'));
        this.bankName = new TextElement(page, page.getByTestId('form-field-text-bankName').locator('input'));
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.documentUpload = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-select-documentType').locator('input').first(),
            page.locator('#fileUpload'),
            page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
        );
        this.completeActivity = new ButtonElement(page, page.getByRole('button', { name: 'Complete activity' }));
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
     * Fills out the Placement Slip Generation form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     */
    async set(data: any): Promise<void> {
        if (data.policyFrom) await this.policyFrom.set(data.policyFrom);
        if (data.policyTo) await this.policyTo.set(data.policyTo);
        if (data.placementSlipDate) await this.placementSlipDate.set(data.placementSlipDate);
        if (data.sumInsured) await this.sumInsured.set(data.sumInsured);
        if (data.basicPremium) await this.basicPremium.set(data.basicPremium);
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

        if (data.terrorism) await this.terrorism.set(data.terrorism);
        if (data.netPremium) await this.netPremium.set(data.netPremium);
        if (data.gstPercentage) await this.gstPercentage.set(data.gstPercentage);
        if (data.gstAmount) await this.gstAmount.set(data.gstAmount);
        if (data.fee) await this.fee.set(data.fee);
        if (data.others) await this.others.set(data.others);
        if (data.grossPremium) await this.grossPremium.set(data.grossPremium);
        if (data.basicBrokeragePercentage) await this.basicBrokeragePercentage.set(data.basicBrokeragePercentage);
        if (data.terrorismBrokeragePercentage) await this.terrorismBrokeragePercentage.set(data.terrorismBrokeragePercentage);
        if (data.basicPremiumAmount) await this.basicBrokerageAmount.set(data.basicPremiumAmount);
        if (data.terrorismBrokerageAmount) await this.terrorismBrokerageAmount.set(data.terrorismBrokerageAmount);
        if (data.totalBrokerageAmount) await this.totalBrokerageAmount.set(data.totalBrokerageAmount);
        if (toCapitalise(data.premiumInstallmentBased) === "Yes") await this.premiumInstallmentYes.click();
        else if (toCapitalise(data.premiumInstallmentBased) === "No") await this.premiumInstallmentNo.click();

        if (Array.isArray(data.installments) && data.installments?.length) {
            await this.installmentsForm.set(data.installments);
        }

        if (toCapitalise(data.feeInstallmentBased) === "Yes") await this.feeInstallmentYes.click();
        else if (toCapitalise(data.feeInstallmentBased) === "No") await this.feeInstallmentNo.click();

        if (data.terrorismBrokeragePercent) await this.terrorismBrokeragePercentage.set(data.terrorismBrokeragePercent);

        if (Array.isArray(data.insurerDetails) && data.insurerDetails?.length) await this.insurerDetailsForm.set(data.insurerDetails);
        if (Array.isArray(data.tpaDetails) && data.tpaDetails?.length) await this.tpaDetailsForm.set(data.tpaDetails);

        if (data.maxAgeOfDependents) await this.maxAgeOfDependents.set(data.maxAgeOfDependents);
        if (data.brokeragePercent) await this.brokeragePercent.set(data.brokeragePercent);
        if (data.brokerageAmount) await this.brokerageAmount.set(data.brokerageAmount);

        if (data.policyPlacedType === 'Multiple') {
            await this.policyPlacedMultiple.click();
        }
        else if (data.policyPlacedType === 'Single') {
            await this.policyPlacedSingle.click();
        }

        if (toCapitalise(data.onlyLeadPays) === "Yes") await this.onlyLeadPaysYes.click();
        else if (toCapitalise(data.onlyLeadPays) === "No") await this.onlyLeadPaysNo.click();

        if (data.leadInsurer) await this.leadInsurer.set(data.leadInsurer);
        if (Array.isArray(data.insurerShareAndBrokerageDetails) && data.insurerShareAndBrokerageDetails?.length) {
            await this.shareAndBrokerageForm.set(data.insurerShareAndBrokerageDetails);
        }
        if (data.paymentType) await this.paymentType.set(data.paymentType);
        if (data.transactionType) await this.transactionType.set(data.transactionType);
        if (data.chequeDate) await this.chequeDate.set(data.chequeDate);
        if (data.chequeAmount) await this.chequeAmount.set(data.chequeAmount);
        if (data.chequeNumber) await this.chequeNumber.set(data.chequeNumber);
        if (data.bankName) await this.bankName.set(data.bankName);
        if (data.cdAccount === 'Existing Account') {
            await this.cdAccountExisting.click();
            if (data.selectCdAccount) await this.selectCdAccount.set(data.selectCdAccount);
        }
        else if (data.cdAccount === 'New Account') {
            await this.cdAccountNew.click();
        }
        if (data.accountName) await this.accountName.set(data.accountName);
        if (data.openBalance) await this.openBalance.set(data.openBalance);
        if (data.cdAccountNumber) await this.cdAccountNumber.set(data.cdAccountNumber);

        if (data.remarks) await this.remarks.set(data.remarks);
        if (data.documentType?.length && data.file?.length) {
            for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                await this.documentType.set(data.documentType[i]);
                await this.page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
                await this.documentUpload.fileUpload.set(data.file[i]);
                await this.page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
            }
        }

        if (data.submitForApproval) await this.submitForApproval.click();
    }

    /**
     * Reads and returns all Placement Slip Generation form values as an object.
     * @returns Object with current form values.
    */
    async get(): Promise<any> {
        /**
         * Helper function to check if a radio button is enabled/selected
         * @param radioButtonLocator - The locator for the radio button element
         * @returns Promise<boolean> - true if enabled/selected, false otherwise
         */
        const isRadioButtonSelected = async (radioButtonLocator: Locator): Promise<boolean> => {
            await radioButtonLocator.waitFor({ state: 'attached', timeout: TIMEOUTS.API_TIMEOUT });
            const testId = await radioButtonLocator.getAttribute('data-testid');

            // Check if it ends with '-true' (selected) or '-false' (not selected)
            if (testId && testId.endsWith('-true')) return true;
            if (testId && testId.endsWith('-false')) return false;
        };
        // Check radio button states
        const premiumInstallmentYes = await isRadioButtonSelected((this.premiumInstallmentYes as any).element);
        const premiumInstallmentNo = await isRadioButtonSelected((this.premiumInstallmentNo as any).element);
        const feeInstallmentYes = await isRadioButtonSelected((this.feeInstallmentYes as any).element);
        const feeInstallmentNo = await isRadioButtonSelected((this.feeInstallmentNo as any).element);
        const policyPlacedMultiple = await isRadioButtonSelected((this.policyPlacedMultiple as any).element);
        const policyPlacedSingle = await isRadioButtonSelected((this.policyPlacedSingle as any).element);
        const onlyLeadPaysYes = await isRadioButtonSelected((this.onlyLeadPaysYes as any).element);
        const onlyLeadPaysNo = await isRadioButtonSelected((this.onlyLeadPaysNo as any).element);
        const cdAccountExisting = await isRadioButtonSelected((this.cdAccountExisting as any).element);
        const cdAccountNew = await isRadioButtonSelected((this.cdAccountNew as any).element);

        return {
            policyFrom: await this.policyFrom.getValue(),
            policyTo: await this.policyTo.getValue(),
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
            premiumInstallmentBased: premiumInstallmentYes ? "Yes" : (premiumInstallmentNo ? "No" : null),
            installments: await this.installmentsForm.get(),
            fee: await this.fee.getValue(),
            feeInstallmentBased: feeInstallmentYes ? "Yes" : (feeInstallmentNo ? "No" : null),
            terrorismBrokeragePercent: await this.terrorismBrokeragePercentage.getValue(),
            others: await this.others.getValue(),
            totalPremium: await this.totalPremium.getValue(),
            placementSlipDate: await this.placementSlipDate.getValue(),
            insurerDetails: await this.insurerDetailsForm.get(),
            tpaDetails: await this.tpaDetailsForm.get(),
            maxAgeOfDependents: await this.maxAgeOfDependents.getValue(),
            brokeragePercent: await this.brokeragePercent.getValue(),
            brokerageAmount: await this.brokerageAmount.getValue(),
            policyPlacedType: policyPlacedMultiple ? "Multiple Insurers" : (policyPlacedSingle ? "Single Insurer" : null),
            onlyLeadPays: onlyLeadPaysYes ? "Yes" : (onlyLeadPaysNo ? "No" : null),
            leadInsurer: await this.leadInsurer.getValue(),
            insurerShareAndBrokerageDetails: await this.shareAndBrokerageForm.get(),
            paymentType: await this.paymentType.getValue(),
            cdAccount: cdAccountExisting ? "Existing Account" : (cdAccountNew ? "New Account" : null),
            selectCdAccount: await this.selectCdAccount.getValue(),
            accountName: await this.accountName.getValue(),
            openBalance: await this.openBalance.getValue(),
            cdAccountNumber: await this.cdAccountNumber.getValue(),
            transactionType: await this.transactionType.getValue(),
            chequeDate: await this.chequeDate.getValue(),
            chequeAmount: await this.chequeAmount.getValue(),
            chequeNumber: await this.chequeNumber.getValue(),
            bankName: await this.bankName.getValue(),
            remarks: await this.remarks.getValue(),
            documentType: await this.documentUpload.listUploadedDocuments(),
            filename: await this.documentUpload.listUploadedDocuments()
        };
    }
}
