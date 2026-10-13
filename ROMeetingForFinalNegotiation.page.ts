import { Page, Locator } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { RadioElement } from '../framework/radio.element';
import { DateElement } from '../framework/date.element';
import { TimePickerElement } from '../framework/timepicker.element';
import { MultiSelectElement } from '../framework/multiselect.element';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { INSURER_SERVICE_LEVEL_AGREEMENT_CONFIG, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG, TAX_DETAILS_CONFIG, UniversalForm } from '../classes/commonServiceProvider';
import { TIMEOUTS } from '../env/timeouts';
import { setCover, getAllCovers, makeQuotes } from '../utils/utils';

export class ROMeetingForFinalNegotiationPage {
    readonly page: Page;
    readonly newMeeting: RadioElement;
    readonly existingMeeting: ButtonElement;
    readonly selectMeeting: SelectElement;
    readonly meetingDate: DateElement;
    readonly availableFrom: TimePickerElement;
    readonly availableTo: TimePickerElement;
    readonly typeOfMeeting: SelectElement;
    readonly meetingLocation: SelectElement;
    readonly companyContactPersons: MultiSelectElement;
    readonly employeeParticipants: MultiSelectElement;
    readonly insurerParticipants: SelectElement;
    readonly insurerContactPerson: MultiSelectElement;
    readonly tpaParticipants: SelectElement;
    readonly tpaContactPerson: MultiSelectElement;
    readonly agenda: TextElement;
    readonly documentType: SelectElement;
    readonly documentUpload: DocumentUploadElement;
    readonly saveActivity: ButtonElement;   
    readonly completeActivity: ButtonElement;
    readonly multipleInsurers: RadioElement;
    readonly singleInsurer: RadioElement;
    readonly selectLeadInsurer: SelectElement;
    readonly onlyLeadInsurerPaysBrokerageYes: RadioElement;
    readonly onlyLeadInsurerPaysBrokerageNo: RadioElement;
    readonly netPremium: TextElement;
    readonly brokeragePercentage: TextElement;
    readonly insurerRemarks: TextElement;
    readonly finalisedVersionQuote: SelectElement;
    readonly finalisedQuote: SelectElement;
    readonly editQuoteYes: RadioElement;
    readonly editQuoteNo: RadioElement;
    readonly selectInsurer: SelectElement;
    readonly selectInsurerLocation: SelectElement;
    readonly quoteReceivedOn: DateElement;
    readonly basicPremium: TextElement;
    readonly terrorism: TextElement;

