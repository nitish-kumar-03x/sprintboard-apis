const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateImprovedDescription = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `I have a task/project with the following title and a simple description. Please provide an improved, clear, and professional description for it. Return only the improved description text, no additional formatting or introductory text.
Title: ${title}
Simple Description: ${description}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedDescription = response.text().trim();

    return res.status(200).json({
      success: true,
      improvedDescription,
    });
  } catch (error) {
    console.error("Error generating AI description:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate improved description" });
  }
};

module.exports = {
  generateImprovedDescription,
};
