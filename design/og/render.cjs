// Regenerates public/og-v2.png (1200×630) from og.html.
// Usage: node design/og/render.cjs   (needs Playwright + its Chromium available)
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + path.join(__dirname, 'og.html'));
  await p.waitForFunction('window.__done === true');
  await p.locator('canvas').screenshot({ path: path.join(__dirname, '../../public/og-v2.png') });
  await b.close();
})();
