# 首轮压缩可靠性修复交付记录

日期：2026-10-22

## 范围

本轮实施下一阶段规划中的 P0 压缩可靠性任务，保留进入本次任务前已有的 Next 图片设置、链接预取、sitemap 日期与文章修改。未提交 Git、未部署。

## 已完成

- `src/lib/compression/worker-client.ts`：Worker 按需创建；成功、业务失败、error、messageerror、postMessage 失败、初始化失败、超时和主动取消均能结束请求；清理监听器和定时器。活动任务超时为 120 秒，构造参数可配置。
- `src/lib/compression/batch.ts`：批次拥有独立取消状态；取消停止后续任务；移除当前文件终止当前 Worker 后继续其余文件；已移除的排队文件不再处理；旧批次结果不会进入新批次。
- `src/lib/compression/download.ts`：ZIP 文件名去重，包括已有编号与大小写冲突；清除路径分隔符。多个同名输入不会互相覆盖。
- `CompressorApp.tsx`：接入上述逻辑，新增中英文取消操作和取消状态，异常后支持重试；单文件超过 50MB 在解码前明确拒绝；开始重新压缩时清除该项旧结果。
- `package.json` / `package-lock.json`：新增测试命令和固定版本 Playwright 开发依赖；不改变生产依赖。
- `README.md`：补充回归检查、浏览器安装、生产服务器及测试命令。

## 验证

| 检查 | 结果 |
| --- | --- |
| `npm test` | 15 / 15 通过 |
| `npm run test:e2e` | Chromium，7 / 7 通过 |
| `PICZIP_TEST_BROWSER=webkit npm run test:e2e` | WebKit，7 / 7 通过 |
| `npm run lint` | 通过 |
| `npm run build` | 通过，TypeScript 及 44 个静态构建条目完成 |
| `git diff --check` | 通过 |

浏览器检查使用本地生产服务 `http://127.0.0.1:3100`。真实 Wasm 编码、ZIP 下载、解压及输出解码均已执行；同名 ZIP 的两个文件均保留且尺寸正确。正常压缩测试未观察到 POST / PUT / PATCH 上传请求。

故障与慢任务测试在浏览器测试上下文中注入 Worker 行为，用于稳定复现 error、取消及排队竞争；120 秒超时通过缩短阈值的单元测试验证，不逐次等待 120 秒。50 个同名结果的 ZIP 完整性通过实际打包与解压的回归测试验证。

首次构建遇到 Google 字体临时下载错误，重试通过。WebKit 首次启动因缺浏览器文件失败，安装对应浏览器后全部通过。没有为绕过环境问题修改字体或业务配置。

## 验证边界与后续

- WebKit 为 Playwright 浏览器检查，不等于已完成实体 iPhone / Safari 设备验收。
- 50MB 限制减少大文件风险，但低于此限制的图片解码后仍可能占用较多内存；40MP 检查仍在浏览器读取尺寸后执行。
- 原生 `createImageBitmap` 调用本身不可中断；准备阶段取消会阻止之后提交 Worker，但已启动的浏览器解码需自行返回。
- 暂未更改目标大小算法、PNG 无效质量迭代、OffscreenCanvas 回退及手机结果布局；属于后续 P1 迭代。
- 下一步可结合选定界面方向，实现手机结果卡片和明确的目标达成状态，再复测受影响指南。

## 设计交付

三版设计预览位于 `doc/design/2026-10-22/`。它们是使用内置 imagegen 生成的界面效果图，尚未应用为实际页面；图片中的数据是布局示例，不是本次测试测量值。
