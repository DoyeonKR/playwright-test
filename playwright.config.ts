import { defineConfig } from '@playwright/test';
import * as path from 'path';

export default defineConfig({
  testDir: './tests',
  globalTeardown: path.join(__dirname, './tests/global-teardown.ts'),
  testMatch: ['**/*.spec.ts'],  // ✅ setup 파일 제외하고 spec 파일만 실행하도록 변경
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,


  outputDir: path.join(__dirname, 'test-results'),  // ✅ 결과 저장 경로

  reporter: [
    ['json', { outputFile: path.join(__dirname, 'test-results', 'test-results.json') }],  // ✅ JSON 리포트 자동 저장
  ],

  use: {
    baseURL: 'http://192.168.0.190',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--start-maximized'],
    },
    viewport: null,
  },

  projects: [
    {
      name: 'Admin Tests',
      testDir: 'tests/Admin',
    },
    {
      name: 'Advanced User Tests',
      testDir: 'tests/advanced',
    }
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://192.168.0.190',
    reuseExistingServer: !process.env.CI,
  },
});
