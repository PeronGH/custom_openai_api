import {
  chatCompletionChunk,
  ChatCompletionParams,
  completionChunk,
  CompletionParams,
} from "./templates.ts";
import { randomChars } from "./utils.ts";

const stringifyChunk = (chunk: unknown) => `data: ${JSON.stringify(chunk)}\n\n`;
async function* sse(
  source: AsyncIterable<string>,
  { getChunk, getEndChunk }: {
    getChunk: (content: string) => unknown;
    getEndChunk: () => unknown;
  },
) {
  try {
    for await (const chunk of source) {
      yield stringifyChunk(getChunk(chunk));
    }
    yield stringifyChunk(getEndChunk());
  } catch {
    // do nothing
  } finally {
    yield "data: [DONE]";
  }
}

export function chatCompletionStreamResponse(source: AsyncIterable<string>, {
  id = `chatcmpl-${randomChars()}`,
  model = "gpt-3.5-turbo",
}: Pick<ChatCompletionParams, "id" | "model"> = {}) {
  const getChunk = (content: string) =>
    chatCompletionChunk({
      id,
      model,
      content,
      finish_reason: null,
    });

  const getEndChunk = () =>
    chatCompletionChunk({
      id,
      model,
      finish_reason: "stop",
    });

  const body = ReadableStream.from(sse(source, { getChunk, getEndChunk }))
    .pipeThrough(new TextEncoderStream());

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

export function completionStreamResponse(source: AsyncIterable<string>, {
  id = `chatcmpl-${randomChars()}`,
  model = "gpt-3.5-turbo",
}: Pick<CompletionParams, "id" | "model"> = {}) {
  const getChunk = (text: string) =>
    completionChunk({
      id,
      model,
      text,
      finish_reason: null,
    });

  const getEndChunk = () =>
    completionChunk({
      id,
      model,
      finish_reason: "stop",
    });

  const body = ReadableStream.from(sse(source, { getChunk, getEndChunk }))
    .pipeThrough(new TextEncoderStream());

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
