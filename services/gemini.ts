import { GoogleGenAI, Type } from "@google/genai";
import { Task, Category, Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

export const parseSmartTask = async (input: string): Promise<Partial<Task> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Parse the following user input into a structured task object. Current date is ${new Date().toISOString()}.
      Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['study', 'personal', 'work', 'health', 'social'] },
            priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            estimatedMinutes: { type: Type.INTEGER },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-5 subtasks breakdown if the task is complex."
            }
          },
          required: ['title', 'category', 'priority']
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      title: result.title,
      category: result.category as Category,
      priority: result.priority as Priority,
      estimatedMinutes: result.estimatedMinutes || 30,
      subtasks: result.subtasks ? result.subtasks.map((st: string) => ({
        id: crypto.randomUUID(),
        title: st,
        completed: false
      })) : []
    };
  } catch (error) {
    console.error("AI Task Parse Error:", error);
    return null;
  }
};

export const getMotivationalMessage = async (stats: { xp: number, tasksCompleted: number }): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Give a short, punchy, Gen-Z style motivational quote or roast based on these stats: ${stats.tasksCompleted} tasks done today, ${stats.xp} XP total. Max 20 words.`,
      config: {
        temperature: 0.8
      }
    });
    return response.text;
  } catch (error) {
    return "Let's get this bread! 🍞";
  }
};

export const breakdownTask = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Break down the task "${taskTitle}" into 3-5 actionable sub-steps for a student.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    const result = JSON.parse(response.text);
    return result.steps;
  } catch (error) {
    return ["Start the task", "Focus for 10 mins", "Review work"];
  }
};
