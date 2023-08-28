import {
  chatCompletion,
  chatCompletionChunk,
  ChatCompletionParams,
} from "./templates.ts";
import { TiktokenModel } from "./tokenizer.ts";
import { randomChars } from "./utils.ts";

export class ChatCompletion {
  #id: string;
  #model: TiktokenModel;
  #prompt_tokens: number;

  constructor({
    id = `chatcmpl-${randomChars()}`,
    model = "gpt-3.5-turbo",
    prompt_tokens = 0,
  }: Pick<ChatCompletionParams, "model" | "id" | "prompt_tokens">) {
    this.#id = id;
    this.#model = model;
    this.#prompt_tokens = prompt_tokens;
  }

  chunk(content: string, finish_reason: "stop" | "length" | null = null) {
    return chatCompletionChunk({
      id: this.#id,
      model: this.#model,
      content,
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
}
