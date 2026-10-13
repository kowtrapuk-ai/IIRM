import { Locator, Page } from "@playwright/test";
import { TextElement } from "../framework/text.element";
import { ButtonElement } from "../framework/button.element";
import { SelectElement } from "../framework/select.element";
import { RichTextElement } from "../framework/richtext.element";
import { TIMEOUTS } from "../env/timeouts";
import { BasePage } from "./Base.page";
import { SnackBar } from "../appcomponents/SnackBar.component";
import { TabList } from "../appcomponents/TabList.component";
import { MenuItem } from "../appcomponents/MenuItem.component";

/**
 * @class TemplateManagementPage
 * @description
 * Provides methods and locators to interact with Template Management UI elements
 * in the Admin Module. Handles template creation, validation, and management.
 */
export class TemplateManagementPage extends BasePage {
    readonly page: Page;
    readonly snackBar: SnackBar;
    readonly menuItem: MenuItem;

    // Page header elements
    readonly templateManagementTitle: Locator;
    readonly refreshIcon: Locator;

    // Tab elements
    readonly home: TabList;
    readonly pendingApprovals: TabList;

    // Filters and search
    readonly channelTypeFilter: SelectElement;
    readonly approvalStatusFilter: SelectElement;
    readonly templateStatusFilter: SelectElement;
    readonly searchBox: TextElement;
    readonly templateCard: Locator;
    readonly kebabMenu: Locator;

    // Template creation/editing elements
    readonly createTemplateText: Locator;
    readonly channelTypeSelect: SelectElement;
    readonly eventType: SelectElement;

    // Template Content elements
    readonly subjectField: TextElement;
    readonly contentEditor: RichTextElement;
    readonly contentEditorToolBar: Locator;

    readonly strikethrough: Locator
    readonly numberFormat: Locator;
    readonly bulletFormat: Locator;
    readonly linkElement: Locator;
    readonly removeTextFormat: Locator;

    // Available Parameters
    readonly availableParametersSection: Locator;
    readonly availableParameters: Locator;

    // Live Preview elements
    readonly livePreviewSection: Locator;
    readonly livePreviewContent: Locator;

    // Test Parameters section
    readonly testParametersSection: Locator;
    readonly testParameterInputs: Locator;

    readonly historyIcon: Locator;


    /**
     * @constructor
     * @param {Page} page - Playwright Page instance.
     */
    constructor(page: Page) {
        super(page);
        this.page = page;
        this.snackBar = new SnackBar(page);

        // Page header elements
        this.templateManagementTitle = page.locator('h1').filter({ hasText: 'Template Management' });
        this.refreshIcon = page.getByTestId("RefreshIcon");

        this.home = new TabList(page);
        this.pendingApprovals = new TabList(page);

        this.channelTypeFilter = new SelectElement(page, page.getByLabel('Channel Type'));
        this.approvalStatusFilter = new SelectElement(page, page.getByLabel("Approval Status"));
        this.templateStatusFilter = new SelectElement(page, page.getByLabel("Template Status"));
        this.searchBox = new TextElement(page, page.getByPlaceholder('Search by subject...'));

        // Selection Criteria elements in Template Creation
        this.channelTypeSelect = new SelectElement(page, page.getByRole('combobox', { name: 'Channel Type' }));
        this.eventType = new SelectElement(page, page.getByRole('combobox', { name: 'Event Type' }));

        // Template Content elements
        this.subjectField = new TextElement(page, page.getByTestId('common-text-field').locator('input'));
        this.contentEditor = new RichTextElement(page, page.locator('.ql-editor'));
        this.contentEditorToolBar = page.locator('.ql-contentEditorToolBar');

        // Available Parameters
        this.availableParametersSection = page.locator('h6').filter({ hasText: 'Available Parameters' });
        this.availableParameters = page.locator('[role="generic"]').filter({ hasText: /^{{.*}}$/ });

        // Live Preview elements
        this.livePreviewSection = page.locator('h6').filter({ hasText: 'Live Preview' });
        this.livePreviewContent = page.locator('[class*="preview"]').locator('div').nth(1);

        // Test Parameters section
        this.testParametersSection = page.locator('h6').filter({ hasText: 'Test Parameters' });
        this.testParameterInputs = page.locator('[class*="test-parameter"]').locator('input');

        // Template listing page elements
        this.templateCard = page.locator(".MuiCard-root");

        this.kebabMenu = page.getByTestId("MoreVertIcon");
        this.historyIcon = page.getByTestId("HistoryIcon");
    }

