import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini API client securely on the server
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_FOR_LOCAL_PLAYGROUND",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to perform generateContent with automatic model fallback for maximum resilience
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Attempting generateContent with model: ${modelName}`);
      const response = await ai.models.generateContent({
        ...params,
        model: modelName,
      });
      console.log(`[AI] Success with model: ${modelName}`);
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI] Model ${modelName} failed. Error:`, err.message || err);
    }
  }
  throw lastError;
}

app.use(express.json());

// API Config Endpoint to check server status
app.get("/api/config", (req, res) => {
  res.json({
    status: "online",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint 1: Recommend freelancers based on job requirements and list of available candidates
app.post("/api/ai/recommend-freelancers", async (req, res) => {
  try {
    const { requirements, freelancers } = req.body;

    if (!requirements) {
      return res.status(400).json({ error: "Job requirements are required." });
    }

    const simplifiedFreelancers = (freelancers || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      skills: f.skills,
      category: f.category,
      rating: f.rating,
      price: f.price,
      experience: f.experience,
      bio: f.bio,
      location: f.location,
    }));

    const prompt = `You are FreelanceHub Africa's intelligent matcher. Match this customer requirement: "${requirements}" against our list of verified service providers: ${JSON.stringify(simplifiedFreelancers)}.
    Select the top 3 best fits and rank them. For each selected provider, provide a brief matching reason and a compatibility score (0-100%).
    Return the response as a valid JSON object in the specified format, ensuring that only the JSON is returned with no markdown blocks.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  freelancerId: { type: Type.STRING },
                  rank: { type: Type.INTEGER },
                  compatibilityScore: { type: Type.INTEGER },
                  matchingReason: { type: Type.STRING },
                },
                required: ["freelancerId", "rank", "compatibilityScore", "matchingReason"],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ["recommendations", "summary"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI Recommendation Error:", error);
    res.status(500).json({
      error: "Failed to generate AI recommendations.",
      details: error.message,
    });
  }
});

// Endpoint 2: Detect spam, fake profiles, and details inconsistency
app.post("/api/ai/verify-profile", async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ error: "Profile data is required." });
    }

    const prompt = `Verify the authenticity of this freelancer profile for spam, fake credentials, plagiarism, or visual identity flags. 
    Profile: ${JSON.stringify(profile)}.
    Analyze their Bio, Experience, Skills, Certifications, and listed location.
    Determine:
    1. Risk Score (0-100% where 100% is extremely high risk of spam/fraud).
    2. Verification Verdict (Approved, Under Review, Flagged, Suspended).
    3. Inconsistencies or red flags detected.
    4. Suggested questions to ask or improvements.
    Return your evaluation as a valid JSON object in the specified schema.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.INTEGER },
            verdict: { type: Type.STRING },
            flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            analysisSummary: { type: Type.STRING },
            recommendations: { type: Type.STRING },
          },
          required: ["riskScore", "verdict", "flags", "analysisSummary"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI Profile Verification Error:", error);
    res.status(500).json({
      error: "Failed to perform AI profile audit.",
      details: error.message,
    });
  }
});

// Endpoint 3: Suggest pricing ranges based on category, complexity, and region
app.post("/api/ai/suggest-pricing", async (req, res) => {
  try {
    const { category, subcategory, complexity, location } = req.body;

    if (!category) {
      return res.status(400).json({ error: "Category is required." });
    }

    const prompt = `You are a regional economic and pricing expert for service labor in Africa. 
    Analyze the following service details:
    - Category: ${category}
    - Subcategory: ${subcategory || "General"}
    - Complexity: ${complexity || "Standard"}
    - Location: ${location || "Lagos, Nigeria"}
    
    Estimate a fair market price range in the local standard currencies (e.g. NGN, KES, GHS, ZAR depending on the location, fallback to USD if unknown) for:
    1. Hourly rate (Low, Average, High)
    2. Flat/Project rate (Low, Average, High)
    
    Also list 3 key factors influencing this rate in this specific city.
    Return your estimates as a valid JSON object matching the provided schema.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currency: { type: Type.STRING },
            hourly: {
              type: Type.OBJECT,
              properties: {
                low: { type: Type.INTEGER },
                avg: { type: Type.INTEGER },
                high: { type: Type.INTEGER },
              },
              required: ["low", "avg", "high"],
            },
            flat: {
              type: Type.OBJECT,
              properties: {
                low: { type: Type.INTEGER },
                avg: { type: Type.INTEGER },
                high: { type: Type.INTEGER },
              },
              required: ["low", "avg", "high"],
            },
            marketFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            advice: { type: Type.STRING },
          },
          required: ["currency", "hourly", "flat", "marketFactors", "advice"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI Pricing Suggestion Error:", error);
    res.status(500).json({
      error: "Failed to suggest optimal pricing ranges.",
      details: error.message,
    });
  }
});

// Endpoint 4: Auto-complete job posting descriptions from short briefs
app.post("/api/ai/autocomplete-job", async (req, res) => {
  try {
    const { brief, category } = req.body;

    if (!brief) {
      return res.status(400).json({ error: "Brief requirements description is required." });
    }

    const prompt = `Transform this minimal customer request: "${brief}" under category: "${category || "General Services"}" into a highly professional, thorough, and formatted job description for a freelancer marketplace.
    Flesh it out with:
    1. Professional Job Title
    2. Scope of Work (step-by-step description of tasks)
    3. Required Skills & Tools
    4. Deliverables expected
    5. Recommended timeline/duration
    Return this as a JSON object with title, and full structured body.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobTitle: { type: Type.STRING },
            scopeOfWork: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            deliverables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            timelineRecommendation: { type: Type.STRING },
            formattedDescriptionMarkdown: { type: Type.STRING },
          },
          required: ["jobTitle", "scopeOfWork", "requiredSkills", "deliverables", "timelineRecommendation", "formattedDescriptionMarkdown"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI Job Autocomplete Error:", error);
    res.status(500).json({
      error: "Failed to autocomplete job description.",
      details: error.message,
    });
  }
});

// Endpoint 5: Chatbot for matching, questions, general platform advice
app.post("/api/ai/chatbot", async (req, res) => {
  try {
    const { messages, userRole, username } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const systemInstruction = `You are "FH Africa Assistant", a friendly, empathetic, and smart AI coordinator for FreelanceHub Africa.
    The current user is named ${username || "Guest"} and their role is "${userRole || "unknown"}".
    Provide useful, high-impact advice about:
    1. Finding work or finding reliable service contractors (plumbers, developers, drivers) across African hubs like Lagos, Nairobi, Kigali, Accra, and Johannesburg.
    2. Explaining our secure verified Escrow feature: Customers pay into escrow, freelancers work, and once the customer is satisfied and clicks approve, money releases.
    3. Handling disputes and withdrawals.
    Keep your answers concise, structured (using bullet points or bold text), friendly, and relevant to the African marketplace context. Avoid long essays. Do not offer fake credentials.`;

    const lastMessage = messages[messages.length - 1]?.content || "";

    const response = await generateContentWithFallback({
      contents: lastMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I apologize, I am having trouble processing your query right now. How else can I assist you?";
    res.json({ reply });
  } catch (error: any) {
    console.error("AI Chatbot Error:", error);
    res.status(500).json({
      error: "Failed to generate chatbot reply.",
      details: error.message,
    });
  }
});

// Setup Vite Dev Server / Static files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode serving static build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FreelanceHub Africa backend-frontend server running on port ${PORT}`);
  });
}

startServer();
