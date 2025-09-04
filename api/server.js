const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Vercelで正しく動作するように、require() を使って words.json を読み込みます。
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
  
  // 構文エラーを修正し、ゲーム開始時は空のデータを返すように戻しました
  res.json({ word: '', description: '' });
});

app.post('/api/turn', (req, res) => {
  const { word: playerWord, difficulty = 'easy' } = req.body;
  const settings = difficultySettings[difficulty];
  const foundPlayerWord = wordsData.find(w => w.word.toLowerCase() === playerWord.toLowerCase());

  if (!foundPlayerWord) {
    return res.json({ isValid: false, message: 'その言葉は存在しません！' });
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

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ ここがあなたの指示による変更点です ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 使用済み単語のリストと解説を返すための新しいAPIを追加
app.get('/api/used-words', (req, res) => {
  const detailedUsedWords = usedWords.map(usedWord => {
    return wordsData.find(wordObject => wordObject.word === usedWord);
  }).filter(item => item); // 見つからなかった単語を除外

  res.json(detailedUsedWords);
});


// ローカルテスト用とVercel用の両対応
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました: http://localhost:${PORT}`);
  });
}

module.exports = app;

