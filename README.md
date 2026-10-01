# The Outlier Group — Website (2026, v7)

This is a static site you can host on GitHub Pages, Netlify, or any web host. There's no build step: upload the folder as-is.
Every page, link, and article lives on this site. Nothing points back to the old outliergroup.us.

## What's in this folder
```
index.html                 the whole site (pages are hash links, see below)
css/style.css              all styling (color tokens at the top; light + dark; chart colors --c1…--c4)
js/config.js               backend URL, NDA file, approver name, AI on/off, map tiles
js/consent.js              cookie consent banner (Accept All / Deny / Manage Preferences)
js/data.js                 content: listings, team, services, sectors, brands, FAQ
js/insights.js             all 24 Market Insights articles (text + images, rebuilt from the old site)
js/charts.js               the Client Portal charts (bars, donut, trend, split), no library
js/brochure.js             "Download Property Brochure": builds a branded PDF for each property
js/nda.js                  NDA review → details → signature → signed PDF → submit for approval
js/app.js                  pages, portfolio, maps, Client Portal + analytics, off-market access, forms
js/assistant.js            the "Ask Outlier" AI Assistant (button on every page)
assets/img/brands/          the 25 original client logos from outliergroup.us (full quality, true colors)
assets/img/listings|insights|team|site
assets/docs/OG_2026_Agent_NDA_with_principal.pdf
google-apps-script.gs      backend: Drive, Google Sheet (opens in Excel), email, AI · Airtable only for NDA approvals (optional)
```

