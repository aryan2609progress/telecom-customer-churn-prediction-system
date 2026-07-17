import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { FileDatabase } from "./server-db";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { AIReport } from "./src/types";

dotenv.config();

// Helper to retrieve dynamic Gemini Client (custom user key or environment key)
function getGeminiClient(): GoogleGenAI | null {
  const settings = FileDatabase.getSettings();
  const customKey = settings?.geminiApiKey;
  const envKey = process.env.GEMINI_API_KEY;
  const activeKey = (customKey && customKey.trim() !== "" && !customKey.includes("••••")) ? customKey : envKey;

  if (activeKey && activeKey.trim() !== "" && activeKey !== "MY_GEMINI_API_KEY") {
    return new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return null;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper middleware/extractor to get authenticated user context from request headers
function getAuthContext(req: express.Request) {
  const userId = req.headers['x-user-id'] as string || 'u1'; // fallback to first user in list for seamless dev
  const users = FileDatabase.getUsers();
  const currentUser = users.find(u => u.id === userId) || users[0];
  return currentUser;
}

// ==========================================
// 1. AUTHENTICATION API
// ==========================================

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = FileDatabase.findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ error: "Account is deactivated. Please contact an admin." });
  }

  const isMatched = FileDatabase.verifyPassword(user.id, password);
  if (!isMatched) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  FileDatabase.forceLog(user.id, user.name, user.role, 'USER_LOGIN', `User ${user.username} successfully logged in.`);
  res.json({ success: true, user });
});

app.post("/api/auth/signup", (req, res) => {
  const { username, password, name, email, role } = req.body;
  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existing = FileDatabase.findUserByUsername(username);
  if (existing) {
    return res.status(400).json({ error: "Username is already taken" });
  }

  const newUser = FileDatabase.createUser({
    username,
    name,
    email,
    role: role || 'employee'
  }, password);

  res.status(210).json({ success: true, user: newUser });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const users = FileDatabase.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ error: "No user found with this email address." });
  }

  // Simulate verification link delivery
  FileDatabase.forceLog(user.id, user.name, user.role, 'PASSWORD_RESET_REQUEST', `Password reset token requested for ${email}`);
  res.json({ success: true, message: `A password reset link has been simulated & delivered to ${email}. Check system logs for details.` });
});

app.post("/api/auth/verify-email", (req, res) => {
  const { email } = req.body;
  res.json({ success: true, message: `Email ${email} successfully verified in the simulation sandbox.` });
});

app.post("/api/auth/change-password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = getAuthContext(req);

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Old and new passwords are required" });
  }

  const success = FileDatabase.changePassword(user.id, oldPassword, newPassword);
  if (!success) {
    return res.status(400).json({ error: "Incorrect old password." });
  }

  res.json({ success: true });
});

// ==========================================
// 2. CUSTOMER MANAGEMENT API
// ==========================================

app.get("/api/customers", (req, res) => {
  const customers = FileDatabase.getCustomers();
  res.json(customers);
});

app.get("/api/customers/:id", (req, res) => {
  const customer = FileDatabase.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }
  res.json(customer);
});

