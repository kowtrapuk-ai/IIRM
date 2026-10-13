import { expect, type Locator, type Page } from '@playwright/test';
import { PageUtils } from '../utils/pageutils';
import { TextElement } from '../framework/text.element';
import { ButtonElement } from '../framework/button.element';
import { TextAreaElement } from '../framework/textarea.element';
import { RichTextElement } from '../framework/richtext.element';
import { ComboBoxElement } from '../framework/combobox.element';
import { ListBoxElement } from '../framework/listbox.element';
import { RadioElement } from '../framework/radio.element';
import { TableSettings } from './TableSettings';
import { StringUtils } from '../utils/stringutils';
// import { CheckBoxElement } from '../utils/checkbox.element';
import { DateElement } from '../framework/date.element';
import { AgGrid } from '../framework/aggrid.element';

export class ManageCompanyPage {
    readonly page: Page;

    // SEARCH PANEL
    readonly searchByCompanyName: TextElement;
    readonly search: ButtonElement;
    readonly filter: ButtonElement;
    readonly type: ComboBoxElement;
    readonly industry: ComboBoxElement;
    readonly priority: ComboBoxElement;
    readonly city: ComboBoxElement;
    readonly reset: ButtonElement;
    readonly collapse: ButtonElement;
    readonly selectedFilters : Locator;

    // KPIs Section
    readonly myLeadsCard: Locator;
    readonly myProspectsCard: Locator;
    readonly myQCRCard: Locator;
    readonly myClientsCard: Locator;

    // Data grid
    readonly listOfCompanies: Locator;
    readonly tableSettings: ButtonElement;
    readonly createNewCompany: ButtonElement;

    readonly companyList: AgGrid;
    readonly tableInfo: Locator;
    readonly tableSize: ListBoxElement;
    private readonly paginationControls: Locator;
    readonly previousPage: Locator;
    readonly nextPage: Locator;
    

    constructor( page: Page) {
        this.page = page;

        // SEARCH PANEL
        this.searchByCompanyName = new TextElement(page, page.getByTestId('search-by-companyname1').locator('input'));
        // this.search = new ButtonElement(page, page.getByRole('button', { name: 'Search' }));
        this.search = new ButtonElement(page, page.locator(".search-icon"));
        this.filter = new ButtonElement(page, page.locator('.filter-icon'));
        this.type = new ComboBoxElement(page, page.getByTestId('form-field-select-companyType').locator('input'));
        this.industry = new ComboBoxElement(page, page.getByTestId('form-field-select-industrySegment').locator('input'));
        this.priority = new ComboBoxElement(page, page.getByTestId('form-field-select-priority').locator('input'));
        this.city = new ComboBoxElement(page, page.getByTestId('form-field-select-city').locator('input'));
        this.reset = new ButtonElement(page, page.getByRole('button', { name: 'Reset' }));
        this.collapse = new ButtonElement(page, page.getByRole('button', { name: 'Collapse' }));
        this.selectedFilters = page.getByTestId('selected-filters').locator('div').nth(0);

        // KPIs Section
        this.myLeadsCard = page.getByTestId('my-leads-card').locator('p').nth(0);
        this.myProspectsCard = page.getByTestId('my-prospects-card').locator('p').nth(0);
        this.myQCRCard = page.getByTestId('qcr-card').locator('p').nth(0);
        this.myClientsCard = page.getByTestId('my-clients-card').locator('p').nth(0);

        // Data grid
        this.listOfCompanies = page.locator("h1:has-text('List of records')");
        this.tableSettings = new ButtonElement(page, page.getByRole('button', { name: 'Table settings' }));
        this.createNewCompany = new ButtonElement(page, page.getByRole('button', { name: 'Create new company' }));
        this.companyList = new AgGrid(page, page.getByTestId('ServerSideGrid'));

        // Pagination controls
        this.tableInfo = page.getByTestId('pagination-entries-info');
        this.tableSize = new ListBoxElement(page, page.getByTestId('page-size'));
        this.paginationControls = page.getByTestId('pagination-nav-pages-info');
        this.previousPage = this.page.getByAltText('Previous');
        this.nextPage = this.page.getByAltText('Next');
    }

    async wait(timeout: number) {
        await this.page.waitForTimeout(timeout);
    }

    async get_activeFilters(): Promise<string[] | null> {
        const filter_count : number = await this.selectedFilters.locator('span').count();
        const values: string[] = [];
        let filter : string;
            
            if (filter_count === 0) {
                return null;
            }
            // Wait for the selected filters to be visible
            // await this.selectedFilters.waitFor({ state: 'visible' });

            // Get the text content of the selected filters
            // const filters = await this.selectedFilters.innerText(); // THIS WORKS
            // return filters; // THIS WORKS
            for (let cnt=0; cnt < filter_count; cnt++) {
                filter = '';
                filter = filter + await this.selectedFilters.locator('span').nth(cnt).textContent();
                filter = filter + await this.selectedFilters.locator('span').nth(cnt+1).textContent();
                values.push(filter);
                cnt++;
            }
        return values;
    }

    async get_currentPage(): Promise<string | null> {
        return this.paginationControls.locator('//button[@aria-current="page"]').textContent();
    }

    async tableSettings_drawer() {
        return new TableSettings(this.page);
    }
        
}