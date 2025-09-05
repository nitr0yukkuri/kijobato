// 全てのボタンにクリックイベントを追加
const buttons = document.querySelectorAll('.btn');
const startAnimationOverlay = document.getElementById('start-animation-overlay');
const logo = document.querySelector('.game-logo');
const instructionText = document.querySelector('.instruction');
const buttonGroup = document.querySelector('.button-group');

// ★★★ 変更点1: ヘルプボタンのコンテナを取得します ★★★
const helpLinkContainer = document.querySelector('.help-link-container');

buttons.forEach(button => {
    button.addEventListener('click', () => {
    
        // 1. クリックされたボタンから難易度を取得 (例: 'easy')
        const selectedDifficulty = button.dataset.difficulty;
        
        // 2. 取得した難易度をブラウザに記憶させる
        localStorage.setItem('gameDifficulty', selectedDifficulty);

        // ロゴ以外の要素を非表示にする
        if (instructionText) instructionText.style.display = 'none';
        if (buttonGroup) buttonGroup.style.display = 'none';

        // ★★★ 変更点2: ヘルプボタンを非表示にします ★★★
        if (helpLinkContainer) helpLinkContainer.style.display = 'none';

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