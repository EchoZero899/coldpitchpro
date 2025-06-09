import getUserByEmail from '../../helpers/getUserByEmail';
import createNewUser from '../../helpers/createNewUser';
import * as logger from 'firebase-functions/logger';
import { admin } from '../../integrations/firebase';
import { Message, MessageStatus, UserStatus } from '../../schema';
import handlePractice from './handlePractice';
import handleTrialExpired from './handleTrialExpired';
import handleUnsubscribed from './handleUnsubscribed';
import forwardToSupport from './forwardToSupport';

// re-usable core logic for processing a message
const processNewMessage = async (doc: any) => {
  try {
    if (!doc) throw new Error('Document data is undefined');
    if (!doc.exists) throw new Error('Document does not exist');
    const message = doc.data() as Message;
    if (!message) throw new Error('Document data is empty');

    // gather variables
    const emailSentTo = message.toEmail;
    const replyTo = message.fromEmail;

    // forward non-practice emails to support
    if (!emailSentTo.includes('practice')) {
      await forwardToSupport(message);
      return;
    }

    // get or create user by email
    const userData = await getUserByEmail(replyTo);
    const user =
      userData || (await createNewUser(replyTo, message.fromName || ''));
    if (!user) {
      logger.error(`Failed to create or fetch user for email: ${replyTo}`);
      return;
    }
    if (userData) {
      // existing user - update usage details
      user.lastEmailAt = new Date();
      user.inboundEmailCount += 1;
      user.updatedAt = new Date();

      // free trial countdown
      if (user.status === UserStatus.FreeTrial) {
        if (user.trialEmailsLeft === 0) {
          user.status = UserStatus.TrialExpired;
        } else {
          user.trialEmailsLeft = Math.max(0, user.trialEmailsLeft - 1);
        }
      }

      // update user doc
      await admin.firestore().collection('users').doc(user.uid).update({
        lastEmailAt: user.lastEmailAt,
        inboundEmailCount: user.inboundEmailCount,
        trialEmailsLeft: user.trialEmailsLeft,
        status: user.status,
        updatedAt: user.updatedAt,
      });
    }

    // link message to user
    await admin.firestore().collection('messages').doc(message.uid).update({
      userId: user.uid,
      status: MessageStatus.Processing,
      updatedAt: new Date(),
    });

    // handler routing
    switch (user.status) {
      case UserStatus.FreeTrial:
      case UserStatus.Subscribed:
        // active user - send reply email
        // core 'practice' logic
        await handlePractice({
          user,
          userEmail: replyTo,
          message,
          replySubject: message.subject,
          messageThread: message.threadId,
        });
        break;
      case UserStatus.TrialExpired:
        // send 'upgrade' upsell email
        await handleTrialExpired({
          user,
          replySubject: message.subject,
          messageThread: message.threadId,
        });
        break;
      case UserStatus.Unsubscribed:
        // send 'resubscribe' upsell email
        await handleUnsubscribed({
          user,
          replySubject: message.subject,
          messageThread: message.threadId,
        });
        break;
      case UserStatus.Blocked:
        // do nothing - user is blocked
        return;
      default:
        // do nothing - unknown user status
        return;
    }

    return;
  } catch (error: any) {
    logger.error('Error handling message created event');
    logger.error(error);

    // update message status to error
    if (doc && doc.exists) {
      await admin
        .firestore()
        .collection('messages')
        .doc(doc.id)
        .update({
          status: MessageStatus.Error,
          error: error?.message || 'Unknown error',
          updatedAt: new Date(),
        });
    }

    return;
  }
};

export default processNewMessage;
