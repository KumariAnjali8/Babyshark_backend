import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    console.log("GROQ KEY LOADED:", !!process.env.GROQ_API_KEY);

    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea required" });
    }

    const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
  {
    role: "system",
    content: "You are a startup planner. You ONLY return valid JSON."
  },
  {
    role: "user",
    content: `
Return ONLY JSON in this exact format:
{
  "roadmap": [
    { "step": 1, "title": "string", "description": "string" }
  ],
  "pitch": {
    "short": "string",
    "long": "string"
  }
}

Startup idea:
${idea}
    `
  }
],

    }),
  }
);


    if (!response.ok) {
      const err = await response.text();
      console.error("GROQ ERROR:", err);
      return res.status(500).json({ error: "Groq API error" });
    }

  const data = await response.json();
const aiText = data.choices[0].message.content;

let structured;

try {
  structured = JSON.parse(aiText);
} catch {
  return res.status(500).json({ error: "AI returned invalid JSON" });
}
console.log("FINAL AI STRUCTURED RESPONSE:", structured);
res.json(structured);



  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server failed" });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
