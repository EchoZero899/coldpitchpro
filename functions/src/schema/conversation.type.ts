export interface Conversation {
  uid: string;
  userId: string;
  userEmail: string;

  status: ConversationStatus;

  personaName: string; // 'John Doe'
  personaRole: string; // 'busy VC Investor'
  personaTitle: string; // 'Partner at Example Ventures'
  personaTone: string; // 'Professional and concise'
  personaPersonality: string; // 'Analytical and skeptical'
  personaMotivation: string; // 'To find promising startups to invest in'

  vendorRole: string; // 'new startup founder'
  vendorMotivation: string; // 'trying to get you to meet about their startup'

  emailsReceived: number; // number of emails received from vendor so far
  ghostedCount: number; // number of times 'ghost' decision has been made

  memories: ConversationMemory[];

  createdAt: Date;
  updatedAt: Date;
}

export enum ConversationStatus {
  Ghosted = 'ghosted',
  Engaged = 'engaged',
  Declined = 'declined',
  Accepted = 'accepted',
}

export interface ConversationMemory {
  reaction: string;
  thoughts: string;
}
