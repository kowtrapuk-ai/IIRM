import { Page, Locator } from "@playwright/test";
import { BaseElement } from "./base.element";
import { TIMEOUTS } from "../env/timeouts";

/**
 * Represents a Select input component that can handle MUI listboxes, combo boxes, and multi-selects with checkboxes.
 * Extends BaseElement to provide additional utilities for value management and error handling.
 */
export class SelectElement extends BaseElement {
    /**
     * Constructs a new SelectElement.
     *
     * @param page - The Playwright Page object.
     * @param selector - The test ID or Locator of the select element.
     * @param parentLocator - (Optional) The parent locator if the element is nested.
     */
    constructor(page: Page, selector: string | Locator, parentLocator?: Locator) {
        if (typeof parentLocator !== "undefined") {
            super(page, parentLocator.getByTestId(`${selector}`).nth(0));
        } else {
            if(typeof selector === "string") {
                super(page, page.getByTestId(selector).nth(0));
            }
            else {
                super(page, selector);
            }
        }
    }

    /**
     * Clears the current value from the select element's input.
     */
    async clear() {
        await this.element.locator("input").clear();
    }

    /**
     * Retrieves all the visible options from a dropdown element as an array of strings.
     *
     * @returns A Promise that resolves to an array of strings representing all dropdown options.
     */
    async getAllValues(): Promise<string[]> {
        await this.element.click(); // Open the dropdown

        const options: Locator = this.page.locator('[role="option"]');
        const count: number = await options.count();

        const values: string[] = [];
        for (let index = 0; index < count; index++) {
            values.push((await options.nth(index).textContent())?.trim() ?? "");
        }

        return values;
    }

    /**
     * Retrieves the error text associated with the select element, if any.
     *
     * @returns A Promise that resolves to the error string or null.
     */
    async getError(): Promise<string | null> {
        return await this.element.locator('p').nth(1).textContent();
    }

    /**
     * Retrieves the current value from the select input.
     * Handles both native listbox and combo box inputs.
     *
     * @returns A Promise that resolves to the current value or null.
     */
    async getValue(): Promise<string | null> {
        const isListBox: boolean = await this.element.locator("input.MuiSelect-nativeInput").isVisible();
        const isComboBox: boolean = await this.element.locator("input.MuiInputBase-input").isVisible();

        if (isListBox || isComboBox) {
            const value = await this.element.locator("input").inputValue();
            return value?.trim() || null;
        } else {
            throw new Error("Unknown select type - neither ListBox nor ComboBox is detected.");
        }
    }

    /**
     * Checks if the select input is disabled based on its class.
     *
     * @returns A Promise that resolves to true if disabled, otherwise false.
     */
    async isdisabled(): Promise<boolean> {
        return (await this.element.locator("input").getAttribute("class")).includes("Mui-disabled");
    }

    /**
     * Sets the value of the select element.
     *
     * Overloaded:
     * - `set(value: string)`
     * - `set(searchString: string, value: string)`
     */
    async set(value: string): Promise<void>;
    async set(searchString: string, value?: string): Promise<void>;

    /**
     * Main set method implementation handling different select types:
     * - ListBox
     * - ComboBox
     * - MUI Select with Checkboxes
     *
     * @param searchStringOrValue - The value to search or select.
     * @param value - (Optional) Display value to select if search string is different.
     */
    async set(searchStringOrValue: string, value?: string): Promise<void> {
        await this.element.getByRole("progressbar").waitFor({state: "detached", timeout: TIMEOUTS.API_TIMEOUT});
        const isListBox: boolean = await this.element.locator("input.MuiSelect-nativeInput").isVisible();
        const isComboBox: boolean = await this.element.locator("input.MuiInputBase-input").isVisible();
        const isMUISelectWithCheckboxes =
            !isListBox &&
            !isComboBox &&
            (await this.element.getAttribute('role')) === 'combobox' &&
            (await this.element.getAttribute('aria-haspopup')) === 'listbox';

        if (isListBox) {
            if (value) {
                searchStringOrValue = value;
            }
            await this.element.click();
            await this.element.getByLabel(searchStringOrValue, { exact: true }).click();
        } else if (isComboBox) {
            if (await this.element.textContent() === value) {
                return;
            }
            if (typeof value === 'undefined') {
                value = searchStringOrValue;
            }
            await this.element.locator("input").clear();
            await this.element.type(searchStringOrValue);
            await this.element.getByRole("progressbar").waitFor({state: "detached", timeout: 5000});
            await this.page.getByRole('option', { name: value, exact: true }).click();
            await this.element.waitFor({ state: 'visible' });
        } else if (isMUISelectWithCheckboxes) {
            const valueToSelect = value ?? searchStringOrValue;

            await this.element.click();

            const dropdown = this.page.locator('ul[role="listbox"]');
            await dropdown.waitFor({ state: 'visible', timeout: 3000 });

            const optionLi = dropdown.locator(`li[role="option"]`, { hasText: valueToSelect });
            await optionLi.waitFor({ state: 'visible', timeout: 3000 });
            await optionLi.scrollIntoViewIfNeeded();
            await optionLi.click();
            const presentationLayer = this.page.getByRole("presentation");
            if (await dropdown.isVisible({ timeout: 1000 })) {
                await presentationLayer.click();
            }
        } else {
            throw new Error("Unknown select type - neither ListBox nor ComboBox nor MUISelectwithCheckbox is detected.");
        }
    }
}
