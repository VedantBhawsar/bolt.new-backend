import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import { basePrompt as reactBasePrompt } from "./details/react";
import { basePrompt as nodeBasePrompt } from "./details/node";
import { BASE_PROMPT, getSystemPrompt } from "./prompt";

dotenv.config();

// constants
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();

// middleware
app.use(express.json());

const googleAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
``;


// routes
app.post("/template", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

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
    if (projectType === "reactjs") {
      res.status(200).json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
    } else {
      res.status(200).json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
    }
    res.status(200).send("you can't access this resources");
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

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (typeof messages !== "object") {
      res.status(400).json({
        message: "message is required",
      });
      return;
    }
    const model = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: getSystemPrompt(),
          },
        ],
      },
    });

    const chat = model.startChat({
      history: messages,
    });

    const { response } = await chat.sendMessage("");

    res.status(200).json({
      message: response.text(),
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
    return;
  }
});

app.get("/", async (req, res) => {
  res.send("working");
  return;
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
