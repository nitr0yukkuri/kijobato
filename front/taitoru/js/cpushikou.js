// (例：cpu.js の中で)

// HTMLから思考中オーバーレイを取得
const thinkingOverlay = document.getElementById('thinking-overlay');

// 思考中画面を表示したい時
thinkingOverlay.classList.remove('hidden');

// 思考中画面を非表示にしたい時 (バックエンドからの指示があった時)
thinkingOverlay.classList.add('hidden');