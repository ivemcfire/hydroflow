import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

console.log("Using API Key:", process.env.GEMINI_API_KEY?.substring(0, 15) + "...");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Say hello world',
        });
        console.log("Success:", response.text);
    } catch (e: any) {
        console.error("Failed:", e.message);
    }
}
run();
