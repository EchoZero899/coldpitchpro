import * as logger from 'firebase-functions/logger';
import { admin } from '../integrations/firebase';
import { Conversation, OutboundMessage } from '../schema';

// returns existing conversation, if it exists
const getConversationByEmailChain = async (
  messageIdBeingRepliedTo: string // 'isReplyTo'
): Promise<Conversation | undefined> => {
  try {
    // check if this is a reply to an outbound message
    const outboundSnap = await admin
      .firestore()
      .collection('outboundMessages')
      .where('uid', '==', messageIdBeingRepliedTo)
      .limit(1)
      .get();

    // if no corresponding outbound message, return undefined
    if (!outboundSnap || outboundSnap.empty) return undefined;

    // get outbound message data
    const outboundMessage = outboundSnap.docs[0].data() as OutboundMessage;
    if (!outboundMessage.conversationId) return undefined;

    // lookup conversation based on outbound message's conversationId
    const conversationSnap = await admin
      .firestore()
      .collection('conversations')
      .where('uid', '==', outboundMessage.conversationId)
      .limit(1)
      .get();

    // if no corresponding conversation, return undefined
    if (!conversationSnap || conversationSnap.empty) return undefined;

    // return data from user doc
    return conversationSnap.docs[0].data() as Conversation;
  } catch (error) {
    logger.error(`Error fetching conversation by email chain`);
    logger.error(error);
    return undefined;
  }
};

export default getConversationByEmailChain;
