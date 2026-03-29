export interface Organization {
  domain: string;
  rootFolderId?: string;
  setupComplete: boolean;
  createdAt: string;
}

export interface Meeting {
  id: string;
  month: number;
  title: string;
  date: string;
  packetUrl?: string;
  calendarEventId?: string;
  status: 'upcoming' | 'completed' | 'draft';
}

export interface Topic {
  id: string;
  meetingId: string;
  title: string;
  now: string;
  headed: string;
  brainstormUrl?: string;
  voteUrl?: string;
  actionPlan: string;
}
