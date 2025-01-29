import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import { basePrompt as reactBasePrompt } from "./details/react";
import { basePrompt as nodeBasePrompt } from "./details/node";

// constants
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();

// middleware
dotenv.config();
app.use(express.json());

const googleAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

// routes
app.get("/template", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const projectTypeModel = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: "Identify if the prompt requests a ReactJS or NodeJS project. Respond only with 'reactjs' or 'nodejs' in lowercase.",
          },
        ],
      },
    });

    const projectTypeChat = projectTypeModel.startChat();
    const { response: typeResponse } = await projectTypeChat.sendMessage(
      prompt
    );
    const projectType = typeResponse.text().trim().toLowerCase();

    if (!["reactjs", "nodejs"].includes(projectType)) {
      res.status(500).json({ error: "Failed to determine project type" });
      return;
    }

    const finalModel = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction:
        projectType === "reactjs" ? reactBasePrompt : nodeBasePrompt,
    });

    const finalChat = finalModel.startChat();
    const result = await finalChat.sendMessageStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
    return;
  } catch (error: any) {
    console.error("Error processing request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
      return;
    }
  }
});

app.get("/", async (req, res) => {
  res.send("working");
  return;
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
