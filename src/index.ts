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
        P.regexp(/\!def\s*\(/),
        P.regexp(/[^\)]*/),
        P.regexp(/\)(\r*\n*)*/),
        P.regexp(/\{(\r*\n*)?/),
        r.Text.many().tieWith(""),
        P.string('}'),
    ).map(([def, arg, rp, lc, content, rc]) => `<b id="${arg}">定義(${arg})</b>\n<div class="box">${content}</div>`),
    SharpExpression: (r) => P.seq(
        P.regexp(/\#\s*\{\s*/),
        P.regexp(/[^\n\r]+/),
        P.newline,
        r.Note,
        P.string('}'),
    ).map(([start, title, nl, content, rb]) => `<h3>${title}</h3><div class=box>\n${content}\n</div>`),
    DollarExpression: () => P.seq(
        P.regexp(/\$\s*\[/),
        P.regexp(/[^\]]*/), // `]` 以外の任意の文字列
        P.string(']'),
    ).map(([start, content, end]) => `\\(${content}\\)`),
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
.box {
margin-left: 2em;
}
</style>
</head>
<body>
${transformedString}
</body>
`;

    saveFile(data);

});


