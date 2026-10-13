import { Locator, Page } from "@playwright/test";
import { SwitchElement } from "../framework/switch.element";
import { ButtonElement } from "../framework/button.element";
import { CheckBoxElement } from "../framework/checkbox.element";
import { TextElement } from "../framework/text.element";
import { ValueWithActionElement } from "../framework/valuewithaction.element";
import { HtmlSelectElement } from "../framework/htmlselect.element";
import { MinMaxWraper } from "../framework/minmaxwraper.element";
import { BasePage } from "./Base.page";
import { hasValue } from "../utils/jsonutils";

/**
 * Represents a single policy component row in the Policy Components table.
 * Each row includes configurable fields, switches, checkboxes, and buttons
 * for managing policy details like Sum Insured, Premium Calculation, and Company Contribution.
 */
class PolicyComponent {
    private page: Page;
    private root: Locator;

    readonly displayLabel: TextElement;
    readonly sumInsuredModel: SwitchElement;
    readonly multipleOf: TextElement;
    readonly minSI: TextElement;
    readonly maxSI: TextElement;
    readonly showCompanyContribution: CheckBoxElement;
    readonly premiumCalculation: SwitchElement;
    readonly remove: ButtonElement;
    readonly addSIAmountOrCTCMultiple: ButtonElement;

    /**
     * @param page Playwright Page instance.
     * @param index Index of the policy component row (0-based).
     */
    constructor(page: Page, root: Locator) {
        this.page = page;
        this.root = root;
        this.sumInsuredModel = new SwitchElement(page, this.root.locator(".MuiSwitch-input").locator("..").locator("..").locator("..", { hasText: "FlatMultiple" }))
        this.premiumCalculation = new SwitchElement(page, this.root.locator(".MuiSwitch-input").locator("..").locator("..").locator("..", { hasText: "Per FamilyPer Life" }));
        this.showCompanyContribution = new CheckBoxElement(page, this.root.locator("p", { hasText: "Show Company Contribution" }).locator("..").locator("input"));
        this.displayLabel = new TextElement(page, this.root.locator(".css-0", { hasText: "Display Label *" }).locator("input"), page.locator(".css-0", { hasText: "Display Label *" }).locator("p").nth(1));
        this.multipleOf = new TextElement(page, this.root.locator(".css-0", { hasText: "Multiple of..." }).locator("input"), this.root.locator(".css-0", { hasText: "Multiple of..." }).locator("p").nth(1));
        this.minSI = new TextElement(page, this.root.locator(".css-0", { hasText: "Min SI" }).locator("input"));
        this.maxSI = new TextElement(page, this.root.locator(".css-0", { hasText: "Max SI" }).locator("input"));
        this.remove = new ButtonElement(page, this.root.locator("td").nth(0).getByRole("button"));
        this.addSIAmountOrCTCMultiple = new ButtonElement(page, this.root.locator("td").nth(3).getByAltText("Add"))
    }

    /**
     * Gets the policy type for this row (e.g., "Base Policy", "Parental Policy").
     * @returns Policy type text or null if not found.
     */
    async getType(): Promise<string | null> {
        return await this.root.locator("td").nth(1).textContent();
    }

    /**
     * Gets a handle on "SI Amount" field at the given index.
     * @param index Index of the SI Amount field (0-based).
     * @returns Instance of ValueWithActionElement.
     */
    SIAmount(index: number): ValueWithActionElement {
        const label: string = "SI Amount *";
        return new ValueWithActionElement(this.page, this.root.locator(".css-0", { hasText: label }).nth(index));
    }

    /**
     * Gets a ValueWithActionElement for the "CTC Multiple" field.
     * If the "Multiple of..." field has a value, it dynamically changes the label.
     * @param index Index of the CTC Multiple field (0-based).
     * @returns Instance of ValueWithActionElement.
     */
    async CTCMultiple(index: number): Promise<ValueWithActionElement> {
        let label: string = "CTC Multiple *";
        if (await this.multipleOf.getValue()) {
            label = `${await this.multipleOf.getValue()} Multiple *`;
        }
        return new ValueWithActionElement(this.page, this.root.locator(".css-0", { hasText: label }).nth(index));
    }
}

/**
 * Represents a policy template component for interacting with policy configuration UI elements.
 * Provides methods to set and get values for specific rows and columns within the template.
 */
class PolicyTemplate {
    private root: Locator;
    private page: Page;

    constructor(page: Page, root: Locator) {
        this.root = root;
        this.page = page;
    }

    /**
     * Gets the sequence input element for a specific row identified by its label.
     * 
     * @param rowLabel - The exact text label that identifies the row
     * @returns A TextElement representing the sequence input field in the specified row
     */
    sequence(rowLabel: string): TextElement {
        const row: Locator = this.root.getByText(rowLabel, { exact: true }).locator("..").locator("..");
        return new TextElement(this.page, row.getByText("Seq").locator("..").locator("input"));
    }

    /**
     * Gets a switch element for the mid-year enrollment allowed setting in a policy configuration row.
     * 
     * @param rowLabel - The exact text label of the row containing the switch element
     * @returns A SwitchElement instance for toggling the mid-year enrollment setting
     */
    midYearEnrollmentAllowed(rowLabel: string): SwitchElement {
        const row: Locator = this.root.getByText(rowLabel, { exact: true }).locator("..").locator("..");
        return new SwitchElement(this.page, row.locator(".MuiSwitch-input").locator("..").locator("..").locator("..").first());
    }

    /**
     * Gets a switch element that controls whether the sum insured is visible to the employee for a given row.
     * 
     * @param rowLabel - The exact text label of the row to locate the switch element in
     * @returns A SwitchElement instance representing the visibility toggle for the specified row
     */
    sumInsuredVisibleToEmployee(rowLabel: string): SwitchElement {
        const row: Locator = this.root.getByText(rowLabel, { exact: true }).locator("..").locator("..");
        return new SwitchElement(this.page, row.locator(".MuiSwitch-input").locator("..").locator("..").locator("..").last());
    }

    /**
     * Retrieves the list of optional policy names from the page.
     *
     * @returns A promise that resolves to an array of optional policy names.
     */
    async getOptionalPolicies(): Promise<string[] | string> {
        let numberOfOptionalPolicies: number = await this.root.locator('[data-testid*="-addon-checkbox-"]').count();
        let optionalPolicies: string[] = [];
        for (let index: number = 0; index < numberOfOptionalPolicies; index++) {
            const optionalPolicy: string = (await this.root.locator(`[data-testid*="-addon-checkbox-${index}"]`).textContent()).replace(" (optional)", "");
            optionalPolicies.push(optionalPolicy);
        }
        if (optionalPolicies.length === 0) {
            return await this.root.getByText("Select Add-on Components").locator("xpath=following-sibling::*").textContent();
        }
        return optionalPolicies;
    }

    /**
     * Retrieves the selected optional policies from the policy configuration page.
     * 
     * @returns {Promise<string[] | string>} A promise that resolves to:
     * - An array of strings containing the names of selected optional policies (without "(optional)" suffix)
     * - A single string with the text content of the element following "Select Add-on Components" 
     *   if no optional policies are selected
     */
    async getSelectedOptionalPolicies(): Promise<string[] | string> {
        let numberOfOptionalPolicies: number = await this.root.locator('[data-testid*="-addon-checkbox-"]').count();
        let optionalPolicies: string[] = [];
        for (let index: number = 0; index < numberOfOptionalPolicies; index++) {
            const optionalPolicy: CheckBoxElement = new CheckBoxElement(this.page, this.root.locator(`[data-testid*="-addon-checkbox-${index}"]`));
            if (await optionalPolicy.isChecked()) {
                const cleanedText: string = (await this.root.locator(`[data-testid*="-addon-checkbox-${index}"]`).textContent()).replace(" (optional)", "");
                optionalPolicies.push(cleanedText);
            }
        }
        if (optionalPolicies.length === 0) {
            return await this.root.getByText("Select Add-on Components").locator("xpath=following-sibling::*").textContent();
        }
        return optionalPolicies;
    }

    /**
     * Returns a CheckBoxElement for an optional policy addon.
     * 
     * @param labelOrIndex - Either the text label of the policy addon or its zero-based index position
     * @returns A CheckBoxElement instance for the specified optional policy
     */
    optionalPolicy(labelOrIndex: string | number): CheckBoxElement {
        if (typeof labelOrIndex === "string") {
            return new CheckBoxElement(this.page, this.root.locator(`[data-testid*="-addon-checkbox-"]`, { hasText: labelOrIndex }));
        }
        return new CheckBoxElement(this.page, this.root.locator(`[data-testid*="-addon-checkbox-"]`).nth(labelOrIndex));
    }
}

