import { expect, Locator, Page } from '@playwright/test';
import { ButtonElement } from '../framework/button.element';
import { TextElement } from '../framework/text.element';
import { Address } from '../classes/Address';
import { SelectElement } from '../framework/select.element';
import { RichTextElement } from '../framework/richtext.element';
import { TIMEOUTS } from '../env/timeouts';
import { ManageEntityListing } from './ManageEntityListing.template';
import { formatAddress } from '../utils/addressutils';

export class AddTPAPage {
    readonly page: Page;
    readonly ManageTPAButton: ButtonElement;

    readonly tpaName: TextElement;
    readonly displayName: TextElement;
    readonly typeOfCompany: SelectElement;
    readonly country: SelectElement;
    readonly website: TextElement;
    readonly remarks: RichTextElement;
    readonly remove: ButtonElement;
    readonly addAddress: ButtonElement;
    readonly submit: ButtonElement;
    readonly update: ButtonElement;
    readonly searchByTPAName: TextElement;

    constructor(page: Page) {

        this.page = page;

        this.tpaName = new TextElement(page, page.getByTestId('form-field-text-tpaName').locator('input'), page.getByTestId('form-field-text-tpaName').locator('.MuiFormHelperText-root.Mui-error'));
        this.displayName = new TextElement(page, page.getByTestId('form-field-text-displayName').locator('input'), page.getByTestId('form-field-text-displayName').locator('p.MuiFormHelperText-root.Mui-error'));
        this.typeOfCompany = new SelectElement(page, 'form-field-select-companyTypeLid');
        this.country = new SelectElement(page, 'form-field-select-countryId')
        this.website = new TextElement(page, page.getByTestId('form-field-text-website').locator('input'), page.getByTestId('form-field-text-website').locator('.MuiFormHelperText-root.Mui-error'));
        this.remarks = new RichTextElement(page, page.getByTestId('form-field-richtext-remarks'), page.getByTestId('form-field-richtext-remarks').locator('p').nth(2));
        this.addAddress = new ButtonElement(page, page.getByAltText('Add'));
        this.submit = new ButtonElement(page, page.getByTestId('submit-button'));
        this.update = new ButtonElement(page, page.getByRole('button', { name: 'Update' }));  // Update button for edit
        this.remove = new ButtonElement(page, page.getByRole('button', { name: 'Remove' }));
    }

    /**
     * Utility method to convert empty strings to 'N/A'.
     * @param dataFromJson - string to check.
     * @returns "N/A" if empty, otherwise original string.
     */
    async checkForNA(dataFromJson: string): Promise<string> {
        return dataFromJson === "" ? "N/A" : dataFromJson;
    }

    async enterTPADetails(tpaData: any, tpaAddressData: any[], randomNum: number, isCountryEditable?: boolean): Promise<void> {

        const TPAName = tpaData.tpaName + (randomNum ? `_${randomNum}` : '');

        await this.tpaName.enter(TPAName);
        await this.displayName.set(TPAName);

        if (isCountryEditable) {
            await this.country.set(tpaData.country);
        }
        await this.page.waitForTimeout(500);

        await this.typeOfCompany.set(tpaData.typeOfCompany);


        await this.website.set(tpaData.website);
        if (this.remarks) {
            await this.remarks.click();
            await this.remarks.set(tpaData.remarks);
        }
        for (let i = 0; i < tpaAddressData.length; i++) {
            if (i > 0) {
                await this.addAddress.click();
            }
            const address = new Address(this.page, i);
            await address.set(tpaAddressData[i], true, false);
        }
    }

    /**
         *  Validates the TPA Edit page fields, including addresses and disabled fields.
         *  After validation, clicks Submit and verifies the Overview page.
         *  @param tpaDetailsPage - the page object of the tpa details.
         *  @param addressData - array of address objects.
         */
    async validateTPAEditPage(tpaDetailsPage: any, addressData: any[]): Promise<void> {

        await tpaDetailsPage.edit.click();
        await this.page.waitForLoadState('networkidle');
        // Fields validation
        const tpaFields = [
            this.tpaName,
            this.displayName,
            this.typeOfCompany,
            this.country,
            this.website,
            this.remarks
        ];
        for (const field of tpaFields) {
            const currentField = await field.isdisabled();
            if (field === this.country) {
                expect(currentField, "Country field should be disabled").toBeTruthy();
            }
            else {
                expect(currentField, "Remaining fields should not be disabled").toBeFalsy();
            }
        }
        for (let index = 0; index < addressData.length; index++) {
            const address = new Address(this.page, index);
            const countryDisabled = await address.addressCountry.isdisabled();
            expect(countryDisabled, "Country field should be disabled").toBeTruthy();
            const addressFields = [
                address.addressType,
                address.addressLine1,
                address.addressLine2,
                address.addressArea,
                address.addressState,
                address.addressCity,
                address.addressPinCode,
                address.addressPhoneNumber,
                address.addressEmail,
                address.addressAlternatePhoneNumber,
                address.addressSupportNumber
            ];
            for (const field of addressFields) {
                const currentField = await field.isdisabled();
                expect(currentField, "Remaining fields should not be disabled").toBeFalsy();
            }
        }

    }

