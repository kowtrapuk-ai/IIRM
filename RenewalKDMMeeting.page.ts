import { Locator,Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { SelectElement } from '../framework/select.element';
import { RadioElement } from '../framework/radio.element';
import { DateElement } from '../framework/date.element';
import { TimePickerElement } from '../framework/timepicker.element';
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

export class RenewalKDMMeetingPage {
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
    readonly agenda: TextElement;
    readonly remarks: TextElement;
    readonly documentType: SelectElement;
    readonly fileUpload: DocumentUploadElement;
    readonly completeActivity: ButtonElement;
    readonly page: Page;
    readonly saveActivity: ButtonElement;

    constructor(page: Page) {
        this.page = page;
        this.newMeeting = new RadioElement(page, page.getByTestId('segmented-control-option-true'));
        this.existingMeeting = new ButtonElement(page, page.getByRole('button', { name: 'Existing Meeting' }));
        this.selectMeeting = new SelectElement(page, 'form-field-select-selectMeeting');
        this.meetingDate = new DateElement(page, page.getByTestId('form-field-date-meetingDate').locator('input'));
        this.availableFrom = new TimePickerElement(page, page.getByTestId('availableFrom-time-picker').locator('input'), page.getByTestId("time-picker-dropdown"));
        this.availableTo = new TimePickerElement(page, page.getByTestId('availableTo-time-picker').locator('input'), page.getByTestId("time-picker-dropdown"));
        this.typeOfMeeting = new SelectElement(page, 'form-field-select-meetingTypeLid');
        this.meetingLocation = new SelectElement(page, 'form-field-select-locationTypeLid');
        this.companyContactPersons = new MultiSelectElement(page, page.getByTestId('form-field-multiselect-companyContactPerson'));
        this.employeeParticipants = new MultiSelectElement(page, page.getByTestId('form-field-multiSelectFieldByApi-employees'));
        this.agenda = new TextElement(page, page.getByTestId('form-field-textarea-mom').locator('textarea').first());
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
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

    /**
     * Fills out the Renewal KDM Meeting form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     */
    async set(data: any): Promise<void> {
        if (data.newMeeting) {
            await this.newMeeting.click();
        }
        if (data.existingMeeting) {
            await this.existingMeeting.click();
            await this.selectMeeting.set(data.selectMeeting);
        }
        if (data.meetingDate) await this.meetingDate.set(data.meetingDate);
        if (data.availableFrom) await this.availableFrom.set(data.availableFrom);
        if (data.availableTo) await this.availableTo.set(data.availableTo);
        if (data.typeOfMeeting) await this.typeOfMeeting.set(data.typeOfMeeting);
        if (data.location) await this.meetingLocation.set(data.location);
        if (data.companyContactPersons) await this.companyContactPersons.set(data.companyContactPersons);
        if (data.employeeParticipants) await this.employeeParticipants.set(data.employeeParticipants);
        if (data.agenda) await this.agenda.set(data.agenda);
        if (data.remarks) await this.remarks.set(data.remarks);
        if (data.documentType && data.file) {
            for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                await this.documentType.set(data.documentType[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
                await this.fileUpload.fileUpload.set(data.file[i]);
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                await this.wait(TIMEOUTS.API_TIMEOUT);
            }
        }
        if(data.saveActivity) await this.saveActivity.click();
        if (data.completeActivity) await this.completeActivity.click();
    }

    /**
     * Reads and returns all Renewal KDM Meeting form values as an object.
     * @returns Object with current form values.
     */
    async get(): Promise<any> {
        const isNewMeeting = await isRadioButtonSelected((this.newMeeting as any).element)

        return {
            isNewMeeting,
            isExistingMeeting: !isNewMeeting,
            selectMeeting: !isNewMeeting ? await this.selectMeeting.getValue() : null,
            meetingDate: await this.meetingDate.getValue(),
            availableFrom: await this.availableFrom.getValue(),
            availableTo: await this.availableTo.getValue(),
            meetingLocation: await this.meetingLocation.getValue(),
            companyContactPersons:
                (await this.companyContactPersons.get()) ?? [],
            employeeParticipants:
                (await this.employeeParticipants.get()) ?? [],
            agenda: await this.agenda.getValue(),
            remarks: await this.remarks.getValue(),
            documentTypeAndFilename: await this.fileUpload.listUploadedDocuments(),
        };
    }
}