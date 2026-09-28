# Hyper-Local Niche Directory – $0 Production Package

Complete end-to-end package for a high-intent local directory site (example: “Mobile RV Repair in Dallas”).

**Stack:** Google Sheets + GitHub Pages / Netlify + Tally.so + pure HTML/CSS/JS

---

## Package Contents

| File | Purpose |
|------|---------|
| `google-maps-scraper.js` | Browser console script – auto-scrolls Google Maps results, extracts listings, downloads CSV |
| `index.html` | Standalone directory frontend (search, filters, featured cards, modal, Schema.org JSON-LD) |
| `Code.gs` | Google Apps Script webhook – accepts Tally/form submissions, writes to “Pending Review”, generates cold-email drafts |
| `seo-and-outreach-templates.md` | Title/meta/H1/H2 patterns + Email 1 (value-first) + Email 2 (upgrade pitch) |

---

## Quick Start

### 1. Scrape listings
1. Open Google Maps → search your niche + city (e.g. `Mobile RV Repair in Dallas`).
2. Open DevTools (F12) → Console.
3. Paste the entire contents of `google-maps-scraper.js` and press Enter.
4. Wait for auto-scroll to finish. A CSV downloads automatically.
5. Clean the CSV and import into a Google Sheet tab named **Verified Listings**.

### 2. Deploy the frontend
1. Replace the sample `LISTINGS` array inside `index.html` with your real data (or load from a public Google Sheets CSV URL).
2. Replace the two Tally form URLs (`your-form-id` / `your-claim-form-id`).
3. Update the canonical URL, title, and meta description for your niche/city.
4. Push `index.html` to a GitHub repo and enable GitHub Pages, **or** drag-and-drop the file onto Netlify Drop.

### 3. Set up submissions + cold emails
1. Create a Google Sheet with two tabs: **Pending Review** and **Verified Listings**.
2. In Pending Review, row 1 headers:
   `Timestamp | Business Name | Category | Phone | Email | Website | Address | Description | Source | Status | Cold Email Draft`
3. Extensions → Apps Script → paste `Code.gs` → Save.
4. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
5. Copy the Web App URL into Tally → Integrations → Webhook.
6. When you set Status = “Verified” on a row, the script moves it to Verified Listings and refreshes the cold-email draft (column K).

### 4. Outreach
- Use **Email 1** when you first publish a free listing.
- Use **Email 2** 5–7 days later (or after engagement) to offer Featured / Verified upgrade.

---

## Customization Checklist

- [ ] Swap sample listings for real data from the scraper
- [ ] Update Tally form IDs in `index.html`
- [ ] Change `YOUR_SITE_URL`, `YOUR_NICHE`, `YOUR_CITY`, `FROM_NAME` in `Code.gs`
- [ ] Update title, meta description, H1, and canonical URL for your market
- [ ] (Optional) Duplicate `index.html` for additional cities and change the LISTINGS array + SEO tags

---

## Notes

- Zero paid services required.
- Google Maps DOM changes occasionally; if selectors break, re-inspect the left results panel and update the fallback arrays in the scraper.
- For production scale you can later swap the hard-coded `LISTINGS` array for a fetch of a published Google Sheets CSV.
