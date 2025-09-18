window.onload = () => {
    let timeLeft = 30;
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    let roomId = 'room1'; // 仮の部屋ID

    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : '';
    
    // Socket.ioを読み込み、サーバーに接続
    const socket = io(API_BASE_URL);

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

    // 接続時にサーバーに部屋への参加を通知
    socket.on('connect', () => {
        // プレイヤー名をユーザーに尋ねる
        const playerName = prompt("あなたの名前を入力してください:");
        if (playerName) {
            socket.emit('joinRoom', { roomId, playerName });
        }
    });
    
    // 部屋に参加したときのサーバーからの通知
    socket.on('playerJoined', (data) => {
        console.log(data.message);
        if (data.players.length === 2) {
            thinkingOverlay.classList.remove('hidden');
            setTimeout(() => {
                thinkingOverlay.classList.add('hidden');
                feedbackElement.textContent = '対戦相手が見つかりました！';
            }, 2000);
        } else {
            feedbackElement.textContent = '対戦相手を待っています...';
        }
    });
    
    // ゲームが開始したときのサーバーからの通知
    socket.on('gameStart', (data) => {
        console.log(data.message);
        feedbackElement.textContent = data.message;
        
        // 最初のターンは入力可能にする
        inputElement.disabled = false;
        inputElement.focus();
        
        // 最初のタイマーを開始
        startTimer();
    });
    
    // ターンが回ってきたときのサーバーからの通知
    socket.on('wordSubmitted', (data) => {
        console.log('相手が単語を入力:', data);
        
        // 相手の単語を表示
        cpuTurnDisplay.textContent = `対戦相手が「${data.word}」という単語を入力しました`;
        cpuTurnDisplay.classList.remove('hidden');
        
        cpuWordDisplay.textContent = data.word;
        cpuAnswerDisplay.textContent = data.description;
        cpuDisplay.classList.remove('hidden');
        
        // 自分のターンになったら入力を有効に
        if (data.nextPlayer === socket.id) {
            inputElement.disabled = false;
            inputElement.focus();
            feedbackElement.textContent = `あなたのターンです。`;
            resetTimer();
        } else {
            inputElement.disabled = true;
            feedbackElement.textContent = `相手のターンです。`;
        }
    });

    // プレイヤーが切断したときの通知
    socket.on('playerDisconnected', (data) => {
        alert(data.message + ' ゲームを終了します。');
        window.location.href = 'index.html'; // トップページに戻る
    });

    // 無効な単語を入力したときの通知
    socket.on('invalidWord', (data) => {
        feedbackElement.textContent = data.message;
    });

    // サーバーエラーの通知
    socket.on('error', (message) => {
        alert('エラーが発生しました: ' + message);
    });

    inputElement.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const playerInputWord = inputElement.value;
        inputElement.value = '';
        
        if (!playerInputWord) {
            feedbackElement.textContent = 'まだ何も入力していません！';
            return; 
        }

        // サーバーに単語を送信
        socket.emit('submitWord', { roomId, word: playerInputWord });
        
        // 自分のターンが終了したことを示すUI
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