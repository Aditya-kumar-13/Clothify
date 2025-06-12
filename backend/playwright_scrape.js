import { chromium } from 'playwright';
import { firefox } from 'playwright';


const searchQuery = process.argv[2];

function extractFashionKeywords(caption) {
  const keywords = [
    'suit', 'tie', 'shirt', 'jacket', 'dress', 't-shirt', 'kurta', 'jeans',
    'trousers', 'blazer', 'saree', 'hoodie', 'skirt', 'pant', 'sweater',
    'coat', 'top', 'lehenga', 'ethnic', 'formal', 'casual', 'gown', 'shorts',
    'shoes', 'sneakers', 'tunic', 'denim', 'tuxedo', 'crop top', 'jumpsuit',
    'chinos', 'polo', 'tracksuit', 'kurti', 'blouse',

    'red', 'blue', 'black', 'white', 'green', 'yellow', 'pink', 'purple',
    'orange', 'grey', 'brown', 'beige', 'maroon', 'navy', 'teal', 'olive',

    'men', 'women', 'boys', 'girls', 'male', 'female'
  ];

  const cleanCaption = caption.toLowerCase().replace(/[^\w\s]/g, '');

  const matched = keywords.filter(word => cleanCaption.includes(word));
  return matched.join(' ') || caption;
}



const query = extractFashionKeywords(searchQuery);

(async () => {
  const browser = await firefox.launch({ headless: true });


  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  const page = await context.newPage();
  const results = [];

  try {
    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.s-main-slot');

  const amazonItems = await page.$$eval('.s-main-slot .s-result-item', items => {
    return items.map(item => {
      const title = item.querySelector('h2 span')?.textContent?.trim() || null;
      const price = item.querySelector('.a-price-whole')?.innerText || null;
      const image = item.querySelector('img')?.src || null;
      const link = item.querySelector('h2 a')?.href;
      const formattedLink = link?.startsWith('http') ? link : `https://www.amazon.in${link}`;

      if (title && price && image) {
        return {
          title,
          price,
          image,
          link: formattedLink,
          source: 'Amazon'
        };
      }
      return null;
    }).filter(item => item !== null);
  });

  results.push(...amazonItems);

await page.goto(`https://www.myntra.com/${query.replace(/\s+/g, '-')}?rawQuery=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    await page.waitForSelector('.search-searchProductsContainer', { timeout: 30000 });

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });

    await page.waitForTimeout(2000);

    const myntraItems = await page.$$eval('.product-base', items => {
      return items.map(item => {
        const title = item.querySelector('.product-product')?.textContent?.trim() || null;
        const price = item.querySelector('.product-discountedPrice')?.textContent?.replace(/[^\d.]/g, '') || null;
        const image = item.querySelector('img')?.src || null;
        const linkEl = item.querySelector('a');
        const relativeLink = linkEl?.getAttribute('href');
        const link = relativeLink ? `https://www.myntra.com${relativeLink}` : null;

        if (title && price && image && link) {
          return { title, price, image, link, source: 'Myntra' };
        }
        return null;
      }).filter(Boolean);
    });

    results.push(...myntraItems);

  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
    console.log(JSON.stringify(results || []));
  }
})();