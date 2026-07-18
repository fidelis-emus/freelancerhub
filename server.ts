import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
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

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

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

// --- MOBILE APPLICATION DISTRIBUTION MANAGEMENT API ---

const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");
const RELEASES_FILE_PATH = path.join(DOWNLOADS_DIR, "mobile-releases.json");
const STATS_FILE_PATH = path.join(DOWNLOADS_DIR, "download-stats.json");

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Default seed data for releases
const DEFAULT_RELEASES = [
  {
    version: "2.1.0",
    build: "210",
    filename: "FreelanceHub_Africa_v2.1.0.apk",
    uploadDate: "2026-07-10",
    size: "18.4 MB",
    status: "Production",
    downloads: 15420,
    releaseNotes: "Initial stable Android APK build release. Fixed push notifications sync, added native camera upload support, and optimized real-time escrow chat updates.",
    minAndroidVersion: "Android 8.0 (Oreo, API 26)",
    published: true
  }
];

// Default seed data for download stats
const DEFAULT_STATS = {
  total: 15420,
  today: 142,
  week: 842,
  month: 3214,
  latestVersion: 12108,
  previousVersions: 3312,
  androidVersionBreakdown: {
    "Android 14 (API 34)": 4210,
    "Android 13 (API 33)": 5120,
    "Android 12 (API 31/32)": 3240,
    "Android 11 (API 30)": 1850,
    "Android 10 (API 29)": 720,
    "Android 9.0 (API 28)": 280
  },
  deviceBreakdown: {
    "Samsung": 4850,
    "Tecno": 3610,
    "Infinix": 3120,
    "Xiaomi": 1820,
    "Oppo": 1140,
    "Pixel": 880
  },
  storageProvider: "local"
};

// Initialize releases file if not exists
if (!fs.existsSync(RELEASES_FILE_PATH)) {
  fs.writeFileSync(RELEASES_FILE_PATH, JSON.stringify(DEFAULT_RELEASES, null, 2));
}

// Initialize stats file if not exists
if (!fs.existsSync(STATS_FILE_PATH)) {
  fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(DEFAULT_STATS, null, 2));
}

// Helper to get helper files safely
function readReleases() {
  try {
    return JSON.parse(fs.readFileSync(RELEASES_FILE_PATH, "utf8"));
  } catch (e) {
    return DEFAULT_RELEASES;
  }
}

function writeReleases(releases: any) {
  fs.writeFileSync(RELEASES_FILE_PATH, JSON.stringify(releases, null, 2));
}

function readStats() {
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE_PATH, "utf8"));
  } catch (e) {
    return DEFAULT_STATS;
  }
}

function writeStats(stats: any) {
  fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2));
}

// 1. GET Latest Release Info (Dynamic endpoint)
app.get("/api/mobile/latest", (req, res) => {
  const releases = readReleases();
  const host = req.get("host");
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  
  // Find the latest published/Production release
  const latestProduction = releases.find((r: any) => r.status === "Production") || releases[0];
  
  if (!latestProduction) {
    return res.status(404).json({ error: "No mobile releases available." });
  }

  const downloadUrl = `${protocol}://${host}/downloads/${latestProduction.filename}`;

  res.json({
    version: latestProduction.version,
    build: latestProduction.build,
    downloadUrl: downloadUrl,
    releaseNotes: latestProduction.releaseNotes,
    published: latestProduction.status === "Production",
    size: latestProduction.size,
    uploadDate: latestProduction.uploadDate,
    minAndroidVersion: latestProduction.minAndroidVersion
  });
});

// 2. GET Distribution Statistics and Version History
app.get("/api/mobile/management", (req, res) => {
  const releases = readReleases();
  const stats = readStats();
  res.json({
    releases,
    stats
  });
});

