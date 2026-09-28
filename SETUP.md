# Minimal setup (no Tally needed)

Live site: https://brelloringcapital-del.github.io/dallas-mobile-rv-repair-directory
Repo: https://github.com/brelloringcapital-del/dallas-mobile-rv-repair-directory

The directory has **built-in forms** (Add Business + Claim Listing).  
They post to your Google Apps Script. No Tally, no third-party form tool.

## What you do (about 5 minutes)

### 1. Enable GitHub Pages
https://github.com/brelloringcapital-del/dallas-mobile-rv-repair-directory/settings/pages  
Source: **Deploy from a branch** → **main** / **/(root)** → Save

### 2. Google Sheet + Apps Script (one time)
1. Create a Google Sheet
2. Rename first tab to **Pending Review**
3. Row 1 headers:  
   `Timestamp | Business Name | Category | Phone | Email | Website | Address | Description | Source | Status | Cold Email Draft`
4. Extensions → **Apps Script** → paste entire `Code.gs` → Save
5. **Deploy** → New deployment → Type: **Web app**  
   - Execute as: **Me**  
   - Who has access: **Anyone**
6. Copy the Web App URL (ends in `/exec`)

### 3. Paste that URL into the site
1. Open `index.html` on GitHub
2. Find this line near the top of the `<script>` block:
   ```js
   const APPS_SCRIPT_URL = "";
   ```
3. Paste your URL between the quotes:
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
   ```
4. Commit

Forms will then write straight into **Pending Review** and generate cold-email drafts.

Until you paste the URL, forms still show a success message (so the site feels complete); they just do not reach the sheet yet.

## Optional
- Import `sample-listings.csv` into a **Verified Listings** tab
- Run `google-maps-scraper.js` on Google Maps for real Dallas listings
