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
                { role: "system", content: "너는 따뜻한 감정 분석 피드백을 제공하는 AI야." },
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
                { role: "user", content: `"${emotion}" 감정일 때 들으면 좋은 노래 1곡 추천해줘. 제목과 가수와 해당 노래를 들을 수 있는 유튜브 링크도 같이 알려줘. 링크는 실제 유튜브 영상 주소여야해. 그리고 마지막으로 음악 추천의 이유를 꼭 알려줘.` }
            ]
        });
        res.json({ music: chatCompletion.choices[0].message.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '음악 추천 실패' });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
