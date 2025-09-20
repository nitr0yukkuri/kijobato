# なにこれ？
基本情報に関する単語を入力し敵(CPU)とお互い思いつくまで　　
単語を入力するゲームです


## 概要
本プロジェクトは、敵(CPU)（ゲームフロントエンド）を通じて、楽しみながらITの基礎知識を習得することを目的としています。データはVercelへのデプロイを前提としたNode.js (Express) サーバーによって提供されます。

## 技術スタック

* **バックエンド:** Node.js, Express
* **フロントエンド:** HTML, CSS, JavaScript (Vanilla JS)
* **データ形式:** JSON
* **デプロイ環境:** Vercel (vercel.jsonに基づく)

## 実行方法

1.  リポジトリをクローンします。
    ```sh
    git clone [リポジトリURL]
    cd kijobato
    ```
2.  必要な依存関係をインストールします。
    ```sh
    npm install
    ```
3.  ローカルサーバーを起動します。
    ```sh
    node api/server.js
    ```
4.  サーバーが `http://localhost:3001` （または `server.js` で指定されたポート）で起動します。
5.  フロントエンドの `front/taitoru/index.html` などをブラウザで開いてゲームを開始します。

## APIエンドポイント

サーバーは以下のエンドポイントでJSONデータを提供します。

* `/api/database`: データベース関連の用語リストを取得します。
* `/api/kisorironn`: 基礎理論関連の用語リストを取得します。
* `/api/network`: ネットワーク関連の用語リストを取得します。
