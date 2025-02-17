import fs from 'fs';
import path from 'path';
import axios from 'axios';
import os from 'os';
import { execSync } from 'child_process';

const TEAMS_WEBHOOK_URL = 'https://neurophet2016.webhook.office.com/webhookb2/68c3850f-014d-4361-8035-655fe16f7aa8@0e0de970-ba32-48a4-a048-99d48e6eb282/IncomingWebhook/c3a5a9e99a41473a9f4d53d619aa0e87/a1b4164a-d122-4726-9b16-7896a06c2159/V2kLMW8k2Ybf2fyBleQleNixH_UVSyEaJqedNNaQiJtwc1';  // 🔹 Teams Webhook URL 입력

async function getSystemInfo() {
    // 🖥️ OS 정보
    const osInfo = `${os.type()} ${os.release()} (${os.arch()})`;
    
    // 🌍 외부 IP 가져오기 (Windows/Linux 호환)
    let ipAddress = 'Unknown';
    try {
        ipAddress = execSync('curl -s ifconfig.me || curl -s icanhazip.com').toString().trim();
    } catch (error) {
        console.error('❌ 외부 IP를 가져올 수 없습니다:', error);
    }

    // 🌐 Playwright 버전 가져오기
    let playwrightVersion = 'Unknown';
    try {
        playwrightVersion = execSync('npx playwright --version').toString().trim();
    } catch (error) {
        console.error('❌ Playwright 버전을 가져올 수 없습니다:', error);
    }

    return { osInfo, ipAddress, playwrightVersion };
}

async function sendTestResultsToTeams() {
    const resultsPath = path.join(__dirname, '../test-results/test-results.json');

    // ✅ 파일이 존재하지 않으면 종료
    if (!fs.existsSync(resultsPath)) {
        console.error(`❌ 테스트 결과 파일을 찾을 수 없습니다: ${resultsPath}`);
        return;
    }

    // ✅ JSON 파일 읽기
    const testResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    // ✅ 테스트 결과 분류
    const passedTests: string[] = [];
    const failedTests: string[] = [];
    const totalTests: string[] = [];

    for (const suite of testResults.suites) {
        for (const spec of suite.specs) {
            for (const result of spec.tests) {
                const testName = `${suite.title} > ${spec.title}`;
                totalTests.push(testName);
                if (result.results.some(r => r.status === 'failed')) {
                    failedTests.push(testName);
                } else {
                    passedTests.push(testName);
                }
            }
        }
    }

    // 🛠️ 시스템 정보 가져오기
    const { osInfo, ipAddress, playwrightVersion } = await getSystemInfo();

    // ✅ 팀즈 메시지 텍스트
    const message = `
📌 **테스트 환경 정보**
- 🖥️ OS: ${osInfo}
- 🌍 실행 IP: ${ipAddress}
- 🌐 Playwright 버전: ${playwrightVersion}

📊 **테스트 결과**
- ✅ **성공한 테스트:** ${passedTests.length}개  
${passedTests.length ? `✔️ ${passedTests.join("\n✔️ ")}` : "없음"}   

- ❌ **실패한 테스트:** ${failedTests.length}개  
${failedTests.length ? `❌ ${failedTests.join("\n❌ ")}` : "없음"}  

- 🔄 **전체 테스트:** ${totalTests.length}개  
${totalTests.length ? `📌 ${totalTests.join("\n📌 ")}` : "없음"}  
    `;

    // ✅ 팀즈 웹훅 데이터
    const teamsMessage = { text: message };

    // ✅ 웹훅 전송
    try {
        await axios.post(TEAMS_WEBHOOK_URL, teamsMessage);
        console.log('✅ 테스트 결과를 Microsoft Teams로 전송했습니다.');
    } catch (error) {
        console.error('❌ 팀즈 웹훅 전송 실패:', error);
    }
}

// **📌 Playwright에서 실행할 단일 함수로 내보내기**
export default async function globalTeardown() {
    await sendTestResultsToTeams();
}
