const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/', (req, res) => {
  res.send('EmotionProject Server is running!');
});

// AI 피드백
app.post('/api/feedback', async (req, res) => {
  const { content, emotion } = req.body;
  const prompt = `사용자가 ${emotion}의 감정을 느끼며 쓴 일기입니다:\n"${content}"\n이 내용을 읽고 진심 어린 피드백과 위로 또는 조언을 해주세요.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ feedback: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ feedback: 'AI 피드백 생성 중 오류가 발생했습니다.' });
  }
});

// 음악 추천
app.post('/api/music', async (req, res) => {
  const { emotion } = req.body;
  const prompt = `기분이 ${emotion}일 때 듣기 좋은 노래 1곡을 추천하고, 유튜브 링크도 함께 제공해주세요.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ music: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ music: '음악 추천 생성 중 오류가 발생했습니다.' });
  }
});

// 감정 통계 분석
app.post('/api/analysis', async (req, res) => {
  const { emotionCounts } = req.body;
  const stats = Object.entries(emotionCounts)
    .map(([k, v]) => `${k}: ${v}회`).join(', ');
  const prompt = `사용자의 감정 일기 분석 결과는 다음과 같습니다: ${stats}. 이를 바탕으로 감정 흐름에 대한 간단한 통찰과 조언을 제공해주세요.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ analysis: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ analysis: '감정 분석 중 오류가 발생했습니다.' });
  }
});

// AI 채팅
app.post('/api/chat', async (req, res) => {
  const { message, diary } = req.body;

  if (!diary || !diary.content || !diary.emotion) {
    return res.status(400).json({ reply: '잘못된 요청입니다. diary 정보가 필요합니다.' });
  }

  const systemPrompt = `너는 감정 상담사야. 사용자의 감정은 "${diary.emotion}"이고, 아래는 사용자가 쓴 일기야:\n"${diary.content}". 이 정보를 바탕으로 공감하며 따뜻한 말과 상담을 이어가.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ reply: 'AI 응답에 실패했습니다.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ 서버가 포트 ${PORT}에서 실행 중!`));
