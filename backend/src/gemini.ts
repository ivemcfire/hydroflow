import { config } from './config.js';
import { latestReadings, recentActivities } from './db.js';

// Server-side Gemini insight for the dashboard — replaces the old frontend
// GoogleGenAI usage that would have shipped the API key in the browser
// bundle. Telemetry is assembled from server state only.

const SYSTEM_PROMPT = `You are HydroFlow-AI, monitoring a homelab irrigation system
(water tanks with level sensors, refill automation via pump and valves).
Analyze the telemetry snapshot and recent automation activity.
Respond in 15-25 words, professional and factual, no pleasantries.
Prefix "WARNING:" if a tank has been refilling for a long time, readings are
stale by more than 10 minutes, or activity shows a fill_timeout.`;

let warnedMissingKey = false;

export interface InsightResult {
  text: string;
  error?: string;
}

export async function generateInsight(): Promise<InsightResult> {
  if (!config.GEMINI_API_KEY) {
    if (!warnedMissingKey) {
      console.warn('[gemini] GEMINI_API_KEY not set — AI insights disabled');
      warnedMissingKey = true;
    }
    return { text: '', error: 'GEMINI_API_KEY not configured' };
  }

  const [readings, activities] = await Promise.all([latestReadings(), recentActivities(10)]);
  const prompt = JSON.stringify({ now: new Date().toISOString(), readings, activities });

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 100, thinkingConfig: { thinkingBudget: 0 } },
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!resp.ok) {
    return { text: '', error: `Gemini ${resp.status} ${resp.statusText}` };
  }
  const data = (await resp.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  return text ? { text } : { text: '', error: 'empty response' };
}
