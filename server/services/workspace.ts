import { google } from "googleapis";
import { GoogleGenAI } from "@google/genai";

export class WorkspaceService {
  private drive;
  private docs;
  private sheets;
  private forms;
  private calendar;
  private ai: GoogleGenAI;

  constructor(tokens: any) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials(tokens);
    this.drive = google.drive({ version: "v3", auth });
    this.docs = google.docs({ version: "v1", auth });
    this.sheets = google.sheets({ version: "v4", auth });
    this.forms = google.forms({ version: "v1", auth });
    this.calendar = google.calendar({ version: "v3", auth });
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async setupGovernanceSystem(domain: string) {
    console.log(`Setting up governance system for ${domain}`);

    // 1. Create Root Folder
    const rootFolder = await this.drive.files.create({
      requestBody: {
        name: "CDI Governance System",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    const rootId = rootFolder.data.id!;

    // 2. Create Subfolders
    const folders = [
      "01_Yearly_Cycle",
      "02_Meeting_Packets",
      "03_Templates",
      "04_Mentor_Feedback",
      "05_Chapter_Writing",
      "06_Archives",
    ];

    const folderMap: Record<string, string> = {};
    for (const name of folders) {
      const folder = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [rootId],
        },
        fields: "id",
      });
      folderMap[name] = folder.data.id!;
    }

    // 3. Create 12 Months in Yearly Cycle
    for (let i = 1; i <= 12; i++) {
      await this.drive.files.create({
        requestBody: {
          name: `Month_${i.toString().padStart(2, '0')}`,
          mimeType: "application/vnd.google-apps.folder",
          parents: [folderMap["01_Yearly_Cycle"]],
        },
      });
    }

    // 4. Create Templates in 03_Templates
    const templates = [
      { name: "Agenda_Template", type: "application/vnd.google-apps.document" },
      { name: "Minutes_Template", type: "application/vnd.google-apps.document" },
      { name: "Chapter_Writing_Template", type: "application/vnd.google-apps.document" },
      { name: "Mentor_Onboarding_Template", type: "application/vnd.google-apps.document" },
      { name: "Board_Onboarding_Template", type: "application/vnd.google-apps.document" },
      { name: "Action_Tracker_Template", type: "application/vnd.google-apps.spreadsheet" },
    ];

    for (const t of templates) {
      await this.drive.files.create({
        requestBody: {
          name: t.name,
          mimeType: t.type,
          parents: [folderMap["03_Templates"]],
        },
      });
    }

    // 5. Create Forms
    const formNames = ["Voting_Form_Template", "Brainstorm_Form_Template", "Mentor_Feedback_Form"];
    for (const name of formNames) {
      await this.forms.forms.create({
        requestBody: {
          info: { title: name },
        },
      });
      // Note: Moving forms to folders is tricky as they are created in root by default
      // In a full implementation, we'd use drive.files.update to move them
    }

    // 6. Generate Director's Script with Gemini
    const script = await this.generateDirectorScript();

    return {
      rootId,
      folderMap,
      script,
    };
  }

  private async generateDirectorScript() {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a TEDx-style director's script for the first CDI board meeting. Include slide-by-slide guidance, pacing, transitions, and prompts for discussion.",
    });
    return response.text;
  }

  async createCalendarEvent(month: number) {
    const event = {
      summary: `CDI Board Meeting - Month ${month}`,
      description: "Monthly governance and decision-making session.",
      start: {
        dateTime: new Date(2026, 3, 15, 10, 0, 0).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(2026, 3, 15, 12, 0, 0).toISOString(),
        timeZone: "UTC",
      },
      conferenceData: {
        createRequest: { requestId: `meeting-month-${month}` },
      },
    };

    return this.calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });
  }
}
