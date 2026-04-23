
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

export async function generateRoadmap(goal: string, apiKey: string): Promise<Roadmap> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an expert learning consultant. Generate a comprehensive and structured learning roadmap for the following goal: "${goal}".
    
    Structure the roadmap as a series of connected nodes. Each node represents a major skill area or milestone.
    Inside each node, provide a list of detailed subtopics.
    For each subtopic, include:
    - 4-5 free resources (at least one from W3Schools, one from GeeksforGeeks, and others like YouTube videos, official documentation). Provide REAL, accurate, and functional links.
    - An estimated number of hours to master this subtopic.
    - A clear description.
    - 2-3 REAL online quizzes or practice tests (e.g., from Tutorialspoint, GeeksforGeeks, Sanfoundry, Quizizz).
    - 1-2 practical challenges (coding tasks, mini-assignments, or project-based challenges). Include external links if applicable (e.g., LeetCode, HackerRank).
    
    Ensure the dependencies are logical (e.g., Basics come before Advanced).
    The response must be a strictly valid JSON matching the provided schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: roadmapSchema,
      systemInstruction: "You specialize in creating visual, structured learning paths for complex skills. Your paths are logical, beginner-friendly, and comprehensive."
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate roadmap: No response from AI");
  }

  try {
    const data = JSON.parse(response.text);
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
  } catch (err) {
    console.error("Error parsing JSON response:", err);
    throw new Error("Failed to parse roadmap data");
  }
}
