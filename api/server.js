const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 1. 読み込むファイルの一覧を配列で定義します
const fileNames = [
  'database.json',
  'network.json',
  'kisorironn.json',
  'algorithm.json'
];


// 2. 各ファイルを読み込み、flat() を使って1つの巨大な配列に合体させます
const wordsData = fileNames
  .map(fileName => require(`./${fileName}`))
  .flat();

console.log(`合計 ${wordsData.length} 個の単語を読み込みました。`);

app.use(cors());
app.use(express.json());

const difficultySettings = {
  easy: { successRate: 0.7 },
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

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★ ここからが最小限の変更点です ★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const playerInput = playerWord.toLowerCase();

  // wordキー、またはaliases配列内のいずれかと一致するかをチェック
  const foundPlayerWord = wordsData.find(w =>
    w.word.toLowerCase() === playerInput || // 1. メインの単語をチェック
    (w.aliases && w.aliases.some(alias => alias.toLowerCase() === playerInput)) // 2. 別名リストをチェック
  );
  // ★★★ 変更点はここまでです ★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


  if (!foundPlayerWord) {
    return res.json({ isValid: false, message: 'その言葉は存在しません！' });
  }
  if (usedWords.includes(foundPlayerWord.word)) {
    return res.json({ isValid: false, message: 'その単語は既に使用されています！' });
  }
  usedWords.push(foundPlayerWord.word);
  
  let currentSuccessRate = settings.successRate;

  if (difficulty === 'medium' && usedWords.length < 20) {
    currentSuccessRate = 1.0;
  } 
  // もし難易度が'easy'で、かつ使用済み単語数が6未満の場合
  else if (difficulty === 'easy' && usedWords.length < 6) {
    // 成功率を一時的に1.0 (100%) に上書き
    currentSuccessRate = 1.0;
  }

  const isSuccess = Math.random() < currentSuccessRate;

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

// 使用済み単語のリストと解説を返すための新しいAPI
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
