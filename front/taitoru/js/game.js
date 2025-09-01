window.onload = () => {
    let timeLeft = 30;

    // 1. タイトル画面で記憶した難易度をブラウザから読み込む
    //    もし記憶されていなければ、'medium' をデフォルト値として使う
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    
    // (デバッグ用) 実際に選択された難易度をコンソールに表示して確認
    console.log('選択された難易度:', difficulty);

    // ★★★ ここからがVercel対応のための最小限の変更 ★★★
    // 現在のURLを見て、ローカル環境かVercel環境かを自動で判断し、APIの接続先を決定します。
    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000' // PCでテストする場合
        : '';                     // Vercelで公開する場合
    // ★★★ 変更はここまで ★★★

    const timerElement = document.querySelector('.timer');
    const inputElement = document.querySelector('.input-area input');
    const feedbackElement = document.getElementById('feedback-message');
    const playerResultDisplay = document.getElementById('result-display');
    const userInputDisplay = document.getElementById('user-input-display');
    const answerDisplay = document.getElementById('answer-display');
    const cpuDisplay = document.getElementById('cpu-display');
    const cpuWordDisplay = document.getElementById('cpu-word-display');
    const cpuAnswerDisplay = document.getElementById('cpu-answer-display');
    // CPUの入力UIを取得
    const cpuTurnDisplay = document.getElementById('cpu-turn-display');

    function updateCpuDisplay(wordData) {
        cpuWordDisplay.textContent = wordData.word;
        cpuAnswerDisplay.textContent = wordData.description;
        cpuDisplay.classList.remove('hidden');
        if (wordData.word) {
            cpuTurnDisplay.textContent = `対戦相手が「${wordData.word}」という単語を入力しました`;
            cpuTurnDisplay.classList.remove('hidden');
        }
    }

    // 上で定義した変数 `API_BASE_URL` を使って接続先を切り替えます
    fetch(`${API_BASE_URL}/api/start`)
      .then(response => response.json())
      .then(updateCpuDisplay)
      .catch(error => {
          console.error('サーバー接続エラー:', error);
          alert('サーバーに接続できません。バックエンドが起動しているか確認してください。');
      });

    inputElement.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const playerInputWord = inputElement.value;
        feedbackElement.textContent = '';
        if (!playerInputWord) return;
        
        userInputDisplay.textContent = playerInputWord;
        playerResultDisplay.classList.remove('hidden');
        answerDisplay.textContent = '判定中...';
        inputElement.value = '';

        // 上で定義した変数 `API_BASE_URL` を使って接続先を切り替えます
        fetch(`${API_BASE_URL}/api/turn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: playerInputWord, difficulty: difficulty }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('サーバーからの返答:', data);
            
            if (data.isValid === false) {
                feedbackElement.textContent = data.message;
                answerDisplay.textContent = '---';
                return;
            }
            
            answerDisplay.textContent = data.playerWordDescription;
            timeLeft = 30;
            timerElement.textContent = `残り${timeLeft}秒`;

            if (data.cpuTimedOut) {
                // 5秒待ってからメッセージ表示などの処理を行う
                setTimeout(() => {
                    clearInterval(countdown); // タイマーを停止

                    const cpuStuckOverlay = document.getElementById('cpu-stuck-overlay');
                    const cpuStuckButton = document.getElementById('cpu-stuck-button');

                    if (cpuStuckOverlay && cpuStuckButton) {
                        // メッセージ画面を表示
                        cpuStuckOverlay.classList.remove('hidden');
                        
                        // 「了解」ボタンがクリックされたら勝利画面へ移動
                        cpuStuckButton.addEventListener('click', () => {
                            window.location.href = 'finish-win.html';
                        });
                    }
                }, 5000); // 5000ミリ秒 = 5秒
            } else if (data.gameOver) {
                alert(data.message);
                window.location.href = 'finish-win.html';
            } else {
                setTimeout(() => {
                    updateCpuDisplay(data);
                    timeLeft = 30;
                    timerElement.textContent = `残り${timeLeft}秒`;
                }, data.cpuDelay);
            }
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

