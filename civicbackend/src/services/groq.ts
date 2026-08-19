import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY in .env");
}

console.log("GROQ_API_KEY length:", process.env.GROQ_API_KEY.length);
console.log("GROQ_API_KEY value:", JSON.stringify(process.env.GROQ_API_KEY));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODEL = "openai/gpt-oss-120b";

export default groq;