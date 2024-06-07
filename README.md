# w1eX
数学などの授業のノート作成に特化したマークアップ言語です。
コードはhtmlにコンパイルされ、視覚的なノートが生成されます。

具体的な使用例は`/sample`内のファイルを参照してください。

## インストール
vscodeの拡張機能として公開しています。
https://marketplace.visualstudio.com/items?itemName=SouichiroTsujimoto.w1ex

## 使い方
拡張子`.w1ex`のファイルを編集すると、Previewが表示されます。

また、コマンドパレットで`w1eX.compile`を実行し編集したw1exファイルの名前を入力すると、htmlファイルが出力されます。

Preview画面を消してしまった場合、`w1eX.reopenView`を実行することで再表示させることができます。

## 文法

<style>
body{
line-break: anywhere;
background-color: white;
color: black;
font-size:16px;
line-height:100%;
box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
border-radius: 10px;
margin: 16px;
padding: 16px;
}
.section {
font-size:16px;
line-height:100%; 
background-color: white;
border-radius: 5px;
padding-top: 10px;
padding-left: 14px;
}
.DefBox {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
.ExpBox {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
.TheBox {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
.ProBox {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
.LemBox {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
.AxiBox {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
.CorBox {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
span.DefMarker {
background: linear-gradient(transparent 50%, #a5dee5 50% 100%);
}
span.ExpMarker {
background: linear-gradient(transparent 50%, #fff57d 50% 100%);
}
span.TheMarker {
background: linear-gradient(transparent 50%, #e2c6ff 50% 100%);
}
span.ProMarker {
background: linear-gradient(transparent 50%, #fdB86d 50% 100%);
}
span.LemMarker {
background: linear-gradient(transparent 50%, #98fb98 50% 100%);
}
span.AxiMarker {
background: linear-gradient(transparent 50%, #ff6961 50% 100%);
}
span.CorMarker {
background: linear-gradient(transparent 50%, #6688cc 50% 100%);
}
</style>

### 章
```
# 商の名前 : 1. {
    ここに文章を記述
}
```
__出力__

<b id="1.">1.  章の名前 </b><div class="section">ここに文章を記述</div><br>

### 定義、定理、命題、補題、公理、系
```
!def {
    数式は$[\LaTeX] : latex で記述できます
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
}
!cor {
    ...
}
!exp {
    ...
}{
    ...
}
```

__出力__

<div class="DefBox">
<b><span class="DefMarker">定義</span>  </b><br><br>
数式は\(\LaTeX\) で記述できます<br>
    
</div><br>
    <div class="TheBox">
<b id="1.2"><span class="TheMarker">定理</span>  1.2</b><br><br>
ラベルを利用することで、登録した\(\LaTeX\)の式を再利用できます<br>
    
</div><br>
    <div class="ProBox">
<b><span class="ProMarker">命題</span> (命題の名前) </b><br><br>
...<br>
        <div class="LemBox">
<b id="1.2.3"><span class="LemMarker">補題</span> 補題の名前 1.2.3</b><br><br>
...<br>
    
</div><br>
    
</div><br>
    <div class="AxiBox">
<b id="id >"><span class="AxiMarker">公理</span></b><br><br>
...<br>
    
</div><br>
    <div class="CorBox">
<b id="id >"><span class="CorMarker">系</span></b><br><br>
...<br>
</div><br>

### 例題
後半の{ }内は解答
```
!exp {
    ...
} {
    ...
}
```
__出力__

<div class="ExpBox">
<b><span class="ExpMarker">例題</span>  </b><br><br>
...<br>
    
<br><details><summary>解答</summary>
...<br>
    
</details></div><br>


### アンカー
指定したidの場所にジャンプ(例 !def _ : 1.2.3 {...} に飛ぶ)
```
@1.2.3
```

__出力__
<a href=#1.2.3>1.2.3</a>

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
+ 自動ナンバリング
+ エラー部分とそれ以外の切り離し
+ エスケープ文字
