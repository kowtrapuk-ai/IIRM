import { Page, Locator } from "@playwright/test";
import { BaseElement } from "./base.element";
import { TIMEOUTS } from "../env/timeouts";

/**
 * Represents a Multi-Select input component with optional error handling.
 * Extends BaseElement to include methods for selecting and deselecting multiple values.
 */
export class MultiSelectElement extends BaseElement {
    dropDownLocator: Locator;
    private errorLocator?: Locator;

    /**
     * Constructs a new MultiSelectElement.
     *
     * @param page - The Playwright Page object.
     * @param inputSelector - The selector or Locator for the multiselect input field.
     * @param errorSelector - (Optional) The selector or Locator for the associated error message.
     */
    constructor(page: Page, inputSelector: Locator | string, errorSelector?: Locator | string) {
        if (typeof inputSelector === 'string') {
            inputSelector = page.locator(inputSelector);
        }
        if (typeof errorSelector === 'string') {
            errorSelector = page.locator(errorSelector);
        }
        super(page, inputSelector);
        if (errorSelector) {
            this.errorLocator = errorSelector;
        }
    }

    /**
     * Retrieves the error message text associated with the multiselect field.
     *
     * @returns A promise resolving to the trimmed error message.
     * @throws If the errorLocator is not defined or the message is empty.
     */
    async getError(): Promise<string | null> {
        if (!this.errorLocator) {
            throw new Error("Error Locator is not defined");
        }
        // wait for the error msg to be visible
        await this.errorLocator.waitFor({ state: "visible" });
        // get the text content of the message
        const errorText: string | null = await this.errorLocator.textContent();
        if (errorText) {
            return errorText.trim();
        } else {
            throw new Error('Error message is empty');
        }
    }

    /**
     * Removes the specified values from the multiselect dropdown.
     *
     * @param values - An array of string values to deselect.
     */
    async remove(values: string[]) {
        let isVisible: Boolean;
        // get the dropdown locator
        await this.page.waitForLoadState('domcontentloaded');
        this.dropDownLocator = this.page.getByRole("listbox");
        // loop through each element and select in the dropdown
        for (let index = 0; index < values.length; index++) {
            isVisible = false;
            isVisible = await this.dropDownLocator.isVisible({ timeout: 1000 });
            if (!isVisible) {
                await this.element.click();
            }
            await this.page.locator(`li[role="option"]:has-text("${values[index]}")`).click();
        }
        // to deselect the dropdown if its still visible
        isVisible = await this.dropDownLocator.isVisible({ timeout: 1000 });
        if (isVisible) {
            await this.page.getByRole("presentation").click();
        }
    }

    /**
     * Removes all selected values from the multiselect field.
     */
    async removeAll() {
        // to remove all the selected items
        await this.page.waitForLoadState('domcontentloaded');
        await this.element.click();
        await this.page.getByTitle('Clear').click();
        // to deselect the dropdown if its still visible
        await this.element.click();
    }

