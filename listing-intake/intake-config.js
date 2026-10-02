/* ════════════════════════════════════════════════════════════
   Listing Intelligence: settings for the Create a Listing page
   This is the only file you normally edit.
   ════════════════════════════════════════════════════════════ */
window.LISTING_INTAKE_CONFIG = {
  /* true  = demo: nothing is saved or sent anywhere. Approve runs a simulated
             Excel → Canva flyer → Ready for Review sequence, exactly like the mockup.
     false = live: every action is sent to the backend below. */
  DEMO_MODE: true,

  /* true = open with the sample listing (2500 Central Ave) and sample files.
     Set to false for real use so every new listing starts blank. */
  START_WITH_SAMPLE: true,

  /* Show the "Demo: simulate a failure" picker in the status bar (demo mode only). */
  SHOW_DEMO_TOOLS: true,

  /* Live mode only. Leave blank when the page runs inside the Apps Script intake
     deployment (it then uses google.script.run automatically). Otherwise the URL of
     the intake web app. It must NOT be the public website endpoint in js/config.js. */
  ENDPOINT: "",

  /* Live mode only: how often to check Excel / flyer progress after approval (seconds). */
  STATUS_POLL_SECONDS: 10
};
