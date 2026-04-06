const { GoogleGenAI } = require("@google/genai");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

exports.chatWithAI = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const expenses = await Expense.find({ userId });
    const incomes = await Income.find({ userId });

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

    const prompt = `
You are a smart financial assistant.

Income: ${totalIncome}
Expense: ${totalExpense}
Balance: ${totalIncome - totalExpense}

User question: ${message}

Give:
- Advice
- Spending insights
- Prediction if asked
`;

    // ✅ NEW WORKING METHOD
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const reply = response.text;

    res.json({ reply });

  } catch (err) {
    console.log("AI ERROR:", err);
    res.status(500).json({ reply: "AI not working" });
  }
};