import { countToken, type TiktokenModel } from "./tokenizer.ts";
import { randomChars, timestamp } from "./utils.ts";

export type ChatCompletionParams = {
  id?: string;
  created?: number;
  model?: TiktokenModel;
  content?: string;
  finish_reason?: "stop" | "length" | null;
  prompt_tokens?: number;
};

export type ChatCompletionChunkParams = Omit<
  ChatCompletionParams,
  "prompt_tokens"
>;

export type CompletionParams = {
  id?: string;
  created?: number;
  model?: TiktokenModel;
  text?: string;
  finish_reason?: "stop" | "length" | null;
  prompt_tokens?: number;
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type ChatCompletionResponse = {
  id: string;
  object: "chat.completion";
  created: number;
  model: TiktokenModel;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop" | "length" | null;
  }[];
  usage: Usage;
};

export type CompletionResponse = {
  id: string;
  object: "text_completion";
  created: number;
  model: TiktokenModel;
  choices: {
    text: string;
    index: number;
    logprobs: null;
    finish_reason: "stop" | "length" | null;
  }[];
  usage: Usage;
};

export type ChatCompletionChunkResponse = {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: TiktokenModel;
  choices: {
    index: number;
    delta: { content: string } | Record<string, never>;
    finish_reason: "stop" | "length" | null;
  }[];
};

export type CompletionChunkResponse = {
  id: string;
  object: "text_completion.chunk";
  created: number;
  model: TiktokenModel;
  choices: {
    text?: string;
    index: number;
    logprobs: null;
    finish_reason: "stop" | "length" | null;
  }[];
};

export function chatCompletion({
  id = `chatcmpl-${randomChars()}`,
  created = timestamp(),
  model = "gpt-3.5-turbo",
  content,
  finish_reason = "stop",
  prompt_tokens = 0,
}: ChatCompletionParams): ChatCompletionResponse {
  const completion_tokens = content ? countToken(model, content) : 0;
  const total_tokens = prompt_tokens + completion_tokens;

  return {
    id,
    "object": "chat.completion",
    created,
    model,
    "choices": content === undefined ? [] : [{
      "index": 0,
      "message": {
        "role": "assistant",
        content,
      },
      finish_reason,
    }],
    "usage": {
      prompt_tokens,
      completion_tokens,
      total_tokens,
    },
  };
}

export function completion(
  {
    id = `chatcmpl-${randomChars()}`,
    created = timestamp(),
    model = "gpt-3.5-turbo",
    text,
    finish_reason = "stop",
    prompt_tokens = 0,
  }: CompletionParams,
): CompletionResponse {
  const completion_tokens = text ? countToken(model, text) : 0;
  const total_tokens = prompt_tokens + completion_tokens;

  return {
    id,
    "object": "text_completion",
    created,
    model,
    "choices": text === undefined ? [] : [{
      text,
      "index": 0,
      "logprobs": null,
      finish_reason,
    }],
    "usage": {
      prompt_tokens,
      completion_tokens,
      total_tokens,
    },
  };
}

export function chatCompletionChunk(
  {
    id = `chatcmpl-${randomChars()}`,
    created = timestamp(),
    model = "gpt-3.5-turbo",
    content,
    finish_reason = null,
  }: ChatCompletionChunkParams,
): ChatCompletionChunkResponse {
  return {
    id,
    "object": "chat.completion.chunk",
    created,
    model,
    "choices": [{
      "index": 0,
      "delta": (finish_reason || content === undefined) ? {} : { content },
      finish_reason,
    }],
  };
}

export function completionChunk(
  {
    id = `chatcmpl-${randomChars()}`,
    created = timestamp(),
    model = "gpt-3.5-turbo",
    text,
    finish_reason = null,
  }: CompletionParams,
): CompletionChunkResponse {
  return {
    id,
    "object": "text_completion.chunk",
    created,
    model,
    "choices": [{
      text,
      "index": 0,
      "logprobs": null,
      finish_reason,
    }],
  };
}
