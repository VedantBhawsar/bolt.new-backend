import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const gemini_api_key = process.env.GEMINI_API_KEY;

const googleAI = new GoogleGenerativeAI(gemini_api_key!);

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

app.get("/", (req, res) => {
  res.send("server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
