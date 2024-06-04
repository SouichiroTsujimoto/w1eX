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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// import { readFile, writeFile } from "fs/promises";
// import * as P from 'parsimmon';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "w1eX" is now active!');
    const createMemoFileCommand = vscode.commands.registerCommand('w1eX.start', async () => {
        // VSCodeで開いているディレクトリを取得
        // 開いていない場合はエラーを出して終了する
        const folders = vscode.workspace.workspaceFolders;
        if (folders === undefined) {
            vscode.window.showErrorMessage('Error: Open the folder before executing this command.');
            return;
        }
        const folderPath = folders[0].uri;
        // ファイル名入力
        const inputName = await vscode.window.showInputBox();
        // ファイル名構築
        // フォーマットは YYYYMMDD_入力した文字列.md とする
        const date = new Date();
        const fileName = `${inputName}.w1eX`;
        // 書き込むファイルのフルパスを生成
        const fullUri = vscode.Uri.joinPath(folderPath, fileName);
        // 書き込むファイルの内容を準備
        // Uint8Arrayに変換する
        const content = `# ${inputName}`;
        const blob = Buffer.from(content);
        // ファイル書き込み
        await vscode.workspace.fs.writeFile(fullUri, blob);
    });
    context.subscriptions.push(createMemoFileCommand);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map