/**
 * PolicyRelationship Component
 * 
 * This component provides helper methods to interact with the "Policy Relationship" 
 * configuration table (Self, Spouse/Partner, Children, Parents, Siblings, etc.).
 * 
 * It allows test writers to:
 * - Select/unselect relationship checkboxes (e.g., Self, Spouse, Children)
 * - Set and get maximum number of dependents allowed for a relationship
 * - Set and get Min/Max Age values for permitted relations (e.g., Husband, Wife)
 * - Reset/unset specific relationships
 */
class PolicyRelationship {
    readonly relationshipType: CheckBoxElement;
    readonly maxNo: TextElement;
    private permittedRelationsSection: Locator;
    constructor(private readonly page: Page, private readonly root: Locator) {
        this.relationshipType = new CheckBoxElement(page, root.locator("td").nth(0).locator("input"));
        this.maxNo = new TextElement(page, root.locator("td").nth(1).locator("input"));
        this.permittedRelationsSection = root.locator("td").nth(2);
    }

    /**
     * Gets a MinMaxWrapper for a specific relationship in the permitted relations section.
     * 
     * @param labelOrIndex - Either the text label of the relationship or its numeric index in the list
     * @returns A MinMaxWrapper instance for interacting with the relationship's min/max controls
     */
    permittedRelation(labelOrIndex: string | number): MinMaxWraper {
        if (typeof labelOrIndex === "string") {
            return new MinMaxWraper(this.page, this.permittedRelationsSection.getByText(labelOrIndex, { exact: true }).locator("..").locator(".."));
        }
        return new MinMaxWraper(this.page, this.permittedRelationsSection.locator('[data-testid^="permitted-relations-checkbox-"]').nth(labelOrIndex).locator(".."));
    }

    /**
     * Retrieves the list of permitted relationships for a given relationship type.
     * If the checkbox for a relationship is checked, its corresponding text is added to the array.
     * Additionally, extracts text for all checkboxes except the first one.
     *
     * @param relationshipType - The label of the relationship type (e.g., "Children").
     * @returns A promise that resolves to an array of permitted relationships.
     */
    async getPermittedRelations(): Promise<string[]> {
        const permittedRelationships: string[] = [];

        const checkboxes = this.permittedRelationsSection.locator('input[type="checkbox"]');
        const count = await checkboxes.count();

        for (let index = 0; index < count; index++) {
            const checkbox = checkboxes.nth(index);
            if (await checkbox.isChecked()) {
                const label = await checkbox.locator("..").locator("..").textContent();
                permittedRelationships.push(label.trim());
            }
        }

        return permittedRelationships;
    }
}

/**
 * Represents the policy parameter section within the Policy Configuration page.
 * Provides access to UI elements and actions for adding, selecting, and manipulating policy parameters.
 *
 * @remarks
 * This class is designed for use with Playwright-based automation and wraps page elements
 * such as buttons, selects, and text fields, enabling interaction with policy parameter rows.
 *
 * @param page - The Playwright Page object.
 * @param root - The root Locator for the policy parameter section.
 *
 * @property add - Button to add a new policy parameter.
 * @property parameter - Select element for choosing a policy parameter type.
 * @method field - Returns an object representing a row of policy parameter fields and actions.
 */
class PolicyParameter {
    private root: Locator;
    private page: Page;

    readonly displayName: TextElement;
    readonly remove: ButtonElement;
    readonly addRangeSet: ButtonElement;
    readonly addRelationGroup: ButtonElement;
    readonly addOption: ButtonElement;

    constructor(page: Page, root: Locator) {
        this.page = page;
        this.root = root;
        this.displayName = new TextElement(this.page, root.getByTestId("undefined-container").locator("input"), root.getByTestId("undefined-container").locator("p").nth(1));
        this.remove = new ButtonElement(this.page, root.getByRole("button").nth(0));
        this.addRangeSet = new ButtonElement(this.page, root.getByRole("button", { name: "Add Range Set" }));
        this.addRelationGroup = new ButtonElement(this.page, root.getByRole("button", { name: "Add Relation Group" }));
        this.addOption = new ButtonElement(this.page, root.getByRole("button", { name: "Add Option" }));
    }

    /**
     * Returns a RangeSet instance for the specified range at the given index.
     * 
     * @param index - The zero-based index of the range element to retrieve
     * @returns A new RangeSet instance configured with the page and the located range element
     */
    rangeSet(index: number): RangeSet {
        return new RangeSet(this.page, this.root.getByText("Range Display Name *", { exact: true }).nth(index).locator("..").locator(".."));
    }

    /**
     * Retrieves an Option instance at the specified index from the policy configuration stack.
     * 
     * @param index - The zero-based index of the option element within the container
     * @returns A new Option instance initialized with the page context and the located element at the given index
     */
    option(index: number): Option {
        return new Option(this.page, this.root.locator(".MuiStack-root").nth(index));
    }

    /**
     * Gets a RelationshipGroup instance for a specific relationship group by its index.
     * 
     * @param index - The zero-based index of the relationship group.
     * @returns A new RelationshipGroup instance initialized with the page and the parent locator of the selected MuiStack-root element
     */
    relationshipGroup(index: number): RelationshipGroup {
        return new RelationshipGroup(this.page, this.root.locator(".MuiStack-root").nth(index).locator(".."));
    }
}

/**
 * Represents a range set component in the Policy Configure page.
 * This class encapsulates the elements and interactions for managing a single range configuration,
 * including display name, minimum and maximum values, and removal functionality.
 * 
 * @class RangeSet
 * @property {TextElement} rangeDisplayName - The text element for the range's display name input field and its validation message
 * @property {TextElement} min - The text element for the minimum value input field and its validation message
 * @property {TextElement} max - The text element for the maximum value input field and its validation message
 * @property {ButtonElement} remove - The button element for removing this range set from the configuration
 * 
 * @param {Page} page - The Playwright page object used for interacting with the browser
 * @param {Locator} root - The root locator that defines the scope of this range set component
 */
class RangeSet {
    readonly rangeDisplayName: TextElement;
    readonly min: TextElement;
    readonly max: TextElement;
    readonly remove: ButtonElement;

    constructor(private readonly page: Page, private readonly root: Locator) {
        this.rangeDisplayName = new TextElement(this.page, root.getByText("Range Display Name *", { exact: true }).locator("..").locator("input"), root.getByText("Range Display Name *", { exact: true }).locator("..").locator("p").last());
        this.min = new TextElement(page, root.getByText("Min *", { exact: true }).locator("..").locator("input"), root.getByText("Min *", { exact: true }).locator("..").locator("p").nth(1));
        this.max = new TextElement(page, root.getByText("Max *", { exact: true }).locator("..").locator("input"), root.getByText("Max *", { exact: true }).locator("..").locator("p").nth(1));
        this.remove = new ButtonElement(page, root.getByRole("button"));
    }
}

/**
 * Represents an option component within the policy configuration page.
 * 
 * This class encapsulates the UI elements for managing individual options,
 * including default values, added values, and removal functionality.
 * 
 * @class Option
 * 
 * @property {TextElement} defaultValue - Text element for the default value input field and its validation message
 * @property {TextElement} addedValue - Text element for the added value input field and its validation message
 * @property {ButtonElement} remove - Button element for removing the option
 * 
 * @param {Page} page - The Playwright page instance
 * @param {Locator} root - The root locator for this option component
 */
class Option {
    readonly defaultValue: TextElement;
    readonly addedValue: TextElement;
    readonly remove: ButtonElement;

    constructor(private readonly page: Page, private readonly root: Locator) {
        this.defaultValue = new TextElement(page, root.getByText("Default Value *", { exact: true }).locator("..").locator("input"), root.getByText("Default Value *", { exact: true }).locator("p").nth(1));
        this.addedValue = new TextElement(page, root.getByText("Added Value *", { exact: true }).locator("..").locator("input"), root.getByText("Added Value *", { exact: true }).locator("p").nth(1));
        this.remove = new ButtonElement(page, root.getByRole("button"));
    }
}

/**
 * Represents a relationship group configuration in the policy configuration page.
 * 
 * This class encapsulates the UI elements and operations for managing a relationship group,
 * including group name, family max total, relationship type selections, and max count values.
 * It provides methods to interact with checkboxes for relationship types, input fields for
 * max counts, and retrieve information about selected and available relationship types.
 * 
 * @class RelationshipGroup
 * 
 * @property {TextElement} groupName - The input element for the relationship group name
 * @property {TextElement} familyMaxTotal - The input element for the family maximum total
 * @property {ButtonElement} remove - The button element to remove this relationship group
 */
class RelationshipGroup {
    readonly groupName: TextElement;
    readonly familyMaxTotal: TextElement;
    readonly remove: ButtonElement;

    constructor(private readonly page: Page, private readonly root: Locator) {
        this.groupName = new TextElement(this.page, root.getByText("Group Name *").locator("..").locator("input"), root.getByText("Group Name *").locator("..").locator("p").last());
        this.familyMaxTotal = new TextElement(this.page, root.getByText("Total", { exact: true }).locator("..").locator("input"), root.getByText("Total", { exact: true }).locator("..").locator("p").last());
        this.remove = new ButtonElement(page, root.getByRole("button"));
    }

