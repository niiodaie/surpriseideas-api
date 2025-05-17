
import express from "express";
import { sendEmailWithIdeas } from "../emailService";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, ideas, prompt } = req.body;

  if (!email || !ideas || !prompt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await sendEmailWithIdeas(email, ideas, prompt);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