    readonly remarks: TextElement;
    readonly otherCommentsFromInsurer: TextElement;
    readonly deviations: TextElement;

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
        this.newMeeting = new RadioElement(page, page.getByTestId('segmented-control-option-true'));
        this.existingMeeting = new ButtonElement(page, page.getByRole('button', { name: 'Existing Meeting' }));
        this.selectMeeting = new SelectElement(page, 'form-field-select-selectMeeting');
        this.meetingDate = new DateElement(page, page.getByTestId('form-field-date-meetingDate').locator('input'));
        this.availableFrom = new TimePickerElement(page, page.getByTestId('availableFrom-time-picker').locator('input'), page.getByTestId('time-picker-dropdown'));
        this.availableTo = new TimePickerElement(page, page.getByTestId('availableTo-time-picker').locator('input'), page.getByTestId('time-picker-dropdown'));
        this.typeOfMeeting = new SelectElement(page, 'form-field-select-meetingTypeLid');
        this.meetingLocation = new SelectElement(page, 'form-field-select-locationTypeLid');
        this.companyContactPersons = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-companyContactPerson'));
        this.employeeParticipants = new MultiSelectElement(page, page.getByTestId('form-field-multiSelectFieldByApi-employees'));
        this.insurerParticipants = new SelectElement(page, page.locator('text=Insurer Participants').locator('..').getByTestId('form-field-selectFieldByApi-insurerId'));
        this.insurerContactPerson = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-insurerContactPerson'));
        this.tpaParticipants = new SelectElement(page, 'form-field-selectFieldByApi-tpaId');
        this.tpaContactPerson = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-tpaContactPerson'));
        this.agenda = new TextElement(page, page.getByTestId('form-field-textarea-mom').locator('textarea').first());
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.documentUpload = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-select-documentType').locator('input').first(),
            page.locator('#fileUpload'),
            page.getByTestId('form-field-documentupload-documents').locator('div.MuiBox-root').first()
        );

        this.multipleInsurers = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid').getByText(/^Multiple Insurers$/i));
        this.singleInsurer = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-policyPlacedTypeLid').getByText(/^Single Insurer$/i));
        this.selectLeadInsurer = new SelectElement(page, 'form-field-selectFieldByApi-leadInsurerId');
        this.onlyLeadInsurerPaysBrokerageYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommissionLid').getByText(/^yes$/i));
        this.onlyLeadInsurerPaysBrokerageNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isLeadInsurerPayCommissionLid').getByText(/^No$/i));
        this.netPremium = new TextElement(page, page.getByTestId('form-field-number-netPremium').locator('input'));
        this.brokeragePercentage = new TextElement(page, page.getByTestId('form-field-number-brokeragePercentage').locator('input'));
        this.insurerRemarks = new TextElement(page, page.getByTestId('form-field-textarea-insurerRemarks').locator('textarea').first());
        this.finalisedVersionQuote = new SelectElement(page, 'form-field-select-finalizedVersionId');
        this.finalisedQuote = new SelectElement(page, 'form-field-select-finalizedQuoteId');
        this.editQuoteYes = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isQuoteEdited').getByText(/^yes$/i));
        this.editQuoteNo = new RadioElement(page, page.getByTestId('form-field-segmentedcontrol-isQuoteEdited').getByText(/^No$/i));
        this.selectInsurer = new SelectElement(page, page.locator('text=Select Insurer').locator('..').getByTestId('form-field-selectFieldByApi-insurerId'));
        this.selectInsurerLocation = new SelectElement(page, 'form-field-selectFieldByApi-insurerLocationId');
        this.quoteReceivedOn = new DateElement(page, page.getByTestId('form-field-date-quoteReceivedOn').locator('input'));
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
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.otherCommentsFromInsurer = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.deviations = new TextElement(page, page.getByTestId('form-field-textarea-retArray.0.issue').locator('textarea').first());
        this.saveActivity=new ButtonElement(page, page.getByRole('button', { name: 'Save activity' }));
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
     * Fills out the Meeting For Final Negotiation form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     * @param coversJson The metadata JSON for basic covers (required for basicCovers)
    */
    async set(data: any, coversJson?: any): Promise<void> {
        // Use setCover utility for each basic cover if coversJson is provided
        if (data.basicCovers && coversJson) {
            for (const cover of data.basicCovers) {
                await setCover(this.page, cover.name, cover.value, coversJson);
            }
        }
        if (data.newMeeting) await this.newMeeting.click();
        if (data.existingMeeting) {
            await this.existingMeeting.click();
            if (data.selectMeeting) await this.selectMeeting.set(data.selectMeeting);
        }
        if (data.meetingDate) await this.meetingDate.set(data.meetingDate);
        if (data.availableFrom) await this.availableFrom.set(data.availableFrom);
        if (data.availableTo) await this.availableTo.set(data.availableTo);
        if (data.typeOfMeeting) await this.typeOfMeeting.set(data.typeOfMeeting);
        if (data.location) await this.meetingLocation.set(data.location);
        if (data.companyContactPersons) await this.companyContactPersons.set(data.companyContactPersons);
        if (data.employeeParticipants) await this.employeeParticipants.set(data.employeeParticipants);
        if (data.insurerParticipants) await this.insurerParticipants.set(data.insurerParticipants);
        if (data.insurerContactPerson) await this.insurerContactPerson.set(data.insurerContactPerson);
        if (data.tpaParticipants) await this.tpaParticipants.set(data.tpaParticipants);
        if (data.tpaContactPerson) await this.tpaContactPerson.set(data.tpaContactPerson);
        if (data.agenda) await this.agenda.set(data.agenda);
        if (data.multipleInsurers) await this.multipleInsurers.click();
        if (data.singleInsurer) await this.singleInsurer.click();
        if (data.selectLeadInsurer) await this.selectLeadInsurer.set(data.selectLeadInsurer);
        if (data.onlyLeadInsurerPaysBrokerageYes) await this.onlyLeadInsurerPaysBrokerageYes.click();
        if (data.onlyLeadInsurerPaysBrokerageNo) await this.onlyLeadInsurerPaysBrokerageNo.click();
        if (data.netPremium) await this.netPremium.set(data.netPremium);
        if (data.brokeragePercentage) await this.brokeragePercentage.set(data.brokeragePercentage);
        if (data.insurerRemarks) await this.insurerRemarks.set(data.insurerRemarks);
        if (data.finalisedVersionQuote) await this.finalisedVersionQuote.set(data.finalisedVersionQuote);
        if (data.finalisedQuote) await this.finalisedQuote.set(data.finalisedQuote);
        if (typeof data.editQuote !== 'undefined') {
            if (data.editQuote) {
                await this.editQuoteYes.click();
            } else {
                await this.editQuoteNo.click();
            }
        }
        if (data.selectInsurer) await this.selectInsurer.set(data.selectInsurer);
        if (data.selectInsurerLocation) await this.selectInsurerLocation.set(data.selectInsurerLocation);
        if (data.quoteReceivedOn) await this.quoteReceivedOn.set(data.quoteReceivedOn);
        if (data.basicPremium) await this.basicPremium.set(data.basicPremium);
        //Sri Lanka Fields
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
        if (data.taxDetails && data.taxDetails.length) {
            // Fill existing pre-filled rows using SelectElement for proper autocomplete handling
            for (let i = 0; i < data.taxDetails.length; i++) {
                // Target the specific autocomplete element, not the container
                const taxList = new SelectElement(this.page, this.page.getByTestId(`form-field-select-retArray.${i}.tax`).locator('.MuiAutocomplete-root'));
                await taxList.set(data.taxDetails[i].Tax);

                // Fill the tax value input using TextElement
                const taxValue = new TextElement(this.page, this.page.getByTestId(`form-field-number-retArray.${i}.taxValue`).locator('input'));
                await taxValue.set(data.taxDetails[i]["Tax Value"]);

                await this.wait(TIMEOUTS.CLICK_TIMEOUT); // Small delay between fields
            }

            // Remove any extra pre-filled rows if JSON has fewer items
            const maxPrefilledRows = await this.page.locator('[data-testid^="remove-button-tax-details-"]').count();
            for (let i = data.taxDetails.length; i < maxPrefilledRows; i++) {
                try {
                    const removeButton = this.page.getByTestId(`remove-button-tax-details-${i + 1}`);
                    if (await removeButton.isVisible()) {
                        await removeButton.click();
                        await this.wait(TIMEOUTS.CLICK_TIMEOUT);
                    }
                } catch (error) {
                    // Ignore if remove button doesn't exist 
                    break;
                }
            }
        }
        if (data.insurerShareAndBrokerageDetails?.length) {
            const insurerAndBrokerage = new UniversalForm(this.page, INSURERS_SHARE_AND_BROKERAGE_DETAILS_CONFIG);
            await insurerAndBrokerage.set(data.insurerShareAndBrokerageDetails as FormData[]);
        }
        if (data.documentType?.length && data.file?.length) {
            for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                await this.documentType.set(data.documentType[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
                await this.documentUpload.fileUpload.set(data.file[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
            }
        }
        if (data.insurerServiceLevelAgreement?.length) {
            const insurerServiceLevelAgreement = new UniversalForm(this.page, INSURER_SERVICE_LEVEL_AGREEMENT_CONFIG);
            await insurerServiceLevelAgreement.set(data.insurerServiceLevelAgreement as FormData[]);
        }
        if (data.remarks) await this.remarks.set(data.remarks);
        if (data.otherCommentsFromInsurer) await this.otherCommentsFromInsurer.set(data.otherCommentsFromInsurer);
        if (data.deviations) await this.deviations.set(data.deviations);
        if(data.saveActivity) await this.saveActivity.click();
        if (data.completeActivity) await this.completeActivity.click();
    }

    /**
     * Reads and returns all Meeting for Final Negotiation form values as an object.
     * Uses getAllCovers utility for basic covers if coversJson is provided.
     * @param coversJson The metadata JSON for basic covers (required for basicCovers)
     * @returns Object with current form values.
    */
    async get(coversJson?: any): Promise<any> {
        // Use getAllCovers utility for basic covers if coversJson is provided
        let basicCoversData = {};
        if (coversJson) {
            basicCoversData = await getAllCovers(this.page, coversJson);
        }
        /**
         * Checks if a radio button is selected by examining its data-testid attribute
         * @param radioButtonLocator - The locator for the radio button element
         * @returns Promise<boolean> - true if the radio button is selected, false otherwise
         */
        const isRadioButtonSelected = async (radioButtonLocator: Locator): Promise<boolean> => {
            await this.wait(TIMEOUTS.API_TIMEOUT);
            const testId = await radioButtonLocator.getAttribute('data-testid');

            // Check if it ends with '-true' (selected) or '-false' (not selected)
            if (testId && testId.endsWith('-true')) return true;
            if (testId && testId.endsWith('-false')) return false;
        };

        const isNewMeeting = await isRadioButtonSelected((this.newMeeting as any).element);
        const isExistingMeeting = await isRadioButtonSelected((this.existingMeeting as any).element);
        const multipleInsurersSelected = await isRadioButtonSelected((this.multipleInsurers as any).element);
        const singleInsurerSelected = await isRadioButtonSelected((this.singleInsurer as any).element);
        const onlyLeadPaysYes = await isRadioButtonSelected((this.onlyLeadInsurerPaysBrokerageYes as any).element);
        const onlyLeadPaysNo = await isRadioButtonSelected((this.onlyLeadInsurerPaysBrokerageNo as any).element);
        const editQuoteYes = await isRadioButtonSelected((this.editQuoteYes as any).element);
        const editQuoteNo = await isRadioButtonSelected((this.editQuoteNo as any).element);

        return {
            basicCovers: makeQuotes(basicCoversData),
            meeting: isNewMeeting ? "New Meeting" : (isExistingMeeting ? "Existing Meeting" : null),
            policyPlacedType: multipleInsurersSelected ? "Multiple Insurers" : (singleInsurerSelected ? "Single Insurer" : null),
            selectMeeting: isNewMeeting === false ? await this.selectMeeting.getValue() : null,
            meetingDate: await this.meetingDate.getValue(),
            availableFrom: await this.availableFrom.getValue(),
            availableTo: await this.availableTo.getValue(),
            typeOfMeeting: await this.typeOfMeeting.getValue(),
            location: await this.meetingLocation.getValue(),
            companyContactPersons: await this.companyContactPersons.get() ?? [],
            employeeParticipants: await this.employeeParticipants.get() ?? [],
            insurerParticipants: await this.insurerParticipants.getValue(),
            insurerContactPerson: await this.insurerContactPerson.get() ?? [],
            tpaParticipants: await this.tpaParticipants.getValue(),
            tpaContactPerson: await this.tpaContactPerson.get() ?? [],
            agenda: await this.agenda.getValue(),
            selectLeadInsurer: await this.selectLeadInsurer.getValue(),
            onlyLeadInsurerPaysBrokerage: onlyLeadPaysYes ? "Yes" : (onlyLeadPaysNo ? "No" : null),
            netPremium: await this.netPremium.getValue(),
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
            brokeragePercentage: await this.brokeragePercentage.getValue(),
            insurerRemarks: await this.insurerRemarks.getValue(),
            finalisedVersionQuote: await this.finalisedVersionQuote.getValue(),
            finalisedQuote: await this.finalisedQuote.getValue(),
            editQuote: editQuoteYes ? "Yes" : (editQuoteNo ? "No" : null),
            selectInsurer: await this.selectInsurer.getValue(),
            selectInsurerLocation: await this.selectInsurerLocation.getValue(),
            quoteReleasedOn: await this.quoteReceivedOn.getValue(),
            basicPremium: await this.basicPremium.getValue(),
            terrorism: await this.terrorism.getValue(),
            otherCommentsFromInsurer: await this.otherCommentsFromInsurer.getValue(),
            deviations: await this.deviations.getValue(),
            remarks: await this.remarks.getValue(),
            documentTypeAndFileName: await this.documentUpload.listUploadedDocuments
        };
    }
}
