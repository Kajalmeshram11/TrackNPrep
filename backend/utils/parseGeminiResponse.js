function parseGeminiResponse(rawText, fallbackType = "questions") {
  let data;

  try {
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    data = JSON.parse(cleanedText);
  } catch (error) {
    console.error("⚠️ JSON Parse Error:", error.message);

    // fallback structure
    if (fallbackType === "questions") {
      data = [
        {
          question: "Gemini Response",
          answer: rawText
        }
      ];
    } else {
      data = {
        title: "Gemini Response",
        explanation: rawText
      };
    }
  }

  return data;
}

module.exports = parseGeminiResponse;
