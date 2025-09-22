document.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.querySelector('.result-container');

    if (resultContainer) {
        setTimeout(() => {
            resultContainer.classList.add('show');
        }, 100);
    }
    
    const retryButton = document.getElementById('retry-button');
    const wordListButton = document.getElementById('word-list-button');
    const notificationArea = document.getElementById('achievement-notification');
    const userId = localStorage.getItem('kijobatoUserId');
    
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            window.location.href = '/'; // トップページに戻る
        });
    }

    // ★★★ ここからが変更点 ★★★
    if (wordListButton) {
        wordListButton.addEventListener('click', () => {
            // word-list.html にページを移動させる
            window.location.href = 'word-list.html';
        });
    }
    // ★★★ ここまでが変更点 ★★★

    // 実績解除の処理
    if (!userId || !notificationArea) {
        console.error("実績機能に必要な要素が見つかりません。");
        return;
    }

    let winCount = parseInt(localStorage.getItem('kijobatoWinCount') || '0');
    winCount++;
    localStorage.setItem('kijobatoWinCount', winCount);

    const unlockAchievement = (achId) => {
        fetch('/api/unlock_achievement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, achievementId: achId })
        })
        .then(res => res.ok ? res.json() : Promise.reject('API Error'))
        .then(data => {
            if (data.achievement) {
                const achievementElement = document.createElement('div');
                achievementElement.className = 'achievement-unlocked';
           
                notificationArea.appendChild(achievementElement);
            }
        })
        .catch(err => console.error('実績解除に失敗しました:', err));
    };

    unlockAchievement(2); // 初勝利
    if (winCount >= 3) unlockAchievement(3); // 常連さん
    if (winCount >= 5) unlockAchievement(4); // もう負けない
});