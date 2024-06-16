# w1eX
数学などの授業のノート作成に特化したマークアップ言語です。
コードはhtmlにコンパイルされ、視覚的なノートが生成されます。

具体的な使用例は`/sample`内のファイルを参照してください。

<img width="1449" alt="スクリーンショット 2024-06-07 22 47 20" src="https://github.com/SouichiroTsujimoto/w1eX/assets/40849683/a87409bc-441a-41ff-93df-4efbd1dbdfe7">


## インストール
vscodeの拡張機能として公開しています。
https://marketplace.visualstudio.com/items?itemName=SouichiroTsujimoto.w1ex

## 使い方
拡張子`.w1ex`のファイルを編集すると、Previewが表示されます。

コマンドパレットから以下のコマンドが呼び出せます。
+ `w1eX.compile` : 選択した`.w1ex`ファイルをhtmlにコンパイル

+ `w1eX.reopenView` : 閉じてしまったPreviewを再表示

## 文法

⚠️ __!expの文法が変更され、折りたたみboxを使用する場合はbox内で!foldを利用することになりました。具体例は`/sample`などをご覧ください__

### 章
```
# 商の名前 : 1. {
    ここに文章を記述
}
```

### 定義、定理、命題、補題、公理、系
```
!def {
    数式は、
    $[\LaTeX] : latex で記述できます
    [1 + 2 * 4 - 1 / ((3 + 2) * 5)] : 四則演算をそのまま記述できます
}
!the : 1.2 {
    ラベルを利用することで、登録した$(latex)の式を再利用できます
}
!pro (命題の名前) {
    ...
    !lem 補題の名前 : 1.2.3 {
        ...
    }
}
!axi {
    ...
    !fold {

    }
}
!cor {
    ...
}
!exp {
    ...
    !fold 解答 {

    }
}
```


### 例題
後半の{ }内は解答
```
!exp {
    ...
} {
    ...
}
```


### アンカー
指定したidの場所にジャンプ(例 !def _ : 1.2.3 {...} に飛ぶ)
```
@1.2.3
```

### 数式
LaTeXの記法で表現(MathJax)
```
$[\LaTeX]
$[\frac{1}{\LaTeX}] : label

$( label )
```



## TODO
+ 起動時にPreviewが表示されない様に変更する
+ Boxを自分で定義できる様にする
+ PDF出力の実装
+ Meta情報の付与
+ LSPを用意して.w1exファイルの色付け
+ 自動ナンバリング (意外と大変そう)
+ エラー部分とそれ以外の切り離し
+ エスケープ文字
