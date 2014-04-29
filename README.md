### Grunt GUI task manager / runner

Gruntのタスク設定とかをGUIからやる。

### ビルド方法

* "build"ディレクトリを作成する（OS毎にデプロイ方法が微妙に違うので一旦ignoreにしている）
* application/ディレクトリに移動する
* Gruntfile.js.sampleをGruntfile.jsにコピーする
* npm installで依存パッケージインストール
* grunt [nw] を実行すると自動的にビルドが開始されます
* application/Gruntfile.jsにnwコマンドへのパス設定があるので、環境によって適宜書き換えること。
* あとはOS毎の吸収方法を考え中。
