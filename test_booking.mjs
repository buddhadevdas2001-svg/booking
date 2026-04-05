import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let hasErrors = false;

  try {
    // Navigate to homepage
    console.log('Navigating to http://localhost:3000/');
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(2000);
    
    let text = await page.textContent('body');
    if(text.includes('Application error') || text.includes('Internal Server Error')) {
      console.error('Homepage is down.');
      hasErrors = true;
    } else {
      console.log('Homepage loaded correctly.');
    }

    // Navigating to search manually using the URL scheme
    // We can just construct a search URL
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    // Assumed query params (just bypassing the homepage form for a faster test)
    // from=Dhaka&to=Chittagong
    const searchUrl = `http://localhost:3000/search?origin=Dhaka&destination=Chittagong&date=${dateStr}`;
    console.log('Testing search page:', searchUrl);
    
    await page.goto(searchUrl);
    await page.waitForTimeout(3000);

    text = await page.textContent('body');
    if(text.includes('Application error') || text.includes('Internal Server Error')) {
      console.error('Search page threw an error.');
      hasErrors = true;
    } else {
      console.log('Search page loaded correctly.');
    }

    // Try to find if there are any bus cards
    // The previous app had "Select Seats" buttons.
    const hasSelectSeats = await page.$('text="Select Seats"');
    if (hasSelectSeats) {
        console.log('Found buses available for booking.');
    } else {
        console.log('No buses found for this route/date, or the UI is different.');
    }

  } catch(err) {
    console.error('Test script failed:', err);
    hasErrors = true;
  } finally {
    await browser.close();
    console.log(hasErrors ? 'Tests Completed with ERRORS.' : 'Tests Completed SUCCESSFULLY.');
  }
})();
