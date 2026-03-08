import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GoogleGenAI } from "@google/genai";
import { WeatherData, IrrigationNode } from './models';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private platformId = inject(PLATFORM_ID);
  private _ai: GoogleGenAI | null = null;

  private get ai(): GoogleGenAI | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (!this._ai) {
      try {
        const key = typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '';
        this._ai = new GoogleGenAI({ apiKey: key });
      } catch (e) {
        console.error('Failed to initialize Gemini AI:', e);
      }
    }
    return this._ai;
  }

  async getIrrigationInsights(nodes: IrrigationNode[], weather: WeatherData): Promise<string> {
    const ai = this.ai;
    if (!ai) return "Insights are only available in the browser.";

    try {
      const prompt = `
        You are an expert irrigation consultant. 
        Current Weather: ${weather.temp}°C, ${weather.condition}, Humidity: ${weather.humidity}%, Rain Probability: ${weather.rainProbability}%.
        Nodes and Sensors:
        ${nodes.map(n => `- ${n.name}: ${n.components.filter(c => c.type === 'soil_humidity').map(c => `${c.name}: ${c.value}%`).join(', ')}`).join('\n')}
        
        Provide a brief, professional recommendation for watering today. 
        Should any nodes be watered more or less? 
        Keep it under 100 words.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro",
        contents: [{ parts: [{ text: prompt }] }],
      });

      return response.text || "No insights available at the moment.";
    } catch (e) {
      console.error('Gemini error:', e);
      return "Unable to connect to AI for insights.";
    }
  }

  async suggestAutomation(node: IrrigationNode, weather: WeatherData): Promise<string> {
    const ai = this.ai;
    if (!ai) return "{}";

    try {
      const prompt = `
        Suggest an automation rule for the irrigation node "${node.name}" based on:
        Weather: ${weather.condition}, Rain Prob: ${weather.rainProbability}%.
        Sensors: ${node.components.filter(c => c.type === 'soil_humidity').map(c => `${c.name}: ${c.value}%`).join(', ')}.
        Return a JSON object with: { "name": "...", "type": "schedule" | "threshold", "config": { ... } }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      return response.text || "{}";
    } catch {
      return "{}";
    }
  }
}
