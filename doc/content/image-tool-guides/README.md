# 图片工具指南 / Image tool guides

2026-10-22：为尺寸调整、格式转换、图片拼接各新增中英文一篇，共 6 个页面。Guide 入口仍为 `/guide` 和 `/zh/guide`，文章沿用 `/guides/<slug>` 的已有路径约定。

## 内容与证据

- 正文：`src/lib/guides/tool-guides-en.ts`、`tool-guides-zh.ts`。
- 渲染：`src/components/guides/ToolGuideArticle.tsx`，复用现有 `GuideArticlePage`。
- 三个主题分别聚焦比例锁定与像素计算、透明背景与转换误区、拼接顺序与画布尺寸。
- 图片来自实际工具操作，不是效果图；对应语言的截图位于 `public/guides/<slug>/`。
- `verify-examples.mjs` 生成不含个人信息的 PNG 测试图，操作真实页面并重新解码输出。16 组断言覆盖中英文的锁定比例、取消锁定、50% 缩放、JPG/PNG/WebP 透明区域、横向/纵向拼接。
- `evidence.json` 保存浏览器版本、执行时间与实测结果。尺寸与透明度可复现，截图中文件字节数不作为跨浏览器保证。
- 格式特性参照 [MDN 图片格式指南](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)；具体参数与限制以项目当前工具实现为依据。未使用搜索量、排名或节省比例等未经测量的数据。

复现示例（先启动应用）：

```sh
PICZIP_TEST_URL=http://localhost:3101 node doc/content/image-tool-guides/verify-examples.mjs
```

## 接入与验证

- Guide 列表新增三个入口，目录、工具链接、相关文章链接和语言切换完整。
- 新路由登记到已有语言路由表，由现有 sitemap 逻辑自动收录；未改动原先待提交的 sitemap 或日期配置。
- 每篇包含 Article 与 HowTo 结构化数据、独立 canonical、中英文 alternates、操作步骤、实测表格、截图和三个常见问题。
- `npm run lint`、`npm run build` 通过。
- 既有 SEO 修改按 `/tmp/piczip-before-tools-seo.json` 的 14 项哈希核对，全部保持不变。
- 本次交付范围为新增指南与文案精简，之前未提交的 SEO 修改排除在提交之外。

浏览器检查补充：桌面 Chromium 与 375 px WebKit 检查 Guide 入口和六篇文章的排版、元数据、锚点、截图与语言切换。WebKit 在长页滚动后切换语言时，会报告部分 Next.js `_rsc` 预加载请求的 access-control 警告；诊断同时观察到导航期间的请求取消。文章访问和切换均成功，此类警告单独保留，不作为“控制台零错误”结论。未为此修改共享导航或原先 SEO 配置。

最终页面检查记录：`page-checks.json`，16 项页面/排版检查和 34 个站内 URL 通过；包含上述单独记录的 WebKit 预加载警告。
