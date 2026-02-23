<div align="center">

# 🦞 ClawBox

**你的 0 Code 本地 AI 代理 | Your 0-Code Local AI Agent**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-blue.svg)](https://openai.com/)

**🇹🇼 [中文](#-clawbox) | [🇺🇸 English](#-clawbox-1)**

一個受 OpenClaw 啟發，專為非程式設計師與注重安全性的用戶打造的本地 AI 代理網關。

*An OpenClaw-inspired local AI agent gateway designed for non-programmers and security-conscious users.*

</div>

---

## 📋 目錄 / Table of Contents

- [中文](#-clawbox)
  - [✨ 核心特色](#-核心特色)
  - [🚀 快速開始](#-快速開始)
  - [📖 使用說明](#-使用說明)
  - [⚙️ 配置說明](#️-配置說明)
  - [🛠️ 技術棧](#️-技術棧)
  - [🗺️ 路線圖](#️-路線圖)
  - [🤝 貢獻指南](#-貢獻指南)
  - [📄 授權](#-授權)
- [English](#-clawbox-1)
  - [✨ Core Features](#-core-features)
  - [🚀 Quick Start](#-quick-start)
  - [📖 Usage](#-usage)
  - [⚙️ Configuration](#️-configuration)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🗺️ Roadmap](#️-roadmap)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

---

<a name="clawbox"></a>
## 🦞 ClawBox

**ClawBox** 是一個受 [OpenClaw](https://github.com/psteinroe/openclaw) 啟發的本地 AI 代理網關，專為「非程式設計師」與「注重安全性」的用戶打造。

我們認為，擁有一個強大的本地 AI 助理不應該需要懂終端機指令、Docker 或複雜的 JSON 配置。ClawBox 提供開箱即用的 **Web UI（視覺化控制台）**，並將安全權限交還給用戶。

### ✨ 核心特色

- 🎨 **0 Code 視覺化介面**：告別黑漆漆的終端機，所有 API Key 設定、模型切換都在精美的網頁中完成
- 🛡️ **視覺化權限沙盒**：預設關閉所有本地權限，防止 Prompt Injection 攻擊，點擊開關即可控制 AI 權限
- ⚡ **極簡部署**：無需繁瑣的 `onboard` 流程，只需 `npm start` 即可啟動
- 🔒 **安全優先**：所有敏感配置（API Key）僅存儲在本地，不會上傳到任何伺服器
- 🌐 **跨平台支援**：支援 Windows、macOS、Linux

### 🚀 快速開始

#### 前置需求

- [Node.js](https://nodejs.org/) 18.0 或更高版本
- [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)
- OpenAI API Key（可在 [OpenAI Platform](https://platform.openai.com/api-keys) 取得）

#### 安裝步驟

```bash
# 1. 複製專案
git clone https://github.com/your-username/ClawBox.git
cd ClawBox

# 2. 安裝依賴
npm install

# 3. 啟動 ClawBox
npm start
```

啟動成功後，打開瀏覽器訪問 **http://localhost:3000**，輸入你的 OpenAI API Key 即可開始使用！

### 📖 使用說明

1. **首次設定**
   - 在 Web UI 的「系統設定」面板中輸入你的 OpenAI API Key
   - 選擇需要的權限開關（預設全部關閉）
   - 點擊「儲存設定」

2. **開始對話**
   - 在「代理測試終端」中輸入你的問題或指令
   - AI 會根據你設定的權限來回答問題或執行操作

3. **權限控制**
   - `允許 AI 讀取本地系統資訊`：開啟後，AI 可以獲取系統時間等資訊
   - `允許 AI 執行系統終端機指令`：目前開發中，未來版本將支援
     - ⚠️ **安全提示**：未來實現此功能時，將採用白名單機制和用戶確認機制，防止 Prompt Injection 攻擊

### ⚙️ 配置說明

所有配置都儲存在專案根目錄的 `config.json` 文件中：

```json
{
  "apiKey": "sk-...",
  "allowFileRead": false,
  "allowSystemCmd": false
}
```

**注意**：`config.json` 已加入 `.gitignore`，不會被提交到 Git 倉庫，確保你的 API Key 安全。

**首次運行**：如果 `config.json` 不存在，ClawBox 會自動使用預設設定啟動，你可以在 Web UI 中輸入 API Key。

### 🛠️ 技術棧

- **後端框架**：Express.js
- **AI 模型**：OpenAI GPT-4o-mini
- **前端框架**：原生 HTML + TailwindCSS
- **運行環境**：Node.js

### 🗺️ 路線圖

- [x] Web UI 控制台
- [x] 基礎安全權限開關
- [ ] 掃碼登入 WhatsApp / Telegram 機器人（無需配置 Token）
- [ ] 視覺化工作流（拖拽自定義 AI 技能）
- [ ] 支援本地開源模型（Ollama 整合）
- [ ] 多語言介面支援
- [ ] 插件系統

### 🤝 貢獻指南

我們歡迎任何形式的貢獻！無論是：

- 🐛 修復 Bug
- ✨ 新增功能
- 📝 改進文檔
- 🎨 優化 UI/UX
- 🌐 增加新渠道支援（Discord、Line 等）

**貢獻步驟**：

1. Fork 本專案
2. 創建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

### 📄 授權

本專案採用 [MIT License](LICENSE) 授權。

---

<a name="clawbox-1"></a>
## 🦞 ClawBox

**ClawBox** is an OpenClaw-inspired local AI agent gateway designed for **non-programmers** and **security-conscious** users.

We believe that having a powerful local AI assistant shouldn't require terminal commands, Docker knowledge, or complex JSON configurations. ClawBox provides an out-of-the-box **Web UI (Visual Dashboard)** and puts security permissions back in your hands.

### ✨ Core Features

- 🎨 **0-Code Visual Interface**: Say goodbye to dark terminals. All API Key settings and model switching are done in a beautiful web interface
- 🛡️ **Visual Permission Sandbox**: All local permissions are disabled by default to prevent Prompt Injection attacks. Toggle switches to control AI permissions
- ⚡ **Ultra-Simple Deployment**: No complicated `onboard` process, just `npm start` to launch
- 🔒 **Security First**: All sensitive configurations (API Keys) are stored locally only, never uploaded to any server
- 🌐 **Cross-Platform Support**: Works on Windows, macOS, and Linux

### 🚀 Quick Start

#### Prerequisites

- [Node.js](https://nodejs.org/) 18.0 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- OpenAI API Key (get one at [OpenAI Platform](https://platform.openai.com/api-keys))

#### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ClawBox.git
cd ClawBox

# 2. Install dependencies
npm install

# 3. Start ClawBox
npm start
```

After starting, open your browser and visit **http://localhost:3000**, then enter your OpenAI API Key to get started!

### 📖 Usage

1. **Initial Setup**
   - Enter your OpenAI API Key in the "System Settings" panel in the Web UI
   - Select the permission toggles you need (all disabled by default)
   - Click "Save Settings"

2. **Start Chatting**
   - Enter your questions or commands in the "Agent Test Terminal"
   - AI will respond or perform actions based on your permission settings

3. **Permission Control**
   - `Allow AI to read local system information`: When enabled, AI can access system time and other information
   - `Allow AI to execute system terminal commands`: Currently in development, will be supported in future versions
     - ⚠️ **Security Note**: When this feature is implemented, it will use a whitelist mechanism and user confirmation to prevent Prompt Injection attacks

### ⚙️ Configuration

All configurations are stored in the `config.json` file in the project root:

```json
{
  "apiKey": "sk-...",
  "allowFileRead": false,
  "allowSystemCmd": false
}
```

**Note**: `config.json` is included in `.gitignore` and will not be committed to the Git repository, ensuring your API Key security.

**First Run**: If `config.json` doesn't exist, ClawBox will automatically start with default settings, and you can enter your API Key in the Web UI.

### 🛠️ Tech Stack

- **Backend Framework**: Express.js
- **AI Model**: OpenAI GPT-4o-mini
- **Frontend Framework**: Vanilla HTML + TailwindCSS
- **Runtime**: Node.js

### 🗺️ Roadmap

- [x] Web UI Dashboard
- [x] Basic Security Permission Toggles
- [ ] QR Code Login for WhatsApp / Telegram Bot (No Token Configuration Required)
- [ ] Visual Workflow Builder (Drag-and-Drop Custom AI Skills)
- [ ] Support for Local Open-Source Models (Ollama Integration)
- [ ] Multi-language Interface Support
- [ ] Plugin System

### 🤝 Contributing

We welcome contributions of any kind! Whether it's:

- 🐛 Fixing bugs
- ✨ Adding features
- 📝 Improving documentation
- 🎨 Enhancing UI/UX
- 🌐 Adding new channel support (Discord, Line, etc.)

**Contribution Steps**:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ by the ClawBox Team**

[⬆ Back to Top](#-clawbox)

</div>