    /**
     * Locates and returns a checkbox element associated with the given label text.
     * 
     * @param label - The text label associated with the checkbox element to locate
     * @returns A CheckBoxElement instance wrapping the located checkbox input element
     */
    checkBox(label: string): CheckBoxElement {
        return new CheckBoxElement(this.page, this.root.getByText(label).locator("..").locator("..").locator("input"));
    }

    /**
     * Gets the text input element for the "Max Count" field associated with a specific label.
     * 
     * @param label - The label text to identify the specific Max Count input field
     * @returns A TextElement representing the Max Count input field for the specified label
     */
    maxCount(label: string): TextElement {
        return new TextElement(this.page, this.root.getByText("Max Count").locator("..").locator("..", { hasText: label }).locator('input[type="text"]'));
    }

    /**
     * Retrieves all relationship types from the page.
     * 
     * @returns A promise that resolves to an array of strings containing all relationship type names found on the page.
     */
    async getAllRelationshipTypes(): Promise<string[]> {
        const numberofRelationshipTypes: number = await this.root.locator('input[type="checkbox"]').count();
        const allRelationshipTypes: string[] = [];
        for (let relationshipIndex: number = 0; relationshipIndex < numberofRelationshipTypes; relationshipIndex++) {
            const relationshipType: string = await this.root.locator('input[type="checkbox"]').locator("..").locator("..").nth(relationshipIndex).textContent();
            allRelationshipTypes.push(relationshipType);
        }
        return allRelationshipTypes;
    }

    /**
     * Retrieves all selected relationship types from the page.
     * 
     * @returns A promise that resolves to an array of strings containing the names
     * of all selected relationship types. Returns an empty array if no checkboxes are checked.
     * 
     */
    async getSelectedRelationshipTypes(): Promise<string[]> {
        const numberofRelationshipTypes: number = await this.root.locator('input[type="checkbox"]').count();
        const allSelectedRelationshipTypes: string[] = [];
        for (let relationshipIndex: number = 0; relationshipIndex < numberofRelationshipTypes; relationshipIndex++) {
            const relationshipType: string = await this.root.locator('input[type="checkbox"]').locator("..").locator("..").nth(relationshipIndex).textContent();
            if (await new CheckBoxElement(this.page, this.root.locator('input[type="checkbox"]').nth(relationshipIndex)).isChecked()) {
                allSelectedRelationshipTypes.push(relationshipType);
            }
        }
        return allSelectedRelationshipTypes;
    }
}

/**
 * Represents a policy choice configuration section within a page, providing methods to interact with
 * and retrieve information about available policy options, their attributes, and associated controls.
 *
 * This class encapsulates locators and UI elements such as buttons, radio buttons, checkboxes, and text inputs
 * for policy configuration, allowing automated interaction and data extraction for testing or automation purposes.
 *
 * @remarks
 * - The class is designed to work with Playwright's `Page` and `Locator` objects.
 * - It provides utility methods to access and manipulate policy choice elements, including setting choices,
 *   retrieving policy names, sum insured amounts, and managing company/employee contributions.
 */
class PolicyChoice {
    private page: Page;
    private root: Locator;
    readonly setChoices: ButtonElement;

    constructor(page: Page, root: Locator) {
        this.page = page;
        this.root = root;
        this.setChoices = new ButtonElement(this.page, root.getByRole("button", { name: "Set Choices", exact: true }));
    }

    /**
     * Retrieves the text content of the first `<td>` element within the root locator.
     *
     * @returns {Promise<string>} A promise that resolves to the text content of the first table cell.
     */
    async getPolicyOption(): Promise<string> {
        const policyOption: string = await this.root.locator("td").first().textContent();
        return policyOption;
    }

    /**
     * Selects an available policy choice by clicking on a button with the specified label.
     * 
     * @param label - The label text of the policy choice button to select
     * @returns A promise that resolves when the button has been clicked
     * @throws May throw an error if the button with the specified label is not found or not clickable
     * 
     * @example
     * ```typescript
     * await policyConfigurePage.selectAvailablePolicyChoice("Auto Policy");
     * ```
     */
    async selectAvailablePolicyChoice(label: string): Promise<void> {
        await this.root.getByRole("button", { name: label }).click();
    }

    /**
     * Retrieves the policy name from the page by locating the last table cell (`td`)
     * and extracting the text content of the heading element (level 6).
     * The returned string has the "Configure: " prefix removed.
     *
     * @returns {Promise<string>} The extracted policy name without the "Configure: " prefix.
     */
    async getPolicyName(): Promise<string> {
        const policyName: string = await this.root.locator("td").last().getByRole("heading", { level: 6 }).textContent();
        return policyName.replace("Configure: ", "");
    }

    /**
     * Creates a new instance of ConfigureSelectedPolicyChoice for a specific policy at the given index.
     * 
     * @param index - The zero-based index of the policy to configure, corresponding to the nth occurrence of "Employee Contribution" text
     * @returns A new ConfigureSelectedPolicyChoice instance initialized with the page and a locator pointing to the policy's container element
     */
    configureSelectedPolicyChoice(index: number): ConfigureSelectedPolicyChoice {
        return new ConfigureSelectedPolicyChoice(this.page, this.root.locator("td").nth(2).getByText("Employee Contribution").nth(index).locator("..").locator(".."));
    }

    /**
     * Retrieves all available policy choices from the page.
     *
     * This method locates all button elements within the second column (`td:nth(1)`)
     * of the root element and extracts their text content. The text content of each
     * button is collected into an array of strings, which is returned.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array containing the text of all available policy choices.
     */
    async getAllAvailablePolicyChoices(): Promise<string[]> {
        let allAvailablePolicyChoices: string[] = [];
        const numberOfAvailablePolicyChoices: number = await this.root.locator("td").nth(1).getByRole("button").count();
        for (let index: number = 0; index < numberOfAvailablePolicyChoices; index++) {
            const availablePolicyChoice: string = await this.root.locator("td").nth(1).getByRole("button").nth(index).textContent();
            allAvailablePolicyChoices.push(availablePolicyChoice);
        }

        return allAvailablePolicyChoices;
    }

    /**
     * Retrieves the text content of the third column (index 2) in the selected policy row.
     * 
     * @returns {Promise<string>} A promise that resolves to the text content of the policy choice cell.
     * @throws {Error} May throw if the element is not found or if textContent() returns null.
     */
    async getConfigureSelectedPolicyChoiceText(): Promise<string> {
        return await this.root.locator("td").nth(2).textContent();
    }

    /**
     * Retrieves the text content of the currently selected policy choice.
     * 
     * @returns A promise that resolves to the text content of the selected policy choice element
     * @throws May throw if the element with alt text "selected" is not found or if navigation fails
     */
    async getCurrentPolicyChoice(): Promise<string> {
        return await this.root.getByAltText("selected", { exact: true }).locator("..").locator("..").textContent();
    }

    /**
     * Retrieves the text contents of all completed policy choices.
     * 
     * @returns A promise that resolves to an array of strings containing the text contents
     * of all policy elements marked as "configured".
     */
    async getCompletedPolicyChoices(): Promise<string[]> {
        return await this.root.getByAltText("configured", { exact: true }).locator("..").locator("..").allTextContents();
    }

    /**
     * Retrieves a list of text contents for all incomplete policy choices.
     * 
     * @returns A promise that resolves to an array of strings containing the text contents
     * of all incomplete policy choice elements.
     */
    async getIncompletedPolicyChoices(): Promise<string[]> {
        return await this.root.getByAltText("not selected", { exact: true }).locator("..").locator("..").allTextContents();
    }

    /**
     * Checks if the policy configure element is visible on the page.
     * 
     * @returns A Promise that resolves to true if the element is visible, false otherwise.
     */
    async isVisible(): Promise<boolean> {
        return this.root.isVisible();
    }
}

/**
 * Represents the configuration options for a selected policy choice in the policy configuration page.
 * 
 * This class provides access to various configuration elements including availability status,
 * default selection, contribution amounts, and sum insured information for a specific policy choice.
 * 
 * @class ConfigureSelectedPolicyChoice
 * 
 * @property {CheckBoxElement} available - Checkbox element to mark the policy choice as available
 * @property {CheckBoxElement} default - Checkbox element to set the policy choice as default
 * @property {TextElement} companyContribution - Text input element for company contribution amount
 * @property {TextElement} employeeContribution - Text input element for employee contribution amount
 */
class ConfigureSelectedPolicyChoice {
    readonly available: CheckBoxElement;
    readonly default: CheckBoxElement;
    readonly companyContribution: TextElement;
    readonly employeeContribution: TextElement;

