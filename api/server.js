const express = require('express');
const cors = require('cors');
const http = require('http'); // HTTPサーバーをインポート
const { Server } = require("socket.io"); // Socket.ioをインポート

const app = express();
const server = http.createServer(app); // HTTPサーバーを作成
const io = new Server(server, {
  cors: {
    origin: "*", // すべてのオリジンからの接続を許可
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

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
app.use(express.json());

// ★★★ ここからがSocket.ioを使った対戦ロジックです ★★★
let rooms = {}; // 部屋の状態を管理するオブジェクト

io.on('connection', (socket) => {
    console.log('新しいプレイヤーが接続しました:', socket.id);

    // プレイヤーが部屋を作成または参加する
    socket.on('joinRoom', ({ roomId, playerName }) => {
        if (!rooms[roomId]) {
            // 部屋が存在しない場合は作成
            rooms[roomId] = {
                players: {},
                usedWords: [],
                currentPlayer: null,
            };
            console.log(`部屋 '${roomId}' が作成されました。`);
        }

        const room = rooms[roomId];
        if (Object.keys(room.players).length < 2) {
            // プレイヤーを部屋に追加
            room.players[socket.id] = { name: playerName, id: socket.id };
            socket.join(roomId);
            console.log(`${playerName}が部屋 '${roomId}' に参加しました。`);
            
            // 部屋の全員に通知
            io.to(roomId).emit('playerJoined', {
                players: Object.values(room.players),
                message: `${playerName}がゲームに参加しました。`
            });

            // 2人揃ったらゲーム開始
            if (Object.keys(room.players).length === 2) {
                const playerIds = Object.keys(room.players);
                room.currentPlayer = playerIds[0]; // 最初のプレイヤーを決定

                io.to(roomId).emit('gameStart', {
                    message: `ゲーム開始！${room.players[room.currentPlayer].name}のターンです。`
                });
            }
        } else {
            socket.emit('error', '部屋は満員です。');
        }
    });

    // プレイヤーが単語を入力した
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

        // 次のプレイヤーにターンを渡す
        const playerIds = Object.keys(room.players);
        const nextPlayerIndex = (playerIds.indexOf(socket.id) + 1) % playerIds.length;
        room.currentPlayer = playerIds[nextPlayerIndex];

        // 部屋の全員に単語と次のプレイヤーを通知
        io.to(roomId).emit('wordSubmitted', {
            player: room.players[socket.id],
            word: foundWord.word,
            description: foundWord.description,
            nextPlayer: room.players[room.currentPlayer].name
        });
    });

    socket.on('disconnect', () => {
        console.log('プレイヤーが切断しました:', socket.id);
        // 切断したプレイヤーがいた部屋を特定し、相手に通知
        for (const roomId in rooms) {
            if (rooms[roomId].players[socket.id]) {
                const disconnectedPlayer = rooms[roomId].players[socket.id];
                delete rooms[roomId].players[socket.id];

                io.to(roomId).emit('playerDisconnected', {
                    message: `${disconnectedPlayer.name}が切断しました。`
                });
                
                // 部屋が空になったら削除
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