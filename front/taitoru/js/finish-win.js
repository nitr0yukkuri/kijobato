// ページが読み込まれたら実行
window.onload = () => {
    const retryButton = document.getElementById('retry-button');
    const resultContainer = document.querySelector('.result-container');

    // ページロード時にフェードインアニメーションを開始
    if (resultContainer) {
        setTimeout(() => {
            resultContainer.classList.add('show');
        }, 100); 
    }

    // 「もう一度挑戦する」ボタンがクリックされたら
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            // タイトル画面 (index.html) に戻る
            window.location.href = 'index.html';
        });
    }
};
