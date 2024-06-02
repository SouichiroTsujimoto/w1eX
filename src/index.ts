import { readFile, writeFile } from "fs/promises";
import * as P from 'parsimmon';

async function loadFile(): Promise<string> {
    let source: string = "";
    try {
        source = await readFile("./src/index.w1ex", "utf8");
        console.log(source);
    } catch (error) {
        console.error("ファイルの読み込みに失敗しました:", error);
    }
    
    return source;
}

async function saveFile(data: string): Promise<void> {
    try {
        await writeFile("./src/index.html", data, "utf8");
        console.log("ファイルが正常に書き込まれました。");
    } catch (error) {
        console.error("ファイルの書き込みに失敗しました:", error);
    }
}

let count = 0;

// パーサーの定義
const parser = P.createLanguage({
    Note: (r) => P.alt(r.SharpExpression, r.Text).many().tieWith(""),
    Text: (r) => P.alt(P.regex(/[^\$\#\n\r\!@\}\]]+/), r.AtSignExpression, r.DollarExpression, r.ExclamationExpression, r.NewLine), 
    NewLine: () => P.regexp(/[\n\r]/).map((nr) => '<br>\n'),
    AtSignExpression: () => P.seq(
        P.string('@'),
        P.regexp(/[^\s]+/),
    ).map(([at, content]) => `<a href=#${content}>${content}</a>`),
    ExclamationExpression: (r) => P.alt(r.DefBox), 
    DefBox: (r) => P.seq(
        P.regexp(/\!def\s*\:?/),
        P.regexp(/[^\{]*/),
        P.regexp(/\s*\{(\r*\n*)?/),
        r.Text.many().tieWith(""),
        P.string('}'),
    ).map(([def, id, lc, content, rc]) =>
        `<div class="box">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="marker">定義${id!="" ? " " + id.trim() : ""}</span></b><br><br>\n${content}</div>`),
    SharpExpression: (r) => P.seq(
        P.regexp(/\#\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        P.regexp(/\s*\{\s*/),
        r.Note,
        P.string('}'),
    ).map(([start, title, colon, id, lb, content, rb]) =>
        `<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}>${id.trim()!="" ? id.trim() + " " : ""} ${title}</b><div class="section">\n${content}\n</div>`),
    DollarExpression: () => P.seq(
        P.regexp(/\$\s*\[\s*/),
        P.regexp(/[^\]]*/), // `]` 以外の任意の文字列
        P.string(']'),
    ).map(([start, content, end]) => 
        `\\(${content}\\)`),
    });

// 文字列中の全ての`$[...]`を`\(...\)`に変換する関数
function transform(input: string): string {
    const result = parser.Note.parse(input);
    if (result.status) {
        console.log(result);
        return result.value;
    } else {
        throw new Error(`Parsing failed: ${result.expected} | ${result.index.offset}`);
    }
}

loadFile().then((source) => { 
    const transformedString = transform(source);
    console.log(transformedString);

    let data = `
<head>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
body{
font-family: "Hiragino Sans";
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
// box-shadow: rgba(99, 99, 99, 0.2) 0px 1px 10px 0px;
// box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
border-radius: 5px;
padding-top: 10px;
padding-left: 14px;
}
.box {
font-size:16px;
line-height:100%;
box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
// box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
margin-top: 7px;
border-radius: 5px;
padding: 14px;
}
span.marker {
    background: linear-gradient(transparent 40%, #a5dee5 40% 80%, transparent 80%);
}
</style>
</head>
<body>
${transformedString}
</body>
`;

    saveFile(data);

});


