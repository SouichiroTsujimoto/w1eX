import { readFile, writeFile } from "fs/promises";
import * as P from 'parsimmon';

async function loadFile(filepath: string): Promise<string> {
    let source: string = "";
    try {
        source = await readFile(filepath, "utf8");
        console.log(source);
    } catch (error) {
        throw new Error("ファイルの読み込みに失敗しました:" + error);
    }
    
    return source;
}

async function saveFile(data: string, outpath: string): Promise<void> {
    try {
        await writeFile(outpath, data, "utf8");
        console.log("ファイルが正常に書き込まれました。");
    } catch (error) {
        throw new Error("ファイルの読み込みに失敗しました:" + error);
    }
}

let count = 0;
let mathLabels: { [key: string]: string; } = {};

// パーサーの定義
const parser = P.createLanguage({
    Sentence: (r) => P.alt(r.SharpExpression, r.Text).many().tieWith(""),
    Text: (r) => P.alt(P.regex(/[^\$\#\n\r\!@\}\]]+/), r.AtSignExpression, r.DollarExpression, r.ExclamationExpression, r.NewLine), 
    NewLine: () => P.regexp(/[\n\r]/).map((nr) => '<br>\n'),
    AtSignExpression: () => P.seq(
        P.string('@'),
        P.regexp(/[^\s]+/),
    ).map(([at, content]) => `<a href=#${content}>${content}</a>`),
    ExclamationExpression: (r) => P.alt(r.DefBox, r.ExpBox), 
    DefBox: (r) => P.seq(
        P.regexp(/\!def\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="DefBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="DefMarker">定義</span> ${name.trim()} ${id!="" ? " " + id.trim() : ""}</b><br><br>${content}</div>`),
    ExpBox: (r) => P.seq(
        P.regexp(/\!exp\s*\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
        r.CurlyBracesTexts, // できれば任意にしたい
    ).map(([exp, id, content1, content2]) =>
        `<div class="ExpBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="ExpMarker">例題${id!="" ? " " + id.trim() : ""}</span></b><br><br>${content1}<br><details><summary>解答</summary>${content2}</details></div>`),
    SharpExpression: (r) => P.seq(
        P.regexp(/\#\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesSentence
    ).map(([start, title, colon, id, cbsentence]) =>
        `<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}>${id.trim()!="" ? id.trim() + " " : ""} ${title}</b>${cbsentence}`),
    CurlyBracesTexts: (r) => P.seq(
        P.regexp(/\s*\{\s*/),
        r.Text.many().tieWith(""),
        P.regexp(/\s*\}\s*/),
    ).map(([lc, content, rc]) => `\n${content}\n`),
    CurlyBracesSentence: (r) => P.seq(
        P.regexp(/\s*\{\s*/),
        r.Sentence,
        P.regexp(/\s*\}\s*/),
    ).map(([lc, content, rc]) => `<div class="section">\n${content}\n</div>`),
    DollarExpression: (r) => P.alt(r.MathExpression, r.MathLabel),
    MathExpression: () => P.seq(
        P.regexp(/\$\s*\[\s*/),
        P.regexp(/[^\]]*/),
        P.string(']'),
        P.regexp(/(\s*\:\s*[^\s]+)?/),
    ).map(([start, content, end, id]) => {
            if(id != ""){
                mathLabels[id.trim().slice(1).trim()] = `\\(${content}\\)`;
            }
            return `\\(${content}\\)`;
        }),
    MathLabel: (r) => P.seq(
        P.regexp(/\$\s*\(\s*/),
        P.regexp(/[^\)]*/),
        P.string(')'),
    ).map(([lp, id, rp]) => {
            let content = "";
            if(mathLabels.hasOwnProperty(id.trim())){
                content = mathLabels[id.trim()];
            }else {
                content = `undefined label: ${id.trim()}`;
            }
            return `${content}`
        }),
    });

// 文字列中の全ての`$[...]`を`\(...\)`に変換する関数
function transform(input: string): string {
    const result = parser.Sentence.parse(input);
    
    console.log(result);
    if (result.status) {
        console.log(result);
        return result.value;
    } else {
        console.log(`Parsing failed: ${result.expected} | ${result.index.offset}`);
        return `<div>Parsing failed: ${result.expected} | ${result.index.offset}</div>`;
    }
}

export async function compile(filepath: string): Promise<string> {
    return loadFile(filepath).then((source) => { 
        const transformedString = transform(source);
        console.log(transformedString);
    
        let data = `
<head>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
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
margin-bottom: 3.5px;
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
span.DefMarker {
background: linear-gradient(transparent 50%, #a5dee5 50% 100%);
}
span.ExpMarker {
background: linear-gradient(transparent 50%, #fff57d 50% 100%);
}
</style>
</head>
<body>
${transformedString}
</body>
`
        // saveFile(data, outpath); //後でhtml出力verも作る
        return data;
    },
    (err) => {
        return err;
    });
}

// console.log(compile("/Users/tsujimoto_souichirou/Documents/w1eX/src/index.w1ex"));
// saveFile(compile("/Users/tsujimoto_souichirou/Documents/w1eX/src/index.w1ex"), "src/index.html");
