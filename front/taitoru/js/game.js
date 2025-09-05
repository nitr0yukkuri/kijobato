window.onload = () => {
    let timeLeft = 30;
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    console.log('選択された難易度:', difficulty);

    let lastValidWord = '';
    let lastValidDescription = '';

    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : '';

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
        
        if (!playerInputWord) {
            feedbackElement.textContent = 'まだ何も入力していません！';
            return; 
        }
        
        inputElement.value = '';

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
            
            // ★★★ 変更点1: CPU思考中は入力欄を無効にする ★★★
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
                    
                    // ★★★ 変更点2: プレイヤーのターンになったら入力欄を有効に戻す ★★★
                    inputElement.disabled = false;
                    
                    // ★★★ 変更点3: すぐ入力できるようにフォーカスを当てる ★★★
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