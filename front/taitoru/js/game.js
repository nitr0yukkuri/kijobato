window.onload = () => {
    let timeLeft = 30;
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    let roomId = 'room1';

    // ★修正点: 引数を空にして、現在のホストに接続
    const socket = io();

    // HTMLに合わせてDOM要素を取得
    const timerElement = document.querySelector('.timer');
    const inputElement = document.querySelector('.input-area input');
    const feedbackElement = document.getElementById('feedback-message');
    const resultDisplay = document.getElementById('result-display');
    const userInputDisplay = document.getElementById('user-input-display');
    const answerDisplay = document.getElementById('answer-display');
    const cpuDisplay = document.getElementById('cpu-display');
    const cpuWordDisplay = document.getElementById('cpu-word-display');
    const cpuAnswerDisplay = document.getElementById('cpu-answer-display');
    const cpuTurnDisplay = document.getElementById('cpu-turn-display');
    const thinkingOverlay = document.getElementById('thinking-overlay');

    socket.on('connect', () => {
        console.log('サーバーに接続しました:', socket.id);
        const playerName = prompt("あなたの名前を入力してください:") || '名無しの挑戦者';
        socket.emit('joinRoom', { roomId, playerName });
    });

    socket.on('playerJoined', (data) => {
        console.log(data.message);
        if (data.players.length < 2) {
            feedbackElement.textContent = '対戦相手を待っています...';
            thinkingOverlay.classList.remove('hidden');
        } else {
            thinkingOverlay.classList.add('hidden');
            feedbackElement.textContent = '対戦相手が見つかりました！';
        }
    });

    socket.on('gameStart', (data) => {
        console.log(data.message);
        feedbackElement.textContent = data.message;
        
        // ★修正点: 自分が最初のプレイヤーの場合に入力を有効にする
        if (data.starterId === socket.id) {
            inputElement.disabled = false;
            inputElement.focus();
        } else {
            feedbackElement.textContent = "相手のターンです。";
        }
        
        startTimer();
    });

    socket.on('wordSubmitted', (data) => {
        console.log('相手が単語を入力:', data);
        
        cpuWordDisplay.textContent = data.word;
        cpuAnswerDisplay.textContent = data.description;
        cpuDisplay.classList.remove('hidden');
        
        // ★修正点: 自分のターンになったら入力を有効に
        if (data.nextPlayerId === socket.id) {
            inputElement.disabled = false;
            inputElement.focus();
            feedbackElement.textContent = 'あなたのターンです。';
            resetTimer();
        } else {
            inputElement.disabled = true;
            feedbackElement.textContent = `相手のターンです。`;
        }
    });

    socket.on('playerDisconnected', (data) => {
        alert(data.message + ' ゲームを終了します。');
        window.location.href = 'index.html';
    });

    socket.on('invalidWord', (data) => {
        feedbackElement.textContent = data.message;
    });

    socket.on('error', (message) => {
        alert('エラーが発生しました: ' + message);
    });

    inputElement.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || !inputElement.value) return;
        
        const playerInputWord = inputElement.value;
        socket.emit('submitWord', { roomId, word: playerInputWord });
        
        userInputDisplay.textContent = playerInputWord;
        resultDisplay.classList.remove('hidden'); 
        answerDisplay.textContent = '（相手の回答を待っています...）';
        
        inputElement.value = '';
        inputElement.disabled = true;
        feedbackElement.textContent = '相手のターンです...';
    });

    let countdown;
    function startTimer() {
        clearInterval(countdown);
        countdown = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(countdown);
                window.location.href = 'finish-lose.html';
            } else {
                timeLeft--;
                timerElement.textContent = `残り${timeLeft}秒`;
            }
        }, 1000);
    }
    
    function resetTimer() {
        timeLeft = 30;
        timerElement.textContent = `残り${timeLeft}秒`;
        startTimer();
    }
};