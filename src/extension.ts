import * as vscode from 'vscode';
import {compile} from './w1ex';

export function activate(context: vscode.ExtensionContext) {
	let panel = vscode.window.createWebviewPanel(
		'openPreview',
		'w1eX preview test',
		vscode.ViewColumn.Two,
		{enableScripts: true}
	);
	
	const w1eXCompile = vscode.commands.registerCommand('w1eX.compile', async () => {
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
		if(inputName == undefined){
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
		compile(inputUri.path).then(html => {
			vscode.workspace.fs.writeFile(outputUri, Buffer.from(html));
		},
		err => {
			console.error(err);
		});
	});

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
			compile(event.uri.path).then(
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



