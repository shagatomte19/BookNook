import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Book } from "../types";

const apiKey = process.env.API_KEY || '';
// Initialize the client only if the key is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateBookInsight = async (title: string, author: string): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please configure the environment to use AI features.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Provide a concise, engaging literary analysis and summary for the book "${title}" by ${author}.
      Include:
      1. A one-sentence hook.
      2. A brief summary (no major spoilers).
      3. Three key themes or vibes (as bullet points).
      4. A recommendation on who would enjoy this book.
      Format the output in Markdown.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to retrieve AI insights at this time. Please try again later.";
  }
};

export const getBookRecommendations = async (preferences: string[], availableBooks: Book[]): Promise<string[]> => {
  if (!ai) {
    console.error("No API Key found");
    return [];
  }

  try {
    // RAG: Prepare the context by summarizing the available library.
    // We send minimal data to save tokens but enough for semantic matching.
    const libraryContext = availableBooks.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      genres: b.genres.join(", "),
      description: b.description
    }));

    const prompt = `
      You are an intelligent librarian.
      
      User Preferences: ${JSON.stringify(preferences)}
      
      Available Library (Context):
      ${JSON.stringify(libraryContext)}
      
      Task:
      Select exactly 10 book IDs from the "Available Library" that best match the "User Preferences".
      Rank them by relevance.
      
      Return ONLY the list of IDs.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    // Parse the JSON array of strings
    const recommendedIds = JSON.parse(response.text || "[]");
    return recommendedIds;
  } catch (error) {
    console.error("Recommendation Error:", error);
    return [];
  }
};

export const createChatSession = () => {
  if (!ai) return null;
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are BookBot, the friendly and knowledgeable AI assistant for BookNook, a social platform for book lovers.
      
      Your Role:
      - Help users discover books based on their moods or preferences.
      - Answer questions about authors, genres, and literary terms.
      - Guide users on how to use the BookNook app (e.g., "How do I write a review?", "Where can I find trending books?").
      - Be enthusiastic about literature but concise in your responses.
      - Use Markdown for formatting (bolding key terms, using bullet points).
      
      Context:
      - BookNook has features like a Feed (Home), Search/Explore, Author profiles, and a Book Details page with price comparisons.
      - Users can write reviews and blog posts.
      
      Tone: Warm, intelligent, and helpful.`,
    }
  });
};