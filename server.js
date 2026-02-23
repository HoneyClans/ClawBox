const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');
// 官方直連 SDK（可選依賴，未安裝時對應選項會報錯提示）
let GoogleGenAI, Anthropic;
try { GoogleGenAI = require('@google/genai').GoogleGenAI; } catch (_) {}
try { Anthropic = require('@anthropic-ai/sdk').default; } catch (_) {}

const app = express();
app.use(express.json());

// 智能檢測 index.html 位置（支援根目錄或 public 資料夾）
const INDEX_HTML_ROOT = path.join(__dirname, 'index.html');
const INDEX_HTML_PUBLIC = path.join(__dirname, 'public', 'index.html');
let indexHtmlPath = null;

if (fs.existsSync(INDEX_HTML_ROOT)) {
    // 如果根目錄有 index.html，優先使用
    indexHtmlPath = INDEX_HTML_ROOT;
    console.log('✅ 檢測到 index.html 在根目錄');
} else if (fs.existsSync(INDEX_HTML_PUBLIC)) {
    // 否則使用 public 資料夾中的 index.html
    indexHtmlPath = INDEX_HTML_PUBLIC;
    app.use(express.static('public')); // 提供 public 資料夾中的靜態文件
    console.log('✅ 檢測到 index.html 在 public 資料夾');
} else {
    // 如果都不存在，創建 public 資料夾並提示
    const PUBLIC_DIR = path.join(__dirname, 'public');
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    console.warn('⚠️  找不到 index.html，請確保 index.html 在根目錄或 public 資料夾中。');
}

// 提供 assets（logo 等）給前端與 README 使用
const ASSETS_DIR = path.join(__dirname, 'assets');
if (fs.existsSync(ASSETS_DIR)) {
    app.use('/assets', express.static(ASSETS_DIR));
}

// 根路徑重定向到 index.html
app.get('/', (req, res) => {
    if (indexHtmlPath && fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
    } else {
        res.status(404).send('❌ 找不到 index.html 文件。請確保 index.html 在根目錄或 public 資料夾中。');
    }
});

// 模擬本地資料庫 (儲存設定)
const CONFIG_FILE = path.join(__dirname, 'config.json');
let config = { 
    apiKey: '', 
    apiProvider: 'openai', // openai, groq, openrouter
    model: 'gpt-4o-mini', // 預設模型
    allowFileRead: false, 
    allowSystemCmd: false,
    // 圖片生成（DALL-E / Stable Diffusion）
    imageProvider: 'dalle', // dalle | stable-diffusion(預留)
    imageApiKey: '',       // 可留空，DALL-E 時會用上方 apiKey（OpenAI）
    // 網絡搜索
    searchProvider: 'bing', // bing | google(預留)
    searchApiKey: '',       // Bing 訂閱金鑰 或 Google API Key
    // 社交媒體（預留，需 OAuth）
    socialTiktok: '', socialFacebook: '', socialInstagram: '', socialTwitter: '', socialYoutube: ''
};

