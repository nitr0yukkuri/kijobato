// ページが読み込まれたら実行
window.onload = () => {
    const retryButton = document.getElementById('retry-button');
    const resultContainer = document.querySelector('.result-container');

    if (resultContainer) {
        setTimeout(() => {
            resultContainer.classList.add('show');
        }, 100); 
    }

    if (retryButton) {
        retryButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // ★★★★★ ここからが唯一の追加点です ★★★★★
    const wordListButton = document.getElementById('word-list-button');
    if (wordListButton) {
        wordListButton.addEventListener('click', () => {
            window.location.href = 'word-list.html';
        });
    }
    // ★★★★★ 追加点はここまでです ★★★★★
};