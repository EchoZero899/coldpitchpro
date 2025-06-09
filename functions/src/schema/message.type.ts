export interface Message {
  uid: string;
  userId?: string;
  status: MessageStatus;
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  message: string;
  replyMessage?: string;
  threadId: string; // unique identifier for the message thread
  isReplyTo?: string; // uid of the message being replied to
  error?: string;
  moderationResults?: any; // results from moderation check
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageStatus {
  Received = 'received', // message received from postmark
  Processing = 'processing', // message is being processed
  Replied = 'replied', // reply message dispatched to user
  Error = 'error', // failed to send reply to user
}
