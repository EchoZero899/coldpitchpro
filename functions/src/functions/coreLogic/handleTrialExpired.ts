import * as logger from 'firebase-functions/logger';
import sendOutboundEmail from '../../helpers/sendOutboundEmail';
import expiredTrialEmailContent from './emails/expired.content';
import { User } from '../../schema';

export interface ExpiredTrialInput {
  user: User;
  replySubject: string;
  messageThread: string;
}

// handle a customer emailing after trial has expired
// send an upsell email with benefits of subscribing
const handleTrialExpired = async ({
  user,
  replySubject,
  messageThread,
}: ExpiredTrialInput): Promise<void> => {
  try {
    await sendOutboundEmail({
      userId: user.uid,
      sendTo: user.email,
      subject: replySubject,
      htmlBody: expiredTrialEmailContent(user),
      messageThreadId: messageThread,
    });

    return;
  } catch (error) {
    logger.error(`Error handling expired trial`);
    logger.error(error);
    return undefined;
  }
};

export default handleTrialExpired;
