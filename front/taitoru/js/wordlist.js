document.addEventListener('DOMContentLoaded', () => {
    // 「タイトルへ戻る」ボタンの処理
    const backButton = document.getElementById('back-to-title-button');

    // ボタンがクリックされたら、タイトル画面 (index.html) へ移動する
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});