import { ChatgptApiWrapper, ChatgptApiCall } from '../chatgptWrapper';
import * as logger from 'firebase-functions/logger';
import parseChatgptResponse from './parseChatgptJson';
import {
  ChatgptModel,
  ChatgptRole,
  ChatgptTalkRequest,
  ChatgptTalkResponse,
} from '../../index';

interface ChatgptTalkInput<T extends object | null = null> {
  model?: ChatgptModel;
  instructions?: string; // system instructions
  message: string;
  enforceJsonType: boolean;
}
interface ChatgptTalkOutput<T extends object | null = null> {
  message: T extends object ? T : string;
}

// -------- EXAMPLE USAGE --------
// plain string usage
// const response = await chatgptTalk({
//   model: ChatgptModel.GPT4,
//   message: "Tell me a joke",
// });
// console.log(response.message); // string output

// enforced JSON type usage
// interface MyResponseType {
//   isDuplicate: boolean;
// }
// const response = await chatgptTalk<MyResponseType>({
//   model: ChatgptModel.GPT4,
//   message: "Check if this item is a duplicate",
//   enforceJsonType: true, // Ensures JSON parsing
// });
// console.log(response.message.isDuplicate); // boolean output

// interact with chatgpt text
export const chatgptTalk = async <T extends object | null = null>({
  model = ChatgptModel.GPT_4O_MINI,
  instructions,
  message,
  enforceJsonType,
}: ChatgptTalkInput<T>): Promise<ChatgptTalkOutput<T>> => {
  try {
    // assemble payload
    const endpoint = '/v1/chat/completions';
    const messages = [];
    if (instructions) {
      messages.push({
        role: ChatgptRole.System,
        content: instructions,
      });
    }
    messages.push({
      role: ChatgptRole.User,
      content: message,
    });
    const payload: ChatgptTalkRequest = {
      model,
      messages,
    };

    // call ChatGPT api
    let apiCall: ChatgptApiCall<ChatgptTalkResponse>;
    try {
      apiCall = await ChatgptApiWrapper.post<ChatgptTalkResponse>(
        endpoint,
        payload
      );
    } catch (e: any) {
      logger.error('Error calling ChatGPT API');
      logger.error(e);
      throw Error(e);
    }
    if (!apiCall || !apiCall.response || apiCall.response.error) {
      logger.error(apiCall?.response?.error || {});
      throw Error('ChatGPT API response missing');
    }

    // get chatpt response message
    const response = apiCall.response?.data;
    const responseMessage: string =
      response?.choices?.[0]?.message?.content || '';
    if (!responseMessage) {
      throw Error('ChatGPT API response missing message');
    }

    // parse JSON if required
    let parsedMessage: T extends object ? T : string = responseMessage as any;
    if (enforceJsonType) {
      const parsed = parseChatgptResponse<T>(responseMessage);
      if (parsed) {
        parsedMessage = parsed as T extends object ? T : never;
      } else {
        throw Error('Failed to parse JSON response into expected type');
      }
    }

    // return response
    return {
      message: parsedMessage,
    } as ChatgptTalkOutput<T>;
  } catch (error) {
    logger.error(error);
    throw Error('Error interacting with ChatGPT text');
  }
};
