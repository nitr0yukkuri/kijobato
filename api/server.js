const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Vercel環境とローカル環境でファイルのパスを正しく解決するための関数
const resolvePath = (file) => {
    if (process.env.VERCEL) {
        return path.resolve(process.cwd(), 'api', file);
    }
    return path.join(__dirname, file);
};

// --- ログ出力用の関数 ---
function logInfo(message) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
}
function logError(message, error) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
}

// dbPathsの定義を新しいパス解決関数を使うように変更
const dbPaths = {
    achievements: resolvePath('achievements.json'),
    userAchievements: resolvePath('user_achievements.json'),
    wordsEasy: resolvePath('kisorironn.json'),
    wordsMedium: resolvePath('database.json'),
    wordsHard: resolvePath('network.json'),
    wordsAlgorithm: resolvePath('algorithm.json'),
};

let allWords = [];
let wordHistory = [];

function loadAllWords() {
    logInfo("すべての単語リストの読み込みと結合を開始します...");
    const tempWords = [];
    const wordFiles = [dbPaths.wordsEasy, dbPaths.wordsMedium, dbPaths.wordsHard,dbPaths.wordsAlgorithm];

    for (const filePath of wordFiles) {
        logInfo(`- ファイルを読み込みます: ${filePath}`);
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(fileContent);
                let words = (data && Array.isArray(data.words)) ? data.words : (Array.isArray(data) ? data : []);
                if (words.length > 0) {
                    tempWords.push(...words);
                    logInfo(`  成功: ${words.length} 個の単語を追加しました。`);
                }
            } catch (e) {
                logError(`  エラー: ${filePath} の読み込みまたは解析に失敗しました。`, e);
            }
        } else {
            logError(`  エラー: ファイルが見つかりません: ${filePath}`);
        }
    }
    
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

function normalizeWord(str) {
    if (!str) return '';
    return str.trim().replace(/[\u3041-\u3096]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60)).toUpperCase();
}

// --- APIエンドポイント ---
app.get('/api/words', (req, res) => {
    wordHistory = [];
    if (allWords.length > 0) {
        res.json({ message: "Word list loaded and game reset." });
    } else {
        res.status(500).send(`サーバーエラー: 単語リストが空です。サーバーのログを確認してください。`);
    }
});

app.get('/api/word_history', (req, res) => {
    const detailedHistory = wordHistory.map(historyWord => {
        const foundWord = allWords.find(w => normalizeWord(w.word) === historyWord);
        return foundWord ? { word: foundWord.word, description: foundWord.description } : null;
    }).filter(item => item !== null);

    res.json(detailedHistory);
});

app.post('/api/turn', (req, res) => {
    const { word, difficulty } = req.body;
    const playerWord = normalizeWord(word);
    
    const wordList = allWords; 

    // ★★★ 変更箇所 1: `word` と `aliases` の両方を検索するように修正 ★★★
    const foundWord = wordList.find(w => 
        normalizeWord(w.word) === playerWord || 
        (w.aliases && Array.isArray(w.aliases) && w.aliases.some(alias => normalizeWord(alias) === playerWord))
    );
    
    if (!foundWord) return res.json({ isValid: false, message: 'その単語は存在しません！' });

    // ★★★ 変更箇所 2: 履歴のチェックと追加は、見つかった単語の正規名(`foundWord.word`)で行う ★★★
    const normalizedFoundWord = normalizeWord(foundWord.word);
    if (wordHistory.includes(normalizedFoundWord)) return res.json({ isValid: false, message: 'その単語は既に使用されています！' });

    wordHistory.push(normalizedFoundWord);
    
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
    
    const possibleCpuWords = allWords.filter(w => !wordHistory.includes(normalizeWord(w.word)));

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

// --- 実績機能 ---
const achievementsData = fs.existsSync(dbPaths.achievements) ? JSON.parse(fs.readFileSync(dbPaths.achievements, 'utf8')).achievements : [];
function getUserAchievements() { try { return fs.existsSync(dbPaths.userAchievements) ? JSON.parse(fs.readFileSync(dbPaths.userAchievements, 'utf8')) : {}; } catch (err) { return {}; } }

function saveUserAchievements(data) {
    if (!process.env.VERCEL) {
        fs.writeFileSync(dbPaths.userAchievements, JSON.stringify(data, null, 2));
    } else {
        console.log("Vercel環境のため、実績ファイルの書き込みをスキップしました。");
    }
}

app.post('/api/unlock_achievement', (req, res) => { const { userId, achievementId } = req.body; if (!userId || !achievementId) { return res.status(400).json({ error: 'userId and achievementId are required' }); } const userAchievements = getUserAchievements(); if (!userAchievements[userId]) { userAchievements[userId] = []; } if (!userAchievements[userId].includes(achievementId)) { userAchievements[userId].push(achievementId); saveUserAchievements(userAchievements); const unlockedAchievement = achievementsData.find(a => a.id === achievementId); res.status(200).json({ message: 'Achievement unlocked!', achievement: unlockedAchievement }); } else { res.status(200).json({ message: 'Achievement already unlocked' }); } });
app.get('/api/achievements/:userId', (req, res) => { const userId = req.params.userId; const userAchievements = getUserAchievements(); const unlockedIds = userAchievements[userId] || []; const unlockedAchievements = achievementsData.filter(a => unlockedIds.includes(a.id)); res.json(unlockedAchievements); });

// --- サーバー起動 ---
if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, '../front/taitoru')));
    app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../front/taitoru/index.html')); });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`サーバーがポート ${PORT} で起動しました。`);
        loadAllWords();
    });
} else {
    loadAllWords();
}

module.exports = app;