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
    Expression: (r) => P.alt(r.Text, r.SharpExpression).many().tieWith(""),
    Text: (r) => P.alt(P.regex(/[^\$\#\n\r]+/), r.DollarExpression, r.NewLine), 
    NewLine: () => P.regexp(/[\n\r]/).map((nr) => '<br>'),
    SharpExpression: (r) => P.seq(
        P.regexp(/\#+[\s]*/),
        P.regexp(/[^\n\r]+/),
        P.newline,
        r.Text.many().tieWith(""),
    ).map(([start, title, nl, content]) => `<h3>${title}</h3>\n<p>${content}</p>\n`),
    DollarExpression: () => P.seq(
        P.string('$['),
        P.regexp(/[^\]]*/), // `]` 以外の任意の文字列
        P.string(']'),
    ).map(([start, content, end]) => `\\(${content}\\)`),
    });

// 文字列中の全ての`$[...]`を`\(...\)`に変換する関数
function transform(input: string): string {
    const result = parser.Expression.parse(input);
    if (result.status) {
        console.log(result);
        return result.value;
    } else {
        throw new Error(`Parsing failed: ${result.expected} | ${result.index.offset}`);
    }
}

loadFile().then((source) => { 

    // 例
    const inputString = 'This is a $[test] string with $[multiple] $[dollar expressions].';
    const transformedString = transform(source);
    console.log(transformedString);



    let data = `
<head>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
p {
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


