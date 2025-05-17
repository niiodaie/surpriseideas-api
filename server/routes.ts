import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateIdeasSchema, sendEmailSchema } from "@shared/schema";
import { generateSurpriseIdeas } from "./openai";
import { sendEmailWithIdeas } from "./emailService";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate ideas
  app.post('/api/get-ideas', async (req, res) => {
    try {
      // Validate the request body
      const validatedData = generateIdeasSchema.parse(req.body);
      const { prompt, email } = validatedData;

      // Generate ideas using OpenAI
      const ideas = await generateSurpriseIdeas(prompt);
      
      // Return the ideas
      return res.json({
        ideas,
        prompt
      });
    } catch (error) {
      console.error('Error generating ideas:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to generate ideas. Please try again." 
      });
    }
  });

  // API endpoint to send ideas via email
  app.post('/api/send-email', async (req, res) => {
    try {
      // Validate the request body
      const validatedData = sendEmailSchema.parse(req.body);
      const { email, ideas, prompt } = validatedData;

      // Send email
      await sendEmailWithIdeas(email, ideas, prompt);
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to send email. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
