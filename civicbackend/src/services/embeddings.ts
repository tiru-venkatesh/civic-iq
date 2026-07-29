import groq from "./groq";

const EMBEDDING_MODEL = "nomic-embed-text-v1_5";

function toNumberArray(embedding: string | number[]): number[] {
  if (typeof embedding === "string") {
    // Groq's OpenAI-compatible embeddings endpoint can return base64-encoded
    // floats when encoding_format is "base64". We always request float arrays,
    // but the SDK's type is broader, so guard against the string case here.
    const buffer = Buffer.from(embedding, "base64");
    const floatArray = new Float32Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.length / Float32Array.BYTES_PER_ELEMENT
    );
    return Array.from(floatArray);
  }
  return embedding;
}

export async function embedText(text: string): Promise<number[]> {
  const response = await groq.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    encoding_format: "float",
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error("Groq embeddings API returned no embedding.");
  return toNumberArray(embedding);
}

/** Batch version — one API call for many strings. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await groq.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    encoding_format: "float",
  });

  return [...response.data]
    .sort((a, b) => a.index - b.index)
    .map((d) => toNumberArray(d.embedding));
}
