import { client, POSTMARK_SERVER_KEY } from '../integrations/postmark';
import * as logger from 'firebase-functions/logger';
import { admin } from '../integrations/firebase';
import { OutboundMessage, OutboundMessageStatus } from '../schema';
import { Message as PostmarkMessage } from 'postmark';
import isTestMode from '../selectors/isTestMode';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface OutboundEmailInput {
  userId: string;
  sendTo: string;
  subject: string;
  htmlBody: string;
  messageThreadId?: string;
  conversationId?: string;
}

// send outbound email via postmark
const sendOutboundEmail = async ({
  userId,
  sendTo,
  subject,
  htmlBody,
  messageThreadId,
  conversationId,
}: OutboundEmailInput): Promise<string | undefined> => {
  try {
    // check if in test mode
    const testing = isTestMode();
    const postmarkApiKey = testing
      ? 'POSTMARK_API_TEST'
      : POSTMARK_SERVER_KEY.value();

    // use postmark to send email
    const postmark = client(postmarkApiKey);
    const emailArgs: PostmarkMessage = {
      From: 'practice@coldpitchpro.com',
      To: sendTo,
      Subject: subject,
      HtmlBody: htmlBody,
    };
    if (messageThreadId) {
      emailArgs.Headers = [
        { Name: 'In-Reply-To', Value: messageThreadId || '' },
        { Name: 'References', Value: messageThreadId || '' },
      ];
    }
    const outboundMessage = await postmark.sendEmail(emailArgs);

    // save outbound message to firestore
    const uid = outboundMessage.MessageID;
    const outboundMessageData: OutboundMessage = {
      uid: uid,
      userId: userId,
      to: sendTo,
      message: htmlBody,
      status: OutboundMessageStatus.Sent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (conversationId) outboundMessageData.conversationId = conversationId;
    await admin
      .firestore()
      .collection('outboundMessages')
      .doc(uid)
      .set(outboundMessageData);

    // in test mode, write HTML body to a local file for easy viewing
    // copy-paste HTML output into https://app.postdrop.io/ to simulate email rendering
    if (testing) {
      const previewPath = join(process.cwd(), 'preview.html');
      writeFileSync(previewPath, htmlBody, 'utf8');
      logger.info(`[TEST_MODE] Outbound email HTML written to ${previewPath}`);
    }

    // return outbound message id
    return uid;
  } catch (error) {
    logger.error(`Error sending outbound email`);
    logger.error(error);
    return undefined;
  }
};

export default sendOutboundEmail;
