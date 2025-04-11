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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });

  res.json({ feedback: completion.choices[0].message.content.trim() });
});

// 음악 추천
app.post('/api/music', async (req, res) => {
  const { emotion } = req.body;
  const prompt = `기분이 ${emotion}일 때 듣기 좋은 한국 노래 1곡을 추천하고, 유튜브 링크도 함께 제공해주세요.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });

  res.json({ music: completion.choices[0].message.content.trim() });
});

// 감정 통계 분석
app.post('/api/analysis', async (req, res) => {
  const { emotionCounts } = req.body;
  const stats = Object.entries(emotionCounts)
    .map(([k, v]) => `${k}: ${v}회`).join(', ');
  const prompt = `사용자의 감정 일기 분석 결과는 다음과 같습니다: ${stats}. 이를 바탕으로 감정 흐름에 대한 간단한 통찰과 조언을 제공해주세요.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });

  res.json({ analysis: completion.choices[0].message.content.trim() });
});

// AI 채팅 기능 업그레이드
app.post('/api/chat', async (req, res) => {
  const { message, diary } = req.body;

  const introPrompt = `너는 감정 상담사야. 사용자의 감정은 "${diary?.emotion}"이고, 다음은 사용자의 일기 내용이야:\n"${diary?.content}"\n이 내용을 참고해서 따뜻하게 공감하며 상담을 시작해줘.`;

  // 대화가 시작될 때 초기 메시지 없이도 상담 시작
  const messages = [];

  if (!message) {
    // 사용자가 채팅을 시작하지 않은 경우: GPT가 먼저 말 걸기
    messages.push(
      { role: 'system', content: '너는 감정 상담사로서 친절하고 공감 능력이 뛰어난 대화를 제공해야 해.' },
      { role: 'user', content: introPrompt }
    );
  } else {
    // 사용자가 보낸 메시지와 함께 대화
    messages.push(
      { role: 'system', content: '너는 감정 상담사로서 친절하고 공감 능력이 뛰어난 대화를 제공해야 해.' },
      { role: 'user', content: introPrompt },
      { role: 'user', content: message }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('❌ Chat API 오류:', error?.response?.data || error.message);
    res.status(500).json({ reply: 'AI와의 대화 중 오류가 발생했습니다. 다시 시도해주세요.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ 서버가 포트 ${PORT}에서 실행 중! http://localhost:${PORT}`));
