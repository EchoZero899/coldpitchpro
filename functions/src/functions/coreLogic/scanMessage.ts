import { admin } from '../../integrations/firebase';
import sendOutboundEmail from '../../helpers/sendOutboundEmail';
import flaggedEmailContent from './emails/flagged.content';
import { chatgptModerate } from '../../integrations/chatgpt';
import { User, Message, MessageStatus } from '../../schema';

export interface ScanMessageInput {
  user: User;
  userEmail: string;
  message: Message;
  replySubject: string;
  messageThread: string;
}
interface ScanMessageOutput {
  flagged: boolean;
}

const scanMessage = async ({
  user,
  userEmail,
  message,
  replySubject,
  messageThread,
}: ScanMessageInput): Promise<ScanMessageOutput> => {
  // check message for moderation safety
  const moderation = await chatgptModerate({
    input: [message.subject, message.message],
  });
  if (moderation.flagged) {
    // send moderation reply email
    await sendOutboundEmail({
      userId: user.uid,
      sendTo: userEmail,
      subject: replySubject,
      htmlBody: flaggedEmailContent(),
      messageThreadId: messageThread,
    });

    // note moderation issue on message
    await admin.firestore().collection('messages').doc(message.uid).update({
      status: MessageStatus.Error,
      error: 'Message flagged by moderation',
      moderationResults: moderation.results,
      updatedAt: new Date(),
    });

    // halt processing this message
    return { flagged: true };
  }

  // message is clean
  return { flagged: false };
};

export default scanMessage;