## Pages
| Link | Page |
|---|---|
| `#home` | Home |
| `#sectors` · `#services` · `#why-outlier` · `#our-team` | Company pages (`#why-outlier` has Our History and Brands We've Worked With) |
| `#team-<slug>` | One profile page per team member, e.g. `#team-mac-autrey`. Old Wix addresses such as `#macautrey` redirect here. |
| `#portfolio` | Our Portfolio: the complete property showcase (available, off-market, pending, leased, sold, past), with filters, grid, and map |
| `#property-<id>` | One page per listing, including every off-market property (`#property-om-…`) |
| `#insights` | Market Insights: featured article, category filters, search |
| `#insight-<slug>` | One page per article, e.g. `#insight-market-update-summer-2025` |
| `#portal` | Client Portal: personalized search that shows off-market opportunities first (NDA), then on-market matches (no NDA) |
| `#calculator` · `#calculator-<id>` | Outlier Investment Calculator (blank, or pre-filled for one property) |
| `#submit-property` | Submit a Property form |
| `#contact` · `#privacy` | Contact form · Privacy Policy (your original policy + a website & cookies section) |
| `#access-<ref>-<token>` | Private link from the approval email (unlocks one off-market property) |

## 1. Client Portal search tracking (Google Sheet → Excel only)
Portal searches are stored **only** in your Google Sheet through the existing Apps Script. Airtable isn't used for them.
Every click on **Find My Opportunities** appends **new rows** at the bottom. Earlier searches are never overwritten or edited, and a script lock keeps simultaneous searches from colliding. Recording starts only after the visitor accepts the Client Portal notice.

**Matching_Searches** tab: one row per search.

| Column | What it holds |
|---|---|
| Timestamp · Search ID · Session ID · Search # (this visit) | When the search ran and who ran it (anonymous IDs) |
| User Type · Looking To | Buyer / Owner-User, Investor, Tenant, Landlord, or Developer · Buy or Lease |
| Budget · Location · Timing · Building Type · Size | The selected requirements |
| Match Count · Off-Market Matches · On-Market Matches · Total Matching SF | Result totals |
| Top Match · Top Match % · Matching Properties · Matching Listing IDs | The matching properties with their match % |
| Portal Consent · Device · Page | Consent time, Mobile / Tablet / Desktop, and the page |

**Portal_Search_Results** tab: one row per matching property. It starts with the search details, then uses your listings-spreadsheet columns
`property name | location | status | Agent | Unit # & Space Available (SF) | Building Size: | Property Type | Unit Size (SF):`, then Listing ID, Deal, and Match %.
Off-market rows show the real name and address here. The sheet is private to you.

If an older **Matching_Searches** tab already exists, its rows stay as they are. The script adds any missing column headers on the right and appends new searches underneath.
To get an Excel copy, open the Google Sheet and choose **File → Download → Microsoft Excel (.xlsx)**.

## Portfolio vs. Client Portal
Both sections read the same property data (`LISTINGS` in `js/data.js`), so a change there shows up in both.
- **Our Portfolio: complete showcase.** Every property and every status: Available, Off-Market, Pending, Leased, Sold, and Past Listings. Off-market cards appear locked, with no address or photos.
- **Client Portal: personalized search focused on off-market.** Results always start with a **confidential off-market section**. Each property there needs an NDA, and the button reads **Request access**. The **"Also Available On-Market"** section comes next. Those properties open straight to their public page (**View property**), and **no NDA is required**. If no off-market property fits every requirement, the closest off-market fits are still shown first.
- **NDA workflow:** only off-market property pages have the View & Sign NDA flow. On-market property pages never ask for an NDA.

### How the portal works
- **Left side:** "I am a…" (Buyer / Owner-User, Investor, Tenant, Landlord, Developer), then Your Requirements (Budget, Location, Timing, Type of Building, Size) and **Find My Opportunities**.
- **Right side:** Portfolio Intelligence. It shows the whole inventory at first, previews live as filters change, and locks to your results when you search. It includes KPIs, listings by property type, top locations, size distribution, available vs. leased, and off-market vs. on-market.
- **Below both:** Your Matching Opportunities, ranked by match %, with off-market first on ties, and **Get These Sent to You**. Under that is Search activity & trends: searches over time and the most-selected types, locations, and sizes.

## Cookie consent
A privacy dialog appears on the first visit, before the site can be used. It offers **Accept All**, **Deny** (strictly necessary only), and **Manage Preferences** (Preferences and Analytics switches).
- The choice is saved in the browser and recorded on the **Cookie_Consent** tab.
- The choice is enforced:
  - with Preferences off, theme and recent searches last only for that page view;
  - with Analytics off, the Portfolio filter, Assistant question, brochure download, and calculator logs aren't sent.
- Visitors can change their choice any time from **Cookie Preferences** in the footer or on the Privacy page.

## Investment Calculator
This rebuilds your Outlier Investment Calculator with the same inputs and formulas: Lease Type (NNN / Modified Gross / Gross), Purchase Price, Rental Income, Vacancy, Taxes, Insurance, CAM, and Other. It gives Total Income, Total Expenses, NOI, and CAP Rate.
It adds Financing & Growth (down payment, rate, amortization, closing costs, hold period, rent growth, appreciation, selling costs), which gives:
- total investment, cash flow, cash-on-cash ROI, and DSCR;
- projected sale, total profit, IRR, and equity multiple;
- an equity chart and a year-by-year table.

You can open it from the Client Portal tabs, the Portfolio Intelligence panel, the footer, and **Run the Numbers** on every property page, which pre-fills the published price and rent. Runs are logged on **Calculator_Runs** when Analytics is allowed.

## 2. NDA approval (Natasha)
1. On an off-market property page, the visitor clicks **View & Sign NDA**, reviews the NDA, enters their details, and signs.
2. The Apps Script creates a **private Google Drive folder** for that person and property, then saves the signed NDA inside it:
   ```
   Outlier Group – Signed NDAs/
     John Smith - [Property Name]/
       Signed NDA - John Smith - [Property Name].pdf
   ```
   The folder name follows `FirstName LastName - Property Name`. It uses the real property name from `CONFIG.OFF_MARKET`, which is safe because the folder is private.
   A row is added to **NDA_Signatures** with Status = *Pending* and the Drive references (FolderName, FolderID, FolderURL, FileName, FileID, FileURL). If Airtable is connected, a record also goes to **NDA Requests**, with Drive Folder, Drive Folder URL, NDA Document, and NDA File.
3. **Natasha gets an email at outreach@outliergroup.us** with the signer's details, the property, the status, a link to the PDF, and two buttons: **Approve** and **Deny**. Both buttons are signed links, so they can't be forged or edited.
4. **Approve** → Status = Approved (in the Sheet, and in Airtable if connected). The visitor is emailed a private link that unlocks the property's address, photos, pricing notes, map, and full brochure.
   **Deny** → Status = Denied. The visitor gets a courteous note and access stays restricted.
5. A visitor can click **Check approval status** on the property page at any time.

**One folder per person and property.** If the same person signs NDAs for two properties, they get two separate folders. Folders are matched by email and property, so two different people with the same name never share one. The second person's folder name gets their email added in parentheses.

**Duplicate protection.** The script runs under a lock, so simultaneous submissions can't race each other. No new folder, file, email, or row is created when:
- the same submission arrives twice (same reference, from a network retry or a double click);
- the same person signs again for the same property while their request is still **Pending** or **Approved**.

In both cases the website shows "You already have a request for this property", and the attempt is logged on the **NDA_Duplicates** tab. After a **Denied** request, a new signature is accepted. It's saved in the same folder, with the date added to the filename.

**Access stays restricted.**
- The parent folder is set to *Restricted*, with no link sharing, and is shared only with the accounts in `CONFIG.NDA_FOLDER_EDITORS` (default `outreach@outliergroup.us`).
- Every person/property folder and every NDA file is also set to Restricted, and they inherit only those editors.
- Drive links appear only in the internal email to outreach@ and in the private Sheet. The signer gets the PDF as an attachment, never a Drive link.
- The Apps Script runs as the company account that owns the folder (Deploy → Execute as: **Me**).

The confidential details (real names, addresses, coordinates) live **only** in `CONFIG.OFF_MARKET` inside the Apps Script. They are never in the website code, so nobody can read them in the page source.

## 3. Property brochures
Every property page has **Download Property Brochure**. It builds a 2-page PDF in the visitor's browser with:
- the branded header, address, type, and status;
- a hero photo, Unit # & Space Available, Building Size, and Unit Size;
- the fact table (price or terms, where published), overview, highlights, and a photo grid;
- the advisor's contact details.

Before approval, an off-market property downloads a **Confidential Teaser** instead, with no address. After approval it downloads the full brochure.
Each download is logged on the **Brochure_Downloads** tab.

## 4. AI Assistant
The **Ask Outlier** button appears on every page and offers the four suggested questions. It answers only from the site's own content: services, sectors, listings, off-market access, the portal, Market Insights, the team, and the FAQ. It links to pages on this site, and when it can't answer it sends the visitor to Contact.
- Add Script Property **`ANTHROPIC_API_KEY`** to have Claude write the answers, restricted to that approved content. The key stays on Google's servers.
- Without a key, or if the AI call fails, the built-in answer engine responds instead. The assistant always works.
- Questions are logged on the **Assistant_Questions** tab.

## Go-live checklist (one time)
1. **Apps Script**: open the Google Sheet behind your endpoint → Extensions → Apps Script → replace the code with `google-apps-script.gs`.
2. In `CONFIG`:
   - `NDA_APPROVER_EMAIL` is set to `outreach@outliergroup.us` (Natasha's Approve / Deny emails);
   - check that `SITE_URL` is where the new site will live;
   - optionally set `NDA_PARENT_FOLDER_ID`.
3. **Project Settings → Script Properties**, both optional:
   - `AIRTABLE_TOKEN`: only if you want NDA requests mirrored to Airtable. Use a Personal Access Token with `data.records:read` and `data.records:write`;
   - `ANTHROPIC_API_KEY`: for the AI Assistant.
4. **Airtable (optional, NDA approvals only)**: set `CONFIG.AIRTABLE.BASE_ID` and create one table. Leave `BASE_ID` blank to skip Airtable entirely; everything is still recorded in the Google Sheet.
   - **NDA Requests**: Reference, Status, Requested At, Decided At, Property ID, Property, Public Title, Signing As, Signer Name, Signer Title, Signer Company, Signer Email, Signer Phone, Principal Name, Principal Email, Advisor, NDA File, Property Folder
5. Run **`setup`** once and approve Drive, Sheets, Gmail, and external requests.
6. **Deploy → Manage deployments → Edit → Version: New version → Deploy**. This keeps the same `/exec` URL that's in `js/config.js`. Access must be **Anyone**.
7. Upload this folder to your host. Test once:
   - press **Find My Opportunities** twice and check for two new rows on **Matching_Searches**;
   - sign an NDA, approve it from the email to outreach@, and open the access link.

## Team profiles
Every card on **Our Team** (and in the home-page team strip) opens that person's profile page. Each profile has:
- their photo, name, and title;
- the full bio from their outliergroup.us profile;
- focus areas and an "At a glance" summary (education, experience, languages, and so on, taken from the bio);
- direct email, phone, and LinkedIn;
- their current listings, if they're the listing advisor;
- a **Send a message** form, which goes to the **Leads** tab and emails that person;
- previous and next navigation, and links to the rest of the team.

Advisor panels on property pages link to the advisor's profile. The Assistant can answer "Who is…?" questions and link to the right profile.
To edit a profile, change its entry in `TEAM` in `js/data.js`. Photos are in `assets/img/team/`.

## Editing
- **Listings**: `js/data.js` → `LISTINGS`. The card fields are `space`, `building`, and `unit`. Set `offMarket: true` for Client Portal and NDA properties, and add their private details to `CONFIG.OFF_MARKET` in the Apps Script.
- **Articles**: `js/insights.js`. Each article is a list of blocks: `{p}`, `{h}`, `{q}`, `{img}`, `{ul}`. The newest article goes first and becomes the featured card.
- **Colors**: the tokens at the top of `css/style.css`.

## Brand update (typography, colors, portal filters)
- **Typography and colors** follow the Outlier Group Brand Guidelines:
  - Libre Caslon Display for page titles and section headlines
  - Libre Caslon Text for body copy and subheadings
  - Libre Franklin for labels, navigation, buttons, tags, forms and footers
  - Colors are monochrome only: White #FFFFFF, Ink Black #141414 and Secondary Gray #5A5752
- **Font sizes** are set in `css/style.css` at the top (`--fs-page-title`, `--fs-section`, `--fs-subhead`, `--fs-body`, `--fs-label`):
  - Page titles: 90–108px on desktop, 48px on phones
  - Section headlines: 64–84px
  - Subheadings: 38–44px
  - Labels: 16px, bold, letterspaced capitals
  - Body copy: 20px (18px on phones), which keeps pages readable on screen
- **Themes:** the site opens white. The theme button switches to the inverted black version.
- **Client Portal filters** ("I am a…" and "Your Requirements") are hidden behind the **Filters** button.
  - A summary line next to the button shows the current choices.
  - **Find My Opportunities** and **Reset** stay visible, and the matching logic is unchanged.
- **Mac's profile:**
  - His email line and message form go to outreach@outliergroup.us (Natasha), and only the main office line is shown.
  - "Acquisitions" replaces "Brokerage Leadership".
  - His profile doesn't list properties (`"showListings": false` in `js/data.js`). The listing records and his listing-agent panels are unchanged.
- **Client Portal and NDA screens** say "our team" instead of naming the approver. Approval emails still go to `CONFIG.NDA_APPROVER_EMAIL` in the Apps Script.
- **Property pages** add a **Property Details** table (address, county, region, type, status, availability, sizes, listing advisor). The listing's own facts are split into **Property Characteristics**, **Pricing / Sale Details** and **Area & Traffic**. Only values already in `js/data.js` are shown.

## Maps
- Maps use **Leaflet** (loaded from cdnjs) with **OpenStreetMap** tiles. They're free, need no API key, and must keep the "© OpenStreetMap contributors" credit.
- The tiles are shown in grayscale (inverted in dark mode) to match the black-and-white design.
- The tile settings are `TILES_LIGHT`, `TILES_DARK` and `TILES_ATTRIB` in `js/config.js`.
- The earlier CARTO basemap was replaced because CARTO now returns "API KEY REQUIRED" tiles.
- Maps don't show tiles inside the private Claude preview, which blocks outside map images. They work on the published site.

## Notes
- **Privacy**: your original policy text is used as-is. It only covers SMS/MMS, so a "Website, Cookies & Client Portal" section was added below it. Have that section reviewed before launch.
- **Careers** opens an email to solutions@ because there's no careers page on the new site.
- **Brand logos** are the original files from outliergroup.us (1000×1000), trimmed of padding and shown on white tiles so their true colors stay intact.
- **Listing photos added (Sept 2026):** 6533 Central Ave., Jacksonville Assembly, 3662 & 3612 Morris St N, 1962 Hawaii Ave NE, and 1322 Pelican Creek Crossing now have photos from your Drive folders and Canva flyer. Each shows up to 5 photos, the gallery's limit.
- Bailiwick Plaza photos come from the 2026 lease flyer PDF. Doggy Daycare uses the South Street photo (same building).
- **Still without photos:** the three confidential off-market properties.
- **Team details to confirm:**
  - **Vanessa Autrey** has no profile page on the old site, so her profile shows her photo, title, and the main office contact until you send a bio.
  - **Natasha's title** is "Advisor Liaison" on the old team page but "Agent Liaison" on her profile page. The new site uses "Agent Liaison".
  - The phone numbers shown as text on the old profiles didn't always match the numbers they dialed. The new site uses the numbers shown: Mac 813-530-9464, Jason 347-693-3447, and Monsie 813-454-1038. On the old site, Mac's link dialed 321-300-6221, and Jason's and Monsie's links dialed Joyce's number.
- **Largo Professional Center**: the sheet says *1200* Seminole Blvd; the old site said *11200*.
