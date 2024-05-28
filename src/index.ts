import { readFile, writeFile } from "fs/promises";

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

loadFile().then((source) => {
    const eol = /\n/;
    const mathBraceOpen = /\$\[/;
    const mathBraceClose = /\]/;
    let r = source.replace(eol, "<br>");
    r = r.replace(mathBraceOpen, "\\("); 
    r = r.replace(mathBraceClose, "\\)"); 

    let data = 
    `
    <head>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    </head>
    <body>
        <p>${r}</p>
    </body>
    `;

    saveFile(data);

});


