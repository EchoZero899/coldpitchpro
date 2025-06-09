import { User, UserStatus, Intention } from '../../../schema';
import upsellEmailContent from './upsell.content';
import { GeneratedReply } from '../prompts/generateReply.prompt';
import { MappedDecisionResults } from '../../../helpers/mapDecisionResults';

export interface PracticeContentInput {
  user: User;
  reply: GeneratedReply;
  intention: Intention;
  mappedResults: MappedDecisionResults;
}

// main 'practice' email content with generated response, customer insights, and coaching tips
const practiceEmailContent = ({
  user,
  reply,
  intention,
  mappedResults,
}: PracticeContentInput): string => {
  const { pitchStatus, pitchStatusTitle, pitchStatusExplanation } =
    mappedResults;

  // begin assembling email content
  let content = reply.content;

  // if ghosting, replace content with "(Ghosted)"
  if (intention === 'ghost') {
    content = `<p><i>(Ghosted)</i><p>`;
  }

  // add customer insights and current pitch status (as long as calculated successfully)
  if (pitchStatus) {
    content += `
      <hr style="border: 1px solid #ccc; margin: 20px 0;">
      <h3>Pitch Status: ${pitchStatusTitle}</h3>
      <p>${pitchStatusExplanation}</p>
      <p><strong>Customer's gut reaction:</strong> ${reply.reaction}</p>
      <p><strong>What the customer is thinking:</strong> "${reply.internalThoughts}"</p>
    `;
  }

  // add coaching tips
  content += `
    <hr style="border: 1px solid #ccc; margin: 20px 0;">
    <h3>Coaching Suggestions:</h3>
    <ul>
      ${reply.coachingSuggestions.map((tip) => `<li>${tip}</li>`).join('')}
    </ul>
  `;

  // add upsell, if applicable
  if (user.status === UserStatus.FreeTrial) {
    content += upsellEmailContent(user);
  }

  return content;
};

export default practiceEmailContent;
