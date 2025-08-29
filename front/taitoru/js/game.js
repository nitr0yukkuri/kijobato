// js/game.js

// ページが読み込まれたら実行
window.onload = () => {
    let timeLeft = 30;

    const timerElement = document.querySelector('.timer');
    const inputElement = document.querySelector('.input-area input');
    const feedbackElement = document.getElementById('feedback-message');

    // Enterキーが押された時の処理
    inputElement.addEventListener('keydown', (event) => {
        // ★変更点: まず最初に、キーが押されたらメッセージを消す
        feedbackElement.classList.remove('show');

        // Enterキーでなければ何もしない
        if (event.key !== 'Enter') {
            return;
        }

        // 入力が空の場合にメッセージを表示
        if (!inputElement.value) {
            feedbackElement.textContent = 'その言葉はありません！';
            feedbackElement.classList.add('show');
        } else {
            // 入力があれば空にする
            inputElement.value = '';
        }
    });

    // 1秒ごとにタイマーを更新
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