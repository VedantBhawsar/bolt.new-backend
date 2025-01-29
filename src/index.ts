import dotenv from "dotenv";
import express from "express";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const gemini = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.send("server is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