    /**
     * @function clickCreateTemplate
     * @description Clicks the Create Template button to navigate to template creation page
     * @returns {Promise<void>}
     */
    async clickCreateTemplate(): Promise<void> {
        await this.button("Create Template").click();
    }

    /**
     * @function createTemplate
     * @description Complete workflow to create a template
     * @param {object} templateData - Template configuration
     * @param {string} templateData.channelType - Channel type (optional, defaults to Email)
     * @param {string} templateData.eventType - Event type
     * @param {string} templateData.subject - Template subject
     * @param {string} templateData.content - Template content
     * @returns {Promise<void>}
     */
    async createTemplate(templateData: { channelType?: string; eventType: string; subject: string; content: string; }): Promise<void> {
        // Navigate to create template page
        await this.clickCreateTemplate();

        // Select channel type if provided
        if (templateData.channelType) {
            await this.selectChannelType(templateData.channelType);
        }

        await this.eventType.set(templateData.eventType);

        // Enter subject
        await this.enterSubject(templateData.subject);

        // Enter content
        await this.enterContent(templateData.content);
    }

    /**
     * @function searchTemplate
     * @description Searches for templates by subject text
     * @param {string} searchText - The text to search for
     * @returns {Promise<void>}
     */
    async searchTemplate(searchText: string): Promise<void> {
        await this.searchBox.set(searchText);
        await this.button("Apply").click();
        await this.waitForTemplates();
    }

    /**
     * 
     * @returns The count of the cards in Template Management
     */
    async getTemplateCardsCount(): Promise<number> {
        // Wait for cards to be attached (not necessarily visible - loader might overlay)
        await this.templateCard.first().waitFor({ state: "attached", timeout: TIMEOUTS.API_TIMEOUT });
        return await this.templateCard.count();
    }

    /**
     * @function waitForTemplates
     * @description Waits for template cards to load by waiting for either cards or no data message
     * @returns {Promise<void>}
     */
    async waitForTemplates(): Promise<void> {
        // Wait for template cards to appear (skip loader wait as it may persist)
        await this.templateCard.first().waitFor({ state: "visible", timeout: TIMEOUTS.PAGE_LOADING_TIMEOUT});
    }

    /**
     * @function applyFilters
     * @description Applies filters on the template listing page
     * @param {object} filters - Filter options
     * @param {string} filters.channelType - Channel type filter
     * @param {string} filters.approvalStatus - Approval status filter
     * @param {string} filters.templateStatus - Template status filter
     * @returns {Promise<void>}
     */
    async applyFilters(filters: { channelType?: string; approvalStatus?: string; templateStatus?: string; }): Promise<void> {
        // Try to wait for loader to hide, but continue if it doesn't
        const globalLoader = this.page.getByTestId("global-loader");
        await globalLoader.waitFor({ state: "hidden", timeout:TIMEOUTS.PAGE_LOADING_TIMEOUT }).catch(() => {
            // Loader still visible, will try to interact anyway
        });
        
        if (filters.channelType) {
            await this.channelTypeFilter.set(filters.channelType);
        }
        if (filters.approvalStatus) {
            await this.approvalStatusFilter.set(filters.approvalStatus);
        }
        if (filters.templateStatus) {
            await this.templateStatusFilter.set(filters.templateStatus);
        }
        
        await this.button("Apply").click();
        await this.waitForTemplates();
    }

    /**
     * @function resetFilters
     * @description Resets all filters to default values
     * @returns {Promise<void>}
     */
    async resetFilters(): Promise<void> {
        // Try to wait for loader to hide, but continue if it doesn't
        const globalLoader = this.page.getByTestId("global-loader");
        await globalLoader.waitFor({ state: "hidden", timeout: TIMEOUTS.PAGE_LOADING_TIMEOUT }).catch(() => {
            // Loader still visible, will try to interact anyway
        });
        
        await this.button("Reset").click();
        await this.waitForTemplates();
    }

    /**
    * @function selectChannelType
    * @description Selects a channel type from the dropdown
    * @param {string} channelType - The channel type to select (e.g., "Email", "SMS", "WhatsApp")
    * @returns {Promise<void>}
    */
    async selectChannelType(channelType: string): Promise<void> {
        await this.channelTypeSelect.set(channelType);
        await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
    }

    /**
     * 
     * @returns The no template data found message
     */
    async getNoTemplatesFoundMessage(): Promise<string> {
        const messageLocator = this.page.locator('.MuiBox-root.css-1fac6oe');
        await messageLocator.waitFor({ state: 'visible' });
        return await messageLocator.innerText();
    }

