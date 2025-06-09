import { ChatgptApiWrapper, ChatgptApiCall } from '../chatgptWrapper';
import * as logger from 'firebase-functions/logger';

interface ChatgptModerateInput {
  input: string | string[];
}
interface ChatgptModerateOutput {
  flagged: boolean;
  results: any;
}

// moderates a message using the moderation endpoint
// https://platform.openai.com/docs/api-reference/moderations
export const chatgptModerate = async ({
  input,
}: ChatgptModerateInput): Promise<ChatgptModerateOutput> => {
  try {
    const endpoint = '/v1/moderations';
    const payload = { input };
    let apiCall: ChatgptApiCall<any>;
    try {
      apiCall = await ChatgptApiWrapper.post<any>(endpoint, payload);
    } catch (e: any) {
      logger.error('Error calling OpenAI Moderation API');
      logger.error(e);
      throw Error(e);
    }
    if (!apiCall || !apiCall.response || apiCall.response.error) {
      logger.error(apiCall?.response?.error || {});
      throw Error('OpenAI Moderation API response missing');
    }
    const response = apiCall.response.data;
    const flagged = Array.isArray(response?.results)
      ? response.results.some((r: any) => r.flagged)
      : false;
    return {
      flagged,
      results: response?.results || [],
    };
  } catch (error) {
    logger.error(error);
    throw Error('Error interacting with OpenAI Moderation API');
  }
};
