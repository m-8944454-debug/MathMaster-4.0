
import { GoogleGenAI, Type } from "@google/genai";
import { MathProblem, Difficulty } from "../types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Wrapper for API calls with exponential backoff retry logic.
 */
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 800): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimit && i < maxRetries - 1) {
        console.warn(`Rate limit hit (429). Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await delay(currentDelay);
        currentDelay *= 2; 
        continue;
      }
      throw error;
    }
  }
  throw new Error('Maximum retries reached');
}

export const generateMathProblem = async (topic: string, difficulty: Difficulty): Promise<MathProblem> => {
  return fetchWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const difficultyLabel = difficulty === 1 ? "Basic" : difficulty === 2 ? "Intermediate" : "Advanced";
    const thinkingBudget = difficulty === 3 ? 1024 : 0;
    const variationId = Math.random().toString(36).substring(7);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 1 ${difficultyLabel} SM025 math question. Topic: ${topic}. Ref: ${variationId}. JSON ONLY.`,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget },
        systemInstruction: `You are an expert KMM Mathematics Lecturer. Generate a UNIQUE exam-style question for SM025.
        - Response MUST be pure JSON.
        - LaTeX: \\( ... \\) for inline, \\[ ... \\] for display.
        - Vectors: \\mathbf{i}, \\mathbf{j}, \\mathbf{k}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctIndex: { type: Type.INTEGER },
            tips: { type: Type.STRING },
            workingSteps: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correctIndex", "tips", "workingSteps", "explanation"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Tiada respon daripada AI");
    const data = JSON.parse(text);
    return { ...data, id: `prob-${variationId}`, topic, difficulty };
  });
};

/**
 * Menjana penyelesaian terperinci secara dinamik apabila pengguna menjawab salah.
 */
export const generateDetailedSolution = async (problem: MathProblem): Promise<string> => {
  return fetchWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed, step-by-step mathematical derivation for this SM025 question: "${problem.question}". 
      The correct answer is "${problem.options[problem.correctIndex]}". 
      Show every step clearly using LaTeX. Focus on clarity and academic precision.`,
      config: {
        temperature: 0.3, // Lower temperature for more consistent math steps
        thinkingConfig: { thinkingBudget: 2048 },
        systemInstruction: `You are a Senior Mathematics Tutor at Kolej Matrikulasi Melaka. 
        Your goal is to explain the solution process so clearly that a student can understand exactly where they might have gone wrong.
        Use formal KMM notation. Use LaTeX \\( \\) and \\[ \\].`,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gagal menjana penyelesaian terperinci.");
    return text;
  });
};
