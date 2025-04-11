const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// 👉 CORS 허용
app.use(cors());
app.use(bodyParser.json());

// 👉 OpenAI 설정
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 👉 감정 + 일기 피드백 API
app.post("/api/feedback", async (req, res) => {
  const { content, emotion } = req.body;

  const prompt = `
감정 상태: ${emotion}
일기 내용:
${content}

위의 내용을 바탕으로 친절한 AI 피드백을 한 문단으로 작성해주세요. 사용자에게 감정을 공감하고 조언하는 톤으로 작성해주세요.
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    const feedback = completion.data.choices[0].message.content;
    res.json({ feedback });
  } catch (err) {
    console.error("피드백 생성 실패:", err);
    res.status(500).json({ error: "피드백 생성 실패" });
  }
});

// 👉 감정 기반 음악 추천 API
app.post("/api/music", async (req, res) => {
  const { emotion } = req.body;

  const prompt = `
지금 사용자의 기분은 ${emotion}야. 이 감정에 어울리는 힐링이나 위로가 되는 노래를 한 곡만 추천해줘. 곡 제목, 아티스트, 그리고 YouTube 링크를 포함해줘. 사용자에게 말하듯 자연스럽게 추천해줘.
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    const music = completion.data.choices[0].message.content;
    res.json({ music });
  } catch (err) {
    console.error("음악 추천 실패:", err);
    res.status(500).json({ error: "음악 추천 실패" });
  }
});

// 👉 감정 통계 분석 API
app.post("/api/analysis", async (req, res) => {
  const { emotionCounts } = req.body;

  const prompt = `
감정 통계를 바탕으로 사용자 감정의 전반적인 경향을 해석해줘. 아래는 감정별 일기 수야.
${Object.entries(emotionCounts)
  .map(([emotion, count]) => `${emotion}: ${count}회`)
  .join("\n")}

사용자에게 따뜻하고 명확하게 설명해줘. 감정적 변화를 예측하거나 조언도 살짝 넣어줘.
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const analysis = completion.data.choices[0].message.content;
    res.json({ analysis });
  } catch (err) {
    console.error("감정 분석 실패:", err);
    res.status(500).json({ error: "감정 분석 실패" });
  }
});

// 👉 서버 시작
app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
