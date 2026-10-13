import { test, expect } from "../../../fixtures/iwork";
import { LoginPage } from '../../../pages/Login.page';
import { NavBarPage } from '../../../pages/Navbar.page';
import { ManageEntityListing } from '../../../pages/ManageEntityListing.template';
import { loadEnvConfig, Utils } from '../../../utils/utils';
import { AddTPAPage } from '../../../pages/AddTPA.page';
import { chromium } from "playwright";
import { TIMEOUTS } from "../../../env/timeouts";

const config = loadEnvConfig(process.env.ENV || 'qa');

//Test data
const TPAData: any = Utils.loadTestData('testdata/ui/functionaltests/iirm2227/iirm2227_TPA.json');
const TPAAddressData: any = Utils.loadTestData('testdata/ui/functionaltests/iirm2227/iirm2227_TPAAddress.json');
const TPAWithSpecialCharactersData: any = Utils.loadTestData('testdata/ui/functionaltests/iirm2227/iirm2227_TPASpecialCharacters.json');

const randomNum: number = Utils.getRandomNumber(1000, 9999);
const TPAName: string = `${TPAData.TPAName}_${randomNum}`;
const TPAWithSpecialCharactersName: string = `${TPAWithSpecialCharactersData.TPAName}_${randomNum}`;


