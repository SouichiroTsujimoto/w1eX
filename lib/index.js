"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const P = __importStar(require("parsimmon"));
function loadFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let source = "";
        try {
            source = yield (0, promises_1.readFile)("./src/index.w1ex", "utf8");
            console.log(source);
        }
        catch (error) {
            console.error("ファイルの読み込みに失敗しました:", error);
        }
        return source;
    });
}
function saveFile(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, promises_1.writeFile)("./src/index.html", data, "utf8");
            console.log("ファイルが正常に書き込まれました。");
        }
        catch (error) {
            console.error("ファイルの書き込みに失敗しました:", error);
        }
    });
}
// パーサーの定義
const parser = P.createLanguage({
    Expression: (r) => P.alt(r.DollarExpression, r.Text),
    Text: () => P.any.many().tie(),
    DollarExpression: () => P.seq(P.string('$['), P.regexp(/[^]]*/), // `]` 以外の任意の文字列
    P.string(']')).map(([start, content, end]) => `\\(${content}\\)`)
});
// 文字列中の全ての`$[...]`を`\(...\)`に変換する関数
function transform(input) {
    const result = parser.Expression.parse(input);
    if (result.status) {
        return result.value;
    }
    else {
        throw new Error(`Parsing failed: ${result.expected}`);
    }
}
loadFile().then((source) => {
    // const eol = /\n/;
    // const mathBraceOpen = /\$\[/;
    // const braceClose = /\]/;
    // const h1labelOpen = /\#\[/;
    // let r = source.replace(eol, "<br>");
    // r = r.replace(h1label, "<h1>");
    // r = r.replace(mathBraceOpen, "\\("); 
    // r = r.replace(mathBraceClose, "\\)"); 
    // 例
    const inputString = 'This is a $[test] string with $[multiple] $[dollar expressions].';
    const transformedString = transform(inputString);
    console.log(transformedString);
    let data = `
    <head>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    </head>
    <body>
        <p>${transformedString}</p>
    </body>
    `;
    saveFile(data);
});
