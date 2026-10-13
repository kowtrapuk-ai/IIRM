import { Locator, Page } from "@playwright/test";
import { TIMEOUTS } from "../env/timeouts";

export class Accordion {
  readonly page: Page;
  readonly accordionRoot: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accordionRoot = page.getByTestId('Root-accordion');
  }

  private getAccordion(title: string): Locator {
    return this.accordionRoot.locator('button').filter({ has: this.page.getByTestId('Accordion-title').filter({ hasText: title }) });
  }


  // Method to open the Accordion
  async open(title: string): Promise<void> {
    const button = this.getAccordion(title);
    const isExpanded = await button.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await button.click();
      await this.page.waitForLoadState("domcontentloaded");
      await this.page.waitForLoadState("networkidle");
      await this.page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
    }
  }

  // Method to close the Accordion
  async close(title: string): Promise<void> {
    const button = this.getAccordion(title);
    const isExpanded = await button.getAttribute("aria-expanded");
    if (isExpanded === "true") {
      await button.click();
    }
  }

  /**
   * Returns all owner names from chips within the specified accordion.
   * @param accordionTitle The title of the accordion to search (e.g., "Meeting for Final Negotiation")
   */
  async getOwners(accordionTitle: string): Promise<string[]> {
    // Find the accordion by its title
    const accordion = this.page.locator('[data-testid="Root-Accordion"]').filter({
      has: this.page.locator(`[data-testid="Accordion-title"]`, { hasText: accordionTitle })
    }).first();
    // Find chips within this accordion only
    const chips = accordion.locator('[role="custom-chip"] p');
    const count = await chips.count();
    const owners: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await chips.nth(i).textContent())?.trim();
      if (text && text.length) owners.push(text);
    }
    return owners;
  }

  // Method to get the planned date
  async getPlanDate(title: string): Promise<string> {
    const button = this.getAccordion(title);
    const planDate = button.getByTestId("Accordion-date");
    const isPresent = await planDate.isVisible().catch(() => false);
    if (!isPresent) {
      return "";
    }
    const text = await planDate.textContent();
    return text?.trim() ?? "";
  }

}