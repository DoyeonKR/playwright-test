import { test, expect } from '@playwright/test';
test.describe.configure({ mode: 'serial' });

const siteManagerFile = 'playwright/.auth/site_manager.json';

let loggedInUser = '';

test.beforeEach(async ({ page }) => {
  await page.goto('http://192.168.0.190/login');  
  await page.getByRole('textbox', { name: 'User ID' }).click();
  loggedInUser = 'master';
  await page.getByRole('textbox', { name: 'User ID' }).fill(loggedInUser);
  await page.getByRole('textbox', { name: 'User ID' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('ADmaster@neurophet1');
  await page.getByRole('button', { name: 'Log In' }).click();

  const yesButton = page.getByRole('button', { name: 'Yes' });

    await page.waitForTimeout(1000);

    if (await yesButton.isVisible()) {
      await yesButton.click();
    }

  await page.context().storageState({ path: siteManagerFile });

  await page.waitForTimeout(1000);

  await page.goto('http://192.168.0.190/administration/analysis');
  
});

test.afterEach(async ({ page }) => {
  if (loggedInUser) {
    console.log(`🔹 Logging out user: ${loggedInUser}`);
    try {
      await page.goto('http://192.168.0.190'); 
      await page.getByRole('button', { name: loggedInUser }).click();
      await page.getByRole('button', { name: 'Log Out' }).click();
      console.log(`✅ Successfully logged out (${loggedInUser})`);
    } catch (error) {
      console.warn(`⚠️ Could not log out user (${loggedInUser})`, error);
    }
  }
});


test('DICOM Tag 생성/삭제 테스트', async ({ page }) => {


    // Page 클릭 
    await page.getByRole('button', { name: 'Add' }).first().click();

    // 예상 결과 입력 
    await expect(page.getByText('Add DICOM Tag')).toBeVisible();
    await expect(page.getByText('Imaging Type')).toBeVisible();
    await expect(page.locator('#dicom-type1-combobox')).toBeVisible();

    await page.getByRole('button', { name: 'Dropdown' }).first().click();

    await page.getByText('PET (Amyloid)', { exact: true }).click();
    await page.getByRole('button', { name: 'Dropdown' }).nth(1).click();

    await page.getByText('F-18 flutemetamol').click();
    await page.locator('#dicom-tag1-text').click();
    await page.locator('#dicom-tag1-text').fill('0000');
    await page.locator('#dicom-tag2-text').click();
    await page.locator('#dicom-tag2-text').fill('0000');
    await page.getByRole('textbox', { name: 'Value can be max 256' }).click();
    await page.getByRole('textbox', { name: 'Value can be max 256' }).fill('abct');

    await page.locator('#admin-change-dicom-tag-modal').getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('PET (Amyloid)', { exact: true })).toBeVisible();
    await page.getByRole('gridcell').filter({ hasText: /^$/ }).first().hover({ force: true });

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Delete', { exact: true })).toBeVisible();
    await expect(page.getByText('Do you want to delete the')).toBeVisible();
    await expect(page.getByRole('button', { name: 'No' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();

    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page.locator('.ag-center-cols-viewport').first()).toBeVisible();  
  
  });

  test('User 필터 테스트', async ({ page }) => {

    await page.goto('http://192.168.0.190/administration/user');  

    await expect(page.getByRole('textbox', { name: 'Enter user ID or user name' })).toBeVisible();
    await expect(page.locator('#user-list-left').getByRole('list').getByRole('button').filter({ hasText: /^$/ })).toBeVisible();
    await expect(page.locator('#common-user-multiselection-status').getByRole('textbox')).toBeVisible();
    await expect(page.locator('#common-user-multiselection-permission').getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter user ID or user name' })).toBeEmpty();
    await page.getByRole('textbox', { name: 'Enter user ID or user name' }).click();
    await page.getByRole('textbox', { name: 'Enter user ID or user name' }).fill('test');
    await expect(page.getByRole('textbox', { name: 'Enter user ID or user name' })).toBeVisible();
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('textbox', { name: 'Enter user ID or user name' })).toBeVisible();

});