// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { readFile, writeFile } from "fs/promises";
// import * as P from 'parsimmon';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
		const blob: Uint8Array = Buffer.from(content);

		// ファイル書き込み
		await vscode.workspace.fs.writeFile(fullUri, blob);
	});

	context.subscriptions.push(createMemoFileCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
