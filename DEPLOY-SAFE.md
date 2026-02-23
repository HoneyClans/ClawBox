# 🔒 ClawBox 安全運行與雲端部署指南

## 沙盒權限說明

- **本機測試（最安全）**：預設只監聽 `127.0.0.1`，僅本機可訪問，外網無法連線。
- **雲端 VM 部署**：在伺服器上設 `HOST=0.0.0.0` 才對外提供服務。

## 本機安全測試（建議先用這個）

```bash
# 方式一：直接 npm start（已預設 127.0.0.1）
npm start

# 方式二：明確沙盒模式（僅本機）
npm run start:safe
```

- 不要在本機建立或填入真實的 `config.json` / API Key，僅在 Web UI 測試輸入即可。
- 確認接通後，再到雲端 VM 部署並在 VM 內設定 API Key。

## 雲端虛擬機部署（防止個人電腦資料外洩）

在雲端 VM（如 AWS EC2、GCP VM、Azure VM、DigitalOcean 等）上執行：

```bash
# 1. 克隆專案
git clone https://github.com/HoneyClans/ClawBox.git
cd ClawBox

# 2. 安裝依賴
npm install

# 3. 在 VM 上對外開放時使用（僅在雲端 VM 執行時使用）
HOST=0.0.0.0 PORT=3000 npm start
```

- 在 VM 內用瀏覽器或 SSH 埠轉發訪問 `http://<VM-IP>:3000`，在 Web UI 中設定 API Key。
- 這樣 API Key 與請求只存在於 VM，不會經過你個人電腦，降低私人資料與權限外洩風險。

## 風險管理要點

1. **本機測試**：只用 `npm start` 或 `npm run start:safe`，不綁定 0.0.0.0，不暴露到外網。
2. **不在本機存真實 Key**：本機僅做「能否啟動、能否打開 Web UI」的接通測試。
3. **正式使用在 VM**：在雲端 VM 上設 `HOST=0.0.0.0` 並在 VM 內設定 API Key，避免個人電腦權限與資料外洩。
