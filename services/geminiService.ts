import { GoogleGenAI, Type } from "@google/genai";
import { MathProblem, Difficulty } from "../types";

/**
 * Generates a math problem using the Gemini 3 Flash model.
 * Optimized for maximum speed and detailed step-by-step derivation.
 */
export const generateMathProblem = async (topic: string, difficulty: Difficulty): Promise<MathProblem> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const difficultyLabel = difficulty === 1 ? "Basic" : difficulty === 2 ? "Intermediate" : "Advanced";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a ${difficultyLabel} SM025 question: ${topic}.`,
    config: {
      temperature: 0,
      thinkingConfig: { thinkingBudget: 0 },
      systemInstruction: `You are an efficient SM025 Mathematics Professor. 

      STRICT NOTATION:
      - All math must use LaTeX: \\( ... \\) or \\[ ... \\].
      - Use \\mathbf{i}, \\mathbf{j}, \\mathbf{k} for vectors.
      - Return valid JSON only.

      DERIVATION RULES:
      - The 'workingSteps' field MUST show the calculation step-by-step.
      - For Integration: Show the substitution/parts choice, then the transformed integral, then the antiderivative, then the final result.
      - For Newton-Raphson: Show \\(f(x)\\), \\(f'(x)\\), and at least two iterations of \\(x_{n+1} = x_{n} - \\frac{f(x_{n})}{f'(x_{n})}\\).
      - For Vectors: Show the dot/cross product expansions clearly.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            minItems: 4,
            maxItems: 4
          },
          correctIndex: { type: Type.INTEGER },
          tips: { type: Type.STRING },
          workingSteps: { type: Type.STRING, description: "Detailed step-by-step calculation" },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "correctIndex", "tips", "workingSteps", "explanation"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  try {
    const data = JSON.parse(text);
    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      topic,
      difficulty
    };
  } catch (e) {
    throw new Error("Mathematical parsing error. Retrying generation...");
  }
};