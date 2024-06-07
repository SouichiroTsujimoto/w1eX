import * as vscode from 'vscode';
import {compile} from './w1ex';
import { stringify } from 'querystring';

export function activate(context: vscode.ExtensionContext) {
	let panel = vscode.window.createWebviewPanel(
		'openPreview',
		'w1eX preview test',
		vscode.ViewColumn.Two,
		{enableScripts: true}
	);

	const reOpenView = vscode.commands.registerCommand('w1eX.reopenView', async () => {
		panel = vscode.window.createWebviewPanel(
			'openPreview',
			'w1eX preview test',
			vscode.ViewColumn.Two,
			{enableScripts: true}
		);
	});

	const w1eXCompile = vscode.commands.registerCommand('w1eX.compile', async () => {
		// // VSCodeで開いているディレクトリを取得
		// // 開いていない場合はエラーを出して終了する
		// const folders = vscode.workspace.workspaceFolders;
		// if (folders === undefined) {
		// 	vscode.window.showErrorMessage('Error: Open the folder before executing this command.');
		// 	return;
		// }
		// const folderPath = folders[0].uri;
		const filePath = await vscode.window.showOpenDialog({
			canSelectFiles: true, // ファイルの選択を有効にする
			canSelectFolders: false, // フォルダーの選択を無効にする
			canSelectMany: false, // 複数のファイルの選択を無効にする
			openLabel: 'Select' // ボタンのラベル
		});
	
		if (filePath && filePath.length > 0) {
			// ファイルが選択された場合の処理
			vscode.window.showInformationMessage(`Selected file: ${filePath[0].path}`);
		} else {
			// ファイルが選択されなかった場合の処理
			vscode.window.showWarningMessage('No file selected.');
			return;
		}

		
		// ファイル名構築
		// フォーマットは YYYYMMDD_入力した文字列.md とする
		// const date = new Date();
		const outputName = (filePath[0].path===undefined ? "" : filePath[0].path) + ".html";
		const outputPath = vscode.Uri.file(outputName);

		// // 書き込むファイルのフルパスを生成
		// const inputUri = vscode.Uri.joinPath(folderPath, inputName);
		// const outputUri = vscode.Uri.joinPath(folderPath, outputName);

		// // 書き込むファイルの内容を準備
		// // Uint8Arrayに変換する
		// const content = `# ${inputName}`;
		// const blob: Uint8Array = Buffer.from(content);

		// ファイル書き込み
		compile(filePath[0].fsPath).then(html => {
			console.log(html);
			vscode.workspace.fs.writeFile(outputPath, Buffer.from(html));
			vscode.window.showInformationMessage("compile success");
		},
		err => {
			console.error(err);
			vscode.window.showErrorMessage("compile fail");
		});
	});

	context.subscriptions.push(reOpenView, w1eXCompile);

	let reOpenPanel = false;

	const didChange = vscode.workspace.onDidSaveTextDocument(event => {
		if(/\.w1ex$/.test(event.uri.path)) {
			if(reOpenPanel) {
				panel = vscode.window.createWebviewPanel(
					'openPreview',
					'w1eX preview test',
					vscode.ViewColumn.Two,
					{enableScripts: true}
				);
				reOpenPanel = false;
			}
			
			// vscode.window.showInformationMessage(event.uri.path);
			compile(event.uri.fsPath).then(
				html => {
					panel.webview.html = html;
				},
				err => {
					console.error(err);
				}
			);
		}
	});

	panel.onDidDispose(
		() => {
			reOpenPanel = true;
		},
		null,
        context.subscriptions
	);
}


export function deactivate() {}



