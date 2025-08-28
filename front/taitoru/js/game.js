// ページが読み込まれたら実行
window.onload = () => {
    let timeLeft = 30;
    const timerElement = document.querySelector('.timer');

    // 1秒ごとにタイマーを更新
    const countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown); // カウントダウンを停止
            timerElement.textContent = "終了！";
        } else {
            timerElement.textContent = `残り${timeLeft}秒`;
            timeLeft--;
        }
    }, 1000);
};