// API Provider 配置（官方直連 + OpenRouter 聚合）
const API_PROVIDERS = {
    // ---------- 官方直連 ----------
    openai: {
        name: 'OpenAI（官方）',
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        useOpenAI: true
    },
    groq: {
        name: 'Groq（官方・免費快）',
        baseURL: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.1-8b-instant',
        models: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma-7b-it'],
        useOpenAI: true
    },
    xai: {
        name: 'xAI Grok（官方）',
        baseURL: 'https://api.x.ai/v1',
        defaultModel: 'grok-2-1212',
        models: ['grok-2-1212', 'grok-2-vision-1212', 'grok-3-mini', 'grok-3', 'grok-4-1-fast-reasoning', 'grok-4-1-fast-non-reasoning'],
        useOpenAI: true
    },
    google: {
        name: 'Google Gemini（官方）',
        baseURL: null,
        defaultModel: 'gemini-2.0-flash',
        models: ['gemini-2.0-flash', 'gemini-2.0-flash-thinking-exp', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
        useGoogle: true
    },
    anthropic: {
        name: 'Anthropic Claude（官方）',
        baseURL: null,
        defaultModel: 'claude-3-5-sonnet-20241022',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        useAnthropic: true
    },
    // ---------- 聚合（一個 Key 用多種模型）----------
    openrouter: {
        name: 'OpenRouter (多模型聚合)',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
        models: [
            // 免費 / 入門
            'meta-llama/llama-3.1-8b-instruct:free',
            'google/gemma-2-9b-it:free',
            'mistralai/mistral-7b-instruct:free',
            'google/gemini-2.0-flash-exp:free',
            // Gemini 系列
            'google/gemini-pro',
            'google/gemini-flash-1.5',
            'google/gemini-2.0-flash-exp:free',
            // GPT 系列
            'openai/gpt-4o-mini',
            'openai/gpt-4o',
            'openai/gpt-4-turbo',
            'openai/gpt-4o-audio-preview',
            // Grok (xAI) 系列
            'x-ai/grok-2-1212',
            'x-ai/grok-2-vision-1212',
            'x-ai/grok-3-mini',
            'x-ai/grok-3',
            // Claude 系列
            'anthropic/claude-3-haiku',
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3.5-haiku',
            'anthropic/claude-3-opus',
            // Llama / 開源
            'meta-llama/llama-3.1-70b-instruct',
            'meta-llama/llama-3.2-3b-instruct:free',
            'meta-llama/llama-3.2-11b-vision-instruct:free',
            // 其他熱門
            'deepseek/deepseek-chat-v3-0324',
            'qwen/qwen-2.5-72b-instruct',
            'cohere/command-r-plus',
            'mistralai/mistral-large-2411'
        ],
        useOpenAI: true
    }
};

// 圖片生成服務（DALL-E 已實作，Stable Diffusion 預留）
const IMAGE_PROVIDERS = {
    dalle: {
        name: 'DALL-E (OpenAI)',
        models: ['dall-e-3', 'dall-e-2'],
        sizes: { 'dall-e-3': ['1024x1024', '1024x1792', '1792x1024'], 'dall-e-2': ['256x256', '512x512', '1024x1024'] }
    },
    'stable-diffusion': { name: 'Stable Diffusion（即將推出）', models: [], sizes: {} }
};

// 網絡搜索服務（Bing 已實作，Google 預留）
const SEARCH_PROVIDERS = {
    bing: { name: 'Bing Web Search API', needKey: true },
    google: { name: 'Google Custom Search（即將推出）', needKey: true }
};

// 讀取設定（如果不存在會使用預設值，不會崩潰）
if (fs.existsSync(CONFIG_FILE)) {
    try {
        const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
        config = JSON.parse(configContent);
        console.log('✅ 設定文件載入成功');
    } catch (error) {
        console.error('❌ 讀取設定文件失敗，將使用預設值:', error.message);
        config = { apiKey: '', apiProvider: 'openai', model: 'gpt-4o-mini', allowFileRead: false, allowSystemCmd: false, imageProvider: 'dalle', imageApiKey: '', searchProvider: 'bing', searchApiKey: '', socialTiktok: '', socialFacebook: '', socialInstagram: '', socialTwitter: '', socialYoutube: '' };
    }
} else {
    console.log('ℹ️  config.json 不存在，使用預設設定。用戶可在 Web UI 中設定 API Key。');
}

// 確保 config 有所有必要欄位（向後兼容）
config.apiProvider = config.apiProvider || 'openai';
config.model = (config.model && String(config.model).trim()) || API_PROVIDERS[config.apiProvider]?.defaultModel || 'gpt-4o-mini';
config.imageProvider = config.imageProvider || 'dalle';
config.searchProvider = config.searchProvider || 'bing';
config.imageApiKey = config.imageApiKey ?? '';
config.searchApiKey = config.searchApiKey ?? '';
config.socialTiktok = config.socialTiktok ?? '';
config.socialFacebook = config.socialFacebook ?? '';
config.socialInstagram = config.socialInstagram ?? '';
config.socialTwitter = config.socialTwitter ?? '';
config.socialYoutube = config.socialYoutube ?? '';

// API: 獲取當前設定
app.get('/api/settings', (req, res) => {
    res.json({
        ...config,
        apiProviders: API_PROVIDERS,
        imageProviders: IMAGE_PROVIDERS,
        searchProviders: SEARCH_PROVIDERS
    });
});

// API: 獲取可用的 API Providers 和 Models
app.get('/api/providers', (req, res) => {
    res.json(API_PROVIDERS);
});

// API: 儲存設定
app.post('/api/settings', (req, res) => {
    try {
        config = { ...config, ...req.body };
        ['apiKey', 'imageApiKey', 'searchApiKey', 'socialTiktok', 'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialYoutube'].forEach(k => {
            if (typeof config[k] === 'string') config[k] = config[k].trim();
        });
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        res.json({ success: true, message: '設定已儲存！' });
    } catch (error) {
        res.status(500).json({ success: false, message: `儲存失敗：${error.message}` });
    }
});

// API: 網絡搜索（Bing）
app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, error: '請提供搜尋關鍵字 (query)。' });
    }
    if (config.searchProvider !== 'bing') {
        return res.status(400).json({ success: false, error: '目前僅支援 Bing，Google 即將推出。請在設定中選擇 Bing 並填入 API Key。' });
    }
    const key = (config.searchApiKey && String(config.searchApiKey).trim()) || '';
    if (!key) {
        return res.status(400).json({ success: false, error: '請在設定中填入 Bing Web Search API 訂閱金鑰。' });
    }
    try {
        const q = encodeURIComponent(query.trim());
        const resp = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${q}&count=10`, {
            headers: { 'Ocp-Apim-Subscription-Key': key }
        });
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Bing API ${resp.status}: ${text.slice(0, 200)}`);
        }
        const data = await resp.json();
        const results = (data.webPages?.value || []).map(p => ({
            title: p.name,
            url: p.url,
            snippet: p.snippet
        }));
        res.json({ success: true, results });
    } catch (err) {
        const msg = err?.message || String(err);
        console.error('[GreenClaw] 搜索錯誤:', msg);
        res.status(500).json({ success: false, error: msg, results: [] });
    }
});

