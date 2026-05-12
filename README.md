# Gorilla Gun Survivor (Web Prototype)

3D roguelike survivor — 玩家是一隻無腿、用手爬行的大猩猩，邊跑邊射。Three.js + TypeScript + Vite。

## 線上試玩

部署到 GitHub Pages 後，網址為：
`https://<your-github-username>.github.io/<repo-name>/`

## 本地開發

```bash
npm install
npm run dev
# 開啟 http://127.0.0.1:5173/
```

## Build

```bash
npm run build      # 輸出到 dist/
npm run preview    # 在 5173 用 production build 預覽
```

## 部署

推到 `main` 分支會自動透過 `.github/workflows/deploy.yml` 部署到 GitHub Pages。

第一次推上去後，到 GitHub repo 的 **Settings → Pages → Build and deployment → Source = GitHub Actions**。

## 控制

- WASD：移動
- 滑鼠：瞄準
- 左鍵：射擊
- ESC：暫停
- Tab（按住）：查看已撿升級卡
