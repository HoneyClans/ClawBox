const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public')); // 提供前端網頁

// 確保 public 資料夾存在
const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.warn('⚠️  public 資料夾不存在，已自動創建。請確保 index.html 在 public 資料夾中。');
}

// 根路徑重定向到 index.html（更好的 UX）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 模擬本地資料庫 (儲存設定)
const CONFIG_FILE = path.join(__dirname, 'config.json');
let config = { apiKey: '', allowFileRead: false, allowSystemCmd: false };

// 讀取設定（如果不存在會使用預設值，不會崩潰）
if (fs.existsSync(CONFIG_FILE)) {
    try {
        const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
        config = JSON.parse(configContent);
        console.log('✅ 設定文件載入成功');
    } catch (error) {
        console.error('❌ 讀取設定文件失敗，將使用預設值:', error.message);
        config = { apiKey: '', allowFileRead: false, allowSystemCmd: false };
    }
} else {
    console.log('ℹ️  config.json 不存在，使用預設設定。用戶可在 Web UI 中設定 API Key。');
}

// API: 獲取當前設定
app.get('/api/settings', (req, res) => {
    res.json(config);
});

// API: 儲存設定
app.post('/api/settings', (req, res) => {
    try {
        config = { ...config, ...req.body };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        res.json({ success: true, message: '設定已儲存！' });
    } catch (error) {
        res.status(500).json({ success: false, message: `儲存失敗：${error.message}` });
    }
});

// API: 與 AI 代理對話 (核心邏輯)
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    // 輸入驗證：確保 message 存在且為字符串
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ reply: '❌ 請輸入有效的訊息內容。' });
    }

    if (!config.apiKey) {
        return res.status(400).json({ reply: '⚠️ 請先在設定頁面輸入 OpenAI API Key！' });
    }

    try {
        const openai = new OpenAI({ apiKey: config.apiKey });
        
        // 定義 AI 可以使用的安全工具
        const tools = [];
        
        // 安全機制：只有用戶在 UI 開啟權限，才把工具交給 AI
        // 這是一個重要的安全設計，防止 Prompt Injection 攻擊
        if (config.allowFileRead) {
            tools.push({
                type: "function",
                function: { name: "read_local_time", description: "獲取電腦當前系統時間" }
            });
        }

        // ⚠️ 安全警告：未來如果實現系統指令執行功能，必須：
        // 1. 建立白名單機制（只允許執行 ls, whoami 等無害指令）
        // 2. 在 Web UI 彈出確認對話框，讓用戶手動確認執行
        // 3. 絕對不能直接把 AI 生成的字串丟進 child_process.exec()
        // 4. 防止執行 rm -rf / 等危險指令
        // if (config.allowSystemCmd) {
        //     // 未來實現時需要嚴格的安全檢查
        // }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // 預設使用較便宜快速的模型
            messages: [{ role: "system", content: "你是一個運行在用戶本地電腦的 AI 助理 ClawBox。請友善地回答問題。" }, { role: "user", content: message }],
            tools: tools.length > 0 ? tools : undefined,
        });

        const aiMessage = response.choices[0].message;

        // 處理工具調用 (Tool Calling)
        if (aiMessage.tool_calls) {
            let toolReply = "";
            for (const tool of aiMessage.tool_calls) {
                if (tool.function.name === "read_local_time") {
                    toolReply += `\n[系統動作] 已獲取本地時間：${new Date().toLocaleString()}`;
                }
            }
            return res.json({ reply: `我執行了本地操作！${toolReply}` });
        }

        res.json({ reply: aiMessage.content });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: `❌ AI 請求失敗：${error.message}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🦞 ClawBox 啟動成功！`);
    console.log(`👉 請在瀏覽器打開：http://localhost:${PORT}\n`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ 端口 ${PORT} 已被占用，請嘗試使用其他端口或關閉占用該端口的程序。\n`);
    } else {
        console.error(`\n❌ 服務器啟動失敗：${error.message}\n`);
    }
    process.exit(1);
});
