import { Locator, Page } from '@playwright/test';
import { StringUtils } from "../utils/stringutils";
import { PaginationControls } from '../appcomponents/PaginationControls.component';
import { TIMEOUTS } from '../env/timeouts';
import { setZoom } from "../utils/browserutils";
/**
 * Represents an AgGrid table component abstraction for Playwright tests.
 * Provides utilities to interact with cells, headers, rows, sorting, pagination, and scrolling.
 */
export class AgGrid {
  private page: Page;
  private body: Locator;
  private headerRow: Locator;
  protected element: Locator;
  private globalLoader: Locator;

  /**
   * Constructs a new AgGrid instance.
   *
   * @param page - The Playwright Page instance.
   * @param selector - The locator or CSS selector for the AgGrid container.
   */
  constructor(page: Page, selector: Locator | string) {
    this.page = page;
    this.element = typeof selector === 'string' ? page.locator(selector) : selector;
    this.headerRow = this.element.locator('.ag-header.ag-pivot-off.ag-header-allow-overflow');
    this.body = this.element.locator('.ag-body.ag-layout-normal');
    this.globalLoader = this.page.getByTestId("global-loader");
  }

  /**
   * THIS METHOD WAS DEPRECATED
   * Clicks a cell in a column where the value matches the given input.
   *
   * @param columnLabel - The column header label.
   * @param columnValue - The cell value to match.
   * @param module - (Optional) The module context.
   * @Usage The module name is taken from the SideNavBar.
   * @Example await manageROListingPage.table().click_on('Policy type','All_Risk','My RO');
   * @throws If the matching cell is not found.
   */
  async click_on_old(columnLabel: string, columnValue: string, module?: string) {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const colId = this.getColId(columnLabel, module);
    const cell = this.element.locator(`[role="row"] [role="gridcell"][col-id="${colId}"][title="${columnValue}"]`).first();
    if (await cell.count() === 0) {
      throw new Error(`Value "${columnLabel}" not found in column "${columnValue}"`);
    }

    await cell.scrollIntoViewIfNeeded();
    await cell.click();
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
  }

  /**
   * Clicks on a cell in the grid based on the specified column label and cell value.
   *
   * @param columnLabel - The label of the column to search in.
   * @param columnValue - The value to match within the specified column.
   * @throws {Error} If the value is not found in the specified column.
   */
  async click_on(columnLabel: string, columnValue: string) {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const columnIndex: number = await this.getColumnIndex(columnLabel);
    const rows: Locator = this.element.getByRole("row");
    const rowCount: number = await rows.count();

    for (let index: number = 1; index < rowCount; index++) {
      const cell: Locator = rows.nth(index).getByRole("gridcell").nth(columnIndex);
      if (await cell.getAttribute("title") === columnValue) {
        await cell.scrollIntoViewIfNeeded();
        await cell.click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
        return;
      }
    }
    throw new Error(`Value "${columnLabel}" not found in column "${columnValue}"`);
  }

  /**
 * THIS METHOD WAS DEPRECATED
 * Gets the text alignment of a cell in the specified row and column.
 *
 * @param rowIdentifier - Unique cell value in the row used to locate the row.
 * @param columnLabel - The column header text used to find the column ID.
 * @param module - (Optional) The module name if column IDs differ by module.
 * @Usage The module name is taken from the SideNavBar
 * @returns {Promise<"right" | "left" | "center">} - Alignment of the cell.
 * @Example for usage of module - await manageROListingPage.table().getCellAlignment(rowIdentifier, 'Company name','My RO');
 * @example
 * await gridPage.getCellAlignment("Opportunity A", "Amount"); // "right"
 */
  async getCellAlignment_old(rowIdentifier: string, columnLabel: string, module?: string): Promise<"right" | "left" | "center"> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const colId = this.getColId(columnLabel, module);

    await this.element.waitFor({ state: 'visible' });
    const rows = this.page.locator('[role="row"]');
    const rowCount = await rows.count();

