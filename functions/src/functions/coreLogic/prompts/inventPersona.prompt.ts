import { chatgptTalk, ChatgptModel } from '../../../integrations/chatgpt';
import trimPromptString from '../../../utils/trimPromptString';
import getPersona from '../../../selectors/getPersona';
import { Persona } from '../../../schema';

export interface InventPersonaInput {
  emailSubject: string;
  emailMessage: string;
}

interface PromptSchema extends Persona {}

const inventPersonaPrompt = async ({
  emailSubject,
  emailMessage,
}: InventPersonaInput): Promise<PromptSchema> => {
  const instructions = `You are a sales coach pretending to be a prospective customer who has received a sales pitch email`;

  const prompt = `
    Your job is to invent a realistic customer persona and also guess the vendor's role and motivation, based on the email you received.
    Invent an appropriate name, role, title, tone, and motivation for the customer persona (assume that this customer is in the correct target market)

    You do not know the person who has emailed you; they are a stranger. You are not friends with them and have never met them.

    It's possible that the prospective customer is an individual (e.g. on social media) rather than a business - if so make the personaRole and title match that. ("title" would be just who they are as a person instead of a job title)

    If the email is addressed to a specific person or role, then make the persona match that.
    If the email is from a specific industry, then make the persona match that industry.

    Respond only with JSON object with the following properties:
    - personaName: string, invent a name for yourself (alliterate first and last)
    - personaRole: string, invent a brief description of your role (e.g. "busy VC Investor") based on the content of vendor's email. Use multiple adjectives to provide good context and character
    - personaTitle: string, invent a job title and company, IF APPLICABLE (e.g. "Partner at Example Ventures") based on the content of vendor's email. If you think of yourself as an individual consumer (e.g. on social media), then don't have a company, just put something like "friendly mom in her 30's"
    - personaTone: string, invent a communication style (e.g. "Professional and concise") based on the content of vendor's email. This is a good spot to note if you're informal (e.g. a social media consumer), and if this is a fully casual individual on social media then note that (include words like 'casual' and 'informal'), use multiple adjectives to really nail the persona's communication style
    - personaPersonality: string, invent a brief description of your personality, unrelated to any context - this should be a random roll of human traits, both positive and negative (e.g. "curious, friendly, skeptical, easily distracted")
    - personaMotivation: string, invent a personal motivation (e.g. "To find promising startups to invest in") based on the content of vendor's email
    - vendorRole: string, guess the vendor's role (e.g. "new startup founder") based on the content of their email
    - vendorMotivation: string, guess the vendor's motivation (e.g. "trying to get you to meet about their startup") based on the content of their email

    Here is the email you received:
    Email subject: ${emailSubject}
    Content: ${emailMessage}
  `;

  // call chatgpt
  const response = await chatgptTalk<PromptSchema>({
    model: ChatgptModel.GPT_4O_MINI,
    instructions,
    message: trimPromptString(prompt),
    enforceJsonType: true,
  });

  // parse response
  const persona = getPersona(response.message);

  // return prompt response
  return persona;
};

export default inventPersonaPrompt;
