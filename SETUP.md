# Remaining setup (5–10 minutes)

Live site (after you enable Pages): https://brelloringcapital-del.github.io/dallas-mobile-rv-repair-directory
Repo: https://github.com/brelloringcapital-del/dallas-mobile-rv-repair-directory

## 1. Enable GitHub Pages (required – only you can do this)

1. Open: https://github.com/brelloringcapital-del/dallas-mobile-rv-repair-directory/settings/pages
2. Under **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main** · Folder: **/ (root)** → **Save**
4. Wait ~30–60 seconds. Site will be at:
   https://brelloringcapital-del.github.io/dallas-mobile-rv-repair-directory

## 2. Tally forms (free)

Create two forms at https://tally.so

**Form A – Add Your Business**
Fields: Business Name, Category (dropdown: Emergency Service / Routine Maintenance / Mobile Mechanics), Phone, Email, Website, Address / Service Area, Description

**Form B – Claim Listing**
Fields: Business Name, Your Email, Phone, Proof / Notes

After creating each form:
- Share → copy the form link
- Replace in `index.html`:
  - `YOUR_ADD_FORM_ID` → Form A id
  - `YOUR_CLAIM_FORM_ID` → Form B id
- In Form A: Integrations → Webhook → paste your Google Apps Script Web App URL (step 3)

## 3. Google Sheet + Apps Script

1. Create a new Google Sheet
2. Rename first tab to **Pending Review**
3. Paste headers from `pending-review-headers.csv` into row 1
4. Create second tab **Verified Listings** (same headers + column L: Featured)
5. Optional: File → Import → upload `sample-listings.csv` into Verified Listings
6. Extensions → Apps Script → delete any default code → paste entire `Code.gs` → Save
7. Deploy → New deployment → Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Copy the Web App URL → paste into Tally Form A webhook

## 4. Real listings

1. Open Google Maps → search `Mobile RV Repair in Dallas`
2. F12 → Console → paste `google-maps-scraper.js` → Enter
3. Download CSV → clean → import into **Verified Listings**
4. Update the `LISTINGS` array in `index.html` (or later load from a published Sheets CSV)

## 5. Outreach

Copy Email 1 / Email 2 from `seo-and-outreach-templates.md`.
`Code.gs` already generates drafts into column K when submissions arrive.

---

Site URL already set in Code.gs and index.html canonical to:
https://brelloringcapital-del.github.io/dallas-mobile-rv-repair-directory
