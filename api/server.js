const express = require('express');
const cors = require('cors');
// const fs = require('fs'); // requireを使うので不要になります
// const path = require('path'); // requireを使うので不要になります

const app = express();
const PORT = 3000;

// ★★★ ここが最重要の変更点 ★★★
// fs.readFileSync の代わりに require を使って words.json を直接読み込みます。
// この方法なら、Vercelがビルドする際に words.json を正しく含めてくれます。
const wordsData = require('./words.json');

app.use(cors());
app.use(express.json());

const difficultySettings = {
  easy: { successRate: 0.1 },
  medium: { successRate: 0.9 },
  hard: { successRate: 1.0 },
};
let usedWords = [];

app.get('/api/start', (req, res) => {
  usedWords = [];
  
  // CPUの最初の単語を返すように修正

    // 単語が一つもない場合はゲームオーバー
    res.json({ gameOver: true, message: '単語リストが空です！' });
  }
);

app.post('/api/turn', (req, res) => {
  const { word: playerWord, difficulty = 'easy' } = req.body;
  const settings = difficultySettings[difficulty];
  const foundPlayerWord = wordsData.find(w => w.word.toLowerCase() === playerWord.toLowerCase());

  if (!foundPlayerWord) {
    // ★★★ この行のメッセージを変更しました ★★★
    return res.json({ isValid: false, message: 'その言葉は存在しません' });
  }
  if (usedWords.includes(foundPlayerWord.word)) {
    return res.json({ isValid: false, message: 'その単語は既に使用されています！' });
  }
  usedWords.push(foundPlayerWord.word);

  const isSuccess = Math.random() < settings.successRate;
  if (!isSuccess) {
    return res.json({ isValid: true, playerWordDescription: foundPlayerWord.description, cpuTimedOut: true, message: 'CPUが時間内に単語を思いつけませんでした。あなたの勝ちです！' });
  }
  const availableWords = wordsData.filter(w => !usedWords.includes(w.word));
  if (availableWords.length === 0) {
    return res.json({ isValid: true, playerWordDescription: foundPlayerWord.description, gameOver: true, message: 'もう単語がありません！あなたの勝ちです！' });
  }
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const cpuWordData = availableWords[randomIndex];
  usedWords.push(cpuWordData.word);
  
  const randomThinkingTime = Math.floor(Math.random() * 3001) + 2000;

  res.json({
    isValid: true,
    playerWordDescription: foundPlayerWord.description,
    cpuDelay: randomThinkingTime,
    ...cpuWordData
  });
});

// ローカルテスト用とVercel用の両対応
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました: http://localhost:${PORT}`);
  });
}

module.exports = app;

