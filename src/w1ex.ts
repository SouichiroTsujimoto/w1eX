import { readFileSync, writeFileSync } from "fs";
import path from "path";
import * as P from 'parsimmon';

async function loadFile(filepath: string): Promise<string> {
    let source: string = "";
    // let rf = path.relative(__dirname, filepath);
    // console.log(rf);
    try {
        source = readFileSync(filepath, "utf8");
        console.log(source);
    } catch (error) {
        throw new Error("ファイルの読み込みに失敗しました:" + error);
    }
    
    return source;
}

async function saveFile(data: string, outpath: string): Promise<void> {
    try {
        await writeFileSync(outpath, data, "utf8");
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
    Text: (r) => P.alt(P.regex(/[^\$\#\n\r\!@\}\[\]]+/), r.BracesSentence, r.AtSignExpression, r.DollarExpression, r.ExclamationExpression, r.NewLine), 
    NewLine: () => P.regexp(/[\n\r]/).map((nr) => '<br>\n'),
    AtSignExpression: () => P.seq(
        P.string('@'),
        P.regexp(/[^\s]+/),
    ).map(([at, content]) => `<a href=#${content}>${content}</a>`),
    ExclamationExpression: (r) => P.alt(r.DefBox, r.ExpBox, r.TheBox, r.ProBox, r.LemBox, r.AxiBox, r.CorBox, r.FoldBox), 
    DefBox: (r) => P.seq(
        P.regexp(/\!def\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="DefBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="DefMarker">定義</span> ${name.trim()} ${id.trim()}</b><br><br>${content}</div>`),
    ExpBox: (r) => P.seq(
        P.regexp(/\!exp\s*\:?/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
        // r.CurlyBracesTexts, // できれば任意にしたい
    ).map(([exp, name, colon, id, content1]) =>
        `<div class="ExpBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="ExpMarker">例題</span> ${name.trim()} ${id.trim()}</b><br><br>${content1}<br></div>`),
    FoldBox: (r) => P.seq(
        P.regexp(/\!fold\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<details><summary>${name.trim()}</summary><br>${content}</details>`),
    TheBox: (r) => P.seq(
        P.regexp(/\!the\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="TheBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="TheMarker">定理</span> ${name.trim()} ${id.trim()}</b><br><br>${content}</div>`),
    ProBox: (r) => P.seq(
        P.regexp(/\!pro\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="ProBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="ProMarker">命題</span> ${name.trim()} ${id.trim()}</b><br><br>${content}</div>`),    
    LemBox: (r) => P.seq(
        P.regexp(/\!lem\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="LemBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="LemMarker">補題</span> ${name.trim()} ${id.trim()}</b><br><br>${content}</div>`),    
    AxiBox: (r) => P.seq(
        P.regexp(/\!axi\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="AxiBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="AxiMarker">公理</span> ${name.trim()} ${id.trim()}</b><br><br>${content}</div>`),    
    CorBox: (r) => P.seq(
        P.regexp(/\!cor\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="CorBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="CorMarker">系</span> ${name.trim()} ${id.trim()}</b><br><br>${content}</div>`),    
    SharpExpression: (r) => P.seq(
        P.regexp(/\#\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesSentence
    ).map(([start, title, colon, id, cbsentence]) =>
        `<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}>${id.trim()!="" ? id.trim() + " " : ""} ${title}</b>${cbsentence}`),
    BracesSentence: (r) => P.seq(
        P.regexp(/\s*\[\s*/),
        r.w1eXMathExpression,
        P.regexp(/\s*\]\s*/),
    ).map(([lb, content, rb]) => `\n<math>${content}</math>\n`),
    CurlyBracesTexts: (r) => P.seq(
        P.regexp(/\s*\{\s*/),
        r.Text.many().tieWith(""),
        P.regexp(/\s*\}/),
    ).map(([lc, content, rc]) => `\n${content}\n`),
    CurlyBracesSentence: (r) => P.seq(
        P.regexp(/\s*\{\s*/),
        r.Sentence,
        P.regexp(/\s*\}/),
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
    w1eXMathExpression: (r) => P.seq(
        r.Number,
        P.alt(
            r.DivideExpression,
            r.MultiExpression,
        ),
        P.alt(
            r.w1eXMathExpression,
            r.Number,
        ),
    ).map(([child, op, parent]) => {
        if(op.trim() == "/"){
            return `<mfrac><mn>${child}</mn><mrow><mn>${parent}</mn></mrow></mfrac>`
        }else {
            return `<mn>${child}</mn><mo>&times;</mo><mn>${parent}</mn>`
        }
    }), // 工事中
    DivideExpression: (r) => P.regexp(/\s*\/\s*/),
    MultiExpression: (r) => P.regexp(/\s*\*\s*/),
    Number: () => P.regexp(/[0-9]+/),
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
<meta charset="UTF-8">
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

