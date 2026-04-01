const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const googleClientId = defineSecret("GOOGLE_CLIENT_ID");
const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");
const geminiApiKey = defineSecret("GEMINI_API_KEY");

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/calendar",
];

function getOAuthClient(req) {
  const { google } = require("googleapis");
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${protocol}://${host}/auth/google/callback`;

  return new google.auth.OAuth2(
    googleClientId.value(),
    googleClientSecret.value(),
    redirectUri
  );
}

// GET /api/auth/google/url
exports.authUrl = onRequest(
  { secrets: [googleClientId, googleClientSecret] },
  (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).send("");
    }

    const oauth2Client = getOAuthClient(req);
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
    res.json({ url });
  }
);

// GET /auth/google/callback
exports.authCallback = onRequest(
  { secrets: [googleClientId, googleClientSecret] },
  async (req, res) => {
    const { code } = req.query;
    const oauth2Client = getOAuthClient(req);

    try {
      const { tokens } = await oauth2Client.getToken(code);
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error exchanging code for tokens", error);
      res.status(500).send("Authentication failed");
    }
  }
);

// POST /api/setup
exports.setup = onRequest(
  {
    secrets: [googleClientId, googleClientSecret, geminiApiKey],
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).send("");
    }

    const { domain, tokens } = req.body;
    try {
      const { google } = require("googleapis");
      const { GoogleGenAI } = require("@google/genai");

      const auth = new google.auth.OAuth2();
      auth.setCredentials(tokens);

      const drive = google.drive({ version: "v3", auth });
      const forms = google.forms({ version: "v1", auth });
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });

      console.log(`Setting up governance system for ${domain}`);

      // 1. Create Root Folder
      const rootFolder = await drive.files.create({
        requestBody: {
          name: "CDI Governance System",
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      });
      const rootId = rootFolder.data.id;

      // 2. Create Subfolders
      const folders = [
        "01_Yearly_Cycle",
        "02_Meeting_Packets",
        "03_Templates",
        "04_Mentor_Feedback",
        "05_Chapter_Writing",
        "06_Archives",
      ];

      const folderMap = {};
      for (const name of folders) {
        const folder = await drive.files.create({
          requestBody: {
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [rootId],
          },
          fields: "id",
        });
        folderMap[name] = folder.data.id;
      }

      // 3. Create 12 Monthly Folders
      for (let i = 1; i <= 12; i++) {
        await drive.files.create({
          requestBody: {
            name: `Month_${i.toString().padStart(2, "0")}`,
            mimeType: "application/vnd.google-apps.folder",
            parents: [folderMap["01_Yearly_Cycle"]],
          },
        });
      }

      // 4. Create Templates
      const templates = [
        { name: "Agenda_Template", type: "application/vnd.google-apps.document" },
        { name: "Minutes_Template", type: "application/vnd.google-apps.document" },
        { name: "Chapter_Writing_Template", type: "application/vnd.google-apps.document" },
        { name: "Mentor_Onboarding_Template", type: "application/vnd.google-apps.document" },
        { name: "Board_Onboarding_Template", type: "application/vnd.google-apps.document" },
        { name: "Action_Tracker_Template", type: "application/vnd.google-apps.spreadsheet" },
      ];

      for (const t of templates) {
        await drive.files.create({
          requestBody: {
            name: t.name,
            mimeType: t.type,
            parents: [folderMap["03_Templates"]],
          },
        });
      }

      // 5. Create Forms
      const formNames = [
        "Voting_Form_Template",
        "Brainstorm_Form_Template",
        "Mentor_Feedback_Form",
      ];
      for (const name of formNames) {
        await forms.forms.create({
          requestBody: { info: { title: name } },
        });
      }

      // 6. Generate Director Script via Gemini
      const scriptResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents:
          "Generate a TEDx-style director's script for the first CDI board meeting. Include slide-by-slide guidance, pacing, transitions, and prompts for discussion.",
      });

      res.json({
        rootId,
        folderMap,
        script: scriptResponse.text,
      });
    } catch (error) {
      console.error("Setup failed", error);
      res.status(500).json({ error: "Setup failed" });
    }
  }
);

// GET /api/health
exports.health = onRequest((req, res) => {
  res.json({ status: "ok" });
});
