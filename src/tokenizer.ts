import {
  getEncoding,
  getEncodingNameForModel,
  type Tiktoken,
  type TiktokenEncoding,
  type TiktokenModel,
} from "npm:js-tiktoken@1.0.12";

export type { TiktokenModel };

const cachedEncoders: Map<TiktokenEncoding, Tiktoken> = new Map();

function cachedEncoderFor(model: TiktokenModel): Tiktoken {
  const encoding = getEncodingNameForModel(model);

  if (!cachedEncoders.has(encoding)) {
    cachedEncoders.set(encoding, getEncoding(encoding));
  }

  return cachedEncoders.get(encoding)!;
}

export function countToken<M extends { content: string }>(
  model: TiktokenModel,
  messages: M[] | string,
): number {
  const tokenizer = cachedEncoderFor(model);

  if (typeof messages === "string") {
    return tokenizer.encode(messages).length;
  }

  return messages.reduce((acc, { content }) => {
    return acc + tokenizer.encode(content).length;
  }, 1);
}

Deno.test("countToken", () => {
  console.log(countToken("gpt-3.5-turbo", "Hello, world!"));
  console.log(
    countToken("gpt-3.5-turbo", [
      {
        "role": "system",
        "content": "You are a helpful assistant.",
      },
      {
        "role": "user",
        "content": "Hello!",
      },
    ]),
  );
});

Deno.test("tokenize", () => {
  console.log(cachedEncoderFor("gpt-3.5-turbo").encode("Hello, world!"));
});
