// 全てのボタンにクリックイベントを追加
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const level = button.dataset.level;
        const text = button.innerText.trim();

        alert(`「${text}」が選択されました！`);
        // ここにレベル選択後の処理を記述します (例: 画面遷移など)
        // console.log(`選択レベル: ${level}`);
    });
});