// API: 圖片生成（DALL-E）
app.post('/api/image', async (req, res) => {
    const { prompt, model = 'dall-e-3', size } = req.body;
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: '請提供圖片描述 (prompt)。' });
    }
    if (config.imageProvider !== 'dalle') {
        return res.status(400).json({ success: false, error: '目前僅支援 DALL-E，Stable Diffusion 即將推出。' });
    }
    const rawKey = (config.imageApiKey && String(config.imageApiKey).trim()) || (config.apiKey && String(config.apiKey).trim()) || '';
    if (!rawKey) {
        return res.status(400).json({ success: false, error: '請在設定中填入 OpenAI API Key（圖片生成使用 OpenAI DALL-E）。' });
    }
    const openai = new OpenAI({ apiKey: rawKey });
    const sizes = IMAGE_PROVIDERS.dalle.sizes[model] || ['1024x1024'];
    const chosenSize = size && sizes.includes(size) ? size : sizes[0];
    try {
        const resp = await openai.images.generate({
            model: model,
            prompt: prompt.slice(0, 4000),
            n: 1,
            size: chosenSize,
            response_format: 'url',
            quality: model === 'dall-e-3' ? 'standard' : undefined
        });
        const url = resp.data?.[0]?.url;
        if (!url) return res.status(500).json({ success: false, error: '未取得圖片 URL。' });
        res.json({ success: true, url, revised_prompt: resp.data[0].revised_prompt });
    } catch (err) {
        const msg = err?.message || String(err);
        console.error('[GreenClaw] 圖片生成錯誤:', msg);
        res.status(500).json({ success: false, error: msg });
    }
});

// API: 社交媒體連接狀態（預留 OAuth，目前回傳即將推出）
app.get('/api/social/status', (req, res) => {
    res.json({
        connected: {},
        comingSoon: [
            { id: 'tiktok', name: 'TikTok' },
            { id: 'facebook', name: 'Facebook' },
            { id: 'instagram', name: 'Instagram' },
            { id: 'twitter', name: 'X (Twitter)' },
            { id: 'youtube', name: 'YouTube' }
        ]
    });
});

