require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `You are a professional career coach and LinkedIn expert. 
Your goal is to help users with:
1. Resume writing and optimization
2. LinkedIn profile improvement
3. Interview preparation
4. Job search strategies
5. Career advice

Be professional, encouraging, and provide specific, actionable advice.`;

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;
        res.json({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 