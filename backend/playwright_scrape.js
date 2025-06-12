import { chromium } from 'playwright';

const searchQuery = process.argv[2];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  // Amazon
  await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`);
  await page.waitForSelector('.s-main-slot');

  const amazonItems = await page.$$eval('.s-main-slot .s-result-item', items => {
    return items.slice(0, 3).map(item => {
      const title = item.querySelector('h2 span')?.innerText;
      const price = item.querySelector('.a-price-whole')?.innerText;
      const image = item.querySelector('img')?.src;
      const link = item.querySelector('h2 a')?.href;
      return { title, price, image, link: `https://amazon.in${link}`, source: 'Amazon' };
    }).filter(p => p.title);
  });

  results.push(...amazonItems);

  // Flipkart
  await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`);
  await page.waitForTimeout(3000);

  const flipkartItems = await page.$$eval('div._1AtVbE', items => {
    return items.slice(2, 5).map(item => {
      const title = item.querySelector('._4rR01T, .IRpwTa')?.innerText;
      const price = item.querySelector('._30jeq3')?.innerText;
      const image = item.querySelector('img')?.src;
      const link = item.querySelector('a')?.href;
      return { title, price, image, link: `https://flipkart.com${link}`, source: 'Flipkart' };
    }).filter(p => p.title);
  });

  results.push(...flipkartItems);

  await browser.close();
  console.log(JSON.stringify(results));
})();
