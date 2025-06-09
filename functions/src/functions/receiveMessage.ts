import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { Message, MessageStatus } from '../schema';
import { admin } from '../integrations/firebase';
import * as cheerio from 'cheerio';
import find from 'lodash/find';
import get from 'lodash/get';
import { ulid } from 'ulid';

// receive inbound email messages from postmark
export const receiveMessage = onRequest(async (request, response: any) => {
  try {
    // gather variables
    const fromEmail = get(request, ['body', 'From'], undefined);
    const fromName = get(request, ['body', 'FromName'], undefined);
    const toEmail = get(request, ['body', 'To'], undefined);
    const subject = get(request, ['body', 'Subject'], undefined);
    const textBody = get(request, ['body', 'TextBody'], undefined);
    const htmlBody = get(request, ['body', 'HtmlBody'], undefined);
    const replyMessage = get(request, ['body', 'StrippedTextReply'], undefined);
    let message = textBody || htmlBody || replyMessage || '';

    // check for required fields
    if (!fromEmail || !toEmail || !subject || !message) {
      logger.error('Missing required fields in request body');

      // return success to avoid retrying; data is missing from postmark
      response.status(200).send('Success');
      return;
    }

    if (!textBody && htmlBody) {
      // delete blockquotes from HTML body
      // (to remove previous quoted text which surpasses openai token limit)
      const $ = cheerio.load(htmlBody);
      $('blockquote').remove();
      const newHtml = $.html();
      message = newHtml;
    }

    // detect message thread ID from headers
    const headers = get(request, ['body', 'Headers'], []);
    const threadHeader = find(
      headers,
      (o) => o.Name.toLowerCase() === 'message-id'
    );
    const threadId = get(threadHeader, ['Value'], undefined) || 'UNKNOWN';

    // detect if this inbound message is a reply to an existing thread
    let messageIdBeingRepliedTo: string | undefined = undefined;
    try {
      const inReplyToHeader = find(
        headers,
        (o) => o.Name.toLowerCase() === 'in-reply-to'
      );
      const inReplyTo = get(inReplyToHeader, ['Value'], undefined); // e.g. '<11f1c45e-5f42-4030-a48e-dc735e21f462@mtasv.net>'
      const inReplyToMessageId = inReplyTo
        ? inReplyTo.match(
            /<([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})@/
          )
        : undefined;
      messageIdBeingRepliedTo = inReplyToMessageId
        ? inReplyToMessageId[1]
        : undefined; // e.g. '11f1c45e-5f42-4030-a48e-dc735e21f462'
    } catch (error) {
      // continue regardless of error
    }

    // save message to Firestore
    const uid = ulid();
    const newMessage: Message = {
      uid,
      status: MessageStatus.Received,
      fromEmail,
      fromName,
      toEmail,
      subject,
      message,
      replyMessage,
      threadId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (messageIdBeingRepliedTo) newMessage.isReplyTo = messageIdBeingRepliedTo;
    await admin.firestore().collection('messages').doc(uid).set(newMessage);

    // return success
    response.status(200).send('Success');
    return;
  } catch (error) {
    logger.error('Error processing email');
    logger.error(error);
    response.status(500).send('Error processing email');
  }
});
