const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'assets', 'screenshots');

async function autoCapture() {
  console.log('📸 Starting automated screenshot capture...');
  
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
  });
  
  const page = await browser.newPage();
  
  // 1. Landing Page
  console.log('Capturing Landing Page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landing_page.png'), fullPage: false });

  // 2. Login Page
  console.log('Capturing Login Page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_login_page.png'), fullPage: false });

  // 3. Register Page
  console.log('Capturing Register Page...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_register_page.png'), fullPage: false });

  await browser.close();
  console.log('✅ Screenshots captured successfully and saved to assets/screenshots!');
}

autoCapture().catch(err => {
  console.error('❌ Failed to capture screenshots:', err);
  process.exit(1);
});
