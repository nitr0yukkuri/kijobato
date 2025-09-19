window.onload = () => {
    // ユーザーIDを取得または新規作成
    let userId = localStorage.getItem('kijobatoUserId');
    if (!userId) {
        userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('kijobatoUserId', userId);
    }
    
    // 実績解除関数
    const unlockAchievement = (achId) => {
        fetch('/api/unlock_achievement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, achievementId: achId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.achievement) {
                // 実績解除時に通知
                alert(`実績解除！\n${data.achievement.name}\n${data.achievement.description}`);
            }
        }).catch(err => console.error('Achievement unlock failed:', err));
    };

    // 「はじめの一歩」実績 (ID: 1) を解除
    unlockAchievement(1);

    // --- ここから元のgame.jsのコード ---
    let timeLeft = 30;
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    console.log('選択された難易度:', difficulty);

    let lastValidWord = '';
    let lastValidDescription = '';
    
    const timerElement = document.querySelector('.timer');
    const inputElement = document.querySelector('.input-area input');
    const feedbackElement = document.getElementById('feedback-message');
    const playerResultDisplay = document.getElementById('result-display');
    const userInputDisplay = document.getElementById('user-input-display');
    const answerDisplay = document.getElementById('answer-display');
    const cpuDisplay = document.getElementById('cpu-display');
    const cpuWordDisplay = document.getElementById('cpu-word-display');
    const cpuAnswerDisplay = document.getElementById('cpu-answer-display');
    const cpuTurnDisplay = document.getElementById('cpu-turn-display');
    const thinkingOverlay = document.getElementById('thinking-overlay');

    function updateCpuDisplay(wordData) {
        cpuWordDisplay.textContent = wordData.word;
        cpuAnswerDisplay.textContent = wordData.description;
        cpuDisplay.classList.remove('hidden');
        if (wordData.word) {
            cpuTurnDisplay.textContent = `対戦相手が「${wordData.word}」という単語を入力しました`;
            cpuTurnDisplay.classList.remove('hidden');
        } else {
            cpuTurnDisplay.classList.add('hidden');
        }
    }

    // APIから単語リストを読み込む
    fetch(`/api/words?category=${difficulty}`)
        .then(response => {
            if (!response.ok) throw new Error('単語リストの読み込みに失敗しました');
            return response.json();
        })
        .then(() => {
            console.log("単語リスト取得成功");
        })
        .catch(error => {
            console.error('サーバー接続エラー:', error);
            alert('サーバーに接続できません。バックエンドが起動しているか確認してください。');
        });

    inputElement.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const playerInputWord = inputElement.value;
        feedbackElement.textContent = '';
        
        if (!playerInputWord) {
            feedbackElement.textContent = 'まだ何も入力していません！';
            return; 
        }
        
        inputElement.value = '';

        fetch(`/api/turn`, { // 相対パスに変更
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: playerInputWord, difficulty: difficulty }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('サーバーからの返答:', data);
            
            if (data.isValid === false) {
                feedbackElement.textContent = data.message;
                return;
            }
            
            playerResultDisplay.classList.remove('hidden');
            userInputDisplay.textContent = playerInputWord;
            answerDisplay.textContent = data.playerWordDescription;

            lastValidWord = playerInputWord;
            lastValidDescription = data.playerWordDescription;
            
            timeLeft = 5;
            timerElement.textContent = `残り${timeLeft}秒`;
            
            thinkingOverlay.classList.remove('hidden');
            
            inputElement.disabled = true;

            const delay = data.cpuTimedOut ? 5000 : data.cpuDelay;

            setTimeout(() => {
                thinkingOverlay.classList.add('hidden');

                if (data.cpuTimedOut) {
                    clearInterval(countdown); 
                    const cpuStuckOverlay = document.getElementById('cpu-stuck-overlay');
                    const cpuStuckButton = document.getElementById('cpu-stuck-button');
                    if (cpuStuckOverlay && cpuStuckButton) {
                        cpuStuckOverlay.classList.remove('hidden');
                        cpuStuckButton.addEventListener('click', () => {
                            window.location.href = 'finish-win.html';
                        });
                    }
                } else if (data.gameOver) {
                    alert(data.message);
                    window.location.href = 'finish-win.html';
                } else {
                    updateCpuDisplay(data);
                    
                    timeLeft = 30;
                    timerElement.textContent = `残り${timeLeft}秒`;
                    
                    inputElement.disabled = false;
                    inputElement.focus();
                }
            }, delay);
        })
        .catch(error => {
            console.error('通信エラー:', error);
            alert('サーバーとの通信中にエラーが発生しました。');
        });
    });

    const countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown);
            window.location.href = 'finish-lose.html';
        } else {
            timeLeft--;
            timerElement.textContent = `残り${timeLeft}秒`;
        }
    }, 1000);
};