    constructor(private readonly page: Page, private readonly root: Locator) {
        this.available = new CheckBoxElement(page, root.getByText("Available", { exact: true }).locator("..").locator("..").locator("input"));
        this.default = new CheckBoxElement(page, root.getByText("Default", { exact: true }).locator("..").locator("..").locator("input"));
        this.companyContribution = new TextElement(page, root.getByText("Company Contribution").locator("..").locator("input"), root.getByText("Company Contribution").locator("..").locator("p").nth(1));
        this.employeeContribution = new TextElement(page, root.getByText("Employee Contribution").locator("..").locator("input"), root.getByText("Employee Contribution").locator("..").locator("p").nth(1));
    }

    /**
     * Retrieves the Sum Insured (SI) amount from the page.
     * 
     * @returns A promise that resolves to the SI amount as a string with the "SI: " prefix removed.
     */
    async getSiAmount(): Promise<string> {
        const siAmount: string = await this.root.locator("p").nth(0).textContent();
        return siAmount.replace("SI: ", "");
    }
}

/**
 * Represents a generic constraint or setting component in a UI, typically structured as a label and an input value in a table row.
 * * It is designed to handle different types of input elements in the value section:
 * 1. A **Switch** (e.g., "Is SEZ based Tax discount applicable?")
 * 2. A **Textarea** (e.g., "Custom disclaimer text...")
 * 3. A standard **Text Input** (e.g., "Number of payroll installments...")
 * * @example
 * // Assuming 'rowLocator' is the locator for the <tr> element containing the label and value sections
 * const constraint = new ConstraintsComponent(page, rowLocator);
 * const label = await constraint.getLabel(); // e.g., "Number of payroll installments for premium deduction"
 * await constraint.set("5"); // Sets the value for the input field
 * const type = await constraint.getType(); // e.g., "TextElement"
 */
class ConstraintsComponent {
    private labelSection: Locator;
    private valueSection: Locator;

    /**
     * Creates an instance of ConstraintsComponent.
     * @param page - The Playwright Page object.
     * @param root - The root Locator for the component, expected to be the container element (e.g., a <tr> element) which holds both label and value sections as children (e.g., <td> elements).
     */
    constructor(private readonly page: Page, private readonly root: Locator) {
        // Assumes the label is in the first <td> and the value in the second <td>
        this.labelSection = root.locator("td").nth(0);
        this.valueSection = root.locator("td").nth(1);
    }

    /**
     * Gets the text content of the constraint's label.
     * @returns A promise that resolves to the label text (string).
     */
    async getLabel(): Promise<string> {
        return await this.labelSection.textContent();
    }

    /**
     * Gets the current value of the constraint, regardless of the input element type.
     * * - For a **Switch**, it calls `get()` on the `SwitchElement`.
     * - For a **Textarea** or standard **Text Input**, it calls `getValue()` on the `TextElement`.
     * @returns A promise that resolves to the input's current value (string).
     */
    async getValue(): Promise<string> {
        let valueElement: SwitchElement | TextElement;
        if (await this.valueSection.locator(".MuiSwitch-root").nth(0).isVisible()) {
            valueElement = new SwitchElement(this.page, this.valueSection.locator(".MuiSwitch-root").nth(0).locator(".."));
            return await valueElement.get();
        }
        else if (await this.valueSection.locator("textarea").nth(0).isVisible()) {
            valueElement = new TextElement(this.page, this.valueSection.locator("textarea").nth(0));
            return await valueElement.getValue();
        }
        // Falls back to standard input for TextElement
        valueElement = new TextElement(this.page, this.valueSection.locator("input"));
        return await valueElement.getValue();
    }

    /**
     * Sets the value of the constraint, adapting to the input element type.
     * * - For a **Switch**, it expects a value like 'Yes' or 'No' and calls `set(value)`.
     * - For a **Textarea** or standard **Text Input**, it types the value and calls `set(value)`.
     * @param value - The desired value to set (string).
     * @returns A promise that resolves when the value is set.
     */
    async set(value: string): Promise<void> {
        let valueElement: SwitchElement | TextElement;
        if (await this.valueSection.locator(".MuiSwitch-root").nth(0).isVisible()) {
            valueElement = new SwitchElement(this.page, this.valueSection.locator(".MuiSwitch-root").nth(0).locator(".."));
            await valueElement.set(value);
        }
        else if (await this.valueSection.locator("textarea").nth(0).isVisible()) {
            valueElement = new TextElement(this.page, this.valueSection.locator("textarea").nth(0));
            await valueElement.set(value);
        }
        else { // Falls back to standard input
            valueElement = new TextElement(this.page, this.valueSection.locator("input"));
            await valueElement.set(value);
        }
    }

    /**
     * Determines and returns the type of the underlying input element.
     * @returns A promise that resolves to a string indicating the element type:
     * - "SwitchElement"
     * - "TextAreaElement"
     * - "TextElement"
     * - "Unknown element found"
     */
    async getType(): Promise<string> {
        if (await this.valueSection.locator(".MuiSwitch-root").nth(0).isVisible()) {
            return "SwitchElement";
        }
        else if (await this.valueSection.locator("textarea").nth(0).isVisible()) {
            return "TextAreaElement"
        }
        // Using a more specific selector might be better, but 'input' is sufficient based on the logic in set/get
        else if (await this.valueSection.locator('input').isVisible()) {
            // Note: Original code checked for 'input[type="text"]', which is a safe check if all other inputs are covered.
            return "TextElement"
        }
        return "Unknown Type found"
    }

    /**
     * Checks if the element is visible in the viewport.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is visible, `false` otherwise.
     */
    async isVisible(): Promise<boolean> {
        return await this.root.isVisible();
    }
}

/**
 * Page object model for the "Policy Configure Page"
 * Provides methods and locators to interact with Info Card, Policy Components table,
 * and navigation controls.
 */
export class PolicyConfigurePage {
    private page: Page;
    // readonly infoCard: InfoCard;
    readonly addParentalPolicy: ButtonElement;
    readonly addOptionalComponent: ButtonElement;
    readonly save: ButtonElement;
    readonly saveAndExit: ButtonElement;
    readonly next: ButtonElement;
    readonly previous: ButtonElement;
    readonly parameter: HtmlSelectElement;
    readonly add: ButtonElement;

    readonly basePolicyTemplate: PolicyTemplate;
    readonly parentalPolicyTemplate: PolicyTemplate;

    constructor(page: Page) {
        // super(page);
        this.page = page;
        // this.infoCard = new InfoCard(page, page.locator(".css-pae5qe"))
        this.addParentalPolicy = new ButtonElement(page, page.getByRole("button", { name: "Add Parental Policy" }));
        this.addOptionalComponent = new ButtonElement(page, page.getByRole("button", { name: "Add Optional Component" }));
        this.save = new ButtonElement(page, page.getByRole("button", { name: "Save" }));
        this.saveAndExit = new ButtonElement(page, page.getByRole("button", { name: "Save & Exit" }));
        this.next = new ButtonElement(page, page.getByRole("button", { name: "Next" }));
        this.previous = new ButtonElement(page, page.getByRole("button", { name: "Previous" }));
        this.parameter = new HtmlSelectElement(page, "policy-parameters-select");
        this.add = new ButtonElement(page, page.getByRole("button", { name: "Add", exact: true }));

        this.basePolicyTemplate = new PolicyTemplate(page, page.getByTestId("policy-configurator-content-policyChoiceTemplate").locator(".css-1qulnur"));
        this.parentalPolicyTemplate = new PolicyTemplate(page, page.getByTestId("policy-configurator-content-policyChoiceTemplate").locator(".css-13yznht"));
    }

    /**
     * Gets the policy component row at the given index.
     * @param index Index of the row (0-based).
     * @returns PolicyComponent instance for interacting with that row.
     */
    policyComponents(index: number) {
        return new PolicyComponent(this.page, this.page.locator("tbody").locator("tr").nth(index));
    }

    /**
     * Retrieves the total count of policy components displayed in the table body.
     * 
     * @returns {Promise<number>} A promise that resolves to the number of table rows (policy components) found in the tbody element.
     */
    async getNumberOfPolicyComponents(): Promise<number> {
        return await this.page.locator("tbody").locator("tr").count();
    }

    /**
     * Gets a PolicyRelationship instance for a specific relationship row.
     * 
     * @param labelOrIndex - Either the text label of the relationship to find, or the zero-based index of the relationship row
     * @returns A PolicyRelationship instance that can be used to interact with the specified relationship row
     */
    policyRelationships(labelOrIndex: string | number): PolicyRelationship {
        if (typeof labelOrIndex === "string") {
            return new PolicyRelationship(this.page, this.page.locator('[data-testid^="relation-checkbox-"]', { hasText: labelOrIndex }).locator("..").locator(".."));
        }
        return new PolicyRelationship(this.page, this.page.locator("tr").nth(labelOrIndex + 1));
    }

