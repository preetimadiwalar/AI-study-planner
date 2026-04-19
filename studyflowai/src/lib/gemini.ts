import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Subject, type PlannerSession } from "./store";
import { format } from "date-fns";
import { generateTimetable } from "./planner";

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  return new GoogleGenerativeAI(apiKey);
};

// Robust API caller with Retry Logic and Fallbacks
async function callGemini(
  prompt: string, 
  modelName: string = "gemini-3-flash", 
  retries: number = 2
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: modelName });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    const status = error?.status || 0;
    const message = error?.message || "";

    // Handle 429 (Quota Exceeded) with Retry
    if (status === 429 && retries > 0) {
      console.warn(`Quota hit for ${modelName}. Retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callGemini(prompt, modelName, retries - 1);
    }

    // Handle 404 (Model Not Found) or internal errors with Fallback
    if (status === 404 || message.includes("not found") || message.includes("429")) {
      // Cascading fallbacks for maximum reliability
      if (modelName === "gemini-3-flash") {
        console.info("Gemini 3 failed/limited, trying 2.5...");
        return callGemini(prompt, "gemini-2.5-flash", 1);
      }
      if (modelName === "gemini-2.5-flash") {
        console.info("2.5-flash failed, trying 2.0-flash...");
        return callGemini(prompt, "gemini-2.0-flash", 1);
      }
      if (modelName === "gemini-2.0-flash") {
        console.info("2.0-flash failed, trying 1.5-flash...");
        return callGemini(prompt, "gemini-1.5-flash", 1);
      }
    }

    throw error;
  }
}

/**
 * Generates an AI-optimized study timetable
 */
export async function generateAITimetable(
  subjects: Subject[],
  options: { startDate: Date; days: number; hoursPerDay: number; goal: string; }
): Promise<PlannerSession[]> {
  if (subjects.length === 0) return [];

  const prompt = `You are a high-performance study planner. 
Subjects: ${subjects.map(s => s.name).join(", ")}
Goal: ${options.goal}
Plan Start: ${format(options.startDate, "yyyy-MM-dd")}
Days: ${options.days}
Total Hours/Day: ${options.hoursPerDay}

Generate a weekly study schedule. 
Respond ONLY with a valid JSON array of objects following this TypeScript interface:
interface Session {
  id: string; // unique short id
  subjectId: string; // must match one of the subject IDs provided
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  completed: false;
}

Subject IDs to use: ${subjects.map(s => `${s.name}:${s.id}`).join(", ")}`;

  try {
    const text = await callGemini(prompt);
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch (err) {
    console.error("AI Planner Failed. Falling back to default algorithm.", err);
  }

  // Fallback to local algorithm if AI fails
  return generateTimetable(subjects, { ...options, startHour: 9, sessionLengthMin: 45 });
}

/**
 * Gets high-level AI insights and subject analysis
 */
export async function getAIInsights(
  subjects: Subject[] = [], 
  planner: PlannerSession[] = []
): Promise<{ 
  tips: string[], 
  analysis: string, 
  readiness: number, 
  subjectBreakdown: { name: string, difficulty: string, priority: string }[] 
}> {
  if (subjects.length === 0) {
    return { tips: ["Add subjects to get insights."], analysis: "No data available.", readiness: 0, subjectBreakdown: [] };
  }

  const prompt = `Analyze this student context:
Subjects: ${subjects.map(s => s.name).join(", ")}
Weekly Sessions: ${planner.length}

Respond ONLY with a JSON object:
{
  "tips": ["3 tactical study tips"],
  "analysis": "2 sentence summary of their focus",
  "readiness": 0-100 score,
  "subjectBreakdown": [
    {"name": "subject", "difficulty": "Easy|Medium|Hard", "priority": "Low|Normal|Urgent"}
  ]
}`;

  try {
    const text = await callGemini(prompt);
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (err) {
    console.error("AI Insights Failed.", err);
  }

  return {
    tips: ["AI is recalibrating. Check your API key/quota.", "Prioritize difficult subjects.", "Take regular breaks."],
    analysis: "AI Sync currently restricted or loading...",
    readiness: 70,
    subjectBreakdown: subjects.map(s => ({ name: s.name, difficulty: "Medium", priority: "Normal" }))
  };
}

/**
 * Chat with Synapse AI context-aware assistant
 */
export async function chatWithAI(
  message: string, 
  context: { subjects: Subject[], planner: PlannerSession[] }
): Promise<string> {
  const prompt = `You are Synapse AI, a professional study coach.
Context: Student has ${context.subjects.length} subjects.
Schedule: ${context.planner.length} sessions in their planner.
Plan Details: ${context.planner.slice(0, 10).map(s => `${s.date} ${s.startTime}: ${context.subjects.find(sub=>sub.id===s.subjectId)?.name || 'Study'}`).join(", ")}

User Question: "${message}"

Rules:
1. Use the scheduled sessions above to answer specific questions about their day.
2. Be professional, motivating, and concise.
3. Max 3 sentences.`;

  try {
    return await callGemini(prompt);
  } catch (err: any) {
    console.error("Chat Error:", err);
    if (err.message?.includes("429")) {
      return "I'm currently processing a lot of requests. Please give me a few seconds to breathe (Quota Exceeded).";
    }
    return "Synapse AI is currently offline. Please check your internet or API key in AI Studio.";
  }
}
