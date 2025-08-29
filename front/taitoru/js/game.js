// ページが読み込まれたら実行
window.onload = () => {
    let timeLeft = 30;
    const timerElement = document.querySelector('.timer');

    // 1秒ごとにタイマーを更新
    const countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown); // カウントダウンを停止
            timerElement.textContent = "終了！";
            
            // ★この行を追加！ 1秒後に結果画面へ移動します
            setTimeout(() => {
                window.location.href = 'finish-lose.html';
            }, 1000); // 1秒待ってから移動

        } else {
            timerElement.textContent = `残り${timeLeft}秒`;
            timeLeft--;
        }
    }, 1000);
};