    for (let rowNum = 0; rowNum < rowCount; rowNum++) {
      const row = rows.nth(rowNum);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();

      for (let cellNum = 0; cellNum < cellCount; cellNum++) {
        const cell = cells.nth(cellNum);
        const cellText = (await cell.getAttribute('title') || await cell.textContent())?.trim();

        if (cellText === rowIdentifier) {
          const targetCell = row.locator(`[role="gridcell"][col-id="${colId}"]`).first();
          const classList = await targetCell.getAttribute("class") || "";

          if (classList.includes("right-aligned-cell")) {
            return "right";
          } else if (classList.includes("center-aligned-cell")) {
            return "center";
          } else {
            return "left"; // default
          }
        }
      }
    }

    throw new Error(`Row with "${rowIdentifier}" not found`);
  }

  /**
   * Retrieves the text alignment ("right", "left", or "center") of a specific cell in an AG Grid table.
   *
   * @param rowIdentifier - The unique text or identifier used to locate the target row.
   * @param columnLabel - The label of the column whose cell alignment is to be determined.
   * @returns A promise that resolves to the alignment of the cell: "right", "left", or "center".
   * @throws If no row matching the `rowIdentifier` is found.
   */
  async getCellAlignment(rowIdentifier: string, columnLabel: string): Promise<"right" | "left" | "center"> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });

    const columnIndex: number = await this.getColumnIndex(columnLabel);
    await this.element.waitFor({ state: 'visible' });
    const rows = this.element.getByRole("row");
    const numberOfRows = await rows.count();

    for (let rowIndex = 1; rowIndex < numberOfRows; rowIndex++) {
      const row = rows.nth(rowIndex);
      const cells = row.getByRole("gridcell");
      const cellCount = await cells.count();

      for (let cellNum = 0; cellNum < cellCount; cellNum++) {
        const cell = cells.nth(cellNum);
        const cellText = (await cell.getAttribute('title') || await cell.textContent())?.trim();

        if (cellText === rowIdentifier) {
          const targetCell = row.getByRole("gridcell").nth(columnIndex);
          const classList = await targetCell.getAttribute("class") || "";

          if (classList.includes("right-aligned-cell")) {
            return "right";
          } else if (classList.includes("center-aligned-cell")) {
            return "center";
          } else {
            return "left"; // default
          }
        }
      }
    }

    throw new Error(`Row with "${rowIdentifier}" not found`);
  }

  /**
   * THIS METHOD WAS DEPRECATED
   * Retrieves the content of a target column from the row identifier.
   *
   * @param rowIdentifier - The value used to identify the row.
   * @param targetColumnTitle - The column header of the target cell.
   * @param module - (Optional) The module context.
   * @returns The cell content as string, or null.
   * @Usage The module name is taken from the SideNavBar.
   * @Example await manageROListingPage.table().getCellContent(rowIdentifier, 'Company name','My RO');
   * @throws If the row is not found.
   */
  async getCellContent_old(rowIdentifier: string, columnLabel: string, module?: string): Promise<string | null> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const colId = this.getColId(columnLabel, module);

    await this.element.waitFor({ state: 'visible' });
    const rows = this.page.locator('[role="row"]');
    const rowCount = await rows.count();

    for (let rowNum = 0; rowNum < rowCount; rowNum++) {
      const row = rows.nth(rowNum);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();

      for (let cellNum = 0; cellNum < cellCount; cellNum++) {
        const cell = cells.nth(cellNum);
        const cellText = (await cell.getAttribute('title') || await cell.textContent())?.trim();

        if (cellText === rowIdentifier) {
          const targetCell = row.locator(`[role="gridcell"][col-id="${colId}"]`);
          await targetCell.scrollIntoViewIfNeeded();
          let titleValue = (await targetCell.getAttribute('title'))?.trim() || null;
          let textValue = (await targetCell.textContent())?.trim() || null;
          // If text contains ₹, always return textValue (ignore title)
          if (textValue && /₹/.test(textValue)) {
            return textValue;
          }
          // If value is '--', also return textValue
          if (titleValue === '--') {
            return textValue;
          }
          //For dates like 14/12/2047 we are getting 2047-12-14 .We are handling in My SO,My RO modules to return the textvalue.
          if (["expectedCloseDate", "opportunityCreationDate"].includes(colId)) {
            return textValue;
          }
          // Otherwise prefer title if available, else text
          return titleValue || textValue;

        }
      }
    }

    throw new Error(`Row with "${rowIdentifier}" not found`);
  }

  /**
   * Retrieves the content of a specific cell in an AG Grid table based on a row identifier and column label.
   *
   * @param rowIdentifier - The unique text used to identify the target row (matches cell text or title).
   * @param columnLabel - The label of the column whose cell content is to be retrieved.
   * @returns A promise that resolves to either the trimmed cell content as a string, an array of strings (for composite cells), or null if the cell is empty.
   * @throws Error if no row matching the `rowIdentifier` is found.
   */
  async getCellContent(rowIdentifier: string, columnLabel: string): Promise<string | null | string[]> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const columnIndex: number = await this.getColumnIndex(columnLabel);

    await this.element.waitFor({ state: 'visible' });
    const rows = this.element.getByRole("row");
    const rowCount = await rows.count();

    for (let rowNum = 0; rowNum < rowCount; rowNum++) {
      const row = rows.nth(rowNum);
      const cells = row.getByRole("gridcell");
      const cellCount = await cells.count();

      for (let cellNum = 0; cellNum < cellCount; cellNum++) {
        const cell = cells.nth(cellNum);
        const cellText = (await cell.getAttribute('title') || await cell.textContent())?.trim();

        if (cellText === rowIdentifier) {
          const targetCell = row.getByRole("gridcell").nth(columnIndex);
          await targetCell.scrollIntoViewIfNeeded();
          if (await targetCell.getByTestId("companyNameAndIndustry").isVisible()) {
            return [
              await targetCell.getByTestId("companyName").textContent(),
              await targetCell.getByTestId("industry").textContent()
            ]
          }
          else {
            return (await targetCell.textContent())?.trim() || null;
          }
        }
      }
    }

    throw new Error(`Row with "${rowIdentifier}" not found`);
  }

  /**
   * THIS METHOD WAS DEPRECATED
   * Retrieves the text of a cell by row index and column label.
   *
   * @param rowIndex - The zero-based index of the row.
   * @param columnLabel - The column header label.
   * @param module - (Optional) The module context.
   * @returns The cell text.
   * @Usage The module name is taken from the SideNavBar.
   * @Example await manageROListingPage.table().getCellText(1, 'Phone', 'TPA');
   */
  async getCellText_old(rowIndex: number, columnLabel: string, module?: string): Promise<string> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const colId = this.getColId(columnLabel, module);

    const row = this.page.getByRole("row").nth(rowIndex);
    await row.scrollIntoViewIfNeeded();

    const cell = row.locator(`[role="gridcell"][col-id="${colId}"]`);

    return (await cell.getAttribute('title')) || '';
  }

  /**
   * Retrieves the text content of a cell in an AG Grid table by row index and column label.
   *
   * @param rowIndex - The zero-based index of the row to retrieve the cell from.
   * @param columnLabel - The label of the column to identify the cell.
   * @returns A promise that resolves to either:
   *   - A string containing the cell's text content,
   *   - An array of strings if the cell contains both company name and industry,
   *   - Or `null` if the cell has no text content.
   */
  async getCellText(rowIndex: number, columnLabel: string): Promise<string | null | string[]> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const columnIndex: number = await this.getColumnIndex(columnLabel);

    const row = this.element.getByRole("row").nth(rowIndex);
    await row.scrollIntoViewIfNeeded();

    const cell = row.getByRole("gridcell").nth(columnIndex);

    if (await cell.getByTestId("companyNameAndIndustry").isVisible()) {
      return [
        await cell.getByTestId("companyName").textContent(),
        await cell.getByTestId("industry").textContent()
      ]
    }

    return (await cell.textContent())?.trim() || null;
  }

  /**
   * Maps a human-readable column label to its AgGrid "col-id".
  *
  * @param label - The column header label.
  * @param module - (Optional) The module context (e.g., 'tpa', 'insurer', 'broker').
  * @returns The resolved "col-id" string for the column.
  */
  private getColId(label: string, module?: string): string {
    const cleaned = label.trim();
    const labelName = cleaned.toLowerCase().replace(/\s+/g, "");

    const specialLabels: Record<string, string> = {
      "brokercompanyname": "companyName",
      "brokercontactname": "contactName",
      "companyaccountmanager": "accountManager",
      "contact": "contacts",
      "contacts": "contacts",
      "configurationstatus": "policyStep",
      "industry": "industrySegment",
      "insurercontactname": "contactName",
      "insurercompanyname": "companyName",
      "insurerendorsementid": "confirmationId",
      "leadcrm": "leadCRM",
      "policynumber": "insurerPolicyNumber",
      "policypremium(#count)": "policyPremium",
      "prioritylevel": "priority",
      "premium(wost)": "premium",
      "rocreationdate": "opportunityCreationDate",
      "ro/policyexpiry": "expectedCloseDate",
      "ropremium(#count)": "roPremium",
      "rostatus": "state",
      "socreationdate": "opportunityCreationDate",
      "soexpirydate": "expectedCloseDate",
      "sopremium(#count)": "soPremium",
      "sostatus": "state",
      "tpacompanyname": "companyName",
      "tpacontactname": "contactName",
      "tpaerrorfile": "actions",
      "type": "companyType"
    };

    // Module-specific overrides for certain labels
    if (labelName === "address") {
      switch (module?.toLowerCase()) {
        case "tpa": return "tpaAddresses";
        case "insurer": return "insurerAddresses";
        case "broker": return "brokerAddresses";
        default: return "addresses";
      }
    }

    if (labelName === 'brokerage') {
      const mod = module?.replace(/\s+/g, "").toLowerCase();
      if (["myro", "myso", "mycompanies"].includes(mod) || "") return "estimatedBrokerage";
    }

    if (["city", "state"].includes(labelName)) {
      const mod = module?.replace(/\s+/g, "").toLowerCase();
      if (labelName === "city" && mod === "company") return "city";
      return labelName + "Id";
    }

    if (labelName === 'contact') {
      const mod = module?.replace(/\s+/g, "").toLowerCase();
      if (["myso", "myro"].includes(mod) || "") return "contacts";
    }

    if (labelName === 'currency') {
      const mod = module?.replace(/\s+/g, "").toLowerCase();
      if (["managecompany"].includes(mod) || "") return "currency.value";
    }

    if (["department", "designation"].includes(labelName)) {
      const mod = module?.replace(/\s+/g, "").toLowerCase() || "";
      const modules = ["tpacontacts", "brokercontacts"];
      if (modules.includes(mod)) {
        return labelName === "department" ? "department.name" : "designation.name";
      }
    }

    if (["phone", "phoneno"].includes(labelName)) {
      const modules = ["insurer", "broker", "tpa"];
      return modules.includes(module?.toLowerCase() || "") ? "phoneNumber" : "phone";
    }

    if (labelName === 'policynumber') {
      const mod = module?.replace(/\s+/g, "").toLowerCase();
      if (["managepolicies"].includes(mod) || "") return "insurerPolicyNumber";
      if (["myro"].includes(mod) || "") return "policyId";
    }

    if (labelName === 'policytype') {
      const mod = module?.replace(/\s+/g, "").toLowerCase();
      if (["mycompanies"].includes(mod) || "") return "policyType.value";
    }

    return specialLabels[labelName] ?? StringUtils.toCamelCase(cleaned);
  }


  /**
  * Retrieves the column index for a given column label.
  *
  * @param columnLabel - The column header label.
  * @returns The column index (zero-based).
  * @returns -1 for Column not found in the table.
  */
  async getColumnIndex(columnLabel: string): Promise<number> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const headers: string[] = await this.getVisibleHeaders();

    return headers.indexOf(columnLabel);
  }


  /**
  * THIS METHOD WAS DEPRECATED
  * Retrieves all column values from a given column label.
  *
  * @param columnLabel - The column header label.
  * @param module - (Optional) The module context.
  * @returns An array of string values from the column within the current page.
  * @Usage The module name is taken from the SideNavBar.
  * @Example await manageROListingPage.table().getColumnValues('State', 'TPA');
  */
  async getColumnValues_old(columnLabel: string, module?: string): Promise<string[]> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const colId = this.getColId(columnLabel, module);
    const rows = this.page.locator('[role="row"]');
    const count = await rows.count();
    const values: string[] = [];

    for (let i = 1; i < count; i++) {
      const cell = rows.nth(i).locator(`[role="gridcell"][col-id="${colId}"]`);
      await cell.scrollIntoViewIfNeeded();
      const text = (await cell.textContent())?.trim() || '';
      values.push(text);
    }
    return values;
  }

  /**
   * Retrieves the text content of all cells in a specified column of an AG Grid table.
   *
   * @param columnLabel - The label of the column whose values are to be retrieved.
   * @returns A promise that resolves to an array of strings, each representing the trimmed text content of a cell in the specified column (excluding the header row).
   * @throws Will throw an error if the column label does not exist or if the operation times out.
   */
  async getColumnValues(columnLabel: string): Promise<string[]> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const columnIndex: number = await this.getColumnIndex(columnLabel);
    const rows = this.element.getByRole("row");
    const numberOfRows = await rows.count();
    const columnValues: string[] = [];

    for (let rowIndex = 1; rowIndex < numberOfRows; rowIndex++) {
      const row: Locator = rows.nth(rowIndex);
      const cell: Locator = row.getByRole("gridcell").nth(columnIndex);
      const text = (await cell.textContent())?.trim() || '';
      columnValues.push(text);
    }
    return columnValues;
  }

  /**
   * Retrieves the "No Data" overlay message if visible.
   *
   * @returns A trimmed string message, or null if not visible.
   */
  async getNoDataMessage(): Promise<string | null> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const noDataLocator = this.element.locator('.ag-overlay-no-rows-center');
    if (await noDataLocator.isVisible()) {
      return (await noDataLocator.innerText()).trim();
    }
    return null;
  }


  /**
   * Retrieves the total number of data rows (excluding header).
   *
   * @returns The row count.
   */
  async getRowCount(): Promise<number> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    return (await this.page.getByRole("row").count()) - 1;
  }


  /**
   * Gets a handle on the PaginationControls instance for managing pagination.
   *
   * @returns PaginationControls object.
   */
  async PageSize() {
    return new PaginationControls(this.page);
  }


  /**
   * Sorts the grid by a given column label.
   *
   * @param columnLabel - The column header label.
   * @param sortOrder - The desired sort order ('asc' | 'desc' | 'none'). Default is 'asc' in entire table.
   */
  async sortByColumn(columnLabel: string, sortOrder: 'asc' | 'desc' | 'none' = 'asc') {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    await this.element.waitFor({ state: 'visible' });
    await this.page.waitForLoadState("domcontentloaded");
    const headerCell = this.element.getByRole("columnheader", { name: columnLabel });

    while (!(await headerCell.getAttribute('aria-sort'))?.includes(sortOrder)) {
      await headerCell.click();
    }
  }


  /**
   * Returns all column header labels from the grid in visual order.
   * Scrolls horizontally to collect every header, sorts by column index,
   * and returns the ordered list of labels.
   */
  async getColumnHeaders(): Promise<string[]> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    await this.element.waitFor({ state: 'visible' });

    await setZoom(this.page, 20);
    const headerViewport = this.element.locator('.ag-header-viewport');
    try {
      const headerContainer = headerViewport.locator('.ag-header-container');
      const headerCells = headerContainer.locator('.ag-header-cell[role="columnheader"]');
      const headerInfo: { label: string, index: number }[] = [];
      const seen = new Set<string>();

      // Reset scroll to far left and wait for grid to stabilize
      await headerViewport.evaluate(el => { el.scrollLeft = 0; });
      await this.page.waitForTimeout(500);

      // Get total columns from aria-colcount
      const totalCols = await this.element.locator('.ag-root').getAttribute('aria-colcount');
      const expectedCount = totalCols ? parseInt(totalCols) : 0;

      // Scroll incrementally until we've collected all expected headers or can't scroll further
      let lastScrollLeft = -1;
      let attempts = 0;
      const maxAttempts = 200;

      while (attempts < maxAttempts) {
        // Collect visible headers at current scroll position
        const count = await headerCells.count();
        for (let i = 0; i < count; i++) {
          const cell = headerCells.nth(i);
          const label = await cell.locator('.ag-header-cell-text').textContent();
          const ariaIndex = await cell.getAttribute('aria-colindex');
          if (label && ariaIndex) {
            const trimmed = label.trim();
            const index = parseInt(ariaIndex);
            if (!seen.has(trimmed)) {
              headerInfo.push({ label: trimmed, index });
              seen.add(trimmed);
            }
          }
        }

        // Check if we've collected all columns
        if (expectedCount > 0 && headerInfo.length >= expectedCount) {
          break;
        }

        // Get current scroll position and dimensions
        const scrollInfo = await headerViewport.evaluate((el) => ({
          left: el.scrollLeft,
          width: el.clientWidth,
          scrollWidth: el.scrollWidth
        }));

        // Check if we've reached the end or can't scroll further
        if (scrollInfo.left >= scrollInfo.scrollWidth - scrollInfo.width || scrollInfo.left === lastScrollLeft) {
          break;
        }

        lastScrollLeft = scrollInfo.left;

        // Scroll by viewport width for faster traversal
        await headerViewport.evaluate((el) => {
          el.scrollLeft = el.scrollLeft + el.clientWidth;
        });
        await this.page.waitForTimeout(150);
        attempts++;
      }

      // Sort by aria-colindex to match visual order
      headerInfo.sort((a, b) => a.index - b.index);

      return headerInfo.map(h => h.label);
    } finally {
      // Restore defaults to avoid impacting subsequent steps
      await headerViewport.evaluate(el => { el.scrollLeft = 0; }).catch(() => {});
      await setZoom(this.page, 100);
    }
  }

  /**
   * Opens the filter respective to particular column name
   * @param columnLabel -Column Name
   */
  async openFilterIcon(columnLabel: string) {
    const trimmedLabel = columnLabel.trim();
    const filterBtn = this.element.locator(
      `.ag-header-cell[role="columnheader"]` +
      `:has(.ag-header-cell-text:has-text("${trimmedLabel}"))` +
      ` [data-ref="eFilterButton"]`
    ).first();
    await filterBtn.click();
  }

  /**
 * Open the Filter of respective label and Fills the column filter with up to two conditions.
 *
 * @param columnLabel Column header text
 * @param filtercriteria1    First operator text (e.g., "Contains")
 * @param filterValue1   First value (required)
 * @param operator  "AND" | "OR" (optional)
 * @param filterCriteria2    Second operator (optional)
 * @param filterValue2   Second value (optional)
 */

  async setFilter(
    columnLabel: string,
    filtercriteria1: string,
    filterValue1?: string,
    operator?: "AND" | "OR",
    filterCriteria2?: string,
    filterValue2?: string
  ) {
    await this.openFilterIcon(columnLabel);
    const menu = this.page.locator('.ag-menu.ag-filter-menu[aria-label="Column Filter"]').last();
    await menu.waitFor({ state: 'visible' });
    const pick = async (comboIndex: number, text?: string) => {
      if (!text) return;
      const combo = menu.getByRole('combobox', { name: /filtering operator/i }).nth(comboIndex);
      if ((await combo.getAttribute('aria-expanded')) !== 'true') await combo.click();
      const listId = await combo.getAttribute('aria-controls');
      const list = listId ? this.page.locator(`#${listId}`) : this.page.locator('[role="listbox"][id^="ag-select-list-"]').last();
      await list.waitFor({ state: 'visible' });
      const trimmedText = text.trim();
      await list.getByRole('option', { name: trimmedText }).click();
    };
    await pick(0, filtercriteria1);
    if (filterValue1 !== undefined) {
      const fc1 = menu.locator('.ag-filter-from [data-ref="eInput"]').first();
      await fc1.fill('');
      await fc1.type(filterValue1);
    }
    if (operator) {
      await menu.getByRole('radio', { name: `${operator}` }).check({ force: true });
    }
    await pick(1, filterCriteria2);

    if (filterValue2 !== undefined) {
      const fc2 = menu.locator('.ag-filter-body').nth(1)
        .locator('.ag-filter-from [data-ref="eInput"]').first();
      await fc2.fill("");
      await fc2.type(filterValue2);
    }
    await this.page.keyboard.press('Escape');
  }

  /**
 * Unsets the filter for a specific column.
 * - If the current filter options are "blank" or "notBlank", changes the criteria to "contains" with empty value
 * - For other filter options, clears the filter values to unset the filter
 * 
 * @param columnLabel - The column header label to unset filter for
 */
  async resetFilter(columnLabel: string) {
    await this.openFilterIcon(columnLabel);
    const menu = this.page.locator('.ag-menu.ag-filter-menu[aria-label="Column Filter"]').last();
    await menu.waitFor({ state: 'visible' });
    const firstCombo = menu.getByRole('combobox', { name: /filtering operator/i }).nth(0);
    const currentCriteria = (await firstCombo.textContent())?.trim() || '';
    if (currentCriteria === 'blank' || currentCriteria === 'notBlank') {
      if ((await firstCombo.getAttribute('aria-expanded')) !== 'true') await firstCombo.click();
      const listId = await firstCombo.getAttribute('aria-controls');
      const list = listId ? this.page.locator(`#${listId}`) : this.page.locator('[role="listbox"][id^="ag-select-list-"]').last();
      await list.waitFor({ state: 'visible' });
      await list.getByRole('option', { name: 'Contains' }).click();
      const fc1 = menu.locator('.ag-filter-from [data-ref="eInput"]').first();
      await fc1.fill('');
    } else {
      const fc1 = menu.locator('.ag-filter-from [data-ref="eInput"]').first();
      await fc1.fill('');
      const fc2 = menu.locator('.ag-filter-body').nth(1).locator('.ag-filter-from [data-ref="eInput"]').first();
      if (await fc2.count() > 0) {
        await fc2.fill('');
      }
    }
    await this.page.keyboard.press('Escape');
  }

  /**
* Open the Filter of respective label and edits the column filter with up to two conditions.
*
* @param columnLabel Column header text
* @param filtercriteria1    First operator text (e.g., "Contains")
* @param filterValue1   First value (required)
* @param operator  "AND" | "OR" (optional)
* @param filterCriteria2    Second operator (optional)
* @param filterValue2   Second value (optional)
*/
  async editFilter(columnLabel: string,
    filtercriteria1: string,
    filterValue1?: string,
    operator?: "AND" | "OR",
    filterCriteria2?: string,
    filterValue2?: string) {
    return this.setFilter(columnLabel,
      filtercriteria1,
      filterValue1,
      operator,
      filterCriteria2,
      filterValue2);
  }

  /**
   * checks if a column has active filter or not
   * @param label is column name
   * @returns true if input column have active filter, and false if it donot contain a active filter
   */
  async hasActiveFilter(label: string): Promise<boolean> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });
    const trimmedLabel = label.trim();
    const header = this.element
      .locator(
        `.ag-header-cell[role="columnheader"]` +
        `:has(.ag-header-cell-text:has-text("${trimmedLabel}"))`
      )
      .first();

    if ((await header.count()) === 0) {
      throw new Error(`Column header not found: "${label}"`);
    }
    const activeBtn = header.locator('[data-ref="eFilterButton"].ag-filter-active');
    return await activeBtn.isVisible();
  }

  /**
   * Gets the current filter content for a specific column and returns it in JSON format.
   * 
   * @param columnLabel - The column header label to get filter content for
   * @returns Promise<object> - JSON object containing filter criteria, values, and operator
   */
  async getFilterContent(columnLabel: string): Promise<object> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });

    await this.openFilterIcon(columnLabel);
    const menu = this.page.locator('.ag-menu.ag-filter-menu[aria-label="Column Filter"]').last();
    await menu.waitFor({ state: 'visible' });

    const filterContent: any = {
      columnLabel: columnLabel,
      criteria1: null,
      value1: null,
      operator: null,
      criteria2: null,
      value2: null,
    };

    try {
      const firstCombo = menu.getByRole('combobox', { name: /filtering operator/i }).nth(0);
      if (await firstCombo.count() > 0) {
        filterContent.criteria1 = (await firstCombo.textContent())?.trim() || '';
      }
      const fc1 = menu.locator('.ag-filter-from [data-ref="eInput"]').first();
      if (await fc1.count() > 0) {
        filterContent.value1 = await fc1.inputValue();
        if (filterContent.value1 == "") {
          filterContent.operator == null;
        }
        else {
          const andRadio = menu.getByRole('radio', { name: 'AND' });
          const orRadio = menu.getByRole('radio', { name: 'OR' });

          if (await andRadio.isChecked()) {
            filterContent.operator = 'AND';
          } else if (await orRadio.isChecked()) {
            filterContent.operator = 'OR';
          }
        }
        // Get second filter criteria
        const secondCombo = menu.getByRole('combobox', { name: /filtering operator/i }).nth(1);
        if (await secondCombo.count() > 0) {
          filterContent.criteria2 = (await secondCombo.textContent())?.trim() || '';
        }

        // Get second filter value
        const fc2 = menu.locator('.ag-filter-body').nth(1).locator('.ag-filter-from [data-ref="eInput"]').first();
        if (await fc2.count() > 0) {
          filterContent.value2 = await fc2.inputValue();
        }
      }

    } catch (error) {
      console.warn(`Error reading filter content for column "${columnLabel}":`, error);
    } finally {
      // Close the filter menu
      await this.page.keyboard.press('Escape');
    }

    return filterContent;
  }

  /**
   * Checks if a particular column label has a filter icon present.
   * 
   * @param columnLabel - The column header label to check for filter icon
   * @returns True if filter icon is present, false otherwise
   */
  async isFilterPresent(columnLabel: string): Promise<boolean> {
    await this.globalLoader.waitFor({ state: "detached", timeout: TIMEOUTS.API_TIMEOUT });

    const trimmedLabel = columnLabel.trim();

    // Check if the filter button exists for this column
    const filterButton = this.element.locator(
      `.ag-header-cell[role="columnheader"]` +
      `:has(.ag-header-cell-text:has-text("${trimmedLabel}"))` +
      ` [data-ref="eFilterButton"]`
    ).first();

    return await filterButton.count() > 0 && await filterButton.isVisible();
  }

  /**
 * Waits until the input timeout
 * @param timeout required timeout
 */
  async wait(timeout: number) {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Retrieves the visible column header texts from the AG Grid element.
   *
   * @returns A promise that resolves to an array of strings, each representing the text of a visible column header.
   */
  private async getVisibleHeaders(): Promise<string[]> {
    return await this.element.getByRole("columnheader").allInnerTexts();
  }
}
