// email response for messages flagged by moderation
const flaggedEmailContent = (): string => {
  const content = `
    <p>Your message has been flagged by our moderation system and cannot be processed.</p>
    <p>Please ensure your message complies with our content guidelines and try again.</p>
    <p><i>If this keeps happening and you believe this is a mistake, please email us at help@coldpitchpro.com for support.</i></p>
  `;
  return content;
};

export default flaggedEmailContent;
