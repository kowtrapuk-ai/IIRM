import { Page, Locator } from "@playwright/test";
import { BaseElement } from "./base.element";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toAccessibleNameRegex = (labelText: string) => {
    const escaped = escapeRegex(labelText).replace(/\s+/g, "\\s+");
    return new RegExp(`\\b${escaped}\\b\\s*(?:[:*])?(?:\\s*\\([^)]*\\))?`, "i");
};

export class DynamicSelectElement extends BaseElement {
    constructor(page: Page, inputLocator: Locator) {
        super(page, inputLocator);
    }

    /**
     * Clears the current value of the select element.
     * @description Focuses the element and clears any entered text or selected value.
     * @usage await dropdown.clear();
     */
    async clear(): Promise<void> {
        await this.element.click();
        await this.element.clear();
    }

    /**
     * Selects an option in the dropdown by visible text.
     * @param optionText - The exact option text to select.
     * @description Waits for the element, types the option text, and clicks the matching option from the list.
     * @usage await dropdown.set("Yes");
     */
    async set(value: string): Promise<void> {
        await this.element.waitFor({ state: "visible" });
        await this.element.click();
        // await this.element.locator("input").clear();
        await this.element.fill(value);
        await this.page.waitForTimeout(200);
        await this.page.getByRole('option', { name: value, exact: true }).click();
        await this.element.waitFor({ state: 'visible' });
    }

    /**
     * Gets the currently selected value from the dropdown.
     * @returns The selected value as a string, or null if empty.
     * @usage const value = await dropdown.get();
     */
    async get(): Promise<string | null> {
        // If we were given an input/select/textarea, read it directly.
        const tag = await this.element.evaluate(el => el.tagName.toLowerCase()).catch(() => "");
        if (tag === "input" || tag === "textarea" || tag === "select") {
            try {
                const v = await this.element.inputValue();
                return v?.trim() || null;
            } catch {
                const t = await this.element.textContent();
                return t?.trim() || null;
            }
        }

        // Otherwise we were given a container: look for a real input first.
        const input = this.element
            .locator('input.MuiInputBase-input, input.MuiAutocomplete-input, input.MuiSelect-nativeInput, input[role="combobox"], select')
            .first();

        if (await input.count()) {
            const v = await input.inputValue();
            return v?.trim() || null;
        }

        // MUI Select sometimes renders the selected value in a "display" node.
        const display = this.element
            .locator('[role="button"] .MuiSelect-select, .MuiSelect-select, [role="combobox"], button[role="combobox"]')
            .first();

        if (await display.count()) {
            const t = await display.textContent();
            return t?.trim() || null;
        }

        throw new Error("Unknown select type - neither ListBox nor ComboBox is detected.");
    }


    /**
    * Gets all available options from the dropdown.
    * @returns An array of option text values.
    * @description Opens the dropdown, collects all visible options, and returns them as a list of strings.
    * @usage const options = await dropdown.getAllValues();
    */
    async getAllValues(): Promise<string[]> {
        await this.element.click();

        const options: Locator = this.page.locator('[role="option"]');
        const count: number = await options.count();

        const values: string[] = [];
        for (let index = 0; index < count; index++) {
            values.push((await options.nth(index).textContent())?.trim() ?? "");
        }
        return values;
    }

    async isDisabled(): Promise<boolean> {
        return await this.element.isDisabled();
    }
}


