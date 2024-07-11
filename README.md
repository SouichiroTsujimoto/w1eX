# w1eX
数学などの授業のノート作成に特化したマークアップ言語です。
コードはhtmlにコンパイルされ、視覚的なノートが生成されます。

具体的な使用例は`/sample`内のファイルを参照してください。

<img width="1449" alt="スクリーンショット 2024-06-07 22 47 20" src="https://github.com/SouichiroTsujimoto/w1eX/assets/40849683/a87409bc-441a-41ff-93df-4efbd1dbdfe7">

自分はw1eX(ワイエックス)って呼んでます。好きに呼んでください。

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
    ここに_文章_を記述
    この文章は_下線_、*太字*、/イタリック体/を含みます
    _これらを/*重ねて*使うこと/_もできます
}
```

### 定義、定理、命題、補題、公理、系、例題
```
!def {
    ここに定義を書く
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
        ここに書いた内容は折りたたまれます
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


### アンカー
指定したidの場所にジャンプ(例 !def _ : 1.2.3 {...} に飛ぶ)
```
@1.2.3
```

### 数式
LaTeXの記法で表現(MathJax)
または角括弧内に四則演算をそのまま記入
```
$[\LaTeX]
$[\frac{1}{\LaTeX}] : label

$( label )

[(1/2+3) * (4+2)/3*4*a]
```



## TODO
- 起動時にPreviewが表示されない様に変更する ✅
- Boxを自分で定義できる様にする
- PDF出力の実装
- Meta情報の付与
- LSPを用意して.w1exファイルの色付け
- 自動ナンバリング (意外と大変そう)
- エラー部分とそれ以外の切り離し
- エスケープ文字 ✅
- ->で矢印
- 斜体、下線 ✅
- 一括コンパイル
- 目次　自動生成
- 数式　累乗対応
- 数式　比較演算子対応
- 数式　行列に対応
- latex　ギリシャ文字なども含めて特殊文字に
- 数式　例 [Sigma [k=1] n [a_k]]
    - 表記はsympyなどを参考にしっかり考える
    - 本文は表記、数式部は意味
    - f(x) ... [f(x)] ... 
    - 単位行列 ... [[1,0],[0,1]]
    - Σとかインテグラルとかみたいな、特殊表記が必要なのは後で考える
        - これはこれで別のパーサが必要な気がする
- latex 改行に対応
- 構文エラー
- ページジャンプhref クオートで囲わないといけない
- エスケープ文字　バグ修正


