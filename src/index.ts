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
    Expression: (r) => P.alt(r.DollarExpression, r.SharpExpression, r.Text).many().tieWith(""),
    Text: () => P.regex(/[^$\#]+/), // `$`以外の任意の文字列
    // Text: () => P.any.many().tie(),
    SharpExpression: () => P.seq(
        P.regexp(/\#+/),
        P.regexp(/[^\n]/)
    ).map(([start, content]) => `\\(${content}\\)`),
    DollarExpression: () => P.seq(
        P.string('$['),
        P.regexp(/[^\]]*/), // `]` 以外の任意の文字列
        P.string(']')
    ).map(([start, content, end]) => `\\(${content}\\)`)
    });

// 文字列中の全ての`$[...]`を`\(...\)`に変換する関数
function transform(input: string): string {
    const result = parser.Expression.parse(input);
    if (result.status) {
        console.log(result);
        return result.value;
    } else {
        throw new Error(`Parsing failed: ${result.expected}, ${result.index.offset}`);
    }
}

loadFile().then((source) => { 

    // 例
    const inputString = 'This is a $[test] string with $[multiple] $[dollar expressions].';
    const transformedString = transform(source);
    console.log(transformedString);



    let data = 
    `
    <head>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    </head>
    <body>
        <p>${transformedString}</p>
    </body>
    `;

    saveFile(data);

});


