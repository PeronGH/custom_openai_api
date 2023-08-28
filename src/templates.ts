import { cachedEncoderFor, TiktokenModel } from "./tokenizer.ts";
import { randomChars, timestamp } from "./utils.ts";

export type ChatCompletionParams = {
  id?: string;
  created?: number;
  model?: TiktokenModel;
  content?: string;
  finish_reason?: "stop" | "length" | null;
  prompt_tokens?: number;
};

export function chatCompletion({
  id = `chatcmpl-${randomChars()}`,
  created = timestamp(),
  model = "gpt-3.5-turbo",
  content,
  finish_reason = "stop",
  prompt_tokens = 0,
}: ChatCompletionParams) {
  const completion_tokens = content
    ? cachedEncoderFor(model).encode(content).length
    : 0;

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

export function chatCompletionChunk(
  {
    id = `chatcmpl-${randomChars()}`,
    created = timestamp(),
    model = "gpt-3.5-turbo",
    content,
    finish_reason = null,
  }: Omit<ChatCompletionParams, "prompt_tokens">,
) {
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
