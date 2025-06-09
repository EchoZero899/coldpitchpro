import { client, POSTMARK_SERVER_KEY } from '../../integrations/postmark';
import { defineString } from 'firebase-functions/params';
import isTestMode from '../../selectors/isTestMode';
import { Message as PostmarkMessage } from 'postmark';
import { Message } from '../../schema';

// support email variable
const supportEmailAddress = defineString('SUPPORT_EMAIL_ADDRESS');

// forward the message to support
const forwardToSupport = async (message: Message): Promise<void> => {
  // check if in test mode
  const testing = isTestMode();
  const postmarkApiKey = testing
    ? 'POSTMARK_API_TEST'
    : POSTMARK_SERVER_KEY.value();

  // use postmark to send email
  const postmark = client(postmarkApiKey);
  const emailArgs: PostmarkMessage = {
    From: 'practice@coldpitchpro.com',
    To: supportEmailAddress.value(),
    ReplyTo: message.fromEmail,
    Subject: message.subject,
    HtmlBody: message.message,
  };
  const messageThreadId = message.threadId;
  if (messageThreadId) {
    emailArgs.Headers = [
      { Name: 'In-Reply-To', Value: messageThreadId || '' },
      { Name: 'References', Value: messageThreadId || '' },
    ];
  }
  await postmark.sendEmail(emailArgs);

  // return void
  return;
};

export default forwardToSupport;
