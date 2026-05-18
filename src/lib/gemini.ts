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
      CRITICAL LINK RULES FOR VIDEO & DOC RESOURCES:
      1. For videos, you MUST pick a specific, highly recommended, globally-popular YouTube tutorial video (such as those from freeCodeCamp, Fireship, CS50, Academind, Traversy Media, or official frameworks).
      2. The link MUST be a direct watch URL (e.g. 'https://www.youtube.com/watch?v=VIDEO_ID') using a REAL, verified, highly stable video ID that matches standard high-quality learning talks, reddit developer recommendations, and top-tier community tutorials.
      3. For Web/JS, use direct, stable MDN reference subpages or official docs (e.g. 'https://react.dev/reference/react', 'https://docs.python.org/3/').
      4. DO NOT invent fake random characters for video IDs. Only output actual, real, globally recognized video IDs that you are 100% confident exist and remain active.
    - Estimated hours to master.
    - 1-2 sentences description.
    - 1 online quiz or practice test (use query searches or trusted root providers like 'https://www.w3schools.com/quiztest/' or standard quizzes on the topic).
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
        systemInstruction: "You specialize in creating visual, structured learning paths for complex skills. Your paths are logical, beginner-friendly, and comprehensive. You must strictly enforce the link rules, generating only highly recommended, globally-popular YouTube watch URLs and active, official documentation paths."
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