test.describe('TPA Creation: Verify in overview page,list page and edit page.', { tag: '@TPA,@iirm2227' }, () => {

  test.beforeAll('Creating TPA', async ({ }) => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const addTPAPage = new AddTPAPage(page);
    const loginPage = new LoginPage(page);
    const manageTPAPage = new ManageEntityListing(page);
    const navBar = new NavBarPage(page);

    await loginPage.open("/");
    await loginPage.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);

    await navBar.open('My Service Portfolio', 'Manage TPA');
    await manageTPAPage.button('Add TPA').click();

    await addTPAPage.enterTPADetails(TPAData, TPAAddressData, randomNum, false);
    await addTPAPage.submit.click();

  });


  test('1. Searching and verifying the Created TPA by Full name', async ({ addTPAPage, tpaDetailsPage, loginPage, manageTPAPage, navBar }) => {

    await loginPage.open("/");
    await loginPage.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);

    await navBar.open('My Service Portfolio', 'Manage TPA');
    await addTPAPage.searchForField(manageTPAPage, TPAName);
    await addTPAPage.wait(TIMEOUTS.SEARCH_TIMEOUT);

    const found = await addTPAPage.validateTPAListPage(manageTPAPage, TPAName, TPAAddressData);
    expect(found, `"${TPAName}" not found after searching`).toBe(true);

    await addTPAPage.wait(TIMEOUTS.CLICK_TIMEOUT);

    await manageTPAPage.table().click_on('TPA name', TPAName);
    await addTPAPage.validateTPAOverviewPage(tpaDetailsPage, TPAData, TPAAddressData, TPAName);

    await addTPAPage.validateTPAEditPage(tpaDetailsPage, TPAAddressData);
    await addTPAPage.update.click();
    await addTPAPage.wait(TIMEOUTS.API_TIMEOUT);

    //Verifying Search functionality on city field

    await navBar.open('My Service Portfolio', 'Manage TPA');
    await addTPAPage.wait(TIMEOUTS.CLICK_TIMEOUT);

    await addTPAPage.searchForField(manageTPAPage, TPAAddressData[0].city);
    await addTPAPage.wait(TIMEOUTS.CLICK_TIMEOUT);
    expect(await manageTPAPage.table().getRowCount(), "The search functionality is not working on city field").not.toBe(0);

  });


  test('2. Searching and verifying the created TPA by partial name', async ({ addTPAPage, loginPage, manageTPAPage, navBar }) => {

    const TPAPartialName = TPAName.substring(0, 3);

    await loginPage.open("/");
    await loginPage.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);

    await navBar.open('My Service Portfolio', 'Manage TPA');

    await addTPAPage.searchForField(manageTPAPage, TPAPartialName);

    const found = await addTPAPage.validateTPAListPage(manageTPAPage, TPAName, TPAAddressData);
    expect(found, `"${TPAName}" not found after checking all pages`).toBe(true);


  });


  test('3. Searching and verifying the created TPA with Casesensitive name', async ({ addTPAPage, tpaDetailsPage, loginPage, manageTPAPage, navBar }) => {

    const TPACaseSensitiveName = TPAName.toUpperCase();

    await loginPage.open("/");
    await loginPage.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);

    await navBar.open('My Service Portfolio', 'Manage TPA');
    await addTPAPage.searchForField(manageTPAPage, TPACaseSensitiveName);
    await addTPAPage.wait(TIMEOUTS.SEARCH_TIMEOUT);

    const found = await addTPAPage.validateTPAListPage(manageTPAPage, TPAName, TPAAddressData);
    expect(found, `"${TPAWithSpecialCharactersName}" not found after searching`).toBe(true);
    await addTPAPage.wait(TIMEOUTS.SEARCH_TIMEOUT);

    await manageTPAPage.table().click_on('TPA name', TPAName);
    await addTPAPage.validateTPAOverviewPage(tpaDetailsPage, TPAData, TPAAddressData, TPAName);

    await addTPAPage.validateTPAEditPage(tpaDetailsPage, TPAAddressData);
    await addTPAPage.update.click();
    await addTPAPage.wait(TIMEOUTS.API_TIMEOUT);



  });


  test('4. Searching and verifying the Created TPA with Leading and trailing spaces in the Full name', async ({ addTPAPage, tpaDetailsPage, loginPage, manageTPAPage, navBar }) => {

    const TPALeadingTrailingSpacesName = `   ${TPAName}   `;

    await loginPage.open("/");
    await loginPage.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);

    await navBar.open('My Service Portfolio', 'Manage TPA');
    await addTPAPage.searchForField(manageTPAPage, TPALeadingTrailingSpacesName);
    await addTPAPage.wait(TIMEOUTS.SEARCH_TIMEOUT);

    const found = await addTPAPage.validateTPAListPage(manageTPAPage, TPAName, TPAAddressData);
    expect(found, `"${TPAName}" not found after searching`).toBe(true);

    await addTPAPage.wait(TIMEOUTS.CLICK_TIMEOUT);

    await manageTPAPage.table().click_on('TPA name', TPAName);
    await addTPAPage.validateTPAOverviewPage(tpaDetailsPage, TPAData, TPAAddressData, TPAName);

    await addTPAPage.validateTPAEditPage(tpaDetailsPage, TPAAddressData);
    await addTPAPage.update.click();
    await addTPAPage.wait(TIMEOUTS.API_TIMEOUT);


  });


  test('5. Searching and verifying the Created TPA by Special characters name', async ({ addTPAPage, tpaDetailsPage, loginPage, manageTPAPage, navBar }) => {

    await loginPage.open("/");
    await loginPage.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);

    await navBar.open('My Service Portfolio', 'Manage TPA');
    await manageTPAPage.button('Add TPA').click();

    await addTPAPage.enterTPADetails(TPAWithSpecialCharactersData, TPAAddressData, randomNum, false);
    await addTPAPage.submit.click();
    await addTPAPage.wait(TIMEOUTS.API_TIMEOUT);

    await addTPAPage.validateTPAOverviewPage(tpaDetailsPage, TPAWithSpecialCharactersData, TPAAddressData, TPAWithSpecialCharactersName);
    await addTPAPage.validateTPAEditPage(tpaDetailsPage, TPAAddressData);
    await addTPAPage.update.click();
    await addTPAPage.wait(TIMEOUTS.API_TIMEOUT);

    await navBar.open('My Service Portfolio', 'Manage TPA');

    await addTPAPage.searchForField(manageTPAPage, TPAWithSpecialCharactersName);
    await addTPAPage.wait(TIMEOUTS.SEARCH_TIMEOUT);

    const found = await addTPAPage.validateTPAListPage(manageTPAPage, TPAWithSpecialCharactersName, TPAAddressData);
    expect(found, `"${TPAWithSpecialCharactersName}" not found after searching`).toBe(true);
    await addTPAPage.wait(TIMEOUTS.CLICK_TIMEOUT);


  });


  test('6. Searching and verifying with non-existing TPA (Negative case)', async ({ addTPAPage, loginPage, manageTPAPage, navBar }) => {

    const TPANoDataName = "TPA@123";

    await loginPage.open("/");
    await loginPage.login(config.LOGIN.USERNAME, config.LOGIN.PASSWORD);

    await navBar.open('My Service Portfolio', 'Manage TPA');
    await addTPAPage.searchForField(manageTPAPage, TPANoDataName);

    const rowCount = await manageTPAPage.table().getRowCount();
    expect(rowCount, `No data found for the TPA name: ${TPANoDataName}`).toBe(0);

  });


});
