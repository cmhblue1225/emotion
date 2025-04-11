const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// OpenAI v4 방식 임
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('client')); // client 폴더 정적 파일 제공

// AI 피드백 생성
app.post('/api/feedback', async (req, res) => {
  const { content, emotion } = req.body;
  try {
    const prompt = `사용자가 다음과 같은 감정(${emotion})을 느끼며 작성한 일기에 대해 진심 어린 피드백을 주세요:\n"${content}"`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ feedback: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI 피드백 생성 오류' });
  }
});

// 감정 기반 음악 추천
app.post('/api/music', async (req, res) => {
  const { emotion } = req.body;
  try {
    const prompt = `지금 사용자의 기분은 "${emotion}"입니다. 이 감정에 어울리는 노래 하나를 유튜브 링크와 함께 추천해주세요.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ music: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '음악 추천 오류' });
  }
});

// 감정 통계 분석
app.post('/api/analysis', async (req, res) => {
  const { emotionCounts } = req.body;
  try {
    const emotionSummary = Object.entries(emotionCounts)
      .map(([emotion, count]) => `${emotion}: ${count}회`)
      .join(', ');
    const prompt = `사용자의 감정 일기 데이터는 다음과 같습니다: ${emotionSummary}. 이 데이터를 바탕으로 사용자의 감정 흐름을 분석하고 주요 감정 경향과 통찰을 알려주세요.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ analysis: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '감정 분석 오류' });
  }
});

// 상담 채팅
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
    });
    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '상담 생성 오류' });
  }
});

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