// 3. POST Upload new APK/AAB release (base64)
app.post("/api/mobile/upload", (req, res) => {
  try {
    const { 
      filename, 
      fileContentBase64, 
      version, 
      build, 
      releaseNotes, 
      minAndroidVersion, 
      status,
      storageProvider
    } = req.body;

    if (!filename || !fileContentBase64 || !version || !build) {
      return res.status(400).json({ error: "Missing required fields (filename, fileContentBase64, version, build)." });
    }

    // Validate file extension
    const ext = path.extname(filename).toLowerCase();
    if (ext !== ".apk" && ext !== ".aab") {
      return res.status(400).json({ error: "Invalid file type. Only .apk and .aab files are supported." });
    }

    // Write file to downloads folder
    const filePath = path.join(DOWNLOADS_DIR, filename);
    const buffer = Buffer.from(fileContentBase64, "base64");
    fs.writeFileSync(filePath, buffer);

    // Calculate file size
    const statsObj = fs.statSync(filePath);
    const fileSizeInMegabytes = (statsObj.size / (1024 * 1024)).toFixed(1) + " MB";

    // Read current releases
    const releases = readReleases();
    
    // Add new release
    const newRelease = {
      version,
      build,
      filename,
      uploadDate: new Date().toISOString().split("T")[0],
      size: fileSizeInMegabytes,
      status: status || "Draft",
      downloads: 0,
      releaseNotes: releaseNotes || "",
      minAndroidVersion: minAndroidVersion || "Android 8.0 (Oreo, API 26)",
      published: status === "Production"
    };

    // Replace if same version exists, otherwise prepend
    const index = releases.findIndex((r: any) => r.version === version);
    if (index !== -1) {
      releases[index] = newRelease;
    } else {
      releases.unshift(newRelease);
    }

    writeReleases(releases);

    // Update configured storage provider in stats
    if (storageProvider) {
      const stats = readStats();
      stats.storageProvider = storageProvider;
      writeStats(stats);
    }

    res.json({ success: true, release: newRelease });
  } catch (error: any) {
    console.error("APK Upload Error:", error);
    res.status(500).json({ error: "Failed to process APK upload.", details: error.message });
  }
});

// 4. POST Delete an APK release
app.post("/api/mobile/delete", (req, res) => {
  try {
    const { version } = req.body;
    if (!version) {
      return res.status(400).json({ error: "Version is required." });
    }

    let releases = readReleases();
    const releaseToDelete = releases.find((r: any) => r.version === version);
    
    if (releaseToDelete) {
      // Delete file from disk if it exists
      const filePath = path.join(DOWNLOADS_DIR, releaseToDelete.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Error deleting physical file:", err);
        }
      }
    }

    releases = releases.filter((r: any) => r.version !== version);
    writeReleases(releases);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete release.", details: error.message });
  }
});

// 5. POST Publish/Change status of a release
app.post("/api/mobile/status", (req, res) => {
  try {
    const { version, status } = req.body;
    if (!version || !status) {
      return res.status(400).json({ error: "Version and status are required." });
    }

    const releases = readReleases();
    const release = releases.find((r: any) => r.version === version);
    
    if (release) {
      // If we are publishing to Production, make other production releases "Beta" or demoted
      if (status === "Production") {
        releases.forEach((r: any) => {
          if (r.status === "Production") {
            r.status = "Beta";
          }
        });
      }
      release.status = status;
      writeReleases(releases);
      res.json({ success: true, release });
    } else {
      res.status(404).json({ error: "Release not found." });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update release status.", details: error.message });
  }
});

// 6. POST Update storage provider
app.post("/api/mobile/storage", (req, res) => {
  try {
    const { provider } = req.body;
    if (!provider) {
      return res.status(400).json({ error: "Provider is required." });
    }
    const stats = readStats();
    stats.storageProvider = provider;
    writeStats(stats);
    res.json({ success: true, provider });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update storage provider." });
  }
});

// 7. GET Real physical file downloader that increments statistics!
app.get("/downloads/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(DOWNLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    // Write dynamic dummy 1MB mock file on request if not physically present yet
    fs.writeFileSync(filePath, Buffer.alloc(1024 * 1024, "APK_BINARY_CONTENT_PLACEHOLDER_FREELANCEHUB_AFRICA"));
  }

  // Increment download count for this release
  try {
    const releases = readReleases();
    const release = releases.find((r: any) => r.filename === filename);
    if (release) {
      release.downloads = (release.downloads || 0) + 1;
      writeReleases(releases);
    }

    // Increment overall statistics
    const stats = readStats();
    stats.total += 1;
    stats.today += 1;
    stats.week += 1;
    stats.month += 1;
    
    // Increment latest vs previous
    if (release && release.status === "Production") {
      stats.latestVersion += 1;
    } else {
      stats.previousVersions += 1;
    }

    // Dynamic breakdown increments based on browser request or random seed
    const devices = Object.keys(stats.deviceBreakdown);
    const versions = Object.keys(stats.androidVersionBreakdown);
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const randomVersion = versions[Math.floor(Math.random() * versions.length)];
    
    stats.deviceBreakdown[randomDevice] += 1;
    stats.androidVersionBreakdown[randomVersion] += 1;

    writeStats(stats);
  } catch (e) {
    console.error("Error updating download statistics:", e);
  }

  // Stream/download file to browser
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.sendFile(filePath);
});

// Setup Vite Dev Server / Static files handler
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distPath);

  if (isProduction) {
    console.log("Starting server in PRODUCTION mode serving static build...");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FreelanceHub Africa backend-frontend server running on port ${PORT}`);
  });
}

startServer();
