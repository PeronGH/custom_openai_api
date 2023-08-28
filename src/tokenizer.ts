import {
  getEncoding,
  getEncodingNameForModel,
  Tiktoken,
  TiktokenEncoding,
  TiktokenModel,
} from "https://esm.sh/js-tiktoken@1.0.7";

export type { TiktokenModel };

const cachedEncoders: Map<TiktokenEncoding, Tiktoken> = new Map();

export function cachedEncoderFor(model: TiktokenModel): Tiktoken {
  const encoding = getEncodingNameForModel(model);

  if (!cachedEncoders.has(encoding)) {
    cachedEncoders.set(encoding, getEncoding(encoding));
  }

  return cachedEncoders.get(encoding)!;
}

Deno.test("tokenize", () => {
  console.log(cachedEncoderFor("gpt-3.5-turbo").encode("Hello, world!"));
});
