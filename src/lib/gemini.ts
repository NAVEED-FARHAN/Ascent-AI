import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap, GoalEvaluation } from "../types";

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

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    isSpecific: { type: Type.BOOLEAN },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['id', 'question', 'options']
      }
    }
  },
  required: ['isSpecific']
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

export type KnowledgeLevel = 'fresher' | 'beginner' | 'intermediate';

const levelInstructions: Record<KnowledgeLevel, { label: string; promptContext: string; systemContext: string }> = {
  fresher: {
    label: 'Fresher',
    promptContext: `
    KNOWLEDGE LEVEL: FRESHER (Zero prior experience)
    - Start from absolute fundamentals. Assume the user has NEVER touched this topic before.
    - Every node must explain the "what" and "why" before the "how".
    - Include introductory analogy-based explanations in descriptions.
    - Resources must be beginner-friendly: prefer crash courses, visual explainers, and interactive tutorials (e.g. freeCodeCamp intro videos, CS50 lectures, official "getting started" guides).
    - Estimated hours should be generous — freshers need more time per concept.
    - Challenges must be very simple: "hello world"-level tasks, guided exercises, or fill-in-the-blank style.
    - Do NOT assume any prerequisite knowledge.
    `,
    systemContext: 'You are teaching a complete newcomer with zero prior knowledge. Be thorough, patient, and foundational. Every concept must be explained from scratch.'
  },
  beginner: {
    label: 'Beginner',
    promptContext: `
    KNOWLEDGE LEVEL: BEGINNER (Knows the very basics, limited hands-on experience)
    - The user knows what the topic is and may have done a tutorial or two, but lacks depth.
    - Skip absolute zero-knowledge intro but still be thorough with core concepts.
    - Resources should include both beginner and intermediate material — official docs intro sections, popular YouTube tutorials.
    - Challenges should be small but real: build a tiny project, implement a basic algorithm, etc.
    - Balance theory and practice equally.
    `,
    systemContext: 'You are guiding a beginner who has surface-level awareness. Be thorough but progressively increase complexity across the roadmap.'
  },
  intermediate: {
    label: 'Intermediate',
    promptContext: `
    KNOWLEDGE LEVEL: INTERMEDIATE (Actively building things, solid fundamentals)
    - The user is already building real projects. Skip introductory content entirely.
    - Focus on depth: architecture patterns, performance, edge cases, best practices, and ecosystem tools.
    - Resources should be advanced: official API references, GitHub repos, conference talks, deep-dive blog posts, and documentation for specific APIs.
    - For videos, prefer conference talks (e.g. React Conf, PyCon, dotJS), deep-dive series, or performance/architecture focused content.
    - Challenges should push toward real-world production scenarios: build a full feature, optimize for performance, refactor legacy code, or integrate multiple tools.
    - Estimated hours should be tighter — intermediates move faster through concepts.
    - Assume strong fundamentals and skip basics entirely.
    `,
    systemContext: 'You are mentoring an intermediate developer actively shipping code. Skip basics entirely. Focus on depth, architecture, performance, and production-grade patterns.'
  }
};

export async function generateRoadmap(
  goal: string, 
  apiKey: string, 
  level: KnowledgeLevel = 'beginner',
  clarifyingAnswers?: Record<string, string>
): Promise<Roadmap> {
  const ai = new GoogleGenAI({ apiKey });
  const levelData = levelInstructions[level];

  let answersContext = '';
  if (clarifyingAnswers && Object.keys(clarifyingAnswers).length > 0) {
    answersContext = `\nADDITIONAL USER CONTEXT FROM CLARIFYING QUESTIONS:\n` + 
      Object.entries(clarifyingAnswers)
        .map(([qId, val]) => `- Parameter: ${qId}\n  Answer: ${val}`)
        .join('\n') + '\n';
  }

  const prompt = `
    You are an expert career mentor and learning consultant. Generate a deep, visual, structured learning roadmap for: "${goal}".
    ${answersContext}

    ${levelData.promptContext}
    
    INSTRUCTIONAL PROTOCOLS & CAREER MENTORSHIP RULES:
    1. Think Like a Career Mentor:
       - Do not just output basic/obvious lists. Evaluate what skills, libraries, and tools are actually in demand in today's tech/industry landscapes.
       - Distinguish between outdated/deprecated technologies and modern, trending standards (e.g., recommend Vite instead of CRA, modern React hooks instead of class components, modern data analysis tools, etc.).
       - Structure the nodes in a progressive, logical timeline (Beginner -> Advanced).
       - In each milestone or subtopic description, briefly explain WHY this step matters in the bigger picture of their career or project goal.
    
    2. Written Materials & Documentation Rules:
       - For written tutorials and references, you must ONLY recommend resources from these three trusted sources:
         a. W3Schools (w3schools.com)
         b. GeeksforGeeks (geeksforgeeks.org)
         c. Official documentation (e.g., developer.mozilla.org, react.dev, docs.python.org, nextjs.org/docs, tailwindcss.com/docs, etc.)
       - Choose highly relevant subpages and direct links.
    
    3. YouTube Video Recommendation Rules:
       - For video resources, you MUST recommend highly popular, widely loved YouTube tutorial videos.
       - Prioritize videos from trusted educational channels (e.g., freeCodeCamp.org, Traversy Media, Net Ninja, Fireship, Tech With Tim, Programming with Mosh, NetworkChuck, etc.).
       - Use real, valid YouTube watch URLs (e.g., 'https://www.youtube.com/watch?v=VIDEO_ID') and do NOT generate fake IDs or placeholder strings.

    Structure: connected nodes (milestones) with detailed subtopics.
    For each subtopic, include:
    - 2 high-quality free resources (1 video, 1 documentation/written article).
    - Estimated hours to master (calibrated to the knowledge level above).
    - 1-2 sentences description explaining the concept and why it is important.
    - 1 online quiz or practice test (use query searches or trusted root providers like 'https://www.w3schools.com/quiztest/' or standard quizzes on the topic).
    - 1 practical mini-challenge (calibrated to the knowledge level above).
    
    Keep dependencies logical. Response MUST be valid JSON matching the schema.
  `;

  const generate = async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
        systemInstruction: `You specialize in creating visual, structured learning paths for complex skills. ${levelData.systemContext} You must strictly enforce the link rules, generating only highly recommended, globally-popular YouTube watch URLs and active, official documentation paths.`
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

export async function evaluateGoal(goal: string, apiKey: string): Promise<GoalEvaluation> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze the learning goal or career destination input by the user: "${goal}".
    
    Determine if this goal is already clear and specific (e.g., "learn Python", "learn Excel", "React state management", "Docker basics") 
    or if it is vague, broad, or has multiple potential directions (e.g., "learn UI", "get into tech", "learn design", "become a developer", "data analyst").
    
    If the goal is specific, return isSpecific: true.
    If the goal is vague or broad, return isSpecific: false and generate 1 to 3 short, friendly, and easy-to-answer clarifying questions.
    Each question must have 3 to 4 multiple-choice options to make answering quick and painless.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
        systemInstruction: "You are a friendly career mentor. Categorize the user's goal. If vague, create 1-3 highly relevant, friendly clarifying questions with multiple-choice options."
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as GoalEvaluation;
  } catch (err) {
    console.error("Error evaluating goal:", err);
    // Fallback: assume specific to not block the user
    return { isSpecific: true };
  }
}
