const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  
  const sites = [
    { url: 'https://buscharter.is/', file: 'screenshot-buscharter.png' },
    { url: 'https://charterbus.is/', file: 'screenshot-charterbus.png' }
  ];
  
  for (const site of sites) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    try {
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.screenshot({ path: site.file, fullPage: false });
      console.log(`Screenshot saved: ${site.file}`);
    } catch (err) {
      console.log(`Error capturing ${site.url}: ${err.message}`);
    }
    await page.close();
  }
  
  await browser.close();
  console.log('Done!');
})();