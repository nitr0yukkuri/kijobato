// js/cpu.js

function initializeCpu() {
    // CPU側の表示要素
    const cpuDisplay = document.getElementById('cpu-display');
    const cpuWordDisplay = document.getElementById('cpu-word-display');
    const cpuAnswerDisplay = document.getElementById('cpu-answer-display');

    // CPUが知っている単語と解説のリスト
    const cpuWordList = [
        { word: "CPU", answer: "Central Processing Unitの略。中央処理装置。" },
        { word: "メモリ", answer: "コンピュータが作業データを一時的に保存する場所。" },
        { word: "ストレージ", answer: "データやプログラムを長期的に保存する場所。SSDやHDDなど。" },
        { word: "OS", answer: "Operating Systemの略。コンピュータの基本的な管理を行うソフトウェア。" }
    ];

    // CPUの行動を制御する関数
    function cpuAction() {
        const randomIndex = Math.floor(Math.random() * cpuWordList.length);
        const selectedItem = cpuWordList[randomIndex];

        cpuWordDisplay.textContent = selectedItem.word;
        cpuAnswerDisplay.textContent = selectedItem.answer;
        cpuDisplay.classList.remove('hidden');

        const randomInterval = Math.random() * 4000 + 2000;
        setTimeout(cpuAction, randomInterval);
    }

    // 最初のCPUの行動を開始
    cpuAction();
}