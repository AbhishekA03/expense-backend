const { GoogleGenAI } = require("@google/genai");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

exports.chatWithAI = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ reply: "Message and userId required" });
    }

    // 📊 FETCH DATA
    const expenses = await Expense.find({ userId });
    const incomes = await Income.find({ userId });

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const balance = totalIncome - totalExpense;

    // 📊 CATEGORY BREAKDOWN
    const categories = {};
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    // ======================================================
    // 🔥 LOCAL LOGIC (WORKS WITHOUT AI)
    // ======================================================

    const msg = message.toLowerCase();

    // 🧠 Highest expense category
    if (msg.includes("highest") || msg.includes("most expense")) {
      let maxCat = "";
      let maxVal = 0;

      for (let cat in categories) {
        if (categories[cat] > maxVal) {
          maxVal = categories[cat];
          maxCat = cat;
        }
      }

      return res.json({
        reply: `Your highest spending is on "${maxCat}" (₹${maxVal}). Try reducing it.`
      });
    }

    // 💰 Saving advice
    if (msg.includes("save") || msg.includes("saving")) {
      return res.json({
        reply: `You can save money by reducing unnecessary expenses. 
Your current balance is ₹${balance}. Try limiting high spending categories.`
      });
    }

    // 📈 Prediction (simple logic)
    if (msg.includes("predict")) {
      const avgExpense = totalExpense / (expenses.length || 1);

      return res.json({
        reply: `Based on your current pattern, your next month expense may be around ₹${Math.round(avgExpense * 30)}.`
      });
    }

    // 🍔 Category specific
    for (let cat in categories) {
      if (msg.includes(cat.toLowerCase())) {
        return res.json({
          reply: `You spent ₹${categories[cat]} on ${cat}.`
        });
      }
    }

    // ======================================================
    // 🤖 AI LOGIC (WITH FALLBACK)
    // ======================================================

    const prompt = `
You are a financial advisor.

User Data:
Income: ₹${totalIncome}
Expense: ₹${totalExpense}
Balance: ₹${balance}

Categories:
${JSON.stringify(categories)}

User Question:
${message}

Give:
- Simple answer
- Financial advice
- Prediction if needed
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      let reply = "";

      if (response.text) {
        reply = response.text;
      } else if (
        response.candidates &&
        response.candidates[0]?.content?.parts[0]?.text
      ) {
        reply = response.candidates[0].content.parts[0].text;
      } else {
        reply = "I couldn't understand. Please try again.";
      }

      return res.json({ reply });

    } catch (aiError) {

      console.log("AI ERROR:", aiError.status);

      // 🚨 QUOTA ERROR HANDLING
      if (aiError.status === 429) {
        return res.json({
          reply: "⚠️ AI quota exceeded. Using smart local analysis instead."
        });
      }

      return res.json({
        reply: "AI not available right now. Try again later."
      });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ reply: "Server error" });
  }
};