import groq from "./groq";

const EMBEDDING_MODEL = "nomic-embed-text-v1_5";

export async function embedText(text: string): Promise<number[]> {
  const response = await groq.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error("Groq embeddings API returned no embedding.");
  return embedding;
}

/** Batch version — one API call for many strings. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await groq.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return [...response.data].sort((a, b) => a.index - b.index).map((d) => d.embedding);
}