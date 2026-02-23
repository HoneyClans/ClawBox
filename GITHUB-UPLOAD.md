# 📤 上傳至 GitHub 成為最新開源版本

## ✅ 應該上傳的檔案與資料夾

上傳以下內容即可，**不要**上傳 `node_modules` 或任何含 API Key 的檔案：

```
GreenClaw/
├── .gitignore          ← 必須有，用來排除敏感檔
├── README.md
├── CHANGELOG.md
├── DEPLOY-SAFE.md
├── TROUBLESHOOTING.md
├── GITHUB-UPLOAD.md    ← 本說明
├── package.json
├── package-lock.json
├── server.js
├── 啟動方法.txt
├── public/
│   └── index.html
└── assets/
    ├── GreenClaw_logo.png   ← GitHub README 顯示的 logo
    └── README.md
```

**注意**：若專案根目錄有重複的 `GreenClaw_logo.png`，只需保留 **assets/GreenClaw_logo.png** 供 README 引用即可；根目錄那張可不上傳或刪除，避免重複。

---

## ❌ 絕對不可上傳（資安與權限風險）

| 檔案/資料夾 | 風險說明 |
|-------------|----------|
| **config.json** | 內含 API Key（OpenAI / OpenRouter 等），上傳會外洩金鑰、被盜用。 |
| **.env**、**.env.local** | 若用來存 Key 或密碼，同上。 |
| **node_modules/** | 依賴由他人自行 `npm install` 即可，體積大且無需版本控制。 |

上述已寫入 **.gitignore**，只要你先加入並提交 `.gitignore`，再用 `git add` 時通常不會誤加入。上傳前請務必執行：

```bash
git status
```

確認 **config.json**、**.env**、**node_modules** 沒有出現在 "Changes to be committed" 裡。

---

## 🔒 個人電腦權限與外洩風險

- **預設只監聽 127.0.0.1**：未設 `HOST=0.0.0.0` 時，外網無法連線，不會暴露你本機。
- **API Key 只存本地**：GreenClaw 不會把 Key 上傳到任何第三方；只要不把 `config.json` 推上 GitHub 就安全。
- **雲端部署**：若在 VM 上跑並設 `HOST=0.0.0.0`，應在 VM 內單獨設定 API Key，不要用本機的 config 上傳。

---

## 建議上傳前檢查清單

- [ ] 已建立或更新 **.gitignore**（含 `config.json`、`.env`、`node_modules`）
- [ ] `git status` 確認沒有 config.json / .env / node_modules 被加入
- [ ] 路徑文件中無個人路徑（如 `/Users/你的名字/`）— 已改為通用路徑或範例
- [ ] README 的 clone 網址為你的 repo（例如 `https://github.com/HoneyClans/GreenClaw.git`）

完成後即可 push 到 GitHub 作為最新開源版本。
