import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { admin } from '../integrations/firebase';
import processNewMessage from './coreLogic/processNewMessage';

// testing endpoint to replay messages as if they were just created
export const replayMessage = onRequest(async (request, response: any) => {
  try {
    // lookup latest message
    const messageSnap = await admin
      .firestore()
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    const messageDoc = messageSnap.docs[0];
    if (!messageDoc || !messageDoc.exists) {
      logger.error('No message found to replay');
      response.status(404).send('No message found to replay');
      return;
    }

    // re-process the message
    await processNewMessage(messageDoc);

    response.status(200).send('Success');
    return;
  } catch (error) {
    logger.error('Error replaying message');
    logger.error(error);
    response.status(500).send('Error replaying message');
  }
});
