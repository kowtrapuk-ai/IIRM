import { Page } from '@playwright/test';
import { TextElement } from '../framework/text.element';
import { DateElement } from '../framework/date.element';
import { SelectElement } from '../framework/select.element';
import { DocumentUploadElement } from '../framework/documentupload.element';
import { ButtonElement } from '../framework/button.element';
import { TIMEOUTS } from '../env/timeouts';
export class ROPolicyDocketPage {
    readonly page: Page;
    readonly dateOfIssuance: DateElement;
    readonly heldCoverNoteDays: TextElement;
    readonly policyDocumentDays: TextElement;
    readonly policyDocketDays: TextElement;
    readonly endorsementDays: TextElement;
    readonly healthClaimsDays: TextElement;
    readonly nonHealthClaimsDays: TextElement;
    readonly mirDays: TextElement;
    readonly monthlyMeetingDays: TextElement;
    readonly quarterlyMeetingDays: TextElement;
    readonly renewalNoticeDays: TextElement;
    readonly dataCollectionDays: TextElement;
    readonly remarks: TextElement;
    readonly documentType: SelectElement;
    readonly documentUpload: DocumentUploadElement;
    readonly submitForApproval: ButtonElement;
    readonly approve: ButtonElement;

    constructor(page: Page) {
        this.page = page;
        this.dateOfIssuance = new DateElement(page, page.getByTestId('form-field-date-issuanceDate').locator('input'));
        this.heldCoverNoteDays = new TextElement(page, page.getByTestId('form-field-number-heldCoverNote').locator('input'));
        this.policyDocumentDays = new TextElement(page, page.getByTestId('form-field-number-policyDocument').locator('input'));
        this.policyDocketDays = new TextElement(page, page.getByTestId('form-field-number-policyDocket').locator('input'));
        this.endorsementDays = new TextElement(page, page.getByTestId('form-field-number-endorsement').locator('input'));
        this.healthClaimsDays = new TextElement(page, page.getByTestId('form-field-number-healthClaims').locator('input'));
        this.nonHealthClaimsDays = new TextElement(page, page.getByTestId('form-field-number-nonHealthClaims').locator('input'));
        this.mirDays = new TextElement(page, page.getByTestId('form-field-number-mir').locator('input'));
        this.monthlyMeetingDays = new TextElement(page, page.getByTestId('form-field-number-monthlyMeeting').locator('input'));
        this.quarterlyMeetingDays = new TextElement(page, page.getByTestId('form-field-number-quarterlyMeeting').locator('input'));
        this.renewalNoticeDays = new TextElement(page, page.getByTestId('form-field-number-renewalNotice').locator('input'));
        this.dataCollectionDays = new TextElement(page, page.getByTestId('form-field-number-dataCollection').locator('input'));
        this.remarks = new TextElement(page, page.getByTestId('form-field-textarea-remarks').locator('textarea').first());
        this.documentType = new SelectElement(page, 'form-field-select-documentType');
        this.documentUpload = new DocumentUploadElement(
            page,
            page.getByTestId('form-field-documentupload-documents').locator('input[type="file"]').first(),
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
     * Fills out the Policy Docket form with the provided data.
     * Only sets fields present in the data object.
     * @param data Object with form values to set.
     */
    async set(data: any): Promise<void> {
        if (data.dateOfIssuance) await this.dateOfIssuance.set(data.dateOfIssuance);
        if (data.heldCoverNoteDays) await this.heldCoverNoteDays.set(data.heldCoverNoteDays);
        if (data.policyDocumentDays) await this.policyDocumentDays.set(data.policyDocumentDays);
        if (data.policyDocketDays) await this.policyDocketDays.set(data.policyDocketDays);
        if (data.endorsementDays) await this.endorsementDays.set(data.endorsementDays);
        if (data.healthClaimsDays) await this.healthClaimsDays.set(data.healthClaimsDays);
        if (data.nonHealthClaimsDays) await this.nonHealthClaimsDays.set(data.nonHealthClaimsDays);
        if (data.mirDays) await this.mirDays.set(data.mirDays);
        if (data.monthlyMeetingDays) await this.monthlyMeetingDays.set(data.monthlyMeetingDays);
        if (data.quarterlyMeetingDays) await this.quarterlyMeetingDays.set(data.quarterlyMeetingDays);
        if (data.renewalNoticeDays) await this.renewalNoticeDays.set(data.renewalNoticeDays);
        if (data.dataCollectionDays) await this.dataCollectionDays.set(data.dataCollectionDays);
        if (data.remarks) await this.remarks.set(data.remarks);

        if (data.documentType.length?.length && data.file?.length) {
            for (let i = 0; i < data.documentType.length && i < data.file.length; i++) {
                await this.documentType.set(data.documentType[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
                await this.documentUpload.fileUpload.set(data.file[i]);
                await this.wait(TIMEOUTS.API_TIMEOUT);
            }
        }
        if (data.submitForApproval) await this.submitForApproval.click();
        if (data.approve) await this.approve.click();
    }

    /**
     * Reads and returns all Policy Docket form values as an object.
     * @returns Object with current form values.
     */
    async get(): Promise<any> {

        return {
            dateOfIssuance: await this.dateOfIssuance.getValue(),
            heldCoverNoteDays: await this.heldCoverNoteDays.getValue(),
            policyDocumentDays: await this.policyDocumentDays.getValue(),
            policyDocketDays: await this.policyDocketDays.getValue(),
            endorsementDays: await this.endorsementDays.getValue(),
            healthClaimsDays: await this.healthClaimsDays.getValue(),
            nonHealthClaimsDays: await this.nonHealthClaimsDays.getValue(),
            mirDays: await this.mirDays.getValue(),
            monthlyMeetingDays: await this.monthlyMeetingDays.getValue(),
            quarterlyMeetingDays: await this.quarterlyMeetingDays.getValue(),
            renewalNoticeDays: await this.renewalNoticeDays.getValue(),
            dataCollectionDays: await this.dataCollectionDays.getValue(),
            remarks: await this.remarks.getValue(),
            documentType: await this.documentUpload.getAllUploadedFilesWithTypes('doctypes'),
            filename: await this.documentUpload.getAllUploadedFilesWithTypes('filenames'),
        };

    }

}