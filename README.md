# 每日单词循环

一个使用 React、TypeScript、Vite 与 IndexedDB 构建的纯前端英语单词听写网页。所有核心数据均仅保存在当前浏览器中，无需登录、API Key 或服务器。

## 安装与运行

```bash
npm install
npm run dev
```

生产构建与检查：

```bash
npm run test
npm run typecheck
npm run build
```

## 导入词库

在“数据与设置”中选择 TXT、CSV 或 XLSX 文件。TXT 支持每行 `word` 或 `word<TAB>中文释义`；CSV 使用 `word`（必填）、`meaning`、`phonetic` 三列；XLSX 默认取前三列。导入前会预览，并自动清理空格、忽略空行和无效行、按英文大小写无关去重。可下载 `public/sample-vocabulary.csv` 作为模板。

## 学习规则

每天按本地日期创建独立学习记录，未掌握且未暂停的单词会进入任务。先浏览记忆，再进入听音拼写；空格可重播，Enter 可提交。单词在连续三轮答对后标记为已掌握；任一次错误会清零连续次数。每日记录、学习位置和答题历史会保存在 IndexedDB，刷新后可继续。

## 数据备份

“数据与设置”中可以导出完整 JSON 备份、恢复备份（会二次确认覆盖），或清除全部本地数据（双重确认）。浏览器不支持英文语音时，页面仍可学习但不会播放音频。

## 部署到 GitHub Pages

此仓库名为 `word-memory-app`，Vite 已配置站点子路径 `/word-memory-app/`。合并后，GitHub Actions 会在 `work` 分支推送时构建并部署；访问地址通常为：

```
https://<你的 GitHub 用户名或组织名>.github.io/word-memory-app/
```

首次启用时，请在 GitHub 仓库中依次打开 **Settings → Pages**，在 **Build and deployment** 的 **Source** 选择 **GitHub Actions**。然后进入 **Actions** 页面确认“Deploy GitHub Pages”工作流完成即可访问。

本应用没有前端 URL 路由，所有页面都由单一应用状态切换，因此刷新 GitHub Pages 地址不会产生前端路由 404。