// API: 與 AI 代理對話 (核心邏輯)
const SYSTEM_PROMPT = '你是一個運行在用戶本地電腦的 AI 助理 GreenClaw。請友善地回答問題。';

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ reply: '❌ 請輸入有效的訊息內容。' });
    }

    const rawKey = (config.apiKey && String(config.apiKey).trim()) || '';
    if (!rawKey) {
        return res.status(400).json({ reply: '⚠️ 請先在設定頁面輸入 API Key！' });
    }

    const provider = API_PROVIDERS[config.apiProvider] || API_PROVIDERS.openai;
    const selectedModel = (config.model && String(config.model).trim()) || provider.defaultModel;
    if (!selectedModel) {
        return res.status(400).json({ reply: '❌ 請在設定中選擇一個 AI 模型。' });
    }

    try {
        // ---------- Google Gemini 官方 ----------
        if (provider.useGoogle) {
            if (!GoogleGenAI) {
                return res.status(500).json({ reply: '❌ 請先安裝 Google Gen AI SDK：npm install @google/genai' });
            }
            const ai = new GoogleGenAI({ apiKey: rawKey });
            const response = await ai.models.generateContent({
                model: selectedModel,
                contents: message,
                config: { systemInstruction: SYSTEM_PROMPT }
            });
            const text = (response && response.text) ? response.text : (response?.candidates?.[0]?.content?.parts?.[0]?.text || '');
            return res.json({ reply: text || '（無回覆）' });
        }

        // ---------- Anthropic Claude 官方 ----------
        if (provider.useAnthropic) {
            if (!Anthropic) {
                return res.status(500).json({ reply: '❌ 請先安裝 Anthropic SDK：npm install @anthropic-ai/sdk' });
            }
            const client = new Anthropic({ apiKey: rawKey });
            const msg = await client.messages.create({
                model: selectedModel,
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: message }]
            });
            const textBlocks = (msg.content || []).filter(b => b.type === 'text').map(b => b.text);
            return res.json({ reply: textBlocks.join('') || '（無回覆）' });
        }

        // ---------- OpenAI 相容（OpenAI / Groq / xAI / OpenRouter）----------
        const clientOptions = { apiKey: rawKey, baseURL: provider.baseURL };
        if (config.apiProvider === 'openrouter') {
            clientOptions.defaultHeaders = {
                'HTTP-Referer': 'http://localhost:3000',
                'Referer': 'http://localhost:3000',
                'X-Title': 'GreenClaw'
            };
        }
        const openai = new OpenAI(clientOptions);

        const tools = [];
        const supportsTools = config.apiProvider !== 'openrouter' && config.apiProvider !== 'xai';
        if (supportsTools && config.allowFileRead) {
            tools.push({
                type: "function",
                function: { name: "read_local_time", description: "獲取電腦當前系統時間" }
            });
        }

        const requestOptions = {
            model: selectedModel,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: message }],
        };
        if (tools.length > 0) requestOptions.tools = tools;

        const response = await openai.chat.completions.create(requestOptions);
        const aiMessage = response.choices[0].message;

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
        // 盡量取出 API 回傳的錯誤訊息（OpenRouter / OpenAI 格式可能不同）
        let apiMsg = error?.message || '';
        if (error?.error) {
            if (typeof error.error === 'string') apiMsg = error.error;
            else if (error.error?.message) apiMsg = error.error.message;
        }
        if (!apiMsg && error?.status) apiMsg = `HTTP ${error.status}`;
        console.error('[GreenClaw] API 錯誤:', apiMsg || error);

        // 403 多為地區限制（OpenRouter 不支援該國家/地區）
        const is403 = String(error?.status) === '403' || /403|country|region|territory|not supported/i.test(apiMsg);
        if (is403) {
            const reply = `❌ 請求被拒：${apiMsg}\n\n💡 若為「Country/region not supported」：你所在地區可能未受該服務支援。可嘗試：\n• 改用 OpenAI 官方 API\n• 使用 VPN 後再試`;
            return res.status(500).json({ reply });
        }

        const reply = `❌ AI 請求失敗：${apiMsg || '請檢查 API Key 與模型是否正確。'}`;
        res.status(500).json({ reply });
    }
});

const PORT = process.env.PORT || 3000;
// 沙盒模式：預設只監聽 127.0.0.1，不暴露給外網。雲端 VM 部署時設 HOST=0.0.0.0
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
    console.log(`\n🦞 GreenClaw 啟動成功！`);
    console.log(`👉 請在瀏覽器打開：http://${HOST === '127.0.0.1' ? 'localhost' : HOST}:${PORT}\n`);
    if (HOST === '127.0.0.1') {
        console.log('🔒 沙盒模式：僅本機可訪問，外網無法連線。\n');
    }
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ 端口 ${PORT} 已被占用，請嘗試使用其他端口或關閉占用該端口的程序。\n`);
    } else {
        console.error(`\n❌ 服務器啟動失敗：${error.message}\n`);
    }
    process.exit(1);
});
