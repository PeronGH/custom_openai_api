import { chatCompletionChunk, ChatCompletionParams } from "./templates.ts";

import { randomChars } from "./utils.ts";

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

  const stringifyChunk = (chunk: unknown) =>
    `data: ${JSON.stringify(chunk)}\n\n`;

  const body = ReadableStream.from(
    async function* () {
      for await (const chunk of source) {
        yield stringifyChunk(getChunk(chunk));
      }
      yield stringifyChunk(getEndChunk());
    }(),
  )
    .pipeThrough(new TextEncoderStream());

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
