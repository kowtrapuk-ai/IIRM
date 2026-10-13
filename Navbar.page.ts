import { Locator, Page } from '@playwright/test';
import { Utils } from '../utils/utils';
import { TIMEOUTS } from '../env/timeouts';
import { BasePage } from './Base.page';
import { Dialog } from '../appcomponents/Dialog.component';

/**
 * application's side navigation bar.
 * Provides methods to interact with and retrieve information from the side nav UI.
 */
export class NavBarPage extends BasePage {
    readonly page: Page;

    // Header Elements
    readonly pageTitle: string;

    // Top Nav Bar elements
    readonly topNavbar: Locator;
    readonly knowledgeCentral: Locator;
    readonly ilearn: Locator;
    readonly reminderIcon: Locator;
    readonly myMails: Locator;
    readonly feedBack: Locator;
    readonly username: Locator;
    readonly profileIcon: Locator;
    readonly usermenu: Locator;
    readonly configureFilePasswordOption: Locator;

    // Modal/Dialog Elements
    readonly passwordPreviewDialog: Dialog;

    // Page Elements
    readonly sideNavbar: Locator;
    readonly rightSideMenu: Locator;
    readonly expand: Locator;
    readonly collapse: Locator;

    //Right side Menu
    readonly expandRightMenu: Locator;
    readonly collapseRightMenu: Locator;

    // Current width of the navbars (used to determine expanded/collapsed state)
    sideNavBarWidth: string;
    rightSideMenuWidth: string;

    // Default widths declaration for expanded/collapsed states
    readonly EXPANDED_SIDE_NAV_BAR_WIDTH: string;
    readonly COLLAPSED_SIDE_NAV_BAR_WIDTH: string;
    readonly EXPANDED_RIGHT_SIDE_MENU_WIDTH: string;
    readonly COLLAPSED_RIGHT_SIDE_MENU_WIDTH: string;

    /**
     * Initializes the SideNavBarPage object.
     * @param page - Playwright Page instance used for browser interaction.
     */
    constructor(page: Page) {
        super(page);
        this.page = page;

        this.EXPANDED_SIDE_NAV_BAR_WIDTH = "270px";
        this.COLLAPSED_SIDE_NAV_BAR_WIDTH = "74px";
        this.EXPANDED_RIGHT_SIDE_MENU_WIDTH = "376px";
        this.COLLAPSED_RIGHT_SIDE_MENU_WIDTH = "0px";

        // Main navbar container
        this.sideNavbar = this.page.locator('.MuiDrawer-paperAnchorLeft');
        this.rightSideMenu = this.page.locator('.MuiDrawer-paperAnchorRight');

        // top nav bar elements
        this.topNavbar = this.page.locator('.MuiBox-root.css-1tmezml');
        this.knowledgeCentral = this.page.getByText('Knowledge Central');
        this.ilearn = this.page.getByText('iLearn');
        this.reminderIcon = this.page.getByAltText('reminder');
        this.myMails = this.page.getByText('My Mails');
        this.feedBack = this.page.getByText('FEEDBACK');
        this.username = this.page.getByTestId('logged-user-name');
        this.profileIcon = this.page.getByTestId('user-profile-icon');
        this.configureFilePasswordOption = this.page.getByRole('menuitem', { name: 'File Password' });

        // Modal/Dialog elements
        this.passwordPreviewDialog = new Dialog(this.page);

        // Button to expand/collapse the navbar
        this.expand = this.page.getByTestId("sidebar-toggle").getByRole('img', { name: 'toggle' }).first();
        this.collapse = this.page.getByTestId("sidebar-toggle").getByRole('img', { name: 'toggle' }).first();

        this.expandRightMenu = this.page.getByRole('img', { name: 'toggle' }).nth(1);
        this.collapseRightMenu = this.page.getByRole('img', { name: 'toggle' }).nth(1);

    }

    /**
     * Collapses the navbar if it is currently expanded.
     * Updates the internal `sideNavBarWidth` value after collapsing.
     */
    async collapseSideNavbar() {
        if (this.sideNavBarWidth === this.EXPANDED_SIDE_NAV_BAR_WIDTH) {
            await this.collapse.click();
            await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        }
        this.sideNavBarWidth = await Utils.getCssPropertyValue(this.sideNavbar, 'width');
    }

    /**
     * Expands the navbar if it is currently collapsed.
     * Updates the internal `sideNavBarWidth` value after expanding.
     */
    async expandSideNavbar() {
        if (this.sideNavBarWidth === this.COLLAPSED_SIDE_NAV_BAR_WIDTH) {
            await this.expand.click();
            await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        }
        this.sideNavBarWidth = await Utils.getCssPropertyValue(this.sideNavbar, 'width');
    }

