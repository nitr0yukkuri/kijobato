const express = require('express');
const cors = require('cors');
// fs と path は require を使うので不要になります
// const fs = require('fs');
// const path = require('path');

const app = express();
const PORT = 3000;

// ★★★ ここからが修正箇所 ★★★
// fs.readFileSync の代わりに require を使って words.json を直接読み込みます。
// この方法なら、Vercelがビルドする際に words.json を正しく含めてくれます。
const wordsData = require('./words.json');
// ★★★ 修正箇所ここまで ★★★

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
  
  res.json({ word: '', description: '' });
});

app.post('/api/turn', (req, res) => {
  const { word: playerWord, difficulty = 'easy' } = req.body;
  const settings = difficultySettings[difficulty];
  const foundPlayerWord = wordsData.find(w => w.word.toLowerCase() === playerWord.toLowerCase());

  if (!foundPlayerWord) {
    return res.json({ isValid: false, message: 'その単語はリストにありません！' });
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

// このファイルが直接実行された場合（ローカル環境）のみサーバーを起動する
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました: http://localhost:${PORT}`);
  });
}

// Vercelで使われる場合は、appをエクスポートするだけ
module.exports = app;

