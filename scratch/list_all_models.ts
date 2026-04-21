import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listAll() {
  try {
    const models = await ai.models.list();
    // Try to see if it's iterable
    const allModels = [];
    for await (const model of models) {
        allModels.push(model.name);
    }
    console.log("All Models:", allModels);
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listAll();
