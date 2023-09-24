import {
  ServerSentEventStreamTarget,
} from "https://deno.land/std@0.200.0/http/server_sent_event.ts";
import {
  chatCompletion,
  chatCompletionChunk,
  ChatCompletionParams,
} from "./templates.ts";
import { TiktokenModel } from "./tokenizer.ts";
import { randomChars } from "./utils.ts";

class ChatCompletion {
  #id: string;
  #model: TiktokenModel;
  #prompt_tokens: number;

  constructor({
    id = `chatcmpl-${randomChars()}`,
    model = "gpt-3.5-turbo",
    prompt_tokens = 0,
  }: Pick<ChatCompletionParams, "model" | "id" | "prompt_tokens"> = {}) {
    this.#id = id;
    this.#model = model;
    this.#prompt_tokens = prompt_tokens;
  }

  chunk(content: string) {
    return chatCompletionChunk({
      id: this.#id,
      model: this.#model,
      content,
      finish_reason: null,
    });
  }

  endChunk(finish_reason: "stop" | "length" = "stop") {
    return chatCompletionChunk({
      id: this.#id,
      model: this.#model,
      finish_reason,
    });
  }

  completion(content: string, finish_reason: "stop" | "length" = "stop") {
    return chatCompletion({
      id: this.#id,
      model: this.#model,
      content,
      finish_reason,
      prompt_tokens: this.#prompt_tokens,
    });
  }

  async *pipe(iterable: AsyncIterable<string>): AsyncIterableIterator<
    ReturnType<typeof ChatCompletion["prototype"]["chunk"]>
  > {
    for await (const chunk of iterable) {
      yield this.chunk(chunk);
    }
    yield this.endChunk();
  }

  asSSE() {
    return new ChatCompletionSSE({
      id: this.#id,
      model: this.#model,
      prompt_tokens: this.#prompt_tokens,
    });
  }
}

export class ChatCompletionSSE extends ChatCompletion {
  #target = new ServerSentEventStreamTarget();

  override chunk(content: string) {
    const message = super.chunk(content);
    this.#target.dispatchMessage(message);
    return message;
  }

  override endChunk(finish_reason: "stop" | "length" = "stop") {
    const message = super.endChunk(finish_reason);
    this.#target.dispatchMessage(message);
    this.#target.close();
    return message;
  }

  override completion(
    content: string,
    finish_reason: "stop" | "length" = "stop",
  ) {
    const message = super.completion(content, finish_reason);
    this.#target.dispatchMessage(message);
    return message;
  }

  close() {
    return this.#target.close();
  }

  asResponse() {
    return this.#target.asResponse();
  }
}
