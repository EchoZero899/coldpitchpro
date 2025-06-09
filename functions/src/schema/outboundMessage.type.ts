export interface OutboundMessage {
  uid: string;
  userId: string;
  to: string;
  message: string;
  status: OutboundMessageStatus;
  conversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OutboundMessageStatus {
  Sent = 'sent',
  Delivered = 'delivered',
  Bounced = 'bounced',
  Opened = 'opened',
  Clicked = 'clicked',
  SpamComplaint = 'spamComplaint',
  Unsubscribed = 'unsubscribed',
  Error = 'error', // failed to send outbound message
}