    /**
     * Collapses the right side menu if it is currently expanded.
     * Updates the internal `rightSideMenuWidth` value after collapsing.
     */
    async collapseRightSideMenu() {
        if (this.rightSideMenuWidth === this.EXPANDED_RIGHT_SIDE_MENU_WIDTH) {
            await this.collapseRightMenu.click();
            await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
        }
        this.rightSideMenuWidth = await Utils.getCssPropertyValue(this.rightSideMenu, 'width');
    }


    /**
     * Retrieves the menu items from the sidebar navigation.
     *
     * If a `menuLabel` is provided, returns the submenu items under the specified menu.
     * Otherwise, returns all top-level menu items in the sidebar.
     *
     * @param menuLabel - (Optional) The label of the menu to retrieve submenu items for.
     * @returns A promise that resolves to an array of menu item strings.
     */
    async getMenuItems(menuLabel?: string): Promise<string[]> {
        if (menuLabel) {
            const menuItem = this.sideNavbar.getByTestId(`sidebar-item-${menuLabel}`);
            const subMenuItems = menuItem.locator("..").locator('[data-testid^="child-item-"]');

            return subMenuItems.allInnerTexts();
        }
        else {
            const menuItems: string[] = await this.sideNavbar.locator('[data-testid^="sidebar-item"]').allInnerTexts();
            return menuItems;
        }
    }

    /**
     * Checks if the side Nav bar is visible.
     * @returns True if visible, otherwise false.
     */
    async isVisible() {
        await this.sideNavbar.waitFor({ state: 'visible', timeout: TIMEOUTS.PAGE_LOADING_TIMEOUT });
        return await this.sideNavbar.isVisible();
    }

    /**
     * Opens a top-level menu item or a submenu item within the navbar.
     * If submenu label is provided, ensures the top menu is expanded before clicking.
     * @param menuLabel - Text label of the top-level menu.
     * @param submenuLabel - (Optional) Text label of the submenu item.
     */
    async open(menuLabel: string, subMenuLabel?: string) {
        let topMenu: Locator;
        let subMenu: Locator;

        topMenu = this.page.locator('li.MuiListItem-root span', { hasText: menuLabel });
        subMenu = this.page.locator('div.MuiListItemText-root span', { hasText: subMenuLabel });

        if (typeof subMenuLabel !== 'undefined') {
            if (await subMenu.isVisible()) {
                await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
                await this.collapseRightSideMenu();
                await this.expandSideNavbar();
                await subMenu.click();
            }
            else {
                await this.collapseRightSideMenu();
                await this.expandSideNavbar();
                await topMenu.click();
                await this.collapseRightSideMenu();
                await this.expandSideNavbar();
                await subMenu.click();
            }
        }
        else {
            await this.collapseRightSideMenu();
            await this.expandSideNavbar();
            topMenu = this.page.locator('div.MuiListItemText-root span', { hasText: menuLabel });
            await topMenu.click();
            await this.collapseRightSideMenu();
            await this.expandSideNavbar();
        }
        await this.collapseRightSideMenu();
        await this.expandSideNavbar();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
    }

    async logout() {
        await this.profileIcon.click();
        await this.page.getByRole('menuitem', { name: 'Logout' }).click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
    }

    /**
     * Checks if a menu or submenu is visible in the sidebar.
     * @param menuLabel - The label of the menu (required)
     * @param subMenuLabel - The label of the submenu (optional)
     * @returns Promise<boolean> true if visible, false otherwise
     */
    async isMenuOrSubMenuVisible(menuLabel: string, subMenuLabel?: string): Promise<boolean> {
        // Top-level menu: use data-testid="sidebar-item-<menuLabel>"
        const menuLocator = this.sideNavbar.locator(`[data-testid="sidebar-item-${menuLabel}"]`);
        if (!subMenuLabel) {
            return await menuLocator.isVisible();
        }
        // Submenu: expand menu if needed, then check for child item
        // Expand menu if not already expanded
        const expandBtn = this.sideNavbar.locator(`[data-testid="expand-collapse-${menuLabel}"]`);
        // Submenu is rendered only if expanded, so try to expand if not found
        let isExpanded = false;
        if (await expandBtn.count()) {
            // If submenu not found, click to expand
            const subMenuLocator = this.sideNavbar.locator(`[data-testid="child-item-${subMenuLabel}"]`);
            if (!(await subMenuLocator.isVisible())) {
                await expandBtn.click();
                await this.page.waitForTimeout(TIMEOUTS.PAGE_LOADING_TIMEOUT);
                isExpanded = true;
            }
        }
        // Now check for submenu
        const subMenuLocator = this.sideNavbar.locator(`[data-testid="child-item-${subMenuLabel}"]`);
        return await subMenuLocator.isVisible();
    }
}
