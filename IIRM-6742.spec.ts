import { test, expect } from '../../../fixtures/iwork';
import qa from "../../../env/qa.json";
import testData from "../../../testdata/ui/functionaltests/iirm6742/iirm6742_comprehensive_policyConfiguration.json";
import { TIMEOUTS } from '../../../env/timeouts';

test.describe('IIRM-6742: Policy Configuration - Cross Selection of Parents Not Allowed', () => {

  test('IIRM-6742 - Configure policy to disallow cross-parent selection (father + mother-in-law, father-in-law + mother)', async ({ loginPage, managePoliciesPage, navBar, page, policyConfigPage }) => {

    const { policyConfiguration } = testData;
    const { companyName, policyType, policyComponent } = policyConfiguration;
    const basePolicy = policyComponent.basePolicy;

    // Get from root policyConfiguration level
    const policyTemplate = policyConfiguration.policyTemplate[0];
    const relationships = policyConfiguration.policyRelationships;
    const parameters = policyConfiguration.policyParameters;
    const policyChoices = policyConfiguration.policyChoices;
    const constraints = policyConfiguration.constraints;

    // Step 1: Navigate to Policy Configuration page
    await loginPage.open("/");
    await loginPage.login(qa.LOGIN.USERNAME, qa.LOGIN.PASSWORD);
    await navBar.open("Manage Placements", "Manage Policies");

    // Step 2: Search for policy using test data
    await managePoliciesPage.smartSearch().search.set(companyName);
    await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
    await managePoliciesPage.smartSearch().searchIcon.click();
    await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
    await managePoliciesPage.table().click_on_old('Policy type', policyType);
    await page.waitForTimeout(TIMEOUTS.API_TIMEOUT);
    await managePoliciesPage.button('Configuration').click();

    // Step 3: Configure Base Policy Component using test data
    await policyConfigPage.policyComponents(0).displayLabel.set(basePolicy.displayLabel);

    for (let i = 0; i < basePolicy.siAmounts.length; i++) {
      await policyConfigPage.policyComponents(0).SIAmount(i).set(basePolicy.siAmounts[i]);
      if (i < basePolicy.siAmounts.length - 1) {
        await policyConfigPage.policyComponents(0).addSIAmountOrCTCMultiple.click();
      }
    }

    if (basePolicy.showCompanyContribution) {
      await policyConfigPage.policyComponents(0).showCompanyContribution.check();
    }

    await policyConfigPage.policyComponents(0).premiumCalculation.set(basePolicy.premiumCalculation);
    await policyConfigPage.next.click();

    // Step 4: Configure Policy Template using test data
    await policyConfigPage.basePolicyTemplate.midYearEnrollmentAllowed(policyTemplate.label).set(policyTemplate.midYearEnrollmentAllowed);
    await policyConfigPage.basePolicyTemplate.sumInsuredVisibleToEmployee(policyTemplate.label).set(policyTemplate.sumInsuredVisibleToEmployee);
    await policyConfigPage.next.click();

    // Step 5: Configure Relationships using test data
    for (const relation of relationships) {
      await policyConfigPage.policyRelationships(relation.relationshipType).relationshipType.check();

      if (relation.maxNo) {
        await policyConfigPage.policyRelationships(relation.relationshipType).maxNo.set(relation.maxNo);
      }

      for (const permRel of relation.permittedRelations) {
        await policyConfigPage.policyRelationships(relation.relationshipType).permittedRelation(permRel.label).label.check();
        await policyConfigPage.policyRelationships(relation.relationshipType).permittedRelation(permRel.label).minAge.set(permRel.minAge);
        await policyConfigPage.policyRelationships(relation.relationshipType).permittedRelation(permRel.label).maxAge.set(permRel.maxAge);
      }
    }
    await policyConfigPage.next.click();

    // Step 6: Configure Policy Parameters using test data - Relationship Group
    for (const param of parameters) {
      await policyConfigPage.parameter.set(param.parameterName);
      await policyConfigPage.add.click();

      const paramIndex = (await policyConfigPage.getNumberOfPolicyParameters()) - 1;
      await policyConfigPage.policyParameters(paramIndex).displayName.set(param.displayName);

      // Handle Relationship Group parameter type
      if (param.parameterName === 'Relationship Group') {
        for (let cfgIndex = 0; cfgIndex < param.configuration.length; cfgIndex++) {
          const cfg = param.configuration[cfgIndex];

          if (cfgIndex > 0) {
            await policyConfigPage.policyParameters(paramIndex).addRelationGroup.click();
          }

          // Set group name
          await policyConfigPage.policyParameters(paramIndex).relationshipGroup(cfgIndex).groupName.set(cfg.groupName);

          // Set max counts for each relationship type
          if (cfg.maxCounts && cfg.maxCounts.length > 0) {
            for (const maxCount of cfg.maxCounts) {
              await policyConfigPage.policyParameters(paramIndex).relationshipGroup(cfgIndex).checkBox(maxCount.label).check();
              await policyConfigPage.policyParameters(paramIndex).relationshipGroup(cfgIndex).maxCount(maxCount.label).set(maxCount.value);
            }
          }

          // Set family max total if provided
          if (cfg.familyMaxTotal) {
            await policyConfigPage.policyParameters(paramIndex).relationshipGroup(cfgIndex).familyMaxTotal.set(cfg.familyMaxTotal);
          }
        }
      }
    }
    await policyConfigPage.next.click();

    // Step 7: Configure Policy Choices using test data
    if (policyChoices && policyChoices.length > 0) {
      for (const policyChoice of policyChoices) {
        const policyOption = policyChoice.policyOption;

        for (const availableChoice of policyChoice.availablePolicyChoices) {
          await policyConfigPage.policyChoices(policyOption).selectAvailablePolicyChoice(availableChoice.label);

          for (let configIndex = 0; configIndex < availableChoice.configuration.length; configIndex++) {
            const config = availableChoice.configuration[configIndex];

            if (config.available) {
              await policyConfigPage.policyChoices(policyOption).configureSelectedPolicyChoice(configIndex).available.check();
            }
            if (config.default) {
              await policyConfigPage.policyChoices(policyOption).configureSelectedPolicyChoice(configIndex).default.check();
            }
            await policyConfigPage.policyChoices(policyOption).configureSelectedPolicyChoice(configIndex).companyContribution.set(config.companyContribution);
            await policyConfigPage.policyChoices(policyOption).configureSelectedPolicyChoice(configIndex).employeeContribution.set(config.employeeContribution);
          }

          if (availableChoice.setChoices) {
            await policyConfigPage.policyChoices(policyOption).setChoices.click();
          }
        }
      }
    }
    await policyConfigPage.next.click();

    // Step 8: Configure Constraints & Final Review using test data
    for (const constraint of constraints) {
      await policyConfigPage.constraints(constraint.label).set(constraint.value);
    }

    // Step 9: Save the policy configuration
    await policyConfigPage.saveAndExit.click();

    // Step 10: Verify cross-parent selection is properly configured
    const crossParentConstraint = constraints.find(c => c.label === 'Cross Selection of Parents Allowed');
    expect(crossParentConstraint?.value, 'Cross Selection of Parents should be set to No').toBe('No');
  });

});