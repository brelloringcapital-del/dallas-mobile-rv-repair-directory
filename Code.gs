/**
 * Google Apps Script – Directory submission webhook + cold email draft generator
 *
 * SETUP:
 * 1. Create a Google Sheet with two tabs: "Pending Review" and "Verified Listings"
 * 2. In "Pending Review" put headers in row 1:
 *    Timestamp | Business Name | Category | Phone | Email | Website | Address | Description | Source | Status | Cold Email Draft
 * 3. Extensions → Apps Script → paste this entire file → Save
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste it as the webhook endpoint in Tally (or Google Forms)
 *
 * Optional: Use the custom menu "Directory Tools" → Regenerate Cold Email
 */

const PENDING_SHEET = "Pending Review";
const VERIFIED_SHEET = "Verified Listings";
const YOUR_SITE_URL = "https://brelloringcapital-del.github.io/dallas-mobile-rv-repair-directory";
const YOUR_NICHE = "Mobile RV Repair";
const YOUR_CITY = "Dallas, TX";
const FROM_NAME = "Dallas RV Repair Directory";

function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : "";
    let data = {};
    if (e.parameter && Object.keys(e.parameter).length) {
      data = e.parameter;
    } else if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (err) {
        data = {};
        raw.split("&").forEach(pair => {
          const [k, v] = pair.split("=");
          data[decodeURIComponent(k)] = decodeURIComponent((v || "").replace(/\+/g, " "));
        });
      }
    }

    const row = {
      timestamp: new Date().toISOString(),
      name: data.businessName || data.name || data["Business Name"] || data.company || "",
      category: data.category || data["Category"] || data.service || "General",
      phone: data.phone || data["Phone"] || data.telephone || "",
      email: data.email || data["Email"] || data.ownerEmail || "",
      website: data.website || data["Website"] || data.url || "",
      address: data.address || data["Address"] || data.serviceArea || "",
      description: data.description || data["Description"] || data.about || "",
      source: data.source || data.form || "Tally/Webhook",
      status: "Pending",
      coldEmail: ""
    };

    if (!row.name) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Missing business name" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let pending = ss.getSheetByName(PENDING_SHEET);
    if (!pending) {
      pending = ss.insertSheet(PENDING_SHEET);
      pending.appendRow([
        "Timestamp", "Business Name", "Category", "Phone", "Email", "Website",
        "Address", "Description", "Source", "Status", "Cold Email Draft"
      ]);
    }

    row.coldEmail = generateColdEmailDraft(row);

    pending.appendRow([
      row.timestamp,
      row.name,
      row.category,
      row.phone,
      row.email,
      row.website,
      row.address,
      row.description,
      row.source,
      row.status,
      row.coldEmail
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "Submitted for review" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Triggered when Status column is set to "Verified" on the Pending Review sheet.
 * Moves the row to Verified Listings and refreshes the cold email draft.
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== PENDING_SHEET) return;
  const col = e.range.getColumn();
  const row = e.range.getRow();
  if (row < 2) return;

  // Status is column 10 (J)
  if (col === 10 && String(e.value).toLowerCase() === "verified") {
    moveToVerified(sheet, row);
  }
}

function moveToVerified(pendingSheet, rowNum) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let verified = ss.getSheetByName(VERIFIED_SHEET);
  if (!verified) {
    verified = ss.insertSheet(VERIFIED_SHEET);
    verified.appendRow([
      "Timestamp", "Business Name", "Category", "Phone", "Email", "Website",
      "Address", "Description", "Source", "Status", "Cold Email Draft", "Featured"
    ]);
  }

  const values = pendingSheet.getRange(rowNum, 1, 1, 11).getValues()[0];
  values[9] = "Verified";
  const draftObj = {
    name: values[1],
    category: values[2],
    phone: values[3],
    email: values[4],
    website: values[5],
    address: values[6],
    description: values[7]
  };
  values[10] = generateColdEmailDraft(draftObj, true);
  values.push("No"); // Featured default

  verified.appendRow(values);
  pendingSheet.deleteRow(rowNum);
}

/**
 * Pre-formatted cold outreach email stored in the sheet column
 */
function generateColdEmailDraft(listing, isVerified) {
  const name = listing.name || "your business";
  const cat = listing.category || YOUR_NICHE;
  const site = YOUR_SITE_URL;

  if (isVerified) {
    return `Subject: You're now listed on the ${YOUR_CITY} ${YOUR_NICHE} directory (free)\n\nHi there,\n\nI wanted to let you know that ${name} has been added to our free local directory of ${YOUR_NICHE} providers in ${YOUR_CITY}.\n\nYour listing is live here: ${site}\n\nWe built this so local RV owners can quickly find trusted mobile repair and maintenance services. There's no cost and no obligation.\n\nIf anything looks incorrect (phone, service area, website), just reply to this email and we'll fix it the same day.\n\nWould you like us to mark the listing as Verified / Featured so it appears at the top with a badge? Happy to do that at no charge for the first month if you confirm ownership.\n\nThanks for serving the ${YOUR_CITY} RV community.\n\nBest,\n${FROM_NAME}\n${site}`;
  }

  return `Subject: ${name} added to the free ${YOUR_CITY} ${YOUR_NICHE} directory\n\nHi,\n\nQuick note: we recently added ${name} to our free directory of ${cat} providers serving ${YOUR_CITY}.\n\nListing URL: ${site}\n\nThis helps local RV owners find you when they search for mobile repair, emergency service, or routine maintenance.\n\nNo cost, no contracts. If you'd like to update the description, add a photo, or claim the listing so only you can edit it, reply to this email or use the claim form on the site.\n\nThanks,\n${FROM_NAME}\n${site}`;
}

/**
 * Custom menu to manually regenerate cold emails for the selected row
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Directory Tools")
    .addItem("Regenerate Cold Email for current row", "regenerateCurrentRowEmail")
    .addToUi();
}

function regenerateCurrentRowEmail() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  if (row < 2) return;
  const values = sheet.getRange(row, 1, 1, 11).getValues()[0];
  const draft = generateColdEmailDraft({
    name: values[1],
    category: values[2],
    phone: values[3],
    email: values[4],
    website: values[5],
    address: values[6],
    description: values[7]
  }, String(values[9]).toLowerCase() === "verified");
  sheet.getRange(row, 11).setValue(draft);
  SpreadsheetApp.getUi().alert("Cold email draft updated in column K.");
}
