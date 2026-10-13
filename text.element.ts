import { Page, Locator } from '@playwright/test';
import { BaseElement } from './base.element';

export class TextElement extends BaseElement {
    private errorLocator?: Locator;
    
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

    async set(value: string) {
        if(!await this.element.isDisabled()) {
            await this.element.waitFor({ state: 'visible' });
            await this.element.click();
            await this.element.fill(value);
        }
    }

    async enter(value: string) {
        await this.element.waitFor({ state: 'visible' });
        await this.element.fill(value);
        await this.element.press('Enter');
    }

    async clear() {
        await this.element.waitFor({ state: 'visible' });
        await this.element.clear();
    }

    async get_error(): Promise<string | null> {
        if (!this.errorLocator) {
            throw new Error('Error locator is not defined');
        }
        // Wait for the error message to be visible
        await this.errorLocator.waitFor({ state: 'visible' });
        // Get the text content of the error message
        const errorText:any = await this.errorLocator.textContent();
        if (errorText) {
            return errorText.trim();
        } else {
            throw new Error('Error message is empty');
        }
        return errorText.trim();
    }

    async getValue(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        return await this.element.inputValue();
    }
}
