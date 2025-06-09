import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { defineString } from 'firebase-functions/params';
import { Timestamp } from 'firebase-admin/firestore';
import { admin } from '../integrations/firebase';
import { addDays } from 'date-fns';
import { ulid } from 'ulid';

// postmark webhook secret
const postmarkWebhookSecret = defineString('POSTMARK_WEBHOOK_SECRET');

// receive postmark webhook events
export const receivePostmarkWebhook = onRequest(
  async (request, response: any) => {
    // auth guard
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).send('Unauthorized');
    }
    const token = authHeader.split('Bearer ')[1];
    if (token !== postmarkWebhookSecret.value()) {
      return response.status(401).send('Unauthorized');
    }

    try {
      // save event to Firestore
      const uid = ulid();
      const newWebhookEvent = {
        ...request.body,

        // automatically delete document after 3 days
        expiresAt: Timestamp.fromDate(addDays(new Date(), 3)),
        createdAt: new Date(),
      };
      await admin
        .firestore()
        .collection('outboundEvents')
        .doc(uid)
        .set(newWebhookEvent);

      // return success
      response.status(200).send('Success');
      return;
    } catch (error) {
      logger.error('Error processing webhook event');
      logger.error(error);
      response.status(500).send('Error processing webhook event');
    }
  }
);
