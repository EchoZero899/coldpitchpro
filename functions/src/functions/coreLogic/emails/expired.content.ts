import { User } from '../../../schema';

// email response for upsell after trial expiration
const expiredTrialEmailContent = (user: User): string => {
  const content = `
    <p>Your free trial of <strong>Cold Pitch Pro</strong> has ended. We hope you enjoyed exploring all the features designed to help you book more meetings and close more deals.</p>
    <h3>Why upgrade to a paid subscription?</h3>
    <ul>
      <li>🚀 <strong>Unlimited access</strong> to all premium features</li>
      <li>⏱️ Realistic sales pitch tempo and reactions</li>
      <li>👩‍⚖️ Complex AI personalities with memory and simulated emotions</li>
      <li>📈 Experiment with different pitches to predict how your target market might respond</li>
      <li>🔥 New features and improvements released regularly</li>
    </ul>
    <p>Don’t miss out on the tools that can supercharge your sales process. Click below to subscribe and keep your momentum going!</p>
    <p style="margin: 30px 0 40px;">
      <a href="https://echozero928.gumroad.com/l/drdcx/?wanted=true&email=${user.email}" style="background: #007bff; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Subscribe Now</a>
    </p>
    <p>If you have any questions or need help, reach out to us at help@coldpitchpro.com – we’re here to help!</p>
    <p>To your success,<br/>The Cold Pitch Pro Team</p>
  `;

  return content;
};

export default expiredTrialEmailContent;
