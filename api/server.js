const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

// JSONファイルの読み込み
const fileNames = [
  'database.json',
  'network.json',
  'kisorironn.json',
  'algorithm.json'
];
const wordsData = fileNames
  .map(fileName => require(`./${fileName}`))
  .flat();

console.log(`合計 ${wordsData.length} 個の単語を読み込みました。`);

app.use(cors());
// ★★★ フロントエンドのファイルを提供するための設定を追加 ★★★
app.use(express.static('front'));
app.use(express.json());

let rooms = {};

io.on('connection', (socket) => {
    console.log('新しいプレイヤーが接続しました:', socket.id);

    socket.on('joinRoom', ({ roomId, playerName }) => {
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: {},
                usedWords: [],
                currentPlayer: null,
            };
            console.log(`部屋 '${roomId}' が作成されました。`);
        }

        const room = rooms[roomId];
        if (Object.keys(room.players).length < 2) {
            room.players[socket.id] = { name: playerName, id: socket.id };
            socket.join(roomId);
            console.log(`${playerName}が部屋 '${roomId}' に参加しました。`);
            
            io.to(roomId).emit('playerJoined', {
                players: Object.values(room.players),
                message: `${playerName}がゲームに参加しました。`
            });

            if (Object.keys(room.players).length === 2) {
                const playerIds = Object.keys(room.players);
                room.currentPlayer = playerIds[0];

                // ★修正点: 最初のプレイヤーIDを送信
                io.to(roomId).emit('gameStart', {
                    message: `ゲーム開始！${room.players[room.currentPlayer].name}のターンです。`,
                    starterId: room.currentPlayer
                });
            }
        } else {
            socket.emit('error', '部屋は満員です。');
        }
    });

    socket.on('submitWord', ({ roomId, word }) => {
        const room = rooms[roomId];
        if (!room || room.currentPlayer !== socket.id) {
            socket.emit('error', 'あなたのターンではありません。');
            return;
        }

        const playerInput = word.toLowerCase();
        const foundWord = wordsData.find(w =>
            w.word.toLowerCase() === playerInput ||
            (w.aliases && w.aliases.some(alias => alias.toLowerCase() === playerInput))
        );

        if (!foundWord) {
            socket.emit('invalidWord', { message: 'その言葉は存在しません！' });
            return;
        }
        if (room.usedWords.includes(foundWord.word)) {
            socket.emit('invalidWord', { message: 'その単語は既に使用されています！' });
            return;
        }
        
        room.usedWords.push(foundWord.word);

        const playerIds = Object.keys(room.players);
        const nextPlayerIndex = (playerIds.indexOf(socket.id) + 1) % playerIds.length;
        room.currentPlayer = playerIds[nextPlayerIndex];

        // ★修正点: 次のプレイヤーIDも送信
        io.to(roomId).emit('wordSubmitted', {
            player: room.players[socket.id],
            word: foundWord.word,
            description: foundWord.description,
            nextPlayer: room.players[room.currentPlayer].name,
            nextPlayerId: room.currentPlayer
        });
    });

    socket.on('disconnect', () => {
        console.log('プレイヤーが切断しました:', socket.id);
        for (const roomId in rooms) {
            if (rooms[roomId].players[socket.id]) {
                const disconnectedPlayer = rooms[roomId].players[socket.id];
                delete rooms[roomId].players[socket.id];

                io.to(roomId).emit('playerDisconnected', {
                    message: `${disconnectedPlayer.name}が切断しました。`
                });
                
                if (Object.keys(rooms[roomId].players).length === 0) {
                    delete rooms[roomId];
                    console.log(`部屋 '${roomId}' が空になったため削除されました。`);
                }
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました: http://localhost:${PORT}`);
});

module.exports = app;