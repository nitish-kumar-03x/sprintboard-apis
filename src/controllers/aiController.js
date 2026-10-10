const aiService = require("../services/aiService");

const generateImprovedDescription = async (req, res) => {
  try {
    const { title, description } = req.body;
    const improvedDescription = await aiService.generateImprovedDescription(title, description);

    return res.status(200).json({
      success: true,
      improvedDescription,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message });
  }
};

const convertSpeechToText = async (req, res) => {
  try {
    const text = await aiService.convertSpeechToText(req.file);

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message });
  }
};

module.exports = {
  generateImprovedDescription,
  convertSpeechToText,
};
