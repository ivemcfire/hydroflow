import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const FASTIFY_URL = process.env.FASTIFY_URL || 'http://localhost:3001';

export const getInsights = async (req: Request, res: Response) => {
    try {
        // Initialize the Gemini SDK explicitly with the API key inside the handler
        // to ensure dotenv has already been parsed and loaded.
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        // 1. Fetch system context from the Fastify backend
        const contextResponse = await fetch(`${FASTIFY_URL}/api/context`);
        if (!contextResponse.ok) {
            throw new Error('Failed to fetch system context from Fastify backend');
        }
        const systemContext = await contextResponse.json();

        // 2. Build the prompt for Gemini
        const prompt = `
You are the AI assistant for "HydroFlow Intelligent Irrigation".
Analyze the following real-time system context (sensor readings, flow logs, and system alerts):
${JSON.stringify(systemContext, null, 2)}

Provide exactly 3 actionable insights or observations based on this data.
Return ONLY a valid JSON array of objects with the following shape:
[
  {
    "title": "Short title describing the insight",
    "description": "A 1-2 sentence detailed description of the insight, using the data provided.",
    "type": "weather", "moisture", or "anomaly" (choose the most appropriate one)
  }
]
`;

        // 3. Call Gemini using the SDK
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const outputText = response.text || '[]';
        const insights = JSON.parse(outputText);

        res.json(insights);
    } catch (err: any) {
        console.error('AI Insights Proxy Error:', err);
        res.status(500).json({ error: 'Failed to generate AI insights: ' + (err.message || err.toString()) });
    }
};
