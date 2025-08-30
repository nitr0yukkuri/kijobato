window.onload = () => {
    let timeLeft = 30;
    const difficulty = 'easy'; // テスト用に 'easy' に設定中

    const timerElement = document.querySelector('.timer');
    const inputElement = document.querySelector('.input-area input');
    const feedbackElement = document.getElementById('feedback-message');
    const playerResultDisplay = document.getElementById('result-display');
    const userInputDisplay = document.getElementById('user-input-display');
    const answerDisplay = document.getElementById('answer-display');
    const cpuDisplay = document.getElementById('cpu-display');
    const cpuWordDisplay = document.getElementById('cpu-word-display');
    const cpuAnswerDisplay = document.getElementById('cpu-answer-display');

    function updateCpuDisplay(wordData) {
        cpuWordDisplay.textContent = wordData.word;
        cpuAnswerDisplay.textContent = wordData.description;
        cpuDisplay.classList.remove('hidden');
    }

    fetch('http://localhost:3000/api/start')
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

        fetch('http://localhost:3000/api/turn', {
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
                // CPUが単語を返せなかった場合
                // alert(data.message); // ← この行を削除しました
                
                // 5秒後に勝利画面へ遷移
                setTimeout(() => {
                    window.location.href = 'finish-win.html';
                }, 5000);
            } else if (data.gameOver) {
                // 全ての単語を使い切った場合
                alert(data.message);
                window.location.href = 'finish-win.html';
            } else {
                // CPUが正常に単語を返した場合
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

