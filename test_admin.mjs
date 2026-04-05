import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:3000/auth/login');
    await page.goto('http://localhost:3000/auth/login');
    
    // Fill in credentials using placeholder
    console.log('Filling admin credentials...');
    await page.fill('input[placeholder="you@example.com"]', 'buddhadev1508@gmail.com');
    await page.fill('input[placeholder="********"]', 'Buddhadev@123');
    
    console.log('Submitting login...');
    await page.click('button[type="submit"]');

    console.log('Waiting for URL to change to dashboard or admin...');
    await page.waitForTimeout(4000); // Wait for redirect
    
    let url = page.url();
    console.log('Current URL after login:', url);

    if (url.includes('/admin')) {
      console.log('Successfully navigated to Admin section.');
    } else {
      console.log('Testing explicit navigation to /admin...');
      await page.goto('http://localhost:3000/admin');
      await page.waitForTimeout(3000);
      console.log('URL after explicit admin navigation:', page.url());
    }
    
    // Take a screenshot of the admin dashboard
    const dashboardShot = path.join(process.cwd(), 'admin_dashboard.png');
    await page.screenshot({ path: dashboardShot, fullPage: true });
    console.log(`Saved screenshot to ${dashboardShot}`);

    // Check Buses Route
    console.log('Navigating to /admin/buses...');
    await page.goto('http://localhost:3000/admin/buses');
    await page.waitForTimeout(3000); // Give time for data to load
    const busShot = path.join(process.cwd(), 'admin_buses.png');
    await page.screenshot({ path: busShot, fullPage: true });
    console.log(`Saved screenshot to ${busShot}`);

    // Check Routes Route
    console.log('Navigating to /admin/routes...');
    await page.goto('http://localhost:3000/admin/routes');
    await page.waitForTimeout(3000); 
    const routeShot = path.join(process.cwd(), 'admin_routes.png');
    await page.screenshot({ path: routeShot, fullPage: true });
    console.log(`Saved screenshot to ${routeShot}`);

  } catch(err) {
    console.error('Test script failed:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
