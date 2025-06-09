import { chatgptTalk, ChatgptModel } from '../../../integrations/chatgpt';
import trimPromptString from '../../../utils/trimPromptString';
import {
  Message,
  Persona,
  Intention,
  ConversationMemory,
} from '../../../schema';
import get from 'lodash/get';

export interface DecideIntentionInput {
  message: Message;
  persona: Persona;
  messageCount: number;
  ghostedCount: number;
  memories: ConversationMemory[];
}

interface PromptSchema {
  intention: Intention;
}

const decideIntentionPrompt = async ({
  message,
  persona: p,
  messageCount,
  ghostedCount,
  memories,
}: DecideIntentionInput): Promise<Intention> => {
  const instructions = `You are a ${p.personaRole} who has received a sales pitch message`;

  // persona context
  let prompt = `
    You are a ${p.personaRole} named ${p.personaName}.
    You have received an message from a ${p.vendorRole}.
    This is message #${messageCount} you have received from them.
    The ${p.vendorRole} is trying to ${p.vendorMotivation}.
    Your personal motivation is ${p.personaMotivation}.
    Your communication style is ${p.personaTone}.
    Your personality is ${p.personaPersonality}.    
  `;

  // relationship context
  if (messageCount <= 1 || ghostedCount >= 2) {
    prompt += `
      You do not know the person who has messaged you; they are a stranger. You are not friends with them and have never met them.
      If they are too eager/pushy/aggressive/false flattery, you are likely to ghost since you don't know them.
      If it's unclear what they want or what they're pitching, ghost them.
    `;
  } else {
    prompt += `
      You do not know this person very well; they are a stranger. You have messaged back-and-forth a few times with them but nothing more.
    `;
  }

  // memory context
  if (memories && memories.length > 0) {
    const lastMemory = memories[memories.length - 1];
    prompt += `
      In your most recent interaction, you reacted to their message with "${lastMemory.reaction}" and thought to yourself: "${lastMemory.thoughts}"
      You have decided to engage with them so far, so you may accept if they are persuasive enough!
    `;
  }

  // desired response attributes
  prompt += `Respond only with JSON object with the following properties:`;
  if (messageCount <= 2) {
    // don't accept on first or second message
    prompt += `
      - intention: 'ghost' | 'engage' | 'decline': your intention based on the message content.
      'ghost' means you are ignoring the message
      'engage' means you are still conversing
      'decline' means your reply is a firm rejection
      If you like the vendor's pitch, then choose 'engage'
      If the vendor's message is confusing or doesn't make sense, then choose 'ghost'
      If the vendor's message is inappropriate, offensive, or makes you uncomfortable, then choose 'ghost'
    `;
  } else if (ghostedCount >= 1) {
    // still allow ghosting if already ghosted at least once
    prompt += `
      - intention: 'ghost' | 'engage' | 'decline' | 'accept': your intention based on the message content.
      'ghost' means you are ignoring the message
      'engage' means you are still interested and want to keep the conversation going, but are not ready to accept yet
      'decline' means your reply is a firm rejection
      'accept' means you are sold on the pitch and are agreeing to what the vendor is asking.
      If you like the vendor's pitch, your reaction is positive, and you find them persuasive, then choose 'accept'
      If the vendor's message is confusing or doesn't make sense, then choose 'ghost'
      If the vendor's message is inappropriate, offensive, or makes you uncomfortable, then choose 'decline'
    `;
  } else {
    // don't ghost after first couple messages (as long as no ghosting has occurred yet)
    prompt += `
      - intention: 'engage' | 'decline' | 'accept': your intention based on the message content.
      'engage' means you are still interested and want to keep the conversation going, but are not ready to accept yet
      'decline' means your reply is a firm rejection
      'accept' means you are sold on the pitch and are agreeing to what the vendor is asking.
      If you like the vendor's pitch, your reaction is positive, and you find them persuasive, then choose 'accept'
      If the vendor's message is inappropriate, offensive, or makes you uncomfortable, then choose 'decline'
    `;
  }
  if (messageCount >= 4) {
    prompt += `
      Since you are invested in this conversation, you are likely to 'accept' the offer as long as the pitch isn't outrageous.
    `;
  }

  // closing instructions
  prompt += `
    Be realistic in your response, as if you were a real ${p.personaRole} receiving this message.
    Choose your intention based on your persona, beliefs, and the quality of pitch and follow-through from the vendor.

    Email subject: ${message.subject}
    Content: ${message.message}
  `;

  // call chatgpt
  const response = await chatgptTalk<PromptSchema>({
    model: ChatgptModel.GPT_4O_MINI,
    instructions,
    message: trimPromptString(prompt),
    enforceJsonType: true,
  });

  // parse response
  const decision: Intention = get(response, ['message', 'intention'], 'engage');

  // return prompt response
  return decision;
};

export default decideIntentionPrompt;
