import { ChatgptModel, ChatgptRole } from '../types';

// talk API
export interface ChatgptTalkRequest {
  model: ChatgptModel;
  messages: ChatgptTalkMessage[];
}
export interface ChatgptTalkResponse {
  id: string;
  object: string; // 'chat.completion';
  created: number; // timestamp 1741456989
  model: string; // 'gpt-4o-mini-2024-07-18'
  choices: ChatgptTalkChoice[];
  usage: {
    prompt_tokens: number; // 100
    completion_tokens: number; // 100
    total_tokens: number; // 200
    prompt_token_details: {
      cached_tokens: number; // 100
      audio_tokens: number; // 100
    };
    completion_token_details: {
      reasoning_tokens: number; // 100
      audio_tokens: number; // 100
      accepted_prediction_tokens: number; // 100
      rejected_prediction_tokens: number; // 100
    };
  };
  service_tier: string; // 'default
  system_fingerprint: string;
}

export interface ChatgptTalkMessage {
  role: ChatgptRole;
  content: string;
}
export interface ChatgptTalkChoice {
  index: number;
  message: {
    role: ChatgptRole;
    content: string;
    refusal?: unknown; // TODO: add refusal type
  };
  logprobs?: unknown; // TODO: add logprobs type
  finish_reason: string; // 'stop'
}
