import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), 'screenshots');

// Ensure screenshots directory exists
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function capturePageSections(page, pageName, sections) {
  console.log(`\n📸 Capturing ${pageName}...`);
  
  // Initial screenshot at top
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, `${pageName}-01-top.png`),
    fullPage: false
  });
  console.log(`  ✓ ${pageName}-01-top.png`);

  // Scroll and capture each section
  let sectionNum = 2;
  for (const section of sections) {
    // Scroll to section
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, section);
    
    // Wait for scroll to complete
    await wait(800);
    
    // Take screenshot
    const filename = `${pageName}-${String(sectionNum).padStart(2, '0')}-section.png`;
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, filename),
      fullPage: false
    });
    console.log(`  ✓ ${filename}`);
    sectionNum++;
  }

  // Final full page screenshot
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, `${pageName}-full.png`),
    fullPage: true
  });
  console.log(`  ✓ ${pageName}-full.png`);
}

async function captureAllPages() {
  console.log('🚀 Starting screenshot capture...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // HOMEPAGE - Most comprehensive
    console.log('=' .repeat(50));
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await wait(1000);
    
    // Capture top without scrolling first
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'homepage-01-hero.png'),
      fullPage: false
    });
    console.log('  ✓ homepage-01-hero.png');

    // Now scroll through each section
    const homepageSections = [
      'section:has(h2:contains("returns are a pain"))',  // Problem section
      'section:has(h2:contains("How It Works"))',        // How It Works
      'section:has(h2:contains("Major Retailers"))',     // Retailers
      'section:has(h2:contains("Your items"))',          // Trust
      'section:has(h2:contains("packaging"))',           // Packaging
      'section:has(h2:contains("Pricing"))',             // Pricing
      'section:has(h2:contains("Testimonials"))',        // Testimonials
      'footer'                                            // Footer
    ];

    let sectionNum = 2;
    for (let i = 0; i < homepageSections.length; i++) {
      // Scroll by viewport height to move down the page
      await page.evaluate((scrollNum) => {
        window.scrollBy(0, window.innerHeight * 0.8);
      }, i);
      
      await wait(800);
      
      const filename = `homepage-${String(sectionNum).padStart(2, '0')}-section.png`;
      await page.screenshot({
        path: join(SCREENSHOTS_DIR, filename),
        fullPage: false
      });
      console.log(`  ✓ ${filename}`);
      sectionNum++;
    }

    // Full page screenshot
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'homepage-full.png'),
      fullPage: true
    });
    console.log('  ✓ homepage-full.png');

    // FAQ PAGE
    console.log('\n' + '='.repeat(50));
    await page.goto('http://localhost:3000/faq', { waitUntil: 'networkidle2' });
    await wait(1000);
    
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'faq-01-top.png'),
      fullPage: false
    });
    console.log('  ✓ faq-01-top.png');

    // Scroll through FAQ
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
      await wait(500);
      
      const filename = `faq-${String(i + 2).padStart(2, '0')}-section.png`;
      await page.screenshot({
        path: join(SCREENSHOTS_DIR, filename),
        fullPage: false
      });
      console.log(`  ✓ ${filename}`);
    }

    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'faq-full.png'),
      fullPage: true
    });
    console.log('  ✓ faq-full.png');

    // PRIVACY PAGE
    console.log('\n' + '='.repeat(50));
    await page.goto('http://localhost:3000/privacy', { waitUntil: 'networkidle2' });
    await wait(1000);
    
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'privacy-top.png'),
      fullPage: false
    });
    console.log('  ✓ privacy-top.png');

    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'privacy-full.png'),
      fullPage: true
    });
    console.log('  ✓ privacy-full.png');

    // TERMS PAGE
    console.log('\n' + '='.repeat(50));
    await page.goto('http://localhost:3000/terms', { waitUntil: 'networkidle2' });
    await wait(1000);
    
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'terms-top.png'),
      fullPage: false
    });
    console.log('  ✓ terms-top.png');

    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'terms-full.png'),
      fullPage: true
    });
    console.log('  ✓ terms-full.png');

    // SIGNIN PAGE
    console.log('\n' + '='.repeat(50));
    await page.goto('http://localhost:3000/signin', { waitUntil: 'networkidle2' });
    await wait(1000);
    
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'signin-full.png'),
      fullPage: true
    });
    console.log('  ✓ signin-full.png');

    // SIGNUP PAGE
    console.log('\n' + '='.repeat(50));
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
    await wait(1000);
    
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'signup-full.png'),
      fullPage: true
    });
    console.log('  ✓ signup-full.png');

    console.log('\n' + '='.repeat(50));
    console.log('✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureAllPages().catch(console.error);
