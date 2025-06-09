import { ConversationStatus, Intention } from '../schema';

export interface MappedDecisionResults {
  pitchStatus: string | undefined;
  pitchStatusTitle: string | undefined;
  pitchStatusExplanation: string | undefined;
}

// returns plain-text pitch status and explanation based on intention
const mapDecisionResults = (intention: Intention): MappedDecisionResults => {
  const pitchStatus = resultStatusMap[intention] || undefined;
  const pitchStatusTitle = resultTitleMap[intention] || undefined;
  const pitchStatusExplanation = resultExplanationMap[intention] || undefined;

  return {
    pitchStatus,
    pitchStatusTitle,
    pitchStatusExplanation,
  };
};

const resultStatusMap = {
  ghost: ConversationStatus.Ghosted,
  engage: ConversationStatus.Engaged,
  decline: ConversationStatus.Declined,
  accept: ConversationStatus.Accepted,
};
const resultTitleMap = {
  ghost: '👻 Ghosted',
  engage: '🟢 Engaged',
  decline: '🔴 Declined',
  accept: '🎉 Accepted - Congratulations!',
};
const resultExplanationMap = {
  ghost:
    'The customer has ghosted you and is no longer responding. Reply to this email to try to re-engage them!',
  engage:
    'The customer is still interested and wants to continue the conversation. Reply to this email to keep the conversation going!',
  decline:
    'The customer has firmly rejected your pitch. Send a fresh email (not a reply) to practice@coldpitchpro.com to try again!',
  accept:
    'The customer is sold on your pitch and is ready to proceed. Great work!',
};

export default mapDecisionResults;
