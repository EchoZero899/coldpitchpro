import * as logger from 'firebase-functions/logger';
import sendOutboundEmail from '../../helpers/sendOutboundEmail';
import unsubscribedEmailContent from './emails/unsubscribed.content';
import { User } from '../../schema';

export interface UnsubscribedInput {
  user: User;
  replySubject: string;
  messageThread: string;
}

// handle a customer emailing after trial has expired
// send an upsell email with benefits of subscribing
const handleUnsubscribed = async ({
  user,
  replySubject,
  messageThread,
}: UnsubscribedInput): Promise<void> => {
  try {
    await sendOutboundEmail({
      userId: user.uid,
      sendTo: user.email,
      subject: replySubject,
      htmlBody: unsubscribedEmailContent(user),
      messageThreadId: messageThread,
    });

    return;
  } catch (error) {
    logger.error(`Error handling unsubscribed user`);
    logger.error(error);
    return undefined;
  }
};

export default handleUnsubscribed;
