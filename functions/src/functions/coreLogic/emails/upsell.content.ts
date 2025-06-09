import { User } from '../../../schema';

// email content for upsell prompt when user is on free plan
const upsellEmailContent = (user: User): string => {
  // trial message based on user's remaining trial emails
  let trialMessage = `<p>Welcome to our Free Trial! ${user.trialEmailsLeft} free emails remaining</p>`;
  if (user.trialEmailsLeft <= 0) {
    trialMessage = `<p>Your free trial has ended. Upgrade to Pro for unlimited practice emails.</p>`;
  }

  // main upsell content
  const content = `
    <hr style="border: 1px solid #ccc; margin: 20px 0;">
    ${trialMessage}
    <p style="font-weight: bold;">
      <strong><a href="https://echozero928.gumroad.com/l/drdcx/?wanted=true&email=${user.email}">Upgrade to Pro for unlimited practice emails:</a></strong>
      <br />
      <a href="https://echozero928.gumroad.com/l/drdcx/?wanted=true&email=${user.email}">Click here to upgrade ($12/month)</a>
    </p>
    <ul>
      <li>Unlimited practice emails</li>
      <li>Realistic customer behavior: ghosting, chatting, and deciding on your offers</li>
      <li>Responsive coaching tips with suggestions to improve</li>
    </ul>
  `;

  return content;
};

export default upsellEmailContent;
