import { expect, test } from '@playwright/test';

import { LoginPage } from '../../pages/Login.page';
import { SignupPage } from '../../pages/SignUp.page';
import { getEnv } from '../../utils/env';

const LOGIN_URL = '/login';
const SIGNUP_URL = '/signup';

test.describe('Authentication — Login mode', () => {
  let loginPage: LoginPage;
  let signupPage: SignupPage;
  let email: string;
  let password: string;
  let validEmail: string;
  let validPassword: string;
  let invalidEmail: string;
  let invalidPassword: string;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    await loginPage.open(LOGIN_URL);
    email = "user@example.com";
    password = "secret123";
    validEmail = "sravanimm@divami.com";
    validPassword = "Sravani@123"
    invalidEmail = "invalid@example.com";
    invalidPassword = "wrongpass123";
  });

  test('renders all login page elements', async () => {
    expect(await loginPage.logo.isVisible(), 'Logo should be visible').toBeTruthy();
    expect(await loginPage.googleButton.isVisible(), 'Google sign-in button should be visible').toBeTruthy();
    expect(await loginPage.linkedInButton.isVisible(), 'LinkedIn button should be visible').toBeTruthy();
    expect(await loginPage.emailInput.isVisible(), 'Email input should be visible').toBeTruthy();
    expect(await loginPage.passwordInput.isVisible(), 'Password input should be visible').toBeTruthy();
    expect(await loginPage.loginButton.isVisible(), 'Login button should be visible').toBeTruthy();
    expect(await loginPage.signUpLink.isVisible(), 'Sign up link should be visible').toBeTruthy();
    expect(await signupPage.fullNameInput.isVisible(), 'Full name input is not hidden in login mode').toBeFalsy();

    expect(await loginPage.getHeadingText(), 'Heading should contain welcome text').toContain('Welcome back');
  });

  test('switches to signup mode and back', async () => {
    await loginPage.goToSignUp();

    expect(await signupPage.fullNameInput.isVisible(), 'Full name input should be visible in signup mode').toBeTruthy();
    expect(await loginPage.signUpLink.isVisible(), 'Sign up link should be hidden in signup mode').toBeFalsy();

    await signupPage.goToLogin();

    expect(await signupPage.fullNameInput.isVisible(), 'Full name input should be hidden in login mode').toBeFalsy();
    expect(await loginPage.loginButton.isVisible(), 'Login button should be visible in login mode').toBeTruthy();
  });

  test('validates required fields and shows API error on invalid credentials', async () => {
    await loginPage.login('', '');
    await loginPage.loginButton.click();
    expect(await loginPage.emailInput.getError(), 'Email error message is not shown').toBe('Email is required');
    expect(await loginPage.passwordInput.getError(), "Password error message is not shown").toBe('Password is required')

    await loginPage.emailInput.set(email);
    await loginPage.loginButton.click();
    expect(await loginPage.passwordInput.getError(), 'Password error should be shown').toBe('Password is required');

    await loginPage.emailInput.clear();
    await loginPage.passwordInput.set(password);
    await loginPage.loginButton.click();
    expect(await loginPage.emailInput.getError(), 'Login button should be enabled with valid input').toBe('Email is required');

    await loginPage.login(invalidEmail, invalidPassword);
    await loginPage.loginButton.click();
    expect(await loginPage.errorMessage.isVisible(), 'API error message should be visible for invalid credentials').toBeTruthy();
    expect(await loginPage.errorMessage.isVisible(), 'Invalid error message is not shown').toBe('Invalid email or password.')
  });

  test('logs in with valid credentials via button click', async ({ page }) => {
    // Test button click submission
    await loginPage.open(LOGIN_URL);
    await loginPage.login(validEmail, validPassword);
    await expect(page, 'Should navigate away from login page after button click').not.toHaveURL(new RegExp(LOGIN_URL));
  });
});

test.describe('Authentication — Signup mode', () => {
  let signupPage: SignupPage;
  let loginPage: LoginPage;
  let email: string;
  let password: string;
  let fullName: string;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    loginPage = new LoginPage(page);
    await signupPage.open(SIGNUP_URL);
    email = "user@example.com";
    password = "Secret@123";
    fullName = "Jane"
  });

  test('renders all signup page elements', async () => {
    expect(await signupPage.logo.isVisible(), 'Logo should be visible').toBeTruthy();
    expect(await signupPage.googleButton.isVisible(), 'Google button should be visible').toBeTruthy();
    expect(await signupPage.linkedInButton.isVisible(), 'LinkedIn button should be visible').toBeTruthy();
    expect(await signupPage.emailInput.isVisible(), 'Email input should be visible').toBeTruthy();
    expect(await signupPage.fullNameInput.isVisible(), 'Full name input should be visible').toBeTruthy();
    expect(await signupPage.passwordInput.isVisible(), 'Password input should be visible').toBeTruthy();
    expect(await signupPage.createAccountButton.isVisible(), 'Create account button should be visible').toBeTruthy();
    expect(await signupPage.loginLink.isVisible(), 'Login link should be visible').toBeTruthy();

    expect(await signupPage.getHeadingText(), 'Heading should contain join text').toContain('Ready to join');
  });

  test('switches to login mode when Login link is clicked', async () => {
    await signupPage.goToLogin();

    expect(await signupPage.fullNameInput.isVisible(), 'Full name input should be hidden in login mode').toBeFalsy();
    expect(await loginPage.loginButton.isVisible(), 'Login button should be visible in login mode').toBeTruthy();
  });

  test('toggles password visibility', async () => {
    await signupPage.passwordInput.set(password);
    expect(await signupPage.passwordInput.getAttribute('type'), 'Password should be hidden initially').toBe('password');
    await signupPage.passwordToggleButton.click();
    expect(await signupPage.passwordInput.getAttribute('type'), 'Password should be visible after toggle').toBe('text');
  });

  test('validates required fields before submission', async ({ page }) => {
    await signupPage.createAccountButton.click();
    expect(await signupPage.emailInput.getError(), 'Email error message is not shown').toBeTruthy();
    expect(await signupPage.fullNameInput.getError(), 'Full name error message is not shown').toBe("Full name must be atleast 3 characters");
    expect(await signupPage.passwordInput.getError(), 'Password error message is not shown').toBe('Password must be at least 8 characters');

    await signupPage.emailInput.set(email);
    await signupPage.passwordInput.set(password);
    await signupPage.fullNameInput.set(fullName);
    await signupPage.createAccountButton.click();

    expect(await signupPage.createAccountButton.isDisabled(), 'Create account button should be enabled with valid input').toBeFalsy();
    await expect(page, 'Should navigate to login page after successful signup').toHaveURL(new RegExp(LOGIN_URL));
  });

  test('registers a new account and navigates to login page', async ({ page }) => {
    const password = getEnv('TEST_NEW_USER_PASSWORD', '');
    test.skip(!password, 'TEST_NEW_USER_PASSWORD not configured');

    await signupPage.signUp(`testuser+${Date.now()}@example.com`, 'Test Automation User', password);
    await expect(page, 'Should navigate to login page after successful signup').toHaveURL(new RegExp(LOGIN_URL));
  });
});
