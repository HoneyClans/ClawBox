# 🔧 GreenClaw 常見問題排除

## 1. 終端機出現 `EPERM: operation not permitted, uv_cwd`

**原因**：在部分路徑下（例如「下載」、含空格或中文的資料夾）執行 `npm start` 時，npm 讀取當前目錄可能被系統權限阻擋。

**解決方法（任選其一）：**

### 方法 A：直接用 Node 啟動（推薦）

唔使經 npm，直接執行：

```bash
cd /path/to/your/GreenClaw
node server.js
```
（請將 `/path/to/your/GreenClaw` 改為你的專案實際路徑）

效果同 `npm start` 一樣，只係唔會觸發 npm 嘅目錄權限檢查。

### 方法 B：將專案搬到簡單路徑

將整個 `GreenClaw` 資料夾複製到冇空格、冇中文嘅路徑，例如：

```bash
cp -R /path/to/your/GreenClaw ~/GreenClaw
cd ~/GreenClaw
npm install
npm start
```
（請將 `/path/to/your/GreenClaw` 改為你的專案實際路徑）

之後可以喺 `~/GreenClaw` 用 `npm start` 正常啟動。

### 方法 C：用 Cursor / VS Code 內建終端

喺 Cursor 或 VS Code 入面開終端（Terminal → New Terminal），確保當前目錄係 GreenClaw 專案根目錄，然後執行：

```bash
npm start
```

有時 IDE 終端嘅工作目錄權限同系統終端唔同，可以避開 EPERM。

---

## 2. 聊天時出現「HTTP error! status: 500」

**可能原因**：API Key 錯誤、模型唔支援、或 OpenRouter/Groq 額度用盡。

**點做**：

1. **睇清楚錯誤內容**  
   新版本會喺對話框顯示後端回傳嘅具體錯誤（例如 Invalid API Key、model not found）。根據嗰句訊息排查。

2. **OpenRouter 使用者**  
   - 去 [openrouter.ai](https://openrouter.ai) 確認 Key 有效。  
   - 「選擇模型」揀有 **:free** 嘅型號（例如 `meta-llama/llama-3.1-8b-instruct:free`）。  
   - 唔好勾選「允許讀取系統資訊」（用 OpenRouter 時唔需要）。

3. **重新儲存設定**  
   改完 API Key 或模型後，一定要再撳一次「儲存設定」，再試發送訊息。

4. **睇伺服器終端**  
   執行 `node server.js` 或 `npm start` 嘅終端會印出 `[GreenClaw] API 錯誤: ...`，嗰度有更詳細嘅錯誤原因。

---

## 3. 瀏覽器 Console 見到 ethereum / chunk-inject 錯誤

嗰啲多數係**瀏覽器擴充功能**（例如錢包）注入嘅程式引起，同 GreenClaw 無關，可以忽略。  
若想畫面乾淨，可以用無痕模式開 http://localhost:3000 試（記得唔好開會改頁面嘅擴充功能）。

---

如有其他問題，可以開 GitHub Issue 或查 [DEPLOY-SAFE.md](DEPLOY-SAFE.md) 嘅安全與部署說明。
