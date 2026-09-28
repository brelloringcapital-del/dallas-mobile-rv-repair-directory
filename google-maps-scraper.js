/**
 * Google Maps Listings Extractor
 * Paste into browser console on a Google Maps search results page.
 * Auto-scrolls the left panel, extracts listings with selector fallbacks,
 * prints console.table(), and downloads a CSV.
 *
 * Usage:
 * 1. Open https://www.google.com/maps/search/Mobile+RV+Repair+in+Dallas
 * 2. Open DevTools (F12) → Console
 * 3. Paste this entire script and press Enter
 * 4. Wait for scrolling to finish — CSV downloads automatically
 */
(async function extractGoogleMapsListings() {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Scroll the results panel until no new listings appear
  async function autoScrollResults() {
    const panelSelectors = [
      'div[role="feed"]',
      'div.m6QErb.DxyBCb.kA9KIf.dS8AEf',
      'div.m6QErb',
      '#QA0Szd div[role="main"]'
    ];
    let panel = null;
    for (const sel of panelSelectors) {
      panel = document.querySelector(sel);
      if (panel) break;
    }
    if (!panel) {
      console.warn('Results panel not found. Try scrolling manually first.');
      return;
    }

    let lastCount = 0;
    let stableRounds = 0;
    const maxRounds = 40;

    for (let i = 0; i < maxRounds; i++) {
      panel.scrollTop = panel.scrollHeight;
      await sleep(1200 + Math.random() * 800);

      // Click "Show more" / load more if present
      const moreBtn = document.querySelector('button[jsaction*="pane.paginationSection"]') ||
                      document.querySelector('button[aria-label*="more results"]') ||
                      Array.from(document.querySelectorAll('button')).find(b => /more|load|show/i.test(b.textContent));
      if (moreBtn) moreBtn.click();

      const cards = document.querySelectorAll('div.Nv2PK, a.hfpxzc, div[role="article"]');
      const count = cards.length;
      if (count === lastCount) {
        stableRounds++;
        if (stableRounds >= 3) break;
      } else {
        stableRounds = 0;
        lastCount = count;
      }
    }
    console.log(`Scrolled. Found ~${lastCount} cards.`);
  }

  await autoScrollResults();
  await sleep(1500);

  // Collect unique listing cards
  let cards = Array.from(document.querySelectorAll('div.Nv2PK, div.THOPZb, div[jsaction*="mouseover"]')).filter(el => {
    return el.querySelector('div.fontHeadlineSmall, a.hfpxzc, div.qBF1Pd');
  });
  if (cards.length === 0) {
    cards = Array.from(document.querySelectorAll('a.hfpxzc')).map(a => a.closest('div') || a);
  }

  const seen = new Set();
  const results = [];

  function text(el, sels) {
    for (const s of sels) {
      const n = el.querySelector(s);
      if (n && n.textContent.trim()) return n.textContent.trim();
    }
    return '';
  }

  function attr(el, sels, attrName) {
    for (const s of sels) {
      const n = el.querySelector(s);
      if (n) {
        const v = n.getAttribute(attrName) || n.href || n.src;
        if (v) return v;
      }
    }
    return '';
  }

  cards.forEach((card) => {
    const name = text(card, [
      'div.fontHeadlineSmall',
      'div.qBF1Pd',
      'a.hfpxzc',
      '[aria-label]',
      'div.fontBodyMedium'
    ]) || card.getAttribute('aria-label') || '';

    if (!name || name.length < 2) return;
    const key = name.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) return;
    seen.add(key);

    let rating = text(card, [
      'span.MW4etd',
      'span[aria-hidden="true"]',
      'div.fontBodyMedium span',
      'span.ZkP5Je'
    ]);

    let reviews = text(card, [
      'span.UY7F9',
      'span[aria-label*="review"]',
      'span.fontBodyMedium'
    ]);
    if (!reviews) {
      const aria = card.querySelector('[aria-label*="review"], [aria-label*="star"]');
      if (aria) reviews = aria.getAttribute('aria-label') || '';
    }

    const category = text(card, [
      'div.W4Efsd:nth-of-type(1) span',
      'div.fontBodyMedium > span',
      'button[jsaction*="category"]',
      'div.W4Efsd span'
    ]);

    let address = '';
    const lines = card.querySelectorAll('div.W4Efsd, div.fontBodyMedium, span.fontBodyMedium');
    lines.forEach(l => {
      const t = l.textContent.trim();
      if (t && (t.includes(',') || /\d/.test(t)) && !t.includes('·') && t.length > 8) {
        if (!address) address = t;
      }
    });

    let phone = text(card, [
      'span[aria-label*="Phone"]',
      'button[data-item-id*="phone"]',
      'a[href^="tel:"]'
    ]);
    if (!phone) {
      const tel = card.querySelector('a[href^="tel:"]');
      if (tel) phone = tel.href.replace('tel:', '') || tel.textContent;
    }

    let website = attr(card, [
      'a[data-item-id*="authority"]',
      'a[href*="http"]',
      'a[aria-label*="Website"]'
    ], 'href');
    if (website && website.includes('google.com')) website = '';

    let mapsUrl = attr(card, ['a.hfpxzc', 'a[href*="/maps/place"]'], 'href');
    if (!mapsUrl) {
      const link = card.closest('a') || card.querySelector('a');
      if (link) mapsUrl = link.href;
    }

    results.push({
      name: name.replace(/\n/g, ' ').trim(),
      rating: rating || '',
      reviews: (reviews || '').replace(/[()]/g, '').trim(),
      category: category || '',
      address: address || '',
      phone: phone || '',
      website: website || '',
      mapsUrl: mapsUrl || '',
      scrapedAt: new Date().toISOString()
    });
  });

  console.table(results);
  console.log(`Extracted ${results.length} unique listings.`);

  if (results.length === 0) {
    console.warn('No listings found. Make sure you are on a Maps search results page and results are visible.');
    return;
  }

  const headers = Object.keys(results[0]);
  const csvRows = [
    headers.join(','),
    ...results.map(row =>
      headers.map(h => {
        let val = (row[h] || '').toString().replace(/"/g, '""');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) val = `"${val}"`;
        return val;
      }).join(',')
    )
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `google-maps-listings-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('CSV downloaded.');
})();
