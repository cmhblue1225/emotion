// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { OpenAI } = require('openai');  // openai v4 방식
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/api/feedback', async (req, res) => {
    const { content, emotion } = req.body;
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "너는 따뜻한 감정 분석 피드백을 제공하는 AI야.." },
                { role: "user", content: `감정: ${emotion}, 일기: ${content}` }
            ]
        });
        res.json({ feedback: chatCompletion.choices[0].message.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI 피드백 생성 실패' });
    }
});

app.post('/api/music', async (req, res) => {
    const { emotion } = req.body;  // content 없음!
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "너는 감정에 어울리는 음악을 추천하는 AI야." },
                { role: "user", content: `"${emotion}" 감정일 때 들으면 좋은 노래 1곡 추천해줘. 제목과 가수와 해당 노래를 들을 수 있는 유튜브 링크도 같이 알려줘. 링크는 실제 유튜브 영상 주소여야해. 추천해주는 노래는 일기와 관련된 노래이고, 최신의 유명한 노래였으면 좋겠어.` }
            ]
        });
        res.json({ music: chatCompletion.choices[0].message.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '음악 추천 실패' });
    }
});
app.post("/api/analysis", async (req, res) => {
    const { emotionCounts } = req.body;
  
    const prompt = `
  감정 통계를 바탕으로 사용자 감정의 전반적인 경향을 해석해줘. 아래는 감정별 일기 수야.
  ${Object.entries(emotionCounts)
      .map(([emotion, count]) => `${emotion}: ${count}회`)
      .join("\n")}
  
  사용자에게 따뜻하고 명확하게 설명해줘.`;
  
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
  
      const analysis = completion.data.choices[0].message.content;
      res.json({ analysis });
    } catch (err) {
      console.error("감정 분석 실패:", err);
      res.status(500).json({ error: "분석 실패" });
    }
  });
  


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
