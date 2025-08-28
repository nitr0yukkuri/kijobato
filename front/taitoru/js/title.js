// 全てのボタンにクリックイベントを追加
const buttons = document.querySelectorAll('.btn');
const startAnimationOverlay = document.getElementById('start-animation-overlay');
const logo = document.querySelector('.game-logo');
const instructionText = document.querySelector('.instruction');
const buttonGroup = document.querySelector('.button-group');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        // ロゴ以外の要素を非表示にする
        if (instructionText) instructionText.style.display = 'none';
        if (buttonGroup) buttonGroup.style.display = 'none';

        // ロゴに新しいクラスを付けて、左上に瞬間移動させる
        if (logo) logo.classList.add('logo-top-left');

        // 「試合開始」アニメーションを開始
        if (startAnimationOverlay) startAnimationOverlay.classList.add('active');

        // 約1.5秒後に「試合開始」を画面から退場させる
        setTimeout(() => {
            if (startAnimationOverlay) {
                startAnimationOverlay.classList.add('exit');
            }
        }, 1500);

        // 約2.5秒後にゲーム画面へ移動
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 2500);
    });
});