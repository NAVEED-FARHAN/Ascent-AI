import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap } from "../types";

// Initialization removed from module level for BYOK
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    goal: { type: Type.STRING },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
          subTopics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedHours: { type: Type.NUMBER },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'article, video, paid_course, or documentation' },
                      title: { type: Type.STRING },
                      url: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ['type', 'title', 'url']
                  }
                },
                quizzes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      url: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      provider: { type: Type.STRING }
                    },
                    required: ['id', 'title', 'url', 'difficulty', 'provider']
                  }
                },
                challenges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING },
                      reward: { type: Type.STRING },
                      externalUrl: { type: Type.STRING }
                    },
                    required: ['id', 'title', 'description', 'type', 'reward']
                  }
                }
              },
              required: ['id', 'title', 'description', 'estimatedHours', 'resources', 'quizzes', 'challenges']
            }
          }
        },
        required: ['id', 'title', 'description', 'dependencies', 'subTopics']
      }
    }
  },
  required: ['goal', 'nodes']
};

function translateGeminiError(err: any): string {
  const message = err?.message || String(err);

  if (message.includes("429") || message.includes("QUOTA_EXCEEDED")) {
    return "Neural capacity reached. Please wait a few seconds for the next synchronization cycle.";
  }
  if (message.includes("503") || message.includes("UNAVAILABLE")) {
    return "High computational load detected on the server. The architecture is stabilizing—please try again in a moment.";
  }
  if (message.includes("403") || message.includes("PERMISSION_DENIED") || message.includes("API_KEY_INVALID")) {
    return "Security Alert: Access protocol denied. Please verify your API credentials in the configuration module.";
  }
  if (message.includes("INVALID_ARGUMENT")) {
    return "Protocol error: The request configuration is invalid. Please refine your goal and re-initialize.";
  }

  // Clean up JSON strings if they still slip through
  try {
    const parsed = JSON.parse(message);
    if (parsed.error?.message) return parsed.error.message;
  } catch (e) { }

  return message;
}

export async function generateRoadmap(goal: string, apiKey: string): Promise<Roadmap> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an expert learning consultant. Generate a structured learning roadmap for: "${goal}".
    
    Structure: connected nodes (milestones) with detailed subtopics.
    For each subtopic, include:
    - 2 high-quality free resources (official docs or tutorials).
      CRITICAL LINK RULES TO PREVENT 404/BROKEN LINKS:
      1. For videos, use YouTube Search query links like `https://www.youtube.com/results?search_query=topic_name` instead of guessing specific watch video IDs (which always fail).
      2. For Web/JS, use MDN Search links like `https://developer.mozilla.org/en-US/search?q=topic_name`.
      3. For other docs, use verified portal root URLs (e.g. `https://react.dev`, `https://w3schools.com`, `https://geeksforgeeks.org`, `https://docs.python.org/3/`) or search engine queries.
      4. DO NOT invent specific subpaths, hash values, or random video IDs. Every link must be 100% functional.
    - Estimated hours to master.
    - 1-2 sentences description.
    - 1 online quiz or practice test (use query searches or trusted root providers like `https://www.w3schools.com/quiztest/` or standard quizzes on the topic).
    - 1 practical mini-challenge (coding task or assignment).
    
    Keep dependencies logical. Response MUST be valid JSON matching the schema.
  `;

  const generate = async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
        systemInstruction: "You specialize in creating visual, structured learning paths for complex skills. Your paths are logical, beginner-friendly, and comprehensive. You must strictly enforce the 404-prevention link rules, generating only search query query-links (YouTube/MDN) or main homepage/portal domains to guarantee all generated links are fully active."
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate roadmap: No response from AI");
    }
    return response;
  };

  // Simple exponential backoff for 429s
  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await generate();
      const data = JSON.parse(response.text!);
      // Add isCompleted field to nodes and subtopics
      data.nodes = data.nodes.map((node: any) => ({
        ...node,
        isCompleted: false,
        subTopics: node.subTopics.map((sub: any) => ({
          ...sub,
          isCompleted: false
        }))
      }));
      return data as Roadmap;
    } catch (err: any) {
      lastError = err;
      if ((err?.status === 429 || err?.message?.includes("429")) && i < 2) {
        await new Promise(r => setTimeout(r, (i + 1) * 3000));
        continue;
      }
      break;
    }
  }

  console.error("Error generating roadmap after retries:", lastError);
  throw new Error(translateGeminiError(lastError));
}
