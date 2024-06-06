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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const w1ex_1 = require("./w1ex");
function activate(context) {
    const panel = vscode.window.createWebviewPanel('openPreview', 'Preview test', vscode.ViewColumn.Two, { enableScripts: true });
    const w1eXCompile = vscode.commands.registerCommand('w1eX.compile', () => __awaiter(this, void 0, void 0, function* () {
        // VSCodeで開いているディレクトリを取得
        // 開いていない場合はエラーを出して終了する
        const folders = vscode.workspace.workspaceFolders;
        if (folders === undefined) {
            vscode.window.showErrorMessage('Error: Open the folder before executing this command.');
            return;
        }
        const folderPath = folders[0].uri;
        // ファイル名入力
        const inputName = yield vscode.window.showInputBox();
        if (inputName == undefined) {
            vscode.window.showErrorMessage('Error: inputName undefined');
            return;
        }
        // ファイル名構築
        // フォーマットは YYYYMMDD_入力した文字列.md とする
        // const date = new Date();
        const outputName = `${inputName}.html`;
        // 書き込むファイルのフルパスを生成
        const inputUri = vscode.Uri.joinPath(folderPath, inputName);
        const outputUri = vscode.Uri.joinPath(folderPath, outputName);
        // // 書き込むファイルの内容を準備
        // // Uint8Arrayに変換する
        // const content = `# ${inputName}`;
        // const blob: Uint8Array = Buffer.from(content);
        // ファイル書き込み
        (0, w1ex_1.compile)(inputUri.path).then(html => {
            vscode.workspace.fs.writeFile(outputUri, Buffer.from(html));
        }, err => {
            console.error(err);
        });
    }));
    const didChange = vscode.workspace.onDidSaveTextDocument(event => {
        vscode.window.showInformationMessage(event.uri.path);
        (0, w1ex_1.compile)(event.uri.path).then(html => {
            panel.webview.html = html;
        }, err => {
            console.error(err);
        });
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
