const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai"); // ✅ v4 방식
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ OpenAI 객체 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ AI 피드백
app.post("/api/feedback", async (req, res) => {
  const { content, emotion } = req.body;

  const prompt = `
감정 상태: ${emotion}
일기 내용:
${content}

위의 내용을 바탕으로 사용자에게 따뜻하고 공감가는 피드백을 한 문단으로 작성해주세요.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ feedback: completion.choices[0].message.content });
  } catch (err) {
    console.error("피드백 오류:", err);
    res.status(500).json({ error: "AI 피드백 실패" });
  }
});

// ✅ 음악 추천
app.post("/api/music", async (req, res) => {
  const { emotion } = req.body;

  const prompt = `
현재 기분은 ${emotion}입니다. 기분에 어울리는 힐링 음악을 한 곡만 추천해주세요.
곡 제목, 아티스트, YouTube 링크를 포함해 자연스럽게 말해주세요.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ music: completion.choices[0].message.content });
  } catch (err) {
    console.error("음악 추천 오류:", err);
    res.status(500).json({ error: "음악 추천 실패" });
  }
});

// ✅ 감정 트렌드 분석
app.post("/api/analysis", async (req, res) => {
  const { emotionCounts } = req.body;

  const prompt = `
아래는 감정별 작성 횟수입니다:
${Object.entries(emotionCounts).map(([k, v]) => `${k}: ${v}회`).join("\n")}

이 통계를 바탕으로 최근 사용자의 감정 흐름을 분석해서 한 문단의 해석을 제공해주세요. 당신은 친절한 상담가입니다. 말투는 따뜻하고 친근한 말투로 해주세요.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ analysis: completion.choices[0].message.content });
  } catch (err) {
    console.error("감정 분석 오류:", err);
    res.status(500).json({ error: "감정 분석 실패" });
  }
});

// ✅ 서버 시작
app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
