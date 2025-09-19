document.addEventListener('DOMContentLoaded', () => {
    const wordListElement = document.getElementById('word-list');
    const backButton = document.getElementById('back-to-title-button');

    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? '' 
        : '';

    // ★★★ ここからが変更点 ★★★
    fetch(`${API_BASE_URL}/api/word_history`)
    // ★★★ ここまでが変更点 ★★★
        .then(response => response.json())
        .then(usedWords => {
            if (!usedWords || usedWords.length === 0) {
                const li = document.createElement('li');
                li.textContent = '今回使った単語はありませんでした。';
                wordListElement.appendChild(li);
                return;
            }

            usedWords.forEach(wordObject => {
                const li = document.createElement('li');

                li.style.textAlign = 'left';
                li.style.marginBottom = '20px';
                
                li.style.borderBottom = 'none';

                li.innerHTML = `<strong style="font-size: 1.1em;">${wordObject.word}</strong><br><span style="font-size: 0.8em; opacity: 0.8;">${wordObject.description}</span>`;
                
                wordListElement.appendChild(li);
            });
        })
        .catch(error => {
            console.error('単語リストの取得に失敗しました:', error);
            const li = document.createElement('li');
            li.textContent = 'リストの読み込みに失敗しました。';
            wordListElement.appendChild(li);
        });

    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});