    /**
     * Selects the specified values in the multiselect dropdown.
     *
     * @param values - An array of string values to select.
     */
    async set(values: string[]) {
        let isVisible: Boolean;
        // click on the element to open the dropdown
        await this.page.waitForLoadState('domcontentloaded');
        this.dropDownLocator = this.page.getByRole("listbox");
        // loop through each element and select in the dropdown
        for (let index = 0; index < values.length; index++) {
            isVisible = false;
            isVisible = await this.dropDownLocator.isVisible({ timeout: TIMEOUTS.API_TIMEOUT });
            if (!isVisible) {
                await this.element.click();
            }
            await this.page.locator(`li[role="option"]:has-text("${values[index]}")`).click();
        }
        // to deselect the dropdown if its still visible
        isVisible = await this.dropDownLocator.isVisible({ timeout: TIMEOUTS.API_TIMEOUT });
        if (isVisible) {
            await this.page.keyboard.press('Escape');
        }
    }
    /**
     * Returns selected values from:
     * - MUI Autocomplete (chips)
     * - MUI Select (multiple) display text
     * Preserves order and duplicates.
     * Example Usage:
     *  1.Used for adding additional partipants in BD Planning Stage.
     *  2.Used for Risk location Dropdown in Add SO page and Company Contact person in SO stages 
     */
    /**
 * Returns selected values from the multiselect component.
 * - Works for both chips (selected items) and select display.
 * - No input required, minimal reliance on class names.
 */
    async get(): Promise<string[]> {
        const root = this.element;

        // 1) Selected chips: buttons with a data-tag-index (MUI Autocomplete chips)
        // For BD Planning participants
        const chipButtons = root.locator('[role="button"][data-tag-index]');
        const chipCount = await chipButtons.count();
        if (chipCount > 0) {
            const out: string[] = [];
            for (let i = 0; i < chipCount; i++) {
                const btn = chipButtons.nth(i);
                // Prefer the 'title' attribute (it contains full text like "Ajay, Hyderabad")
                let text = (await btn.getAttribute('title'))?.trim() || '';
                (await btn.textContent())?.trim() || "";
                // Ignore overflow chip like "+1" which is a summary, not a value
                if (text && !/^\+\d+$/.test(text)) {
                    out.push(text);
                }
            }
            if (out.length) return out;
        }

        // 2) Combobox OR input combobox
        // For contact and signed By,risk Location,Ultimate descision makers in RO stages
        const combo = root.locator('div[role="combobox"], input[role="combobox"]');
        if (await combo.count()) {
            // read using evaluate for reliability
            const value = await combo.first().evaluate(el => {
                // input uses value, div uses textContent
                if (el.tagName === "INPUT") {
                    return (el as HTMLInputElement).value.trim();
                }
                return (el.textContent || "").trim();
            });
            if (value) return [value];
        }
        // Fallback
        // For ultimate decision maker field in RFP and planning stages
        const fallback = await combo.first().textContent();
        if (fallback?.trim()) return [fallback.trim()];

        return [];
    }
    // async get(testId: string): Promise<string[]> {
    //     const root = this.page.getByTestId(testId);

    //     // trim + dedupe (no Set to avoid TS2802)
    //     const uniq = (xs: string[]) => {
    //         const seen: { [k: string]: 1 } = {};
    //         const out: string[] = [];
    //         for (let i = 0; i < xs.length; i++) {
    //             const s = (xs[i] || "").trim();
    //             if (s && !seen[s]) { seen[s] = 1; out.push(s); }
    //         }
    //         return out;
    //     };

    //     // 1) Multi-select chips
    //     const chips = root.locator('.MuiAutocomplete-tag .MuiChip-label, .MuiChip-root .MuiChip-label');
    //     if (await chips.count()) {
    //         return uniq(await chips.allTextContents());
    //     }

    //     // 2) Combobox input (single/readonly)
    //     const combo = root.locator('.MuiAutocomplete-inputRoot input[role="combobox"]');
    //     if (await combo.count()) {
    //         // property value first
    //         let v = (await combo.first().inputValue()).trim();
    //         if (v) return [v];

    //         // 2a) nearest parent with title (only around THIS input)
    //         v = await combo.first().evaluate((el) => {
    //             let n: HTMLElement | null = el as HTMLElement;
    //             while (n && n !== document.body) {
    //                 const t = n.getAttribute('title');
    //                 if (t && !/^(Clear|Open)$/i.test(t)) return t.trim();
    //                 n = n.parentElement;
    //             }
    //             return "";
    //         });
    //         if (v) return uniq(v.split(/,\s*/));
    //     }

    //     // 3) MUI Select display text
    //     const sel = root.locator('.MuiSelect-select');
    //     if (await sel.count()) {
    //         const txt = (await sel.first().innerText()).trim();
    //         if (txt) return uniq(txt.split(/,\s*/));
    //     }

    //     return [];
    // }
}