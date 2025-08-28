// ページが読み込まれたら実行
window.onload = () => {
    let timeLeft = 30;
    const timerElement = document.querySelector('.timer');

    // 1秒ごとにタイマーを更新
    const countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown); // カウントダウンを停止
            
            // ★変更点：敗北画面 (finish-lose.html) へ移動する
            window.location.href = 'finish-lose.html';

        } else {
            timerElement.textContent = `残り${timeLeft}秒`;
            timeLeft--;
        }
    }, 1000);
};