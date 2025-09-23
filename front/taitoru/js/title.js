// js/title.js の内容をこれで完全に上書きしてください

document.addEventListener('DOMContentLoaded', () => {
    // --- 必要なHTML要素をすべて取得 ---
    const difficultyButtons = document.querySelectorAll('.btn[data-difficulty]');
    const startAnimationOverlay = document.getElementById('start-animation-overlay');
    const logo = document.querySelector('.game-logo');
    const instructionText = document.querySelector('.instruction');
    const buttonGroup = document.querySelector('.button-group');
    const topRightContainer = document.querySelector('.top-right-container');
    
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const gotoAchievementsBtn = document.getElementById('goto-achievements-btn');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const gotoHelpBtn = document.getElementById('goto-help-btn');
    const returnToTitleBtn = document.getElementById('return-to-title-btn');
    
    // --- 効果音関連の処理 ---
    const clickSound = new Audio('./sounds/button-click.mp3');
    let isSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';

    const updateSoundIcon = () => {
        if (soundToggleBtn) {
            soundToggleBtn.textContent = isSoundEnabled ? 'サウンド ON 🔊' : 'サウンド OFF 🔇';
        }
    };

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            localStorage.setItem('soundEnabled', isSoundEnabled);
            updateSoundIcon();
            if (isSoundEnabled) clickSound.play();
        });
    }
    updateSoundIcon();

    // --- メイン設定ボタン（⚙️）の処理 ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (event) => {
            if (isSoundEnabled) clickSound.play();
            settingsMenu.classList.toggle('hidden');
            event.stopPropagation();
        });
    }

    // --- メニュー項目の処理 ---
    if (gotoAchievementsBtn) {
        gotoAchievementsBtn.addEventListener('click', () => {
            if (isSoundEnabled) clickSound.play();
            window.location.href = 'achievements.html';
        });
    }
    if (gotoHelpBtn) {
        gotoHelpBtn.addEventListener('click', () => {
            if (isSoundEnabled) clickSound.play();
            window.location.href = 'help.html';
        });
    }
    if (returnToTitleBtn) {
        returnToTitleBtn.addEventListener('click', () => {
            if (isSoundEnabled) clickSound.play();
            window.location.href = 'index.html';
        });
    }

    // --- 難易度選択ボタンの処理 ---
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isSoundEnabled) clickSound.play();
            
            localStorage.setItem('gameDifficulty', button.dataset.difficulty);
            
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
            // ★ 修正点: アニメーションの邪魔にならないよう、不要な要素を非表示にします
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
            if (logo) logo.style.display = 'none';
            if (instructionText) instructionText.style.display = 'none';
            if (buttonGroup) buttonGroup.style.display = 'none';
            if (topRightContainer) topRightContainer.style.display = 'none';
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

            if (startAnimationOverlay) {
                startAnimationOverlay.classList.add('active');
                setTimeout(() => {
                    startAnimationOverlay.classList.add('exit');
                }, 1500);
            }

            setTimeout(() => {
                window.location.href = 'game.html';
            }, 2500);
        });
    });

    // --- メニューの外側をクリックしたらメニューを閉じる処理 ---
    document.addEventListener('click', (event) => {
        if (settingsMenu && !settingsMenu.classList.contains('hidden')) {
            if (!event.target.closest('.settings-container')) {
                settingsMenu.classList.add('hidden');
            }
        }
    });
});