import { Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { DateElement } from '../framework/date.element';
import { MultiSelectElement } from '../framework/multiselect.element';
import { SelectAssigneeElement } from '../framework/selectassignee.element';
import { TIMEOUTS } from '../env/timeouts';

export class ROISGPlanningPage {

  readonly page: Page;
  readonly selectAssignee: SelectAssigneeElement;
  readonly sendSelectUser: ButtonElement;
  readonly brokingSlipGenerationDate: DateElement;
  readonly brokingSlipGenerationParticipants: MultiSelectElement;
  readonly enterQuoteDate: DateElement;
  readonly enterQuoteParticipants: MultiSelectElement;
  readonly qcrGenerationDate: DateElement;
  readonly qcrGenerationParticipants: MultiSelectElement;
  readonly meetingForFinalNegotiationDate: DateElement;
  readonly meetingForFinalNegotiationParticipants: MultiSelectElement;
  readonly placementSlipGenerationDate: DateElement;
  readonly placementSlipGenerationParticipants: MultiSelectElement;
  readonly premiumCalculationDate: DateElement;
  readonly premiumCalculationParticipants: MultiSelectElement;
  readonly heldCoverNoteDate: DateElement;
  readonly heldCoverNoteParticipants: MultiSelectElement;
  readonly policyHardCopyReceiptDate: DateElement;
  readonly policyHardCopyReceiptParticipants: MultiSelectElement;
  readonly policyDocketDate: DateElement;
  readonly policyDocketParticipants: MultiSelectElement;
  readonly handOverMeetDate: DateElement;
  readonly handOverMeetParticipants: MultiSelectElement;
  readonly policyConfirmationDate: DateElement;
  readonly policyConfirmationParticipants: MultiSelectElement;
  readonly completePlanning: ButtonElement;

  constructor(page: Page) {
    this.page = page;
    this.selectAssignee = new SelectAssigneeElement(page, page.locator('[role="combobox"][aria-labelledby*="select"]').first());
    this.sendSelectUser = new ButtonElement(page, page.getByRole('button', { name: 'Send selected user' }));
    this.brokingSlipGenerationDate = new DateElement(page, page.locator('input[name="stagedRows[0].activities[0].date"]'));
    this.brokingSlipGenerationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-broking-slip-generation'));
    this.enterQuoteDate = new DateElement(page, page.locator('input[name="stagedRows[1].activities[0].date"]'));
    this.enterQuoteParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-enter-quote'));
    this.qcrGenerationDate = new DateElement(page, page.locator('input[name="stagedRows[1].activities[1].date"]'));
    this.qcrGenerationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-qcr-generation'));
    this.meetingForFinalNegotiationDate = new DateElement(page, page.locator('input[name="stagedRows[2].activities[0].date"]'));
    this.meetingForFinalNegotiationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-meeting-for-final-negotiation'));
    this.placementSlipGenerationDate = new DateElement(page, page.locator('input[name="stagedRows[3].activities[0].date"]'));
    this.placementSlipGenerationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-placement-slip-generation'));
    this.premiumCalculationDate = new DateElement(page, page.locator('input[name="stagedRows[3].activities[1].date"]'));
    this.premiumCalculationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-premium-calculation'));
    this.heldCoverNoteDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[0].date"]'));
    this.heldCoverNoteParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-held-cover-note'));
    this.policyHardCopyReceiptDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[1].date"]'));
    this.policyHardCopyReceiptParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-policy-hard-copy-receipt'));
    this.policyDocketDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[2].date"]'));
    this.policyDocketParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-policy-docket'));
    this.handOverMeetDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[3].date"]'));
    this.handOverMeetParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-hand-over-meet'));
    this.policyConfirmationDate = new DateElement(page, page.locator('input[name="stagedRows[4].activities[4].date"]'));
    this.policyConfirmationParticipants = new MultiSelectElement(page, page.getByTestId('select-participants-policy-confirmation'));
    this.completePlanning = new ButtonElement(page, page.getByRole('button', { name: 'Complete planning' }));
  }

  /**
   * Fills out the ISG Planning form with the provided data.
   * Only sets fields present in the data object.
   * @param data Object with form values to set.
   */
  async set(data: any): Promise<void> {
    if (data.brokingSlipGenerationDate) await this.brokingSlipGenerationDate.set(data.brokingSlipGenerationDate);
    if (data.brokingSlipGenerationParticipants?.length) await this.brokingSlipGenerationParticipants.set(data.brokingSlipGenerationParticipants);

    if (data.enterQuoteDate) await this.enterQuoteDate.set(data.enterQuoteDate);
    if (data.enterQuoteParticipants?.length) await this.enterQuoteParticipants.set(data.enterQuoteParticipants);

    if (data.qcrGenerationDate) await this.qcrGenerationDate.set(data.qcrGenerationDate);
    if (data.qcrGenerationParticipants?.length) await this.qcrGenerationParticipants.set(data.qcrGenerationParticipants);

    if (data.meetingForFinalNegotiationDate) await this.meetingForFinalNegotiationDate.set(data.meetingForFinalNegotiationDate);
    if (data.meetingForFinalNegotiationParticipants?.length) await this.meetingForFinalNegotiationParticipants.set(data.meetingForFinalNegotiationParticipants);

    if (data.placementSlipGenerationDate) await this.placementSlipGenerationDate.set(data.placementSlipGenerationDate);
    if (data.placementSlipGenerationParticipants?.length) await this.placementSlipGenerationParticipants.set(data.placementSlipGenerationParticipants);

    if (data.premiumCalculationDate) await this.premiumCalculationDate.set(data.premiumCalculationDate);
    if (data.premiumCalculationParticipants?.length) await this.premiumCalculationParticipants.set(data.premiumCalculationParticipants);

    if (data.heldCoverNoteDate) await this.heldCoverNoteDate.set(data.heldCoverNoteDate);
    if (data.heldCoverNoteParticipants?.length) await this.heldCoverNoteParticipants.set(data.heldCoverNoteParticipants);

    if (data.policyHardCopyReceiptDate) await this.policyHardCopyReceiptDate.set(data.policyHardCopyReceiptDate);
    if (data.policyHardCopyReceiptParticipants?.length) await this.policyHardCopyReceiptParticipants.set(data.policyHardCopyReceiptParticipants);

    if (data.policyDocketDate) await this.policyDocketDate.set(data.policyDocketDate);
    if (data.policyDocketParticipants?.length) await this.policyDocketParticipants.set(data.policyDocketParticipants);

    if (data.handOverMeetDate) await this.handOverMeetDate.set(data.handOverMeetDate);
    if (data.handOverMeetParticipants?.length) await this.handOverMeetParticipants.set(data.handOverMeetParticipants);

    if (data.policyConfirmationDate) await this.policyConfirmationDate.set(data.policyConfirmationDate);
    if (data.policyConfirmationParticipants?.length) await this.policyConfirmationParticipants.set(data.policyConfirmationParticipants);

    if (data.completePlanning) await this.completePlanning.click();
  }

  /**
   * Reads and returns all ISG Planning form values as an object.
   * @returns Object with current form values.
   */
  async get(): Promise<any> {
    return {
      // selectAssignee: await this.selectAssignee.getValue(),
      brokingSlipGenerationDate: await this.brokingSlipGenerationDate.getValue(),
      brokingSlipGenerationParticipants: (await this.brokingSlipGenerationParticipants.get()) ?? [],

      enterQuoteDate: await this.enterQuoteDate.getValue(),
      enterQuoteParticipants: (await this.enterQuoteParticipants.get()) ?? [],

      qcrGenerationDate: await this.qcrGenerationDate.getValue(),
      qcrGenerationParticipants: (await this.qcrGenerationParticipants.get()) ?? [],

      meetingForFinalNegotiationDate: await this.meetingForFinalNegotiationDate.getValue(),
      meetingForFinalNegotiationParticipants:
        (await this.meetingForFinalNegotiationParticipants.get()) ?? [],

      placementSlipGenerationDate: await this.placementSlipGenerationDate.getValue(),
      placementSlipGenerationParticipants:
        (await this.placementSlipGenerationParticipants.get()) ?? [],

      premiumCalculationDate: await this.premiumCalculationDate.getValue(),
      premiumCalculationParticipants: (await this.premiumCalculationParticipants.get()) ?? [],

      heldCoverNoteDate: await this.heldCoverNoteDate.getValue(),
      heldCoverNoteParticipants: (await this.heldCoverNoteParticipants.get()) ?? [],

      policyHardCopyReceiptDate: await this.policyHardCopyReceiptDate.getValue(),
      policyHardCopyReceiptParticipants: (await this.policyHardCopyReceiptParticipants.get()) ?? [],

      policyDocketDate: await this.policyDocketDate.getValue(),
      policyDocketParticipants: (await this.policyDocketParticipants.get()) ?? [],

      handOverMeetDate: await this.handOverMeetDate.getValue(),
      handOverMeetParticipants: (await this.handOverMeetParticipants.get()) ?? [],

      policyConfirmationDate: await this.policyConfirmationDate.getValue(),
      policyConfirmationParticipants: (await this.policyConfirmationParticipants.get()) ?? [],
    };
  }

  /**
   * Sets the assignee for the planning and confirms the selection.
   * @param assigneeName Name of the assignee to select.
   */
  async setAssignee(assigneeName: string) {
    await this.page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
    await this.selectAssignee.set(assigneeName);
    await this.page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
    await this.sendSelectUser.click();
  }

  async getAssignee(): Promise<string[]> {
    const assignee = await this.selectAssignee.getValue();
    return [assignee];
  }

}
