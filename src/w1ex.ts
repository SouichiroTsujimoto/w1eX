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

let operationPriority: {[key: string]: number;} = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
}
let operateStack: string[] = [];

function operateStackReset() {
    operateStack = [];
}

function pushOperate(op: string): string[] {
    if(operateStack.length == 0 || op == "("){
        operateStack.push(op);
        return [];
    }else if(op == ")"){
        let last = operateStack.pop();
        last = last ? last : "";
        let result: string[] = [];
        
        if(last != "("){
            result.push(last);
            result = result.concat(pushOperate(op));
        }
        return result;
    }else{
        let pri = operationPriority[op];
        let last = operateStack.pop();
        last = last ? last : "";
        let lp = operationPriority[last];
        let result: string[] = [];

        if(pri <= lp){
            result.push(last);
            result = result.concat(pushOperate(op));
        }else{
            operateStack.push(last);
            operateStack.push(op);   
        }

        return result;
    }
}

// パーサーの定義
const parser = P.createLanguage({
    Sentence: (r) => r.Text.many().tieWith(""),
    Text: (r) => P.alt(
        r.SharpExpression, 
        r.BracesSentence,
        r.EscapeSequence,
        r.AtSignExpression,
        r.DollarExpression,
        r.ExclamationExpression,
        r.NewLine,
        r.DecorationText,
        r.Image,
        P.regex(/[^\$\&\#\n\r\!@\}\[\]\\\_\*\/]+/),
    ), 
    NewLine: () => P.regexp(/\n\r|\n|\r/).map((nr) => '<br>\n'),
    EscapeSequence: () => P.seq(
        P.string("\\"),
        P.regexp(/./),
    ).map(([escape, char]) => char),
    AtSignExpression: () => P.seq(
        P.string('@'),
        P.regexp(/[^\s]+/),
    ).map(([at, content]) => `<a href=#${content}>${content}</a>`),
    //  !記号ボックス
    ExclamationExpression: (r) => P.alt(r.DefBox, r.ExpBox, r.TheBox, r.ProBox, r.LemBox, r.AxiBox, r.CorBox, r.FoldBox), 
    DefBox: (r) => P.seq(
        P.regexp(/\!def\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="DefBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="DefMarker">定義</span> ${id.trim()} ${name.trim()}</b><br><br>${content}</div>`),
    ExpBox: (r) => P.seq(
        P.regexp(/\!exp\s*\:?/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
        // r.CurlyBracesTexts, // できれば任意にしたい
    ).map(([exp, name, colon, id, content1]) =>
        `<div class="ExpBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="ExpMarker">例題</span> ${id.trim()} ${name.trim()}</b><br><br>${content1}<br></div>`),
    FoldBox: (r) => P.seq(
        P.regexp(/\!fold\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<details${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><summary><b> ${id.trim()} ${name.trim()}</b></summary><br>${content}</details>`),
    TheBox: (r) => P.seq(
        P.regexp(/\!the\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="TheBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="TheMarker">定理</span> ${id.trim()} ${name.trim()}</b><br><br>${content}</div>`),
    ProBox: (r) => P.seq(
        P.regexp(/\!pro\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="ProBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="ProMarker">命題</span> ${id.trim()} ${name.trim()}</b><br><br>${content}</div>`),    
    LemBox: (r) => P.seq(
        P.regexp(/\!lem\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="LemBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="LemMarker">補題</span> ${id.trim()} ${name.trim()}</b><br><br>${content}</div>`),    
    AxiBox: (r) => P.seq(
        P.regexp(/\!axi\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="AxiBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="AxiMarker">公理</span> ${id.trim()} ${name.trim()}</b><br><br>${content}</div>`),    
    CorBox: (r) => P.seq(
        P.regexp(/\!cor\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesTexts,
    ).map(([def, name, colon, id, content]) =>
        `<div class="CorBox">\n<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}><span class="CorMarker">系</span> ${id.trim()} ${name.trim()}</b><br><br>${content}</div>`),    
    SharpExpression: (r) => P.seq(
        P.regexp(/\#\s*/),
        P.regexp(/[^\{\:]*/),
        P.regexp(/\:?/),
        P.regexp(/[^\{]*/),
        r.CurlyBracesSentence
    ).map(([start, title, colon, id, cbsentence]) =>
        `<b${id.trim()!="" ? " id=\"" + id.trim() + "\"" : ""}>${id.trim()!="" ? id.trim() + " " : ""} ${title}</b>${cbsentence}`),
    BracesSentence: (r) => P.seq(
        P.regexp(/\[\s*/),
        r.w1eXMathExpression,
        P.regexp(/\]/),
    ).map(([lb, content, rb]) => `\n${content}\n`),
    CurlyBracesTexts: (r) => P.seq(
        P.regexp(/\s*\{\s*/),
        r.Text.many().tieWith(""),
        P.regexp(/\s*\}/),
    ).map(([lc, content, rc]) => `\n${content}\n`),
    CurlyBracesSentence: (r) => P.seq(
        P.regexp(/\s*\{\s*/),
        r.Text.many().tieWith(""),
        P.regexp(/\s*\}/),
    ).map(([lc, content, rc]) => `<div class="section">\n${content}\n</div>`),
    // テキスト装飾
    DecorationText: (r) => P.alt(
        r.Italic,
        r.Bold,
        r.UnderLine,
    ),
    Italic: (r) => P.seq(
        P.string("/"),
        P.alt(
            P.regex(/[^\/]+/),
        ).many().tieWith(""),
        P.string("/"),
    ).map(([sign1, text, sign2]) => `<span style="font-style: italic">${text}</span>`),
    Bold: (r) => P.seq(
        P.string("*"),
        P.alt(
            P.regex(/[^\*]+/),
        ).many().tieWith(""),
        P.string("*"),
    ).map(([sign1, text, sign2]) => `<span style="font-weight: bold">${text}</span>`),
    UnderLine: (r) => P.seq(
        P.string("_"),
        P.alt(
            P.regex(/[^\_]+/),
        ).many().tieWith(""),
        P.string("_"),
    ).map(([sign1, text, sign2]) => `<span style="text-decoration: underline">${text}</span>`),
    // &記号(今の所、imageのみ)
    Image: (r) => P.seq(
        P.regexp(/\&\s*\[\s*/),
        P.regexp(/[^\]]*/),
        P.string(']'),
    ).map(([lp, url, rp]) => {
        return `<img src="${url}" />`
    }),
    // $記号
    DollarExpression: (r) => P.alt(r.MathExpression, r.MathLabel),
    MathExpression: () => P.seq(
        P.regexp(/\$\s*\[\s*/),
        P.regexp(/(\\\]|[^\]])*/),
        P.regexp(/\]/),
        P.regexp(/(\s*\:\s*[^\s]+)?/),
    ).map(([start, content, end, id]) => {
        let escaping = content
            .replaceAll("(", "&lpar;")
            .replaceAll(")", "&rpar;")
            .replaceAll("\\[", "&lbrack;")
            .replaceAll("\\]", "&rbrack;");
        if(id != ""){
            mathLabels[id.trim().slice(1).trim()] = `\\(${escaping}\\)`;
        }
        return `\\(${escaping}\\)`;
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
    w1eXMathExpression: (r) => r.w1eXMathExpressionReversePolish.many()
    .map((polish_exp) => {
        let stack: [string, string][] = [];
        let numberCheck = /[0-9]+(\.[0-9]+)?/
        polish_exp.push(operateStack.reverse());
        operateStackReset();
        for(let i of polish_exp){
            if(i.length == 0 || i[0] == ""){
                continue;
            }
            for(let j of i){
                if(operationPriority.hasOwnProperty(j)){
                    if(j == "*"){
                        let opRight = stack.pop();
                        let opLeft = stack.pop();
                        opRight = opRight ? opRight : ["", ""];
                        opLeft = opLeft ? opLeft : ["", ""];
                        if(opRight[1]=="pm") {
                            opRight = [`<mo>(</mo>${opRight[0]}<mo>)</mo>`, "ident"]
                        }
                        if(opLeft[1]=="pm") {
                            opLeft = [`<mo>(</mo>${opLeft[0]}<mo>)</mo>`, "ident"]
                        }
                        if(opRight[1]=="number"){
                            stack.push([`${opLeft[0]}<mo>&times;</mo>${opRight[0]}`, "number"]);
                        }else{
                            stack.push([`${opLeft[0]}<mo>&InvisibleTimes;</mo>${opRight[0]}`, "ident"]);
                        }
                    }else if(j == "/"){
                        let opRight = stack.pop();
                        let opLeft = stack.pop();
                        opRight = opRight ? opRight : ["", ""];
                        opLeft = opLeft ? opLeft : ["", ""];
                        stack.push([`<mfrac><mrow>${opLeft[0]}</mrow><mrow>${opRight[0]}</mrow></mfrac>`, "number"]);
                    }else if(j == "+"){
                        let opRight = stack.pop();
                        let opLeft = stack.pop();
                        opRight = opRight ? opRight : ["", ""];
                        opLeft = opLeft ? opLeft : ["", ""];
                        stack.push([`${opLeft[0]}<mo>+</mo>${opRight[0]}`, "pm"]);
                    }else if(j == "-"){
                        let opRight = stack.pop();
                        let opLeft = stack.pop();
                        opRight = opRight ? opRight : ["", ""];
                        opLeft = opLeft ? opLeft : ["", ""];
                        if(opRight[1]=="pm") {
                            opRight = [`<mo>(</mo>${opRight[0]}<mo>)</mo>`, "ident"]
                        }
                        stack.push([`${opLeft[0]}<mo>-</mo>${opRight[0]}`, "pm"]);
                    }
                }else{
                    if(numberCheck.test(j)){
                        stack.push([`<mn>${j}</mn>`, "number"]);
                    }else{
                        stack.push([`<mi>${j}</mi>`, "ident"]);
                    }
                }
            }
        }
        console.log(Object(stack));
        return `<math>${stack[0][0]}</math>`;
    }),
    w1eXMathExpressionReversePolish: (r) => P.alt(
        r.Operand,
        r.MultiOperation,
        r.DivideOperation,
        r.PlusOperation,
        r.MinusOperation,
        r.OpenParenSymbol,
        r.CloseParenSymbol,
        P.regexp(/\s+/),
    ).map((i) => {
        if(i.trim() == ""){
            return [""]; 
        }else if(i == "(" || i == ")" || operationPriority.hasOwnProperty(i)){
            return pushOperate(i);
        }else {
            return [i];
        }
    }),
    // .map(([operand1, operate]) => {
    //     if(operate[0].trim() == "/"){
    //         return `<mfrac><mn>${operand1}</mn><mrow><mn>${operate[1]}</mn></mrow></mfrac>`
    //     }else if(operate[0].trim() == "*") {
    //         return `<mn>${operand1}</mn><mo>&times;</mo><mn>${operate[1]}</mn>`
    //     }else if(operate[0].trim() == "+") {
    //         return `<mn>${operand1}</mn><mo>+</mo><mn>${operate[1]}</mn>`
    //     }else if(operate[0].trim() == "-") {
    //         return `<mn>${operand1}</mn><mo>-</mo><mn>${operate[1]}</mn>`
    //     }
    // }), // 工事中
    DivideOperation: () => P.regexp(/\//),
    MultiOperation: () => P.regexp(/\*/),
    PlusOperation: () => P.regexp(/\+/),
    MinusOperation: () => P.regexp(/\-/),
    OpenParenSymbol: () => P.string("("),
    CloseParenSymbol: () => P.string(")"),
    Number: () => P.regexp(/[0-9]+(\.[0-9]+)?/),
    Symbol: () => P.regexp(/\w+/),
    Operand: (r) => P.alt(r.Number, r.Symbol),
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
<meta charset="UTF-8" lang="en">
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

