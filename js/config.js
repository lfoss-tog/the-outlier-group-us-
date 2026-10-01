/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — site configuration
   ════════════════════════════════════════════════════════════ */
const OG_CONFIG = {
  /* Google Apps Script Web App (google-apps-script.gs). One endpoint for:
     NDA requests + Natasha's approve/deny + protected-detail access,
     leads, Client Portal search logging (Google Sheet → Excel, one new row per search),
     NDA approval tracking (Sheet + optional Airtable),
     portal analytics (all-visitor stats) and the AI Assistant. */
  ENDPOINT: "https://script.google.com/macros/s/AKfycbzlNzzfjg0UkyIp5iK1Bcepbe2mPlW6c2muagIas2IkfS2olFfX_ZpIsJYnf8GlGJYj/exec",

  /* NDA every off-market request signs */
  NDA_PDF: "assets/docs/OG_2026_Agent_NDA_with_principal.pdf",
  NDA_VERSION: "OG 2026 Agent NDA with Principal",
  NDA_APPROVER: "Natasha Santillana",

  /* AI Assistant: true = ask Claude through the Apps Script (needs ANTHROPIC_API_KEY
     in Script Properties). If the call fails, the assistant answers from the
     site's built-in knowledge instead. */
  AI_ENABLED: true,

  /* Logo used on generated brochures */
  LOGO_WHITE: "assets/img/site/og-monogram-white.png",

  /* Map tiles: OpenStreetMap (free, no API key; attribution required).
     Shown in grayscale by css/style.css (inverted in dark mode) to match the black-and-white design.
     CARTO's basemaps were replaced because they now return "API KEY REQUIRED" tiles. */
  TILES_LIGHT: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  TILES_DARK: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  TILES_ATTRIB: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
};