    /**
     * Validate tpa details in the List page.
     * @param manageTPAPage - TPA Listing page object.
     * @param tpaName - expected tpa name.
     * @param addressData - array of address objects.
     */
    async validateTPAListPage(manageTPAPage: ManageEntityListing, tpaName: string, addressData: any[]) {

        let pageNumber = 1;
        const totalPages = Number(await manageTPAPage.paginationControls().noOfPages());

        while (pageNumber <= totalPages) {

            const tpaNames = await manageTPAPage.table().getColumnValues('TPA name');
            const index = tpaNames.indexOf(tpaName);

            if (index !== -1) {
                const tpaAddress = (await manageTPAPage.table().getColumnValues('Address', 'TPA'))[index];
                const tpaCity = (await manageTPAPage.table().getColumnValues('City'))[index];
                const tpaState = (await manageTPAPage.table().getColumnValues('State'))[index];
                const tpaPhone = (await manageTPAPage.table().getColumnValues('Phone', 'TPA'))[index];

                expect(tpaNames[index], "Mismatch observed with TPA name in the table cell").toBe(tpaName);
                expect(tpaAddress, "Mismatch observed with Address got mismatched in the table cell").toBe(addressData[0].addressLine1);
                expect(tpaCity, "Mismatch observed with City got mismatched in the table cell").toBe(addressData[0].city);
                expect(tpaState, "Mismatch observed with State got mismatched in the table cell").toBe(addressData[0].state);
                expect(tpaPhone, "Mismatch observed with Phone number got mismatched in the table cell").toBe(addressData[0].phoneNumber);
                //Stop here dont go for pagination if the tpa is found
                return true;
            }

            // Move to next page if tpa not found
            pageNumber++;
            if (pageNumber <= totalPages) {
                await manageTPAPage.paginationControls().goToPage(pageNumber);
            }
        }
        return false; // TPA not found after checking all pages
    }

    /**
     * Validate tpa details on the Overview page, including Info Card and addresses.
     * @param tpaDetailsPage - page object for details page.
     * @param data - tpa data.
     * @param addressData - array of address objects.
     * @param tpaName - expected tpa name.
     */
    async validateTPAOverviewPage(tpaDetailsPage: any, data: any, addressData: any[], tpaName: string): Promise<void> {

        const TPAOverviewPage = tpaDetailsPage.getSectionDetails('TPA details');

        // Info Card validations
        expect(await tpaDetailsPage.infoCard.getTitle(), "Title got mismatched").toBe(data.displayName);
        expect(await tpaDetailsPage.infoCard.get("TPA code"), "TPA code got mismatched").toBe(data.tpaCode);
        expect(await tpaDetailsPage.infoCard.get("Insurance company type"), "Insurance company type got mismatched").toBe(data.insuranceCompanyType);
        expect(await tpaDetailsPage.infoCard.get("Company tag"), "Company tag got mismatched").toBe(data.companyTag);

        // TPA details validations
        expect(await TPAOverviewPage.get('TPA name'), "TPA name got mismatched").toBe(tpaName);
        expect(await TPAOverviewPage.get('Company type'), "Company type got mismatched").toBe(data.typeOfCompany);
        expect(await TPAOverviewPage.get('Website'), "Website got mismatched").toBe(data.website);
        expect(await TPAOverviewPage.get('Country'), "Country got mismatched").toBe(data.country);
        expect(await TPAOverviewPage.get('Remarks'), "Remarks got mismatched").toBe(data.remarks);

        // Address validations
        const actualTPAAddresses = await tpaDetailsPage.getAllAddresses();
        expect(actualTPAAddresses.length, "Address length got mismatched").toEqual(addressData.length);

        for (let index = 0; index < addressData.length; index++) {
            const expectedAddress = addressData[index];
            const addressToBeCompared = formatAddress(expectedAddress);
            const addressObj = await tpaDetailsPage.getAddress(`${expectedAddress.city}, ${expectedAddress.addressType}`);
            expect(addressObj.address, "Address got mismatched").toBe(addressToBeCompared);
            expect(addressObj.mobileNumber, "Mobile number got mismatched").toMatch(await this.checkForNA(expectedAddress.phoneNumber));
            expect(addressObj.landlineNumber, "Landline number got mismatched").toBe(await this.checkForNA(expectedAddress.alternatePhoneNumber));
            expect(addressObj.emailAddress, "Email address got mismatched").toMatch(await this.checkForNA(expectedAddress.emailAddress));
        }
    }


    /**
    * Performs search in the Manage TPA page using the provided search Field.
    * @param manageTPAPage - Page object for the ManageEntityListing.
    * @param searchField - The field to search for (tpa name, city, etc.).
    * */
    async searchForField(manageTPAPage: ManageEntityListing, searchField: string): Promise<void> {
        await manageTPAPage.smartSearch().search.set(searchField);
        await this.wait(TIMEOUTS.SEARCH_TIMEOUT);
        await manageTPAPage.smartSearch().searchIcon.click();
        await this.wait(TIMEOUTS.SEARCH_TIMEOUT);
    }

    async wait(timeout: number) {
        await this.page.waitForTimeout(timeout);
    }

}