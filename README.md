# 2026 CNY 上海到福建自驾计划网站

一个可视化旅行计划 Web 应用，适合春节自驾场景。支持：

- 每日行程时间块展示
- 路线进度动画（上海→福建）
- 按天切换计划详情与备选方案
- 可构建为纯静态资源（`dist/`）部署到互联网

## 技术架构

- `Vite`（构建工具）
- 原生 `HTML + CSS + JavaScript`（零运行时框架，加载快，部署简单）
- 数据驱动：`src/plan.js` 中维护所有行程与清单

## 本地运行

```bash
pnpm install
pnpm dev
```

## 生产构建

```bash
pnpm build
```

构建后输出目录：`dist/`

## 交互说明（全屏切页）

- `↑ / ↓`：上一页 / 下一页
- `PageUp / PageDown / Space`：切页
- `Home / End`：跳到首页 / 最后一页
- 鼠标滚轮与触控滑动同样支持切页

## 静态部署

可直接部署到以下平台：

- Netlify: 新建站点，Build command 填 `pnpm build`，Publish directory 填 `dist`
- Vercel: Framework 选 `Vite`，Output directory 为 `dist`
- GitHub Pages: 将 `dist/` 内容发布到 Pages 分支或使用 Actions 自动发布

## 行程数据修改

编辑 `src/plan.js`：

- `days`：每日日期、驾驶里程、行程时间块、吃什么、备选计划
- `points`：路线图上的城市节点（用于动画路径）
- `packingChecklist`：出行清单

## 说明

当前默认计划窗口为 **2026-02-14 至 2026-02-22**，春节为 **2026-02-17**（除夕为 **2026-02-16**）。

总览页的真实地图使用在线底图（Leaflet + OpenStreetMap），部署后需要可访问互联网。
