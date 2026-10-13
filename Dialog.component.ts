import { Locator, Page } from "@playwright/test";
import { ButtonElement } from "../framework/button.element";

export class Dialog {
    private page : Page;
    private dialog: Locator;
    private title: Locator;
    private message: Locator;
    readonly messageLocator:Locator;
    readonly closeIcon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dialog = page.getByTestId("modal-section-content").last();
        this.title = this.dialog.locator("p").first();
        this.closeIcon = this.dialog.getByAltText("close");
        this.message = this.dialog.locator(".css-mzzkn5");
        this.messageLocator = this.dialog.getByTestId('response-text'); 
    }

    /**
     * Gets handle on the button identified by its label
     * @param label - Refers to the text on the button
     * @returns ButtonElement
     */
    button(label: string): ButtonElement {
        return new ButtonElement(this.page, this.dialog.getByRole("button", {name: label}));
    }

    /**
     * Clicks on the close (x) icon on the top-right corner
     */
    async close(): Promise<void> {
        await this.closeIcon.click();
    }

    /**
     * Returns the contents of the dialog
     * @returns String
     */
    async getMessage(): Promise<string> {
        return (await this.message.textContent())?.trim() ?? "";
    }

    /**
     * Returns only the success message text, excluding button labels
     */
    async getSuccessMessage(): Promise<string> {
        return (await this.messageLocator.textContent())?.trim() ?? "";
    }

    
    /**
     * Returns the title of the dialog box
     * @returns String
     */
    async getTitle(): Promise<string> {
        return (await this.title.textContent())?.trim() ?? "";
    }

    /**
     * Gets the value corresponding to a label inside the dialog.
     * @param labelText - The visible label text in the dialog (e.g., "Current File Password")
     * @returns The value text of the label, or null if not found
    */
    async getValueByLabel(labelText: string): Promise<string | null> {
        const label = this.dialog.locator('p', { hasText: labelText }).first();
        const container = label.locator('..');
        const value = container.locator('p').nth(1);
        return (await value.textContent())?.trim() ?? null;
    }
}