const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAIApi(
  new Configuration({
    apiKey: "YOUR_OPENAI_API_KEY", // Replace with your OpenAI API key
  })
);

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a chatbot that helps female entrepreneurs with business guidance, funding, and networking." },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