    /**
     * @function enterSubject
     * @description Enters the subject text for the template
     * @param {string} subject - The subject text
     * @returns {Promise<void>}
     */
    async enterSubject(subject: string): Promise<void> {
        await this.subjectField.set(subject);
    }

    /**
     * @function getSubject
     * @description Gets the current subject text
     * @returns {Promise<string>} The subject text
     */
    async getSubject(): Promise<string> {
        return await this.subjectField.getValue();
    }

    /**
     * @function enterContent
     * @description Enters content in the rich text editor
     * @param {string} content - The content to enter
     * @returns {Promise<void>}
     */
    async enterContent(content: string): Promise<void> {
        await this.contentEditor.click();
        await this.contentEditor.set(content);
    }

    /**
     * 
     * @param level The level from normal,Heading1,Heading2,Heading3 
     * clicks the selected level in the content Editor
     */
    async selectHeader(level: string) {
        await this.contentEditorToolBar.locator('.ql-header.ql-picker .ql-picker-label').click();

        if (level === 'normal') {
            await this.contentEditorToolBar.locator('.ql-picker-item:not([data-value])').click();
        } else {
            await this.contentEditorToolBar.locator(`.ql-picker-item[data-value="${level}"]`).click();
        }
    }

    /**
     * Apply any formatting by name
     * @param format - 'bold', 'italic', 'underline', 'strike', 'clean', 'ordered', 'bullet', 'link', 'h1', 'h2', 'h3', 'normal'
     * */
    async applyFormat(format: string) {
        switch (format) {
            case 'bold': case 'italic': case 'underline': case 'ordered': case 'bullet':
                await this.buttonByAlt(format).click();
                break;

            case 'link':
                await this.buttonByAlt('link').click();
            case 'strike': case 'clean':
                await this.contentEditorToolBar.getByRole('button', { name: format }).click();
                break;
            case 'h1': case 'h2': case 'h3': case 'normal':
                await this.selectHeader(format);
                break;
            default:
                throw new Error(`Format '${format}' not recognized`);
        }
    }

    /**
     * Helper method to get toolbar buttons by their alt text
     */
    private buttonByAlt(name: string) {
        return this.contentEditorToolBar.getByAltText(name);
    }

    /**
     * @function getContent
     * @description Gets the current content from the editor
     * @returns {Promise<string>} The content text
     */
    async getContent(): Promise<string> {
        return await this.contentEditor.getValue();
    }

    /**
     * @function getLivePreviewContent
     * @description Gets the content displayed in the Live Preview section
     * @returns {Promise<string>} The live preview content
     */
    async getLivePreviewContent(): Promise<string> {
        const livePreviewContainer = this.page.locator('h6').filter({ hasText: 'Live Preview' }).locator('..').locator('..');
        const content = await livePreviewContainer.locator('div').nth(2).textContent();
        return content?.trim() || '';
    }

    /**
     * @function getLivePreviewSubject
     * @description Gets the subject displayed in the Live Preview section
     * @returns {Promise<string>} The live preview subject
     */
    async getLivePreviewSubject(): Promise<string> {
        const livePreviewContainer = this.page.locator('h6').filter({ hasText: 'Live Preview' }).locator('..').locator('..');
        const subject = await livePreviewContainer.locator('h6').nth(1).textContent();
        return subject?.trim() || '';
    }

    /**
     * @function verifyContentMatchesPreview
     * @description Verifies that the written content matches the Live Preview
     * @returns {Promise<boolean>} True if content matches preview
     */
    async verifyContentMatchesPreview(): Promise<boolean> {
        const editorContent = await this.getContent();
        const previewContent = await this.getLivePreviewContent();
        // Normalize whitespace and newlines for comparison
        const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();
        return normalizeText(editorContent) === normalizeText(previewContent);
    }

    /**
     * @function getAvailableParameters
     * @description Gets all available parameters that can be used in the template
     * @returns {Promise<string[]>} Array of parameter names
     */
    async getAvailableParameters(): Promise<string[]> {
        const params = await this.availableParameters.allTextContents();
        return params.map(p => p.trim());
    }

    /**
     * Returns a ButtonElement instance for the specified button label.
     * 
     * @param label - The accessible name of the button
     * @returns ButtonElement instance
     * 
     * @example
     * const editButton = detailsCard.button("Edit");
     * await editButton.click();
     */
    button(label: string): ButtonElement {
        return new ButtonElement(this.page, this.page.getByRole("button", { name: label, exact: true }));
    }
}