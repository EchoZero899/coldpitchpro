// email response for conversations that have already been declined
const alreadyDeclinedEmailContent = (): string => {
  const content = `
    <h2>🔴 Declined</h2>
    <p>The customer has firmly rejected your pitch.</p>
    <p>Send a fresh email (not a reply) to practice@coldpitchpro.com to try again!</p>
  `;
  return content;
};

export default alreadyDeclinedEmailContent;
