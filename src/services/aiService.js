const { GoogleGenerativeAI } = require("@google/generative-ai");
const CustomError = require("../utils/CustomError");

const generateImprovedDescription = async (title, description) => {
  if (!title || !description) {
    throw new CustomError("Title and description are required", 400);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `I have a task/project with the following title and a simple description. Please provide an improved, clear, and professional description for it. Return only the improved description text, no additional formatting or introductory text.
Title: ${title}
Simple Description: ${description}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating AI description:", error);
    throw new CustomError("Failed to generate improved description", 500);
  }
};

const convertSpeechToText = async (file) => {
  if (!file) {
    throw new CustomError("Audio file is required", 400);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const audioPart = {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };

  const prompt = "Transcribe the speech in this audio exactly to text. Do not add any extra formatting or conversational text.";

  try {
    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error converting speech to text:", error);
    throw new CustomError("Failed to convert speech to text", 500);
  }
};

module.exports = {
  generateImprovedDescription,
  convertSpeechToText,
};
