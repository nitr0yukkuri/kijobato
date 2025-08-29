// ページが読み込まれたら実行
window.onload = () => {
    let timeLeft = 30;

    // HTMLから操作したい要素を取得
    const timerElement = document.querySelector('.timer');
    const inputElement = document.querySelector('.input-area input');
    const feedbackElement = document.getElementById('feedback-message');
    const resultDisplay = document.getElementById('result-display');
    const userInputDisplay = document.getElementById('user-input-display');
    const answerDisplay = document.getElementById('answer-display');

    // 表示したい答えをここで設定
    const correctAnswer = "これが答えのテキストです"; 
    
    // Enterキーが押された時の処理
    inputElement.addEventListener('keydown', (event) => {
        // まず、表示されているかもしれないメッセージを消す
        feedbackElement.classList.remove('show');

        // Enterキー以外が押されたら、何もしない
        if (event.key !== 'Enter') {
            return;
        }

        // 入力欄が空かどうかで処理を分ける
        if (!inputElement.value) {
            // 入力が空の場合：メッセージを表示
            feedbackElement.textContent = 'その言葉はありません！';
            feedbackElement.classList.add('show');
        } else {
            // 入力がある場合：左側に結果を表示
            userInputDisplay.textContent = inputElement.value;
            answerDisplay.textContent = correctAnswer;

            // 結果エリアを表示状態にする
            resultDisplay.classList.remove('hidden');

            // 入力欄を空にする
            inputElement.value = '';
        }
    });

    // 1秒ごとにタイマーを更新する処理
    const countdown = setInterval(() => {
        if (timeLeft <= 0) {
            // 時間が0になったらタイマーを止めて画面遷移
            clearInterval(countdown);
            window.location.href = 'finish-lose.html';
        } else {
            // 時間を1秒減らして表示を更新
            timeLeft--;
            timerElement.textContent = `残り${timeLeft}秒`;
        }
    }, 1000);
};