// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as http from 'http';
import express from 'express';
import { ILyricsInfo } from './models/ILyricsInfo';


export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration("lyricsIslandIndicator");

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    let statusBarShowed = false;
    statusBarItem.text = "$(music) …";
    statusBarItem.tooltip = "歌词";

    const app = express();
    const port = config.get<number>("port");

    app.use(express.json()); // 自动解析 JSON body

    // 定义 POST 接口
    app.post('/component/lyrics/lyrics/', (req, res) => {
        const configLocal = vscode.workspace.getConfiguration("lyricsIslandIndicator");
        const data = req.body as ILyricsInfo;
        const showExtra = configLocal.get<boolean>("showExtraLyrics");
        let text = `$(music) ${data.lyric}`;
        if (showExtra && data.extra && data.extra !== data.lyric) {
            text += `  ${data.extra}`;
        }

        statusBarItem.text = text;
        if (!statusBarShowed) {
            statusBarItem.show();
        }

        res.json({ status: 'ok' });
    });

    const server = http.createServer(app);
    try {
        // 启动服务器
        server.listen(port, () => {
            console.log(`开始监听歌词请求：http://localhost:${port}/webhook`);
            // vscode.window.showInformationMessage(`监听端口 ${port} 成功`);
        });
        
        context.subscriptions.push({
            dispose() {
            server.close(() => {
                console.log('服务器已关闭');
            });
            }
        });
    } catch (error: any) {
        console.error(`无法在 URL 上监听端口：http://localhost:${port}/webhook`);
    }
    
    // 关闭服务器时清理
}

// This method is called when your extension is deactivated
export function deactivate() {}