    /**
     * Returns a PolicyParameter instance for the specified policy parameter.
     * 
     * @param labelOrIndex - The label (string) of the policy parameter to find by its input value attribute,
     *                       or the zero-based index (number) of the policy parameter row.
     * @returns A PolicyParameter instance wrapping the matching table row element.
     */
    policyParameters(labelOrIndex: string | number): PolicyParameter {
        if (typeof labelOrIndex === "string") {
            return new PolicyParameter(this.page, this.page.locator('tr', { has: this.page.locator(`input[value="${labelOrIndex}"]`) }));
        }
        return new PolicyParameter(this.page, this.page.locator("tr").nth(labelOrIndex + 1));
    }

    /**
     * Retrieves the total count of policy parameters displayed in the table.
     * 
     * @returns {Promise<number>} A promise that resolves to the number of table rows (policy parameters) found in the tbody element.
     */
    async getNumberOfPolicyParameters(): Promise<number> {
        return await this.page.locator("tbody").locator("tr").count();
    }

    /**
     * Returns a PolicyChoice instance for the specified table row.
     * 
     * @param index - The zero-based index of the table row to select
     * @returns A new PolicyChoice instance initialized with the page and the selected table row element
     */
    policyChoices(labelOrIndex: string | number): PolicyChoice {
        const rows = this.page.locator("tbody tr");
        if (typeof labelOrIndex === "string") {
            const matchingRow = rows.filter({
                has: this.page.locator("td").nth(0).getByText(labelOrIndex, { exact: true })
            });
            return new PolicyChoice(this.page, matchingRow.first());
        }
        return new PolicyChoice(this.page, rows.nth(labelOrIndex));
    }

    /**
     * Retrieves the total number of policy choices available in the table.
     * 
     * @returns {Promise<number>} A promise that resolves to the count of table rows (policy choices) in the tbody element.
     */
    async getNumberOfPolicyChoices(): Promise<number> {
        return await this.page.locator("tbody").locator("tr").count();
    }

    /**
     * Creates a ConstraintsComponent instance for a specific constraint row.
     * 
     * @param labelOrIndex - The constraint identifier. Can be either:
     *   - A string representing the text label of the constraint row to locate
     *   - A number representing the zero-based index of the constraint row
     * @returns A new ConstraintsComponent instance bound to the specified constraint row
     */
    constraints(labelOrIndex: string | number): ConstraintsComponent {
        if (typeof labelOrIndex === "string") {
            return new ConstraintsComponent(this.page, this.page.getByText(labelOrIndex, { exact: true }).locator("..").locator(".."));
        }
        return new ConstraintsComponent(this.page, this.page.locator("tr").nth(labelOrIndex));
    }

    /**
     * Gets the total number of constraint rows in the table.
     * 
     * @returns A promise that resolves to the count of table rows (`<tr>` elements) within the table body (`<tbody>`).
     */
    async getNumberOfConstraints(): Promise<number> {
        return await this.page.locator("tbody").locator("tr").count();
    }

    /**
     * Configures the policy components (Base, Parental, and Optional policies)
     * on the Policy Configuration Page based on the provided JSON data.
     *
     * Each policy type is conditionally filled only when data is available.
     * Empty strings or arrays are skipped.
     *
     * @param {Object} data - JSON object containing the policy configuration details.
     * Refer `testdata\references\example_policy_configuration.json` for the complete JSON structure reference.
     *
     * @returns {Promise<void>} Resolves once all applicable policy components are configured.
     */
    async configurePolicyComponent(data: any): Promise<void> {
        // --- Configure Base Policy ---
        if (hasValue(data.basePolicy)) {
            // Set display label if provided
            if (hasValue(data.basePolicy.displayLabel)) {
                await this.policyComponents(0).displayLabel.set(data.basePolicy.displayLabel);
            }

            // Set Sum Insured Model (e.g., Flat, Multiple)
            if (hasValue(data.basePolicy.sumInsuredModel)) {
                await this.policyComponents(0).sumInsuredModel.set(data.basePolicy.sumInsuredModel);
            }

            // Set "Multiple Of" value if present
            if (hasValue(data.basePolicy.multipleOf)) {
                await this.policyComponents(0).multipleOf.set(data.basePolicy.multipleOf);
            }

            // Set Minimum Sum Insured value
            if (hasValue(data.basePolicy.minSI)) {
                await this.policyComponents(0).minSI.set(data.basePolicy.minSI);
            }

            // Set Maximum Sum Insured value
            if (hasValue(data.basePolicy.maxSI)) {
                await this.policyComponents(0).maxSI.set(data.basePolicy.maxSI);
            }

            // Handle SI Amounts list if provided
            if (hasValue(data.basePolicy.siAmounts)) {
                const numberOfSIAmonts: number = data.basePolicy.siAmounts.length;
                for (let siAmountIndex: number = 0; siAmountIndex < numberOfSIAmonts; siAmountIndex++) {
                    await this.policyComponents(0).SIAmount(siAmountIndex).set(data.basePolicy.siAmounts[siAmountIndex]);
                    // Click "Add" for all except the last item
                    if (siAmountIndex !== numberOfSIAmonts - 1) {
                        await this.policyComponents(0).addSIAmountOrCTCMultiple.click();
                    }
                }
            }

            // Handle CTC Multiples list if provided
            if (hasValue(data.basePolicy.ctcMultiples)) {
                const numberOfCTCMultiples: number = data.basePolicy.ctcMultiples.length;
                for (let ctcMultipleIndex: number = 0; ctcMultipleIndex < numberOfCTCMultiples; ctcMultipleIndex++) {
                    await (await this.policyComponents(0).CTCMultiple(ctcMultipleIndex)).set(data.basePolicy.ctcMultiples[ctcMultipleIndex]);
                    // Click "Add" for all except the last item
                    if (ctcMultipleIndex !== numberOfCTCMultiples - 1) {
                        await this.policyComponents(0).addSIAmountOrCTCMultiple.click();
                    }
                }
            }

            // Toggle Company Contribution checkbox
            if (data.basePolicy.showCompanyContribution) {
                await this.policyComponents(0).showCompanyContribution.check();
            }
            else {
                await this.policyComponents(0).showCompanyContribution.uncheck();
            }

            // Set Premium Calculation model if provided
            if (hasValue(data.basePolicy.premiumCalculation)) {
                await this.policyComponents(0).premiumCalculation.set(data.basePolicy.premiumCalculation);
            }
        }

        // --- Configure Parental Policy ---
        if (hasValue(data.parentalPolicy)) {
            await this.addParentalPolicy.click();

            // Set display label if provided
            if (hasValue(data.parentalPolicy.displayLabel)) {
                await this.policyComponents(1).displayLabel.set(data.parentalPolicy.displayLabel);
            }

            // Set Sum Insured Model (e.g., Flat, Multiple)
            if (hasValue(data.parentalPolicy.sumInsuredModel)) {
                await this.policyComponents(1).sumInsuredModel.set(data.parentalPolicy.sumInsuredModel);
            }

            // Set "Multiple Of" value if present
            if (hasValue(data.parentalPolicy.multipleOf)) {
                await this.policyComponents(1).multipleOf.set(data.parentalPolicy.multipleOf);
            }

            // Set Minimum Sum Insured value
            if (hasValue(data.parentalPolicy.minSI)) {
                await this.policyComponents(1).minSI.set(data.parentalPolicy.minSI);
            }

            // Set Maximum Sum Insured value
            if (hasValue(data.parentalPolicy.maxSI)) {
                await this.policyComponents(1).maxSI.set(data.parentalPolicy.maxSI);
            }

            // Handle SI Amounts list if provided
            if (hasValue(data.parentalPolicy.siAmounts)) {
                const numberOfSIAmonts: number = data.parentalPolicy.siAmounts.length;
                for (let siAmountIndex: number = 0; siAmountIndex < numberOfSIAmonts; siAmountIndex++) {
                    await this.policyComponents(1).SIAmount(siAmountIndex).set(data.parentalPolicy.siAmounts[siAmountIndex]);
                    // Click "Add" for all except the last item
                    if (siAmountIndex !== numberOfSIAmonts - 1) {
                        await this.policyComponents(1).addSIAmountOrCTCMultiple.click();
                    }
                }
            }

            // Handle CTC Multiples list if provided
            if (hasValue(data.parentalPolicy.ctcMultiples)) {
                const numberOfCTCMultiples: number = data.parentalPolicy.ctcMultiples.length;
                for (let ctcMultipleIndex: number = 0; ctcMultipleIndex < numberOfCTCMultiples; ctcMultipleIndex++) {
                    await (await this.policyComponents(1).CTCMultiple(ctcMultipleIndex)).set(data.parentalPolicy.ctcMultiples[ctcMultipleIndex]);
                    // Click "Add" for all except the last item
                    if (ctcMultipleIndex !== numberOfCTCMultiples - 1) {
                        await this.policyComponents(1).addSIAmountOrCTCMultiple.click();
                    }
                }
            }

            // Toggle Company Contribution checkbox
            if (data.parentalPolicy.showCompanyContribution) {
                await this.policyComponents(1).showCompanyContribution.check();
            }
            else {
                await this.policyComponents(1).showCompanyContribution.uncheck();
            }

            // Set Premium Calculation model if provided
            if (hasValue(data.parentalPolicy.premiumCalculation)) {
                await this.policyComponents(1).premiumCalculation.set(data.parentalPolicy.premiumCalculation);
            }
        }

        // --- Configure Optional Policies ---
        if (hasValue(data.optionalPolicies)) {
            const numberOfOptionalPolicies: number = data.optionalPolicies.length;
            const addOnValueForOptionalPolicyIndex: number = hasValue(data.parentalPolicy) ? 2 : 1;
            // Iterate through each optional policy
            for (let optionalPolicyIndex: number = 0; optionalPolicyIndex < numberOfOptionalPolicies; optionalPolicyIndex++) {
                const optionalPolicy: any = data.optionalPolicies[optionalPolicyIndex];
                await this.addOptionalComponent.click();

                // Set display label if provided
                if (hasValue(optionalPolicy.displayLabel)) {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).displayLabel.set(optionalPolicy.displayLabel);
                }

                // Set Sum Insured Model (e.g., Flat, Multiple)
                if (hasValue(optionalPolicy.sumInsuredModel)) {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).sumInsuredModel.set(optionalPolicy.sumInsuredModel);
                }

                // Set "Multiple Of" value if present
                if (hasValue(optionalPolicy.multipleOf)) {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).multipleOf.set(optionalPolicy.multipleOf);
                }

