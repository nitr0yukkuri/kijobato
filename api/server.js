const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../front/taitoru')));

// --- ログ出力用の関数 ---
function logInfo(message) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
}
function logError(message, error) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
}

const dbPaths = {
    // 実績用のパス
    achievements: path.join(__dirname, 'achievements.json'),
    userAchievements: path.join(__dirname, 'user_achievements.json'),
    // 単語ファイルのパス
    wordsEasy: path.join(__dirname, 'kisorironn.json'),
    wordsMedium: path.join(__dirname, 'database.json'),
    wordsHard: path.join(__dirname, 'network.json'),
};

let allWords = []; // すべての単語を格納する配列
let wordHistory = []; // ゲームごとの単語履歴

// --- 単語リストを読み込む関数 (3つのファイルを1つに結合) ---
function loadAllWords() {
    logInfo("すべての単語リストの読み込みと結合を開始します...");
    const tempWords = [];
    const wordFiles = [dbPaths.wordsEasy, dbPaths.wordsMedium, dbPaths.wordsHard];

    for (const filePath of wordFiles) {
        logInfo(`- ファイルを読み込みます: ${filePath}`);
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(fileContent);
                let words = [];

                if (data && Array.isArray(data.words)) {
                    words = data.words;
                } else if (Array.isArray(data)) {
                    words = data;
                }

                if (words.length > 0) {
                    tempWords.push(...words);
                    logInfo(`  成功: ${words.length} 個の単語を追加しました。`);
                }
            } catch (e) {
                logError(`  エラー: ${filePath} の読み込みまたは解析に失敗しました。`, e);
            }
        } else {
            logError(`  エラー: ファイルが見つかりません: ${filePath}`);
        }
    }
    
    // 重複する単語を削除して、最終的な単語リストを作成
    const uniqueWords = new Map();
    tempWords.forEach(item => {
        const normalized = normalizeWord(item.word);
        if (!uniqueWords.has(normalized)) {
            uniqueWords.set(normalized, item);
        }
    });
    allWords = Array.from(uniqueWords.values());

    logInfo(`単語の結合完了。合計 ${allWords.length} 個のユニークな単語を読み込みました。`);
}

// 単語を正規化する関数 (大文字・小文字を区別しない、空白除去)
function normalizeWord(str) {
    if (!str) return '';
    return str.trim().replace(/[\u3041-\u3096]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60)).toUpperCase();
}

// --- APIエンドポイント ---
app.get('/api/achievements', (req, res) => {
    res.json(achievementsData);
});

app.get('/api/words', (req, res) => {
    wordHistory = []; // ゲーム開始時に履歴をリセット
    if (allWords.length > 0) {
        res.json({ message: "Word list loaded and game reset." });
    } else {
        res.status(500).send(`サーバーエラー: 単語リストが空です。サーバーのログを確認してください。`);
    }
});

// ★★★ ここからが変更点 ★★★
// 使用された単語の履歴を、意味とセットで返すAPIエンドポイント
app.get('/api/word_history', (req, res) => {
    const detailedHistory = wordHistory.map(historyWord => {
        const foundWord = allWords.find(w => normalizeWord(w.word) === historyWord);
        return foundWord ? { word: foundWord.word, description: foundWord.description } : null;
    }).filter(item => item !== null);

    res.json(detailedHistory);
});
// ★★★ ここまでが変更点 ★★★

// プレイヤーのターン処理
app.post('/api/turn', (req, res) => {
    const { word, difficulty } = req.body;
    const playerWord = normalizeWord(word);
    
    const wordList = allWords; 

    const foundWord = wordList.find(w => normalizeWord(w.word) === playerWord);
    if (!foundWord) {
        return res.json({ isValid: false, message: 'その単語は存在しません！' });
    }
    if (wordHistory.includes(playerWord)) {
        return res.json({ isValid: false, message: 'その単語は既に使用されています！' });
    }

    wordHistory.push(playerWord);

    const playerTurnCount = Math.ceil(wordHistory.length / 2);
    let cpuShouldReply = false;

    logInfo(`Player turn: ${playerTurnCount}, Difficulty: ${difficulty}`);

    switch (difficulty) {
        case 'easy':
            if (playerTurnCount <= 3) {
                cpuShouldReply = true;
            } else {
                cpuShouldReply = Math.random() < 0.7;
            }
            break;
        case 'medium':
            if (playerTurnCount <= 10) {
                cpuShouldReply = true;
            } else {
                cpuShouldReply = Math.random() < 0.9;
            }
            break;
        case 'hard':
        default:
            cpuShouldReply = true;
            break;
    }

    if (!cpuShouldReply) {
        logInfo(`CPUが難易度ルールに基づき返信しませんでした。プレイヤーの勝利です。`);
        return res.json({ 
            isValid: true, 
            playerWordDescription: foundWord.description, 
            cpuTimedOut: true 
        });
    }

    const possibleCpuWords = wordList.filter(w => !wordHistory.includes(normalizeWord(w.word)));

    if (possibleCpuWords.length === 0) {
        logInfo(`CPUが返せる単語がありません。プレイヤーの勝利です。`);
        return res.json({ 
            isValid: true, 
            playerWordDescription: foundWord.description, 
            cpuTimedOut: true 
        });
    }
    
    const cpuChoice = possibleCpuWords[Math.floor(Math.random() * possibleCpuWords.length)];
    wordHistory.push(normalizeWord(cpuChoice.word));
    
    const randomDelay = Math.floor(Math.random() * 4001) + 1000;

    res.json({
        isValid: true,
        playerWordDescription: foundWord.description,
        word: cpuChoice.word,
        description: cpuChoice.description,
        cpuDelay: randomDelay
    });
});

// --- 実績機能 (変更なし) ---
const achievementsData = fs.existsSync(dbPaths.achievements) ? JSON.parse(fs.readFileSync(dbPaths.achievements, 'utf8')).achievements : [];
function getUserAchievements() { try { if (!fs.existsSync(dbPaths.userAchievements)) return {}; const data = fs.readFileSync(dbPaths.userAchievements, 'utf8'); return data ? JSON.parse(data) : {}; } catch (err) { return {}; } }
function saveUserAchievements(data) { fs.writeFileSync(dbPaths.userAchievements, JSON.stringify(data, null, 2)); }
app.post('/api/unlock_achievement', (req, res) => { const { userId, achievementId } = req.body; if (!userId || !achievementId) { return res.status(400).json({ error: 'userId and achievementId are required' }); } const userAchievements = getUserAchievements(); if (!userAchievements[userId]) { userAchievements[userId] = []; } if (!userAchievements[userId].includes(achievementId)) { userAchievements[userId].push(achievementId); saveUserAchievements(userAchievements); const unlockedAchievement = achievementsData.find(a => a.id === achievementId); res.status(200).json({ message: 'Achievement unlocked!', achievement: unlockedAchievement }); } else { res.status(200).json({ message: 'Achievement already unlocked' }); } });
app.get('/api/achievements/:userId', (req, res) => { const userId = req.params.userId; const userAchievements = getUserAchievements(); const unlockedIds = userAchievements[userId] || []; const unlockedAchievements = achievementsData.filter(a => unlockedIds.includes(a.id)); res.json(unlockedAchievements); });

// --- サーバー起動 ---
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../front/taitoru/index.html')); });
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました。`);
    loadAllWords();
});

module.exports = app;