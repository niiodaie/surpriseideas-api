import OpenAI from "openai";
import { type Idea } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates 3 creative surprise ideas based on the prompt using OpenAI
 */
export async function generateSurpriseIdeas(prompt: string): Promise<Idea[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // Create structured prompt for OpenAI
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a creative ideas expert. Generate 3 unique and creative surprise ideas based on the user's prompt. Each idea should have a title and a detailed description. Respond with valid JSON in this format: { 'ideas': [{ 'title': string, 'description': string }] }"
        },
        {
          role: "user",
          content: `Generate 3 creative surprise ideas for: ${prompt}`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    
    if (!parsedResponse.ideas || !Array.isArray(parsedResponse.ideas) || parsedResponse.ideas.length === 0) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Return the ideas
    return parsedResponse.ideas as Idea[];
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Failed to generate surprise ideas. Please try again.");
  }
}