                // Set Minimum Sum Insured value
                if (hasValue(optionalPolicy.minSI)) {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).minSI.set(optionalPolicy.minSI);
                }

                // Set Maximum Sum Insured value
                if (hasValue(optionalPolicy.maxSI)) {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).maxSI.set(optionalPolicy.maxSI);
                }

                // Handle SI Amounts list if provided
                if (hasValue(optionalPolicy.siAmounts)) {
                    const numberOfSIAmonts: number = optionalPolicy.siAmounts.length;
                    for (let siAmountIndex: number = 0; siAmountIndex < numberOfSIAmonts; siAmountIndex++) {
                        await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).SIAmount(siAmountIndex).set(optionalPolicy.siAmounts[siAmountIndex]);
                        // Click "Add" for all except the last item
                        if (siAmountIndex !== numberOfSIAmonts - 1) {
                            await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).addSIAmountOrCTCMultiple.click();
                        }
                    }
                }

                // Handle CTC Multiples list if provided
                if (hasValue(optionalPolicy.ctcMultiples)) {
                    const numberOfCTCMultiples: number = optionalPolicy.ctcMultiples.length;
                    for (let ctcMultipleIndex: number = 0; ctcMultipleIndex < numberOfCTCMultiples; ctcMultipleIndex++) {
                        await (await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).CTCMultiple(ctcMultipleIndex)).set(optionalPolicy.ctcMultiples[ctcMultipleIndex]);
                        // Click "Add" for all except the last item
                        if (ctcMultipleIndex !== numberOfCTCMultiples - 1) {
                            await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).addSIAmountOrCTCMultiple.click();
                        }
                    }
                }

                // Toggle Company Contribution checkbox
                if (optionalPolicy.showCompanyContribution) {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).showCompanyContribution.check();
                }
                else {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).showCompanyContribution.uncheck();
                }

                // Set Premium Calculation model if provided
                if (hasValue(optionalPolicy.premiumCalculation)) {
                    await this.policyComponents(optionalPolicyIndex + addOnValueForOptionalPolicyIndex).premiumCalculation.set(optionalPolicy.premiumCalculation);
                }
            }
        }
    }

    /**
     * Configures both **Base** and **Parental** Policy templates based on the provided JSON data.
     * 
     * This method reads configuration details for both policy types — base and parental —
     * and updates the corresponding policy settings in the UI. It applies configuration only
     * when data values are present (i.e., not empty, null, or undefined).  
     * 
     * The function performs the following steps for each policy type:
     * 
     * 1. Validates that the **main policy label** is provided.  
     * 2. Sets **sequence number**, **mid-year enrollment**, and **sum insured visibility** if values exist.  
     * 3. Iterates through all **optional policies**, validating labels and applying configurations only when `enablePolicy` is `true`.  
     * 4. Throws an error if a required label is missing for either main or optional policies.  
     * 
     * @param data - JSON object containing configuration for both base and parental policies.
     * Refer `testdata\references\example_policy_configuration.json` for the complete JSON structure reference.
     * 
     * @remarks
     * - The `hasValue()` utility is used to verify meaningful values before applying configurations.
     * - Optional policies are processed only if they exist under `optionalPolicies` arrays.
     * - Sequence fields are set only if they are not disabled in the UI.
     * - Policies are toggled (enabled/disabled) based on the `enablePolicy` flag.
     */
    async configurePolicyTemplate(data: any): Promise<void> {
        const numberOfOptionalPoliciesForBasePolicy: number = data.basePolicy.optionalPolicies.length;
        const numberOfOptionalPoliciesForParentalPolicy: number = data.parentalPolicy.optionalPolicies.length;

        // ---- Configure Base Policy ----
        if (!hasValue(data.basePolicy.label)) {
            throw new Error("Label is required for Base Policy Template");
        }
        if (hasValue(data.basePolicy.sequence) && !(await this.basePolicyTemplate.sequence(data.basePolicy.label).isdisabled())) {
            await this.basePolicyTemplate.sequence(data.basePolicy.label).set(data.basePolicy.sequence);
        }
        if (hasValue(data.basePolicy.midYearEnrollmentAllowed)) {
            await this.basePolicyTemplate.midYearEnrollmentAllowed(data.basePolicy.label).set(data.basePolicy.midYearEnrollmentAllowed);
        }
        if (hasValue(data.basePolicy.sumInsuredVisibleToEmployee)) {
            await this.basePolicyTemplate.sumInsuredVisibleToEmployee(data.basePolicy.label).set(data.basePolicy.sumInsuredVisibleToEmployee);
        }

        // Iterate through each optional policy in base policy
        for (let optionalPolicyIndex: number = 0; optionalPolicyIndex < numberOfOptionalPoliciesForBasePolicy; optionalPolicyIndex++) {
            const basePolicyComponent: any = data.basePolicy.optionalPolicies[optionalPolicyIndex];

            // Throw error if the lable is not provided
            if (!hasValue(basePolicyComponent.label)) {
                throw new Error("Label is required for a Policy Template");
            }

            // Check if enablePolicy is set to true and toggle checkbox accordingly
            if (basePolicyComponent.enablePolicy) {
                await this.basePolicyTemplate.optionalPolicy(basePolicyComponent.label).check();
            }

            // Set policy sequence number if provided
            if (hasValue(basePolicyComponent.sequence) && basePolicyComponent.enablePolicy) {
                await this.basePolicyTemplate.sequence(basePolicyComponent.label).set(basePolicyComponent.sequence);
            }

            // Configure mid-year enrollment option if specified
            if (hasValue(basePolicyComponent.midYearEnrollmentAllowed) && basePolicyComponent.enablePolicy) {
                await this.basePolicyTemplate.midYearEnrollmentAllowed(basePolicyComponent.label).set(basePolicyComponent.midYearEnrollmentAllowed);
            }

            // Set visibility of Sum Insured field for employees, if specified
            if (hasValue(basePolicyComponent.sumInsuredVisibleToEmployee) && basePolicyComponent.enablePolicy) {
                await this.basePolicyTemplate.sumInsuredVisibleToEmployee(basePolicyComponent.label).set(basePolicyComponent.sumInsuredVisibleToEmployee);
            }
        }

        // ---- Configure Parent Policy ----
        if (!hasValue(data.parentalPolicy.label)) {
            throw new Error("Label is required for Parental Policy Template");
        }
        if (hasValue(data.parentalPolicy.sequence) && !(await this.parentalPolicyTemplate.sequence(data.parentalPolicy.label).isdisabled())) {
            await this.parentalPolicyTemplate.sequence(data.parentalPolicy.label).set(data.parentalPolicy.sequence);
        }
        if (hasValue(data.parentalPolicy.midYearEnrollmentAllowed)) {
            await this.parentalPolicyTemplate.midYearEnrollmentAllowed(data.parentalPolicy.label).set(data.parentalPolicy.midYearEnrollmentAllowed);
        }
        if (hasValue(data.parentalPolicy.sumInsuredVisibleToEmployee)) {
            await this.parentalPolicyTemplate.sumInsuredVisibleToEmployee(data.parentalPolicy.label).set(data.parentalPolicy.sumInsuredVisibleToEmployee);
        }

        // Iterate through each optional policy in parental policy
        for (let optionalPolicyIndex: number = 0; optionalPolicyIndex < numberOfOptionalPoliciesForParentalPolicy; optionalPolicyIndex++) {
            const parentalPolicyComponent: any = data.parentalPolicy.optionalPolicies[optionalPolicyIndex];

            // Throw error if the lable is not provided
            if (!hasValue(parentalPolicyComponent.label)) {
                throw new Error("Label is required for a Policy Template");
            }

            // Check if enablePolicy is set to true and toggle checkbox accordingly
            if (parentalPolicyComponent.enablePolicy) {
                await this.parentalPolicyTemplate.optionalPolicy(parentalPolicyComponent.label).check();
            }

            // Set policy sequence number if provided
            if (hasValue(parentalPolicyComponent.sequence) && parentalPolicyComponent.enablePolicy) {
                await this.parentalPolicyTemplate.sequence(parentalPolicyComponent.label).set(parentalPolicyComponent.sequence);
            }

            // Configure mid-year enrollment option if specified
            if (hasValue(parentalPolicyComponent.midYearEnrollmentAllowed) && parentalPolicyComponent.enablePolicy) {
                await this.parentalPolicyTemplate.midYearEnrollmentAllowed(parentalPolicyComponent.label).set(parentalPolicyComponent.midYearEnrollmentAllowed);
            }

            // Set visibility of Sum Insured field for employees, if specified
            if (hasValue(parentalPolicyComponent.sumInsuredVisibleToEmployee) && parentalPolicyComponent.enablePolicy) {
                await this.parentalPolicyTemplate.sumInsuredVisibleToEmployee(parentalPolicyComponent.label).set(parentalPolicyComponent.sumInsuredVisibleToEmployee);
            }
        }
    }

    /**
     * Configures policy relationship settings based on the provided JSON data.
     *
     * Each relationship entry defines:
     * - The **relationship type** (e.g., Self, Children, Parents)
     * - The **maximum number** of dependents allowed (`maxNo`)
     * - A list of **permitted relations** under that relationship type, with optional
     *   `minAge` and `maxAge` restrictions.
     *
     * The method:
     * - Validates that every relationship has a `relationshipType`
     * - Validates that every permitted relation has a `label`
     * - Skips optional fields (`maxNo`, `minAge`, `maxAge`) if empty
     *
     * @param {Array<Object>} data - Array of policy relationship configuration objects.
     * Refer `testdata\references\example_policy_configuration.json` for the complete JSON structure reference.
     *
     * @throws {Error} If `relationshipType` or permitted relation `label` is missing.
     * @returns {Promise<void>} Resolves once all policy relationships and their permitted relations are configured.
     */
    async configurePolicyRelationships(data: any): Promise<void> {
        // Get total number of relationship types from the input data
        const numberOfPolicyRelationships: number = data.length;

        // Iterate through each policy relationship configuration block
        for (let policyRelationshipIndex: number = 0; policyRelationshipIndex < numberOfPolicyRelationships; policyRelationshipIndex++) {
            const policyRelationship: any = data[policyRelationshipIndex];

            // ---- Validate Relationship Type ----
            // Relationship Type is mandatory — throw error if missing
            if (!hasValue(policyRelationship.relationshipType)) {
                throw new Error("Relationship Type is mandatory");
            }

            // Select the checkbox for the given Relationship Type
            await this.policyRelationships(policyRelationship.relationshipType).relationshipType.check();

            // ---- Configure Maximum Number of Relations ----
            // Set max count only if the value is provided
            if (hasValue(policyRelationship.maxNo)) {
                await this.policyRelationships(policyRelationship.relationshipType).maxNo.set(policyRelationship.maxNo);
            }

            // ---- Configure Permitted Relations ----
            // Proceed only if permittedRelations are defined
            if (hasValue(policyRelationship.permittedRelations)) {
                const numberOfPermittedRelations: number = policyRelationship.permittedRelations.length;

                // Iterate through each permitted relation under the relationship type
                for (let permittedRelationIndex: number = 0; permittedRelationIndex < numberOfPermittedRelations; permittedRelationIndex++) {
                    const permittedRelation: any = policyRelationship.permittedRelations[permittedRelationIndex];

                    // Validate that a label is provided for the permitted relation
                    if (!hasValue(permittedRelation.label)) {
                        throw new Error("Permitted relation Label is Required");
                    }

                    // Select and enable the permitted relation checkbox
                    await this.policyRelationships(policyRelationship.relationshipType).permittedRelation(permittedRelation.label).label.check();

                    // ---- Configure Age Restrictions ----
                    // Set minimum age if available
                    if (hasValue(permittedRelation.minAge)) {
                        await this.policyRelationships(policyRelationship.relationshipType).permittedRelation(permittedRelation.label).minAge.set(permittedRelation.minAge);
                    }

                    // Set maximum age if available
                    if (hasValue(permittedRelation.maxAge)) {
                        await this.policyRelationships(policyRelationship.relationshipType)
                            .permittedRelation(permittedRelation.label)
                            .maxAge.set(permittedRelation.maxAge);
                    }
                }
            }
        }
    }

    /**
     * Configures Policy Parameters in the UI based on the provided JSON data.
     *
     * This method automates the configuration of various policy parameter types
     * (e.g., **Range Set**, **Relationship Group**, and **Option**) by reading structured
     * data and filling the corresponding UI form fields dynamically.
     *
     * @param data - An array of policy parameter objects defining type, display names,
     *               and configuration details for each parameter. Refer `testdata\references\example_policy_configuration.json` for the complete JSON structure reference.
     * @returns A `Promise<void>` indicating the completion of the policy parameter configuration process.
     *
     * @throws Will throw an error if a required field (e.g., `parameterName` or `maxCount.label`) is missing,
     *         or if an unknown parameter type is encountered.
     */
    async configurePolicyParamenters(data: any): Promise<void> {
        const numberOfPolicyParameters: number = data.length;

        // Iterate throught each policy parameter
        for (let policyParameterIndex = 0; policyParameterIndex < numberOfPolicyParameters; policyParameterIndex++) {
            const policyParameter: any = data[policyParameterIndex];
            const allPolicyParameters: string[] = await this.parameter.getAllValues();

            // Validate that the parameter name is provided
            if (!hasValue(policyParameter.parameterName)) {
                throw new Error("Policy parameter name is required");
            }
            if (!allPolicyParameters.includes(policyParameter.parameterName)) {
                throw new Error(`Unknown Policy parameter ${policyParameter.parameterName}`);
            }

            // Select the parameter and click 'Add' to insert it into the UI
            await this.parameter.set(policyParameter.parameterName);
            await this.add.click();

            // Handle "Range Set" parameter type
            if (policyParameter.type === "Range Set") {
                const numberOfRangeSets: number = policyParameter.configuration.length;

                // Set display name if available
                if (hasValue(policyParameter.displayName)) {
                    await this.policyParameters(policyParameterIndex).displayName.set(policyParameter.displayName);
                }

                // Iterate over each range set configuration
                for (let rangeSetIndex = 0; rangeSetIndex < numberOfRangeSets; rangeSetIndex++) {
                    const rangeSet: any = policyParameter.configuration[rangeSetIndex];

                    if (hasValue(rangeSet.rangeDisplayName)) {
                        await this.policyParameters(policyParameterIndex).rangeSet(rangeSetIndex).rangeDisplayName.set(rangeSet.rangeDisplayName);
                    }

                    if (hasValue(rangeSet.min)) {
                        await this.policyParameters(policyParameterIndex).rangeSet(rangeSetIndex).min.set(rangeSet.min);
                    }

                    if (hasValue(rangeSet.max)) {
                        await this.policyParameters(policyParameterIndex).rangeSet(rangeSetIndex).max.set(rangeSet.max);
                    }

                    // Add a new range set row except after the last one
                    if (rangeSetIndex < numberOfRangeSets - 1) {
                        await this.policyParameters(policyParameterIndex).addRangeSet.click();
                    }
                }
            }

            // Handle "Relationship Group" parameter type
            else if (policyParameter.type === "Relationship Group") {
                const numberOfRelationShipGroups: number = policyParameter.configuration.length;

                // Set display name if available
                if (hasValue(policyParameter.displayName)) {
                    await this.policyParameters(policyParameterIndex).displayName.set(policyParameter.displayName);
                }

                // Iterate over each relationship group configuration
                for (let relationshipGroupIndex = 0; relationshipGroupIndex < numberOfRelationShipGroups; relationshipGroupIndex++) {
                    const relationshipGroup: any = policyParameter.configuration[relationshipGroupIndex];

                    // Set group name
                    if (hasValue(relationshipGroup.groupName)) {
                        await this.policyParameters(policyParameterIndex).relationshipGroup(relationshipGroupIndex).groupName.set(relationshipGroup.groupName);
                    }

                    // Set individual max counts for relationships
                    if (hasValue(relationshipGroup.maxCounts)) {
                        const numberOfMaxCounts: number = relationshipGroup.maxCounts.length;

                        // Iterate through each max count to enable checkbox and to set maxcount
                        for (let maxCountIndex = 0; maxCountIndex < numberOfMaxCounts; maxCountIndex++) {
                            const maxcount: any = relationshipGroup.maxCounts[maxCountIndex];

                            // Ensure a label exists for the checkbox
                            if (!hasValue(maxcount.label)) {
                                throw new Error("Max count label is required");
                            }

                            // Check the relationship type (e.g., Self, Children)
                            await this.policyParameters(policyParameterIndex).relationshipGroup(relationshipGroupIndex).checkBox(maxcount.label).check();

                            // Set maximum count value
                            if (hasValue(maxcount.value)) {
                                await this.policyParameters(policyParameterIndex).relationshipGroup(relationshipGroupIndex).maxCount(maxcount.label).set(maxcount.value);
                            }
                        }
                    }

                    // Add another relationship group if not the last one
                    if (relationshipGroupIndex < numberOfRelationShipGroups - 1) {
                        await this.policyParameters(policyParameterIndex).addRelationGroup.click();
                    }
                }
            }

            // Handle "Option" parameter type
            else if (policyParameter.type === "Option") {
                const defaultValues: any = policyParameter.configuration.defaultValues;
                const addedValues: any = policyParameter.configuration.addedValues
                const numberOfDefaultValues: number = defaultValues.length;
                const numberOfAddedValues: number = addedValues.length;

                // Set display name if available
                if (hasValue(policyParameter.displayName)) {
                    await this.policyParameters(policyParameterIndex).displayName.set(policyParameter.displayName);
                }

                // Throw error if default values for "Designation" are more than 4
                if (policyParameter.parameterName === "Designation" && numberOfDefaultValues > 4) {
                    throw new Error("Maximum number of default values for 'Designation' is 4");
                }

                // Throw error if default values for "Gender" are more than 2
                else if (policyParameter.parameterName === "Gender" && numberOfDefaultValues > 2) {
                    throw new Error("Maximum number of default values for 'Gender' is 2")
                }

                // Throw error if default values for "Marital Status" are more than 2
                else if (policyParameter.parameterName === "Marital Status" && numberOfDefaultValues > 2) {
                    throw new Error("Maximum number of default values for 'Marital Status' is 2")
                }

                // Throw error if default values for "Custom List" are more than 2
                else if (policyParameter.parameterName === "Custom List" && numberOfDefaultValues > 2) {
                    throw new Error("Maximum number of default values for 'Custom List' is 2")
                }

                // Fill add default values
                if (hasValue(defaultValues)) {
                    for (let defaultValueIndex: number = 0; defaultValueIndex < numberOfDefaultValues; defaultValueIndex++) {
                        const defaultValue: any = defaultValues[defaultValueIndex];
                        await this.policyParameters(policyParameterIndex).option(defaultValueIndex).defaultValue.set(defaultValue);
                    }
                }

                // Remove extra default values
                while (await this.policyParameters(policyParameterIndex).option(numberOfDefaultValues).defaultValue.isvisible()) {
                    await this.policyParameters(policyParameterIndex).option(numberOfDefaultValues).remove.click();
                }

                // Add specified added values
                if (hasValue(addedValues)) {
                    for (let addedValueIndex: number = 0; addedValueIndex < numberOfAddedValues; addedValueIndex++) {
                        const addedValue: any = addedValues[addedValueIndex];
                        await this.policyParameters(policyParameterIndex).addOption.click();
                        await this.policyParameters(policyParameterIndex).option(numberOfDefaultValues + addedValueIndex).addedValue.set(addedValue);
                    }
                }
            }

            // Handle unknown or unsupported parameter types
            else {
                throw new Error(`Unknown Policy parameter type found: ${policyParameter.type}`);
            }
        }
    }

    /**
     * Configures Policy Choices (Base, Parental, Optional Add-on) on the Policy Configuration UI.
     *
     * This method automates selecting a policy option, choosing available policy choices, and setting configuration options such as:
     *  - Marking a choice as Available
     *  - Marking a choice as Default (if enabled)
     *  - Entering Company Contribution
     *  - Entering Employee Contribution
     *
     * ⚠️ Throws error when:
     *  - Policy Option is missing or not visible in UI
     *  - Available Policy Choice label does not exist in UI
     *  - Configuration values are invalid
     *
     * @param data Policy configuration data array. Refer `testdata\references\example_policy_configuration.json` for the complete JSON structure reference.
     */
    async configurePolicyChoices(data: any): Promise<void> {
        const numberOfPolicyChoices: number = data.length;

        // Loop through each policy option group (Base / Parental / Optional)
        for (let policyChoiceIndex: number = 0; policyChoiceIndex < numberOfPolicyChoices; policyChoiceIndex++) {
            const policyChoice: any = data[policyChoiceIndex];
            const numberOfAvailablePolicyChoices: any = policyChoice.availablePolicyChoices.length;

            // Validate mandatory policy option field
            if (!hasValue(policyChoice.policyOption)) {
                throw new Error("Policy Option is required");
            }

            // Ensure policy option exists in UI
            if (!(await this.policyChoices(policyChoice.policyOption).isVisible())) {
                throw new Error(`No Policy Choice found with the label: ${policyChoice.policyOption}`);
            }

            // Iterate through available policy choices under a specific policy option
            for (let availablePolicyChoiceIndex: number = 0; availablePolicyChoiceIndex < numberOfAvailablePolicyChoices; availablePolicyChoiceIndex++) {
                const availablePolicyChoice: any = policyChoice.availablePolicyChoices[availablePolicyChoiceIndex];
                const numberOfConfigurations: number = availablePolicyChoice.configuration.length;

                // Validate policy choice label
                if (!hasValue(availablePolicyChoice.label)) {
                    throw new Error("Available policy choice label is required");
                }

                // Ensure Available policy choice exists in UI
                if (!(await this.policyChoices(policyChoice.policyOption).getAllAvailablePolicyChoices()).includes(availablePolicyChoice.label)) {
                    throw new Error(`No Available policy choice found with label: ${availablePolicyChoice.label}`);
                }

                // Select the available policy choice
                await this.policyChoices(policyChoice.policyOption).selectAvailablePolicyChoice(availablePolicyChoice.label);

                // Configure Available, Default, Company contribution and Employee contribution fields
                for (let configurationIndex: number = 0; configurationIndex < numberOfConfigurations; configurationIndex++) {
                    const configuration: any = availablePolicyChoice.configuration[configurationIndex];

                    // Toggle "Available"
                    if (configuration.available) {
                        await this.policyChoices(policyChoice.policyOption).configureSelectedPolicyChoice(configurationIndex).available.check();
                    }

                    // Toggle "Default" if enabled
                    if (configuration.default && !(await this.policyChoices(policyChoice.policyOption).configureSelectedPolicyChoice(configurationIndex).default.isdisabled())) {
                        await this.policyChoices(policyChoice.policyOption).configureSelectedPolicyChoice(configurationIndex).default.check();
                    }

                    // Enter company contribution (if field editable)
                    if (hasValue(configuration.companyContribution) && !(await this.policyChoices(policyChoice.policyOption).configureSelectedPolicyChoice(configurationIndex).companyContribution.isdisabled())) {
                        await this.policyChoices(policyChoice.policyOption).configureSelectedPolicyChoice(configurationIndex).companyContribution.set(configuration.companyContribution);
                    }

                    // Enter employee contribution (if field editable)
                    if (hasValue(configuration.employeeContribution) && !(await this.policyChoices(policyChoice.policyOption).configureSelectedPolicyChoice(configurationIndex).employeeContribution.isdisabled())) {
                        await this.policyChoices(policyChoice.policyOption).configureSelectedPolicyChoice(configurationIndex).employeeContribution.set(configuration.employeeContribution);
                    }
                }

                // Click "Set Choices" button
                if (availablePolicyChoice.setChoices) {
                    await this.policyChoices(policyChoice.policyOption).setChoices.click();
                }
            }
        }
    }

    /**
     * Configures constraints based on the provided data array.
     * 
     * @param data - An array of constraint objects. Refer `testdata\references\example_policy_configuration.json` for the complete JSON structure reference.
     * 
     * @returns A Promise that resolves when all constraints have been configured
     * 
     * @throws {Error} If a constraint label is not provided (missing or empty)
     * @throws {Error} If a constraint with the specified label is not visible on the page
     * ```
     */
    async configureConstraints(data: any): Promise<void> {
        const numberOfConstraints: number = data.length;
        // Iterate through each constraint
        for(let constraintIndex: number = 0 ; constraintIndex < numberOfConstraints ; constraintIndex++) {
            const constraint: any = data[constraintIndex];

            // Throw error if there is no label
            if(!hasValue(constraint.label)) {
                throw new Error("Constraint label is required");
            }

            // Throw error if the provided label is not present in UI
            if(!(await this.constraints(constraint.label).isVisible())) {
                throw new Error(`No constraint found with the label: ${constraint.label}`);
            }

            // Set the value for the corresponding label if provided in the data
            if(hasValue(constraint.value)) {
                await this.constraints(constraint.label).set(constraint.value);
            }
        }
    }
}