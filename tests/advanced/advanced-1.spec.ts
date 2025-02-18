import { test, expect } from '@playwright/test';
test.describe.configure({ mode: 'serial' });

let analysisUploadFailed = false;
const siteManagerFile = 'playwright/.auth/site_manager.json';
let loggedInUser = '';

test.beforeEach(async ({ page }) => {
  await page.goto('http://192.168.0.190/login');  
  await page.getByRole('textbox', { name: 'User ID' }).click();
  loggedInUser = 'test1';
  await page.getByRole('textbox', { name: 'User ID' }).fill(loggedInUser);
  await page.getByRole('textbox', { name: 'User ID' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('rlaehdus100!');
  await page.getByRole('button', { name: 'Log In' }).click();

  const yesButton = page.getByRole('button', { name: 'Yes' });

    await page.waitForTimeout(1000);

    if (await yesButton.isVisible()) {
      await yesButton.click();
    }

  await page.context().storageState({ path: siteManagerFile });

  await page.waitForTimeout(1000);

  await page.goto('http://192.168.0.190/analysis');
  
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


test('42048	STS_Analysis_UI', async ({ page }) => {

  await page.goto('http://192.168.0.190/analysis'); 
  
    await test.step('Check the analysis list title', async () => {

    /*
      Verify that you see the description below
      - GNB : neurophet AQUA AD, Patient, Analysis, Administration, [Upload DICOM lmages], [Help], [About], [Account]
      - Title : Analysis
      └ All requested analyses, both automatic and manual, are listed 
    **/

      await expect(page.getByRole('button', { name: 'Upload DICOM Images' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Help' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'About' })).toBeVisible();
      await page.getByRole('link', { name: 'Analysis' }).click();
      await expect(page.locator('div').filter({ hasText: /^Analysis$/ })).toBeVisible();
    });

    await test.step('Check the number of listings by analysis status', async () => {

      /*
        Verify that you see the description below
          - In Queue
          - In Progress
          - Completed
          - Failed
          - Canceled
          - Pending
      **/
        await expect(page.getByText('In Queue:')).toBeVisible();
        await expect(page.getByText('In Progress:')).toBeVisible();
        await expect(page.getByText('Completed:')).toBeVisible();
        await expect(page.getByText('Failed:')).toBeVisible();
        await expect(page.getByText('Canceled:')).toBeVisible();
        await expect(page.getByText('Pending:')).toBeVisible();

    });

    await test.step('Check the analysis list', async () => {

      /*
        Check the Analysis List

        [TEST DATA]
        If there is no value, display (-)
      **/

        /*

        Verify that you see the description below
          - Patient ID or Patient Name <i>
          - Sex, Analysis Type, Analysis Status, Image Type, Analysis Requested <d>
          └ Last 6 months
          - [Reset] - Disable | [Export] - Disable
          - <c> | ID | Analysis Type │Analysis Status│Analysis Requested | Analysis Completed | Image Type | Source of Image | Patient ID | Patient Name | Sex | Date of Birth (Age) | Mode | Action

          - [<], [1], [2], ... , ['n'], [>] │ 20/page <d>

        **/

        await expect(page.getByRole('textbox', { name: 'All' })).toHaveValue('Last 6 months');
        await expect(page.getByRole('row')).toContainText('ID');
        await expect(page.getByRole('row')).toContainText('Analysis Type');
        await expect(page.getByRole('row')).toContainText('Analysis Requested');
        await expect(page.getByRole('row')).toContainText('Analysis Completed');
        await expect(page.getByRole('row')).toContainText('Image Type');
        await expect(page.getByRole('row')).toContainText('Source of Image');
        await expect(page.getByRole('row')).toContainText('Patient Name');
        await expect(page.getByRole('row')).toContainText('Sex');
        await expect(page.getByRole('row')).toContainText('Date of Birth (Age)');
        await expect(page.getByRole('row')).toContainText('Mode');
        await expect(page.getByRole('row')).toContainText('Action');


    });

});

test('42060 STS_Analysis_Search/Filter', async ({ page }) => {

  await page.goto('http://192.168.0.190/analysis');

  await page.waitForLoadState('networkidle');


    await page.getByRole('textbox', { name: 'Patient ID or Patient Name' }).click();
    await page.getByRole('textbox', { name: 'Patient ID or Patient Name' }).fill('test');



    await page.waitForSelector('#patient-sex-filter');
    await page.locator('#patient-sex-filter').getByRole('textbox').click();
    await expect(page.getByText('All', { exact: true })).toBeVisible();
    await expect(page.getByText('Male', { exact: true })).toBeVisible();
    await expect(page.getByText('Female', { exact: true })).toBeVisible();
    await expect(page.getByText('Unknown', { exact: true })).toBeVisible();


    await page.getByRole('listitem').filter({ hasText: 'Analysis Type' }).getByRole('textbox').click();
    await expect(page.getByText('AD Biomarker', { exact: true })).toBeVisible();
    await expect(page.getByText('Tau PET', { exact: true })).toBeVisible();
    await expect(page.getByText('Amyloid PET', { exact: true })).toBeVisible();
    await expect(page.getByText('Brain Volumetry', { exact: true })).toBeVisible();  



  await page.getByRole('listitem').filter({ hasText: 'Analysis Status' }).getByRole('textbox').click();
  await expect(page.getByText('All', { exact: true })).toBeVisible();
  await expect(page.getByText('In Progress', { exact: true })).toBeVisible();
  await expect(page.getByText('Failed', { exact: true })).toBeVisible();
  await expect(page.getByText('Canceled', { exact: true })).toBeVisible();
  await expect(page.getByText('Pending', { exact: true })).toBeVisible();


    await page.getByRole('listitem').filter({ hasText: 'Image Type' }).getByRole('textbox').click();
    await expect(page.getByText('All', { exact: true })).toBeVisible();
    await expect(page.getByText('T1', { exact: true })).toBeVisible();
    await expect(page.getByText('T2-FLAIR', { exact: true })).toBeVisible();
    await expect(page.getByText('SWI', { exact: true })).toBeVisible();
    await expect(page.getByText('Phase', { exact: true })).toBeVisible();
    await expect(page.getByText('Amyloid PET', { exact: true })).toBeVisible();
    await expect(page.getByText('Tau PET', { exact: true })).toBeVisible();

    await page.getByRole('textbox', { name: 'All' }).click();
    await expect(page.locator('#range-date-picker')).toBeVisible();
    await expect(page.locator('#textinput-popover').getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();



});

test('42072 STS_Analysis_Request Failed', async ({ page }) => {

  await page.goto('http://192.168.0.190/analysis');

    await page.getByRole('button', { name: 'Upload DICOM Images' }).click();

    /*
    아래는 정상적인 다이콤 이미지 - 추후 프로젝트 안에 경로를 넣어 로컬에서 파일 넣지 않는 것으로 대체 하여야함함
    **/
    // await page.locator('#manual-upload-input').setInputFiles('D:\\T1&FLAIR\\T1&FLAIR\\sub_0020_20170427\\t1\\new');

    await page.locator('#manual-upload-input').setInputFiles('D:\\PyCharm 2024.1.4\\bin\\aarch64');
    await expect(page.locator('#manual-upload-input-delete')).toBeVisible();
    await page.getByRole('button', { name: 'Upload', exact: true }).click();

    await expect(page.getByText('The image format is invalid.')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.waitForTimeout(1000);

});


// test('Analysis 업로드 후 Failed 건 Delete', async ({ page }) => {

//   await page.goto('http://192.168.0.190/analysis');

//   await page.getByRole('button', { name: 'Upload DICOM Images' }).click();

//   /*
//   아래는 정상적인 다이콤 이미지 - 추후 프로젝트 안에 경로를 넣어 로컬에서 파일 넣지 않는 것으로 대체 하여야함함
//   **/
//   await page.locator('#manual-upload-input').setInputFiles('D:\\T1&FLAIR\\T1&FLAIR\\sub_0020_20170427\\t1\\new');

//   await expect(page.locator('#manual-upload-input-delete')).toBeVisible();

//   await page.getByRole('button', { name: 'Upload', exact: true }).click();


//   await expect(page.getByText('Analysis requested.')).toBeVisible({ timeout: 300000 }); // 5분(300초) 동안 대기
//   await expect(page.getByText('Failed', { exact: true })).toBeVisible({ timeout: 300000 }); // 5분(300초) 동안 대기

//   await page.getByRole('gridcell').filter({ hasText: /^$/ }).nth(1).hover();
// await page.waitForTimeout(500);  // 살짝 기다려줌

// await page.evaluate(() => {
//   const btn = document.querySelector('button[aria-label="Delete"]') as HTMLElement;
//   if (btn) {
//     btn.style.display = 'block';
//     btn.style.opacity = '1';
//     btn.style.visibility = 'visible';
//   }
// });


// await page.getByRole('button', { name: 'Delete' }).click();

  // await page.goto('http://192.168.0.190/patient');

  // await page.getByRole('gridcell', { name: '-', exact: true }).nth(1).click();

  // await page.getByRole('gridcell').filter({ hasText: /^$/ }).nth(1).hover({ force: true });

  // await page.getByRole('button', { name: 'Delete' }).click();
  // await page.getByRole('button', { name: 'Yes' }).click(); 


  // });


// test('Patient 생성된 것 확인', async ({ page }) => {

//   await page.goto('http://192.168.0.190/patient');

//   await expect(page.getByRole('gridcell', { name: 'Wood, Seth' })).toBeVisible();
//   await expect(page.getByText('Unknown', { exact: true })).toBeVisible();
//   await expect(page.getByText('1946-06-01 (78)', { exact: true })).toBeVisible();

// });

// test('Related Imaged 미삭제 시 Patient 환자 지울수 없는 동작 확인', async ({ page }) => {

//   await page.goto('http://192.168.0.190/patient');

//   await page.getByRole('gridcell', { name: 'Results' }).hover();
//   await page.getByRole('button', { name: 'more' }).click();
//   await page.getByText('Delete').click();

//   await expect(page.getByRole('dialog').getByText('Delete', { exact: true })).toBeVisible();
//   await expect(page.getByText('Do you want to delete the')).toBeVisible();

//   await page.getByRole('button', { name: 'Yes' }).click();
//   await expect(page.getByText('Cannot Delete', { exact: true })).toBeVisible();
//   await expect(page.getByText('You cannot delete the')).toBeVisible();
//   await page.getByRole('button', { name: 'OK' }).click();

// });

// test('Patient 삭제 동작 확인', async ({ page }) => {
//   await page.goto('http://192.168.0.190/patient');



//   await page.getByRole('gridcell', { name: 'TEST_TEST_TEST_TEST_TEST_TEST_TEST_TEST_TEST_TEST_TEST_TEST_' }).click();

//   if (analysisUploadFailed) {

//     console.log('Analysis 업로드 후 Failed 건 Delete 실패로 인해 Patient Tap 에서 다시 한번 수행행');

//   // 아래는 test('Analysis 업로드 후 Failed 건 Delete', 테스트 실패 되었을떄만 수행되어야함

//   await page.getByText('Analysis Result (1)').click();
//   await page.getByRole('gridcell').filter({ hasText: /^$/ }).nth(1).hover();
//   await page.getByRole('button', { name: 'Delete' }).click();
//   await page.getByRole('button', { name: 'Yes' }).click();
//   await expect(page.getByText('Deleted the selected item.')).toBeVisible();

//   }

//   await page.getByText('Related Images (1)').click();
//   await page.getByRole('row', { name: '1710901892 2017-04-27 2025-02' }).locator('#dropdown-itemmore-patien-grid-more').click();
//   await page.getByText('Delete').click();
//   await page.getByRole('button', { name: 'Yes' }).click();
//   await expect(page.getByText('Deleted the selected item.')).toBeVisible();
//   await page.getByRole('gridcell', { name: 'Results' }).click();

//   await page.getByRole('gridcell', { name: 'Results' }).hover();

//   await page.getByRole('button', { name: 'more' }).click();
//   await page.getByText('Delete').click();
//   await page.getByRole('button', { name: 'Yes' }).click();
//   await expect(page.getByText('Deleted the selected item.')).toBeVisible();
//   await page.getByText('Deleted the selected item.').click();

// });


test ('42070 STS_General_Software Infromation_Product information', async ({ page }) => {

  await page.goto('http://192.168.0.190/patient');

    /* [If there is regulatory information]

    Research Mode On > Select the [About] icon in the upper right corner
    **/
   await page.getByRole('button', { name: 'About' }).click();

    await expect(page.locator('#common-modal-about-has-license').getByRole('img', { name: 'Neurophet AQUA AD' })).toBeVisible();
    await expect(page.getByText('Product Information')).toBeVisible();
    await expect(page.getByText('Product Name')).toBeVisible();
    await expect(page.locator('#common-modal-about-has-license').getByText('Neurophet AQUA AD Plus')).toBeVisible();
    await expect(page.getByText('Product Version')).toBeVisible();

  });

  test('42073 STS_Analysis_File Size Exceeded', async ({ page }) => {

    await page.goto('http://192.168.0.190/analysis');
  
      await page.getByRole('button', { name: 'Upload DICOM Images' }).click();
  
      /*
      아래는 .setInputFiles('D:\\PyCharm 2024.1.4\\bin\\aarch64'); path 에 1GB 이상 DICOM 이미지를 폴더를 지정 해주세요.
      **/
  
      await page.locator('#manual-upload-input').setInputFiles('D:\\PyCharm 2024.1.4\\bin\\aarch64');
      await expect(page.locator('#manual-upload-input-delete')).toBeVisible();
      await page.getByRole('button', { name: 'Upload', exact: true }).click();
  
      await expect(page.getByText('The image format is invalid.')).toBeVisible();
      await page.getByRole('button', { name: 'OK' }).click();
      await page.getByRole('button', { name: 'Cancel' }).click();
  
      await page.waitForTimeout(1000);
  
  });


