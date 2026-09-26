const ai = require("./gemini");

const suggestCategory = async (title, description) => {
  const prompt = `
You are an IT Helpdesk ticket classifier.

Classify the following ticket into exactly ONE of these categories:

Hardware
Software
Network

Ticket title:
${title}

Ticket description:
${description}

Return ONLY one category name:
Hardware
Software
Network
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt
  });

  return response.text.trim();
};

module.exports = suggestCategory;