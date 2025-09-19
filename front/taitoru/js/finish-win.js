document.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.querySelector('.result-container');

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ この1行を追加してアニメーションを開始 ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★
    if (resultContainer) {
        // 遅延させてアニメーションクラスを適用
        setTimeout(() => {
            resultContainer.classList.add('show');
        }, 100);
    }
    
    // --- ここから下のコードは変更ありません ---

    // ボタンや表示エリアの要素を取得
    const retryButton = document.getElementById('retry-button');
    const wordListButton = document.getElementById('word-list-button');
    const wordListContainer = document.getElementById('word-list-container');
    const wordListUl = document.getElementById('word-list');
    const notificationArea = document.getElementById('achievement-notification');
    const userId = localStorage.getItem('kijobatoUserId');
    
    // ボタンの機能
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            window.location.href = '/'; // トップページに戻る
        });
    }

    if (wordListButton && wordListContainer && wordListUl) {
        wordListButton.addEventListener('click', () => {
            fetch('/api/word_history')
                .then(response => response.json())
                .then(history => {
                    wordListUl.innerHTML = ''; 
                    if (history.length > 0) {
                        history.forEach(word => {
                            const li = document.createElement('li');
                            li.textContent = word;
                            wordListUl.appendChild(li);
                        });
                    } else {
                        const li = document.createElement('li');
                        li.textContent = '単語の履歴がありません。';
                        wordListUl.appendChild(li);
                    }
                    wordListContainer.style.display = 'block';
                    wordListButton.style.display = 'none';
                })
                .catch(err => console.error('単語履歴の取得に失敗:', err));
        });
    }

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
                achievementElement.innerHTML = `
                    <h3>✨ 実績解除！ ✨</h3>
                    <p><strong>${data.achievement.name}</strong>: ${data.achievement.description}</p>
                `;
                notificationArea.appendChild(achievementElement);
            }
        })
        .catch(err => console.error('実績解除に失敗しました:', err));
    };

    unlockAchievement(2); // 初勝利
    if (winCount >= 3) unlockAchievement(3); // 常連さん
    if (winCount >= 5) unlockAchievement(4); // もう負けない
});