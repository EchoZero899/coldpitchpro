import { defineString } from 'firebase-functions/params';
import { objectToQueryString } from '../../../utils/objectToQueryString';

export interface ChatgptApiCall<T = any> {
  request?: {
    url?: string;
    method?: string;
    headers?: any;
    body?: any;
  };
  response?: ChatgptApiResponse<T>;
}
export interface ChatgptApiResponse<T = any> {
  data?: T;
  error?: string;
}

// chatgpt secrets
const chatgptApiUrlSecret = defineString('CHATGPT_API_URL');
const chatgptApiKeySecret = defineString('CHATGPT_API_KEY');

export class ChatgptApiWrapper {
  private static baseUrl = chatgptApiUrlSecret;
  private static apiKey = chatgptApiKeySecret;

  private static async fetchJson<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any
  ): Promise<ChatgptApiCall<T>> {
    // setup headers
    const headers: HeadersInit = {
      Authorization: `Bearer ${ChatgptApiWrapper.apiKey.value()}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    };

    // call Chatgpt api
    let fullUrl = `${ChatgptApiWrapper.baseUrl.value()}${endpoint}`;
    if (method === 'GET' && data) {
      const queryString = objectToQueryString(data);
      fullUrl += `?${queryString}`;
    }
    try {
      const payloadBody =
        method !== 'GET' && data ? JSON.stringify(data) : undefined;
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: payloadBody,
      });

      const apiResponse: ChatgptApiCall<T> = {};
      apiResponse.request = {
        url: fullUrl,
        method,
        headers,
        body: data,
      };

      if (response.ok) {
        const responseData = await response.json();
        apiResponse.response = {
          data: responseData as T,
        };
      } else {
        apiResponse.response = {
          error: await response.text().then((text) => {
            return text;
          }),
        };
      }

      return apiResponse;
    } catch (error: any) {
      const apiResponse: ChatgptApiCall<T> = {};
      apiResponse.response = {
        error: error.message,
      };
      return apiResponse;
    }
  }

  static async get<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ChatgptApiCall<T>> {
    return await ChatgptApiWrapper.fetchJson(endpoint, 'GET', data);
  }
  static async post<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ChatgptApiCall<T>> {
    return await ChatgptApiWrapper.fetchJson(endpoint, 'POST', data);
  }
  static async put<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ChatgptApiCall<T>> {
    return await ChatgptApiWrapper.fetchJson(endpoint, 'PUT', data);
  }
  static async patch<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ChatgptApiCall<T>> {
    return await ChatgptApiWrapper.fetchJson(endpoint, 'PATCH', data);
  }
  static async delete<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ChatgptApiCall<T>> {
    return await ChatgptApiWrapper.fetchJson(endpoint, 'DELETE', data);
  }
}
