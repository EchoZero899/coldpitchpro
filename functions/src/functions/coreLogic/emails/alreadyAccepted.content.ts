// email response for conversations that have already been accepted
const alreadyAcceptedEmailContent = (): string => {
  const content = `
    <h2>🎉 Accepted - Congratulations!</h2>
    <p>You did it! The customer is sold on your pitch and is ready to proceed. Great work!</p>
    <p>Send a fresh email (not a reply) to practice@coldpitchpro.com to try again!</p>
  `;
  return content;
};

export default alreadyAcceptedEmailContent;