app.post("/api/customers", (req, res) => {
  const user = getAuthContext(req);
  try {
    const customer = FileDatabase.createCustomer(user.id, req.body);
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/customers/:id", (req, res) => {
  const user = getAuthContext(req);
  try {
    const customer = FileDatabase.updateCustomer(user.id, req.params.id, req.body);
    res.json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const user = getAuthContext(req);
  const success = FileDatabase.deleteCustomer(user.id, req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Customer not found" });
  }
  res.json({ success: true });
});

// ==========================================
// 3. CHURN PREDICTION API
// ==========================================

app.post("/api/predictions/predict/:customerId", (req, res) => {
  const user = getAuthContext(req);
  try {
    const prediction = FileDatabase.runRealPrediction(user.id, req.params.customerId);
    res.json(prediction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/predictions/history/:customerId", (req, res) => {
  const history = FileDatabase.getPredictionHistory(req.params.customerId);
  res.json(history);
});

// ==========================================
// 4. AI INSIGHTS API (GEMINI-POWERED RETENTION)
// ==========================================

app.post("/api/ai/insights/:customerId", async (req, res) => {
  const user = getAuthContext(req);
  const { customerId } = req.params;
  const customer = FileDatabase.getCustomerById(customerId);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  // Generate fallback response in case Gemini client isn't configured/connected
  const createFallbackReport = (): any => {
    const isHigh = customer.riskLevel === 'high';
    return {
      id: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId,
      customerName: customer.personal.name,
      executiveSummary: `Retention analysis for ${customer.personal.name} indicates a ${customer.riskLevel.toUpperCase()} churn risk of ${customer.churnProbability}%. There are multiple indicators of potential dissatisfaction relating to pricing structure and service density.`,
      riskAnalysis: `The main risk features include a ${customer.billing.contract} contract which offers absolute zero commitment or switching friction. Furthermore, ${customer.telecom.techSupport === 'No' ? 'the absence of Technical Support' : 'service issues'} and monthly billing of $${customer.billing.monthlyCharges} increase pricing sensitivity.`,
      retentionStrategies: isHigh ? [
        "Proactively offer a contract migration from Month-to-Month to a 1-year saver plan at a 25% discount.",
        "Bundle active Tech Support and Online Security services free of charge for 3 billing cycles.",
        "Waive any manual processing fees and guide them to credit card automatic payment options."
      ] : [
        "Offer standard long-term upgrade credits to secure extended lock-in contracts.",
        "Trigger custom service check-ins to build brand trust and prevent technical complaints.",
        "Add digital perk subscriptions to increase plan value without sacrificing service pricing."
      ],
      discountSuggestion: isHigh ? "Offer 25% loyalty rebate on plan migration" : "Offer $10 monthly account loyalty credit for auto-pay transition",
      nextBestAction: isHigh ? "Assign immediate direct outbound phone outreach call by Retention Specialist" : "Email monthly newsletter with digital perk activations",
      createdAt: new Date().toISOString()
    };
  };

  const aiClient = getGeminiClient();
  if (!aiClient) {
    const report = createFallbackReport();
    FileDatabase.saveAIReport(report);
    FileDatabase.forceLog(user.id, user.name, user.role, 'AI_REPORT_GENERATED_FALLBACK', `Generated heuristic AI insights for customer ${customer.personal.name}`);
    return res.json(report);
  }

  try {
    const prompt = `
      Perform a professional telecom customer retention risk analysis for the following customer:
      Name: ${customer.personal.name}
      Age: ${customer.personal.age}
      Senior Citizen: ${customer.family.seniorCitizen}
      Tenure: ${customer.telecom.tenure} months
      Services: Phone: ${customer.telecom.phoneService}, Lines: ${customer.telecom.multipleLines}, Internet: ${customer.telecom.internetService}, Security: ${customer.telecom.onlineSecurity}, Tech Support: ${customer.telecom.techSupport}
      Billing: Contract: ${customer.billing.contract}, Payment Method: ${customer.billing.paymentMethod}, Paperless Billing: ${customer.billing.paperlessBilling}, Monthly Charges: $${customer.billing.monthlyCharges}, Total Charges: $${customer.billing.totalCharges}
      Current Churn Model Estimation: Probability is ${customer.churnProbability}%, Risk Level: ${customer.riskLevel.toUpperCase()}

      Provide insights inside the JSON response schema. Write tailored, concrete, highly realistic recommendations, specific discount structures, executive summaries, and clear analysis of why they are likely to leave or stay.
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior predictive customer lifecycle director at an elite enterprise telecommunications firm. Your specialty is analyzing subscriber risk metrics and formulating highly personalized, context-aware retention tactics to secure vulnerable accounts. Give practical retention ideas.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: "High-level summary of customer health, warning indicators, and primary loyalty status."
            },
            riskAnalysis: {
              type: Type.STRING,
              description: "Detailed breakdown of why this customer is prone to churn or what triggers are driving potential cancellation."
            },
            retentionStrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three highly customized, step-by-step retention campaigns to offer this specific customer."
            },
            discountSuggestion: {
              type: Type.STRING,
              description: "A specific financial concession, plan upgrade, or billing waiver designed for this subscriber."
            },
            nextBestAction: {
              type: Type.STRING,
              description: "The immediate single highest priority action the management representative must take."
            }
          },
          required: ["executiveSummary", "riskAnalysis", "retentionStrategies", "discountSuggestion", "nextBestAction"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response content from Gemini API.");
    }

    const aiData = JSON.parse(text);
    const report: AIReport = {
      id: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId,
      customerName: customer.personal.name,
      executiveSummary: aiData.executiveSummary,
      riskAnalysis: aiData.riskAnalysis,
      retentionStrategies: aiData.retentionStrategies,
      discountSuggestion: aiData.discountSuggestion,
      nextBestAction: aiData.nextBestAction,
      createdAt: new Date().toISOString()
    };

    FileDatabase.saveAIReport(report);
    FileDatabase.forceLog(user.id, user.name, user.role, 'AI_REPORT_GENERATED', `Generated Gemini Churn Insights for customer ${customer.personal.name}`);
    res.json(report);

  } catch (err: any) {
    console.error("Gemini Churn Prediction failed, utilizing heuristic fallback:", err);
    const report = createFallbackReport();
    FileDatabase.saveAIReport(report);
    FileDatabase.forceLog(user.id, user.name, user.role, 'AI_REPORT_GENERATED_FALLBACK_ON_ERROR', `Generated heuristic fallback insights for customer ${customer.personal.name} due to API issues.`);
    res.json(report);
  }
});

app.get("/api/ai/reports/:customerId", (req, res) => {
  const reports = FileDatabase.getAIReports(req.params.customerId);
  res.json(reports);
});

// ==========================================
// 5. FOLLOW UP & ALERTS API
// ==========================================

app.get("/api/followups", (req, res) => {
  const followups = FileDatabase.getFollowUps();
  res.json(followups);
});

app.post("/api/followups", (req, res) => {
  const user = getAuthContext(req);
  try {
    const followup = FileDatabase.createFollowUp(user.id, req.body);
    res.status(201).json(followup);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/followups/:id", (req, res) => {
  const user = getAuthContext(req);
  const { notes, customerResponse, status } = req.body;
  try {
    const updated = FileDatabase.updateFollowUp(user.id, req.params.id, notes, customerResponse, status);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. ADMIN & AUDIT LOGS API
// ==========================================

app.get("/api/logs", (req, res) => {
  const logs = FileDatabase.getLogs();
  res.json(logs);
});

app.get("/api/users", (req, res) => {
  const users = FileDatabase.getUsers();
  res.json(users);
});

app.put("/api/users/:userId/role", (req, res) => {
  const admin = getAuthContext(req);
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: "Only admins are allowed to manage user roles." });
  }
  const { role } = req.body;
  const success = FileDatabase.updateUserRole(admin.id, req.params.userId, role);
  if (!success) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({ success: true });
});

app.put("/api/users/:userId/status", (req, res) => {
  const admin = getAuthContext(req);
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: "Only admins are allowed to update user status." });
  }
  const { status } = req.body;
  const success = FileDatabase.updateUserStatus(admin.id, req.params.userId, status);
  if (!success) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({ success: true });
});

// ==========================================
// 7. SYSTEM SETTINGS API
// ==========================================

app.get("/api/settings", (req, res) => {
  const settings = { ...FileDatabase.getSettings() };
  if (settings.geminiApiKey) {
    const len = settings.geminiApiKey.length;
    if (len > 8) {
      settings.geminiApiKey = `••••••••••••${settings.geminiApiKey.substring(len - 4)}`;
    } else {
      settings.geminiApiKey = "••••••••••••";
    }
  }
  res.json(settings);
});

app.put("/api/settings", (req, res) => {
  const user = getAuthContext(req);
  try {
    const existingSettings = FileDatabase.getSettings();
    const newSettings = req.body;

    // If the input key is masked (starts with ••••), retain the existing saved API key
    if (newSettings.geminiApiKey && newSettings.geminiApiKey.includes("••••")) {
      newSettings.geminiApiKey = existingSettings.geminiApiKey;
    }

    const updated = FileDatabase.updateSettings(user.id, newSettings);
    
    // Mask the returned settings key
    const settingsToReturn = { ...updated };
    if (settingsToReturn.geminiApiKey) {
      const len = settingsToReturn.geminiApiKey.length;
      if (len > 8) {
        settingsToReturn.geminiApiKey = `••••••••••••${settingsToReturn.geminiApiKey.substring(len - 4)}`;
      } else {
        settingsToReturn.geminiApiKey = "••••••••••••";
      }
    }
    res.json(settingsToReturn);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/settings/test-key", async (req, res) => {
  const user = getAuthContext(req);
  let { apiKey } = req.body;
  
  if (!apiKey || apiKey.trim() === "") {
    return res.status(400).json({ error: "API Key cannot be empty." });
  }

  // If the user is testing the currently saved key and it's masked, unmask it from database
  if (apiKey.includes("••••")) {
    const settings = FileDatabase.getSettings();
    apiKey = settings.geminiApiKey || "";
  }

  if (!apiKey || apiKey.trim() === "") {
    return res.status(400).json({ error: "No valid API Key configured to test." });
  }

  try {
    const testAi = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Run a quick validation query asking for a single word
    const response = await testAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Say precisely OK and nothing else.",
    });

    if (response && response.text) {
      FileDatabase.forceLog(user.id, user.name, user.role, 'AI_KEY_TEST_SUCCESS', "Successfully verified Gemini API connectivity using the tested credentials.");
      return res.json({ success: true, message: "Connection successful! Gemini API key is fully active and validated." });
    } else {
      throw new Error("No response received from model endpoint.");
    }
  } catch (err: any) {
    console.error("Gemini API Key test failed:", err);
    FileDatabase.forceLog(user.id, user.name, user.role, 'AI_KEY_TEST_FAILED', `API connection test failed: ${err.message || 'Unknown error'}`);
    return res.status(400).json({ error: err.message || "Failed to validate API Key. Please verify the credentials." });
  }
});

// ==========================================
// 8. VITE MIDDLEWARE & STATIC FILE SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
