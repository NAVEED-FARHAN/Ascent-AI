import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function check() {
  try {
    const models = await ai.models.list();
    console.log("Type of models result:", typeof models);
    console.log("Is array:", Array.isArray(models));
    console.log("Keys:", Object.keys(models));
    if ((models as any).models) {
        console.log("Number of models in models.models:", (models as any).models.length);
        (models as any).models.forEach((m: any) => {
            if (m.name.includes("flash")) console.log(m.name);
        });
    }
  } catch (err) {
    console.error(err);
  }
}

check();
