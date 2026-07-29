import { db } from "./firebaseAdmin";
import { embedText } from "./embeddings";
import type { StoredComplaint, SimilarComplaintMatch } from "../types/complaint";

const COMPLAINTS_COLLECTION = "complaints";

function buildEmbeddingText(input: { title: string; description: string; category?: string }): string {
  return [input.title, input.description, input.category].filter(Boolean).join("\n");
}

export async function storeComplaintEmbedding(
  complaintId: string,
  input: { title: string; description: string; category?: string }
): Promise<void> {
  const embedding = await embedText(buildEmbeddingText(input));
  await db.collection(COMPLAINTS_COLLECTION).doc(complaintId).set({ embedding }, { merge: true });
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embedding dimension mismatch — were these embedded with the same model?");
  }
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface FindSimilarOptions {
  category?: string;
  topK?: number;
  minSimilarity?: number;
  excludeId?: string;
}

export async function findSimilarComplaints(
  queryText: string,
  options: FindSimilarOptions = {}
): Promise<SimilarComplaintMatch[]> {
  const { category, topK = 5, minSimilarity = 0.75, excludeId } = options;
  const queryEmbedding = await embedText(queryText);

  let ref = db.collection(COMPLAINTS_COLLECTION) as FirebaseFirestore.Query;
  if (category) ref = ref.where("category", "==", category);

  const snapshot = await ref.get();
  const matches: SimilarComplaintMatch[] = [];

  snapshot.forEach((doc) => {
    if (doc.id === excludeId) return;
    const data = doc.data() as StoredComplaint;
    if (!data.embedding?.length) return;

    const similarity = cosineSimilarity(queryEmbedding, data.embedding);
    if (similarity >= minSimilarity) {
      matches.push({ complaint: { ...data, id: doc.id }, similarity });
    }
  });

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches.slice(0, topK);
}

export async function findSimilarToComplaint(
  complaint: { id: string; title: string; description: string; category?: string },
  options: Omit<FindSimilarOptions, "excludeId"> = {}
): Promise<SimilarComplaintMatch[]> {
  const text = buildEmbeddingText(complaint);
  return findSimilarComplaints(text, {
    ...options,
    category: options.category ?? complaint.category,
    excludeId: complaint.id,
  });
}