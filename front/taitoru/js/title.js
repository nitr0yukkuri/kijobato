// js/title.js の内容をこれで完全に上書きしてください

document.addEventListener('DOMContentLoaded', () => {
    // --- 試合開始アニメーション関連の要素を取得 ---
    const difficultyButtons = document.querySelectorAll('.btn[data-difficulty]');
    const startAnimationOverlay = document.getElementById('start-animation-overlay');
    const logo = document.querySelector('.game-logo');
    const instructionText = document.querySelector('.instruction');
    const buttonGroup = document.querySelector('.button-group');
    const helpLinkContainer = document.querySelector('.help-link-container');
    const achievementsContainer = document.querySelector('.achievements-container');

    // --- 難易度ボタンの処理 ---
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedDifficulty = button.dataset.difficulty;
            localStorage.setItem('gameDifficulty', selectedDifficulty);

            if (instructionText) instructionText.style.display = 'none';
            if (buttonGroup) buttonGroup.style.display = 'none';
            if (helpLinkContainer) helpLinkContainer.style.display = 'none';
            if (achievementsContainer) achievementsContainer.style.display = 'none';

            if (logo) logo.classList.add('logo-top-left');
            if (startAnimationOverlay) startAnimationOverlay.classList.add('active');

            setTimeout(() => {
                if (startAnimationOverlay) startAnimationOverlay.classList.add('exit');
            }, 1500);

            setTimeout(() => {
                window.location.href = 'game.html';
            }, 2500);
        });
    });

    // --- 実績ボタンの処理 ---
    const achievementsBtn = document.getElementById('achievements-btn');
    let isAchievementsExpanded = false; // ボタンが展開されているかの状態を管理

    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', () => {
            if (isAchievementsExpanded) {
                // 状態が「展開済み」なら、実績ページへ移動
                window.location.href = 'achievements.html';
            } else {
                // 状態が「初期状態（⚙）」なら、ボタンを展開
                achievementsBtn.classList.remove('btn-round');
                achievementsBtn.classList.add('expanded');
                achievementsBtn.textContent = '実績';
                isAchievementsExpanded = true; // 状態を展開済みに更新
            }
        });
    }
});