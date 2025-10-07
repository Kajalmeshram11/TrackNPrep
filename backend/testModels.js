require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

(async () => {
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // List available models
    const models = await ai.listModels();
    console.log("✅ Available Models:");
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error("❌ Error listing models:", error);
  }
})();
