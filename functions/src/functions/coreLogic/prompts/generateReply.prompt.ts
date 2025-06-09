import { chatgptTalk, ChatgptModel } from '../../../integrations/chatgpt';
import trimPromptString from '../../../utils/trimPromptString';
import {
  Message,
  Persona,
  Intention,
  ConversationMemory,
} from '../../../schema';
import get from 'lodash/get';

export interface GenerateReplyInput {
  intention: Intention;
  message: Message;
  persona: Persona;
  messageCount: number;
  memories: ConversationMemory[];
}

export interface GeneratedReply {
  content: string; // HTML email message (<p> tags only)
  reaction: string; // customer's gut-reaction to the message
  internalThoughts: string; // customer's internal reflections on the message
  coachingSuggestions: string[]; // coaching tips for the vendor
}

const generateReplyPrompt = async ({
  intention,
  message,
  persona: p,
  messageCount,
  memories,
}: GenerateReplyInput): Promise<GeneratedReply | undefined> => {
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

  // memory context
  if (memories && memories.length > 0) {
    const lastMemory = memories[memories.length - 1];
    prompt += `
      In your most recent interaction with this person, you reacted with "${lastMemory.reaction}" and thought to yourself: "${lastMemory.thoughts}"
    `;
  }

  // intention instructions
  prompt += `IMPORTANT: You have already decided your intention is to '${intention}'.`;
  switch (intention) {
    case 'decline':
      prompt += `
        Since you've decided to decline, write a brief, polite but firm rejection message. Do not ask any questions or invite further response.
      `;
      break;
    case 'engage':
      prompt += `
        Since you've decided to engage, write a brief message that keeps the conversation going, but does not agree to any requests from the vendor.
        Do not agree to any meetings, calls, demos, or purchases;
        only share hesitations/objections or request more information or ask questions.
      `;
      break;
    case 'accept':
      prompt += `Since you've decided to accept, write a positive message agreeing to the vendor's request.`;
      break;
    case 'ghost':
    default:
      break;
  }

  // communication style
  prompt += `
    If your communication style includes being casual/informal, then use some slang, contractions, and humor as appropriate, and use emojis.
    Also if casual/informal, be brief with less than 40 words and don't use greetings or sign-offs.
    If your communication style is professional/formal, then keep the message professional and businesslike; use proper greetings and sign-offs; do not use slang or emojis.
  `;

  // desired response attributes
  prompt += `
    Respond only with JSON object with the following properties:
    - reaction: a string indicating your emotional reaction to the message (lead with an emoji followed by an emotion describing your reaction)
    - internalThoughts: a string with your internal thoughts about the message, such as "I like the idea but need more details", "This seems like a good fit for our portfolio", etc.
  `;
  if (intention === 'ghost') {
    // special content for ghosting
    prompt += `- content: a string with only the word "GHOST"`;
  } else {
    // regular content for other intentions
    prompt += `- content: a response message to the vendor, in HTML format, using <p> tags only.`;
  }
  prompt += `
    - coachingSuggestions: an array of 3 coaching tips strings for the vendor on how to close the sale, based on your response.
  `;

  // closing instructions
  prompt += `
    Be realistic in your response, as if you were a real ${p.personaRole} receiving this message. Choose your intention based on your persona, beliefs, and the quality of pitch and follow-through from the vendor.
    Do not request any attachments or links, as this is a simulated message conversation.

    This response message will be sent back to the vendor. Stay in character and talk like a real ${p.personaRole}.

    If your tone is formal/professional, then include this full email signature at the bottom:
    '${p.personaName}
    ${p.personaTitle}
    practice@coldpitchpro.com'
    Separate the lines of the signature with <br> tags within the same <p> tag.

    If your tone is informal/brief/casual, just leave the signature off.
    
    Email subject: ${message.subject}
    From: ${message.fromName}
    Content: ${message.message}
  `;

  // call chatgpt
  const response = await chatgptTalk<GeneratedReply>({
    model: ChatgptModel.GPT_4O_MINI,
    instructions,
    message: trimPromptString(prompt),
    enforceJsonType: true,
  });

  // parse response
  const generatedReply = get(response, ['message'], undefined);
  if (!generatedReply) return undefined;

  // return prompt response
  return {
    content: get(generatedReply, ['content'], ''),
    reaction: get(generatedReply, ['reaction'], ''),
    internalThoughts: get(generatedReply, ['internalThoughts'], ''),
    coachingSuggestions: get(generatedReply, ['coachingSuggestions'], []),
  };
};

export default generateReplyPrompt;
