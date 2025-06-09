import * as logger from 'firebase-functions/logger';
import { admin } from '../../integrations/firebase';
import sendOutboundEmail from '../../helpers/sendOutboundEmail';
import inventPersonaPrompt from './prompts/inventPersona.prompt';
import decideIntentionPrompt from './prompts/decideIntention.prompt';
import generateReplyPrompt from './prompts/generateReply.prompt';
import getConversationByEmailChain from '../../helpers/getConversationByEmailChain';
import practiceEmailContent from './emails/practice.content';
import alreadyAcceptedEmailContent from './emails/alreadyAccepted.content';
import alreadyDeclinedEmailContent from './emails/alreadyDeclined.content';
import scanMessage from './scanMessage';
import getPersona from '../../selectors/getPersona';
import mapDecisionResults from '../../helpers/mapDecisionResults';
import get from 'lodash/get';
import { ulid } from 'ulid';
import {
  User,
  Message,
  MessageStatus,
  Conversation,
  ConversationStatus,
} from '../../schema';

export interface PracticeInput {
  user: User;
  userEmail: string;
  message: Message;
  replySubject: string;
  messageThread: string;
}

// handle inbound practice emails
const handlePractice = async (input: PracticeInput): Promise<void> => {
  try {
    // check message for moderation safety
    const moderation = await scanMessage(input);
    if (moderation.flagged) return;

    // spread input
    const { user, userEmail, message, replySubject, messageThread } = input;

    // get conversation details
    let conversation: Conversation | undefined = undefined;
    if (message.isReplyTo) {
      conversation = await getConversationByEmailChain(message.isReplyTo);
    }
    if (conversation) {
      // increment existing conversation's email count
      conversation.emailsReceived = conversation.emailsReceived + 1 || 1;
    } else {
      // no existing conversation found
      try {
        // generate persona with GPT
        const persona = await inventPersonaPrompt({
          emailSubject: message.subject,
          emailMessage: message.message,
        });

        // create new conversation doc
        const uid = ulid();
        conversation = {
          uid: uid,
          ...persona,
          userId: user.uid,
          userEmail: user.email,
          status: ConversationStatus.Engaged,
          emailsReceived: 1,
          ghostedCount: 0,
          memories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await admin
          .firestore()
          .collection('conversations')
          .doc(uid)
          .set(conversation);
      } catch (e) {
        // allow service to continue even if persona setup fails
        // (persona adds immersion and quality, but is not critically essential)
      }
    }

    // check whether conversation has already been closed
    if (conversation) {
      switch (conversation.status) {
        case ConversationStatus.Declined:
          // send "they have firmly declined and cannot be persuaded" reply
          await sendOutboundEmail({
            userId: user.uid,
            sendTo: userEmail,
            subject: replySubject,
            htmlBody: alreadyDeclinedEmailContent(),
            messageThreadId: messageThread,
            conversationId: conversation.uid,
          });
          return;
        case ConversationStatus.Accepted:
          // send "you did it!" reply
          await sendOutboundEmail({
            userId: user.uid,
            sendTo: userEmail,
            subject: replySubject,
            htmlBody: alreadyAcceptedEmailContent(),
            messageThreadId: messageThread,
            conversationId: conversation.uid,
          });
          return;
        default:
          break;
      }
    }

    // extract conversation details
    const messageCount = get(conversation, ['emailsReceived'], 1);
    const ghostedCount = get(conversation, ['ghostedCount'], 0);
    const persona = getPersona(conversation);

    // make gut-reaction decision based on latest message
    const decisionIntention = await decideIntentionPrompt({
      message,
      persona,
      messageCount,
      ghostedCount,
      memories: conversation?.memories || [],
    });

    // map the decision to status and explanation
    const { pitchStatus, pitchStatusTitle, pitchStatusExplanation } =
      mapDecisionResults(decisionIntention);

    // generate full response
    const generatedReply = await generateReplyPrompt({
      intention: decisionIntention,
      message,
      persona,
      messageCount,
      memories: conversation?.memories || [],
    });
    if (!generatedReply) throw Error('Generated response is empty');

    // assemble reply email content
    const replyContent = practiceEmailContent({
      user,
      reply: generatedReply,
      intention: decisionIntention,
      mappedResults: { pitchStatus, pitchStatusTitle, pitchStatusExplanation },
    });

    // send reply email
    await sendOutboundEmail({
      userId: user.uid,
      sendTo: userEmail,
      subject: replySubject,
      htmlBody: replyContent,
      messageThreadId: messageThread,
      conversationId: conversation?.uid,
    });

    // update message doc with reply status
    await admin.firestore().collection('messages').doc(message.uid).update({
      status: MessageStatus.Replied,
      updatedAt: new Date(),
    });

    // update conversation doc with new email count and memory
    if (conversation) {
      const newMemories = conversation.memories || [];
      newMemories.push({
        reaction: generatedReply.reaction,
        thoughts: generatedReply.internalThoughts,
      });
      await admin
        .firestore()
        .collection('conversations')
        .doc(conversation.uid)
        .update({
          emailsReceived: messageCount,
          ghostedCount:
            decisionIntention === 'ghost'
              ? conversation.ghostedCount + 1
              : conversation.ghostedCount,
          memories: newMemories,
          status: pitchStatus || ConversationStatus.Engaged,
          updatedAt: new Date(),
        });
    }

    return;
  } catch (error) {
    logger.error(`Error handling practice email`);
    logger.error(error);
    return undefined;
  }
};

export default handlePractice;
