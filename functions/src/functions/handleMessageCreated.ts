import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import processNewMessage from './coreLogic/processNewMessage';

// process incoming messages from postmark
export const handleMessageCreated = onDocumentCreated(
  `messages/{messageId}`,
  async (event) => {
    await processNewMessage(event.data);
  }
);
