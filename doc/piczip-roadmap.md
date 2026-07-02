# PicZip 本地图片压缩工具站落地方案

日期：2026-07-01

## 1. 项目判断

PicZip 可以做，而且技术路径清晰。核心定位应该是：

> 一个在浏览器本地完成图片压缩、转换和批量处理的隐私优先工具站。

这个方向的机会不在“图片压缩”这个大词本身，而在以下细分需求：

- 用户不想上传身份证、证件照、合同截图、产品图、设计稿。
- 用户需要把图片压缩到指定大小，例如 20KB、100KB、200KB、500KB。
- 用户需要批量压缩并一次下载。
- 用户需要在手机上快速处理报名照、电商图、社媒图。
- 用户需要更清楚地看到压缩前后体积、画质和尺寸变化。

结论：

- 值得做，但不要只做一个单页工具。
- 第一阶段目标不是挑战 TinyPNG、iLoveIMG、Squoosh 的主词，而是用“本地处理 + 指定大小 + 场景页面”拿长尾流量。
- 产品第一版必须足够快、稳定、可信；SEO 页面必须直接嵌入可用工具，而不是只写文章。

## 2. 成功目标

### 0-1 个月

- 上线可用 MVP。
- 使用 Wasm 编码器完成 JPG、PNG、WebP 基础压缩。
- 支持批量上传、质量调节、指定目标大小、ZIP 下载。
- 上线英文默认首页和 10 个核心英文 SEO 页面，同时保留中文多语言基础。
- 接入 Google Search Console、Google Analytics 或 Plausible。

### 1-3 个月

- 完成 30-50 个长尾页面。
- 支持 PWA 离线访问。
- 优化移动端体验。
- 开始拿到长尾关键词曝光。
- 月自然流量目标：1,000-5,000 UV。

### 3-6 个月

- 页面矩阵扩展到 80-120 个。
- 针对欧美 Google 市场扩展英文页面，中文作为辅助语言。
- 增加 WebP 转换、EXIF 清理、尺寸调整、压缩前后对比。
- 月自然流量目标：3,000-20,000 UV。

### 6-12 个月

- 强化英文长尾、Google 搜索表现和工具矩阵。
- 扩展图片裁剪、图片拼接、格式转换、尺寸调整等工具。
- 做 Chrome 插件或桌面 PWA 分发。
- 月自然流量目标：20,000-100,000 UV。

## 3. 产品范围

### MVP 必做功能

1. 本地上传
   - 点击选择图片。
   - 拖拽上传。
   - 多文件上传。
   - 不支持 URL 图片压缩，避免跨域 Canvas 污染。

2. 压缩设置
   - 输出格式：Auto、JPG、PNG、WebP。
   - 图片质量：0-100 滑杆。
   - 最大宽度 / 高度。
   - 目标大小：例如 100KB、200KB、自定义 KB。

3. 结果展示
   - 原始大小。
   - 压缩后大小。
   - 节省比例。
   - 输出尺寸。
   - 单张下载。
   - 全部 ZIP 下载。

4. 隐私说明
   - 明确写出“图片只在当前浏览器内处理，不上传服务器”。
   - 提供“如何验证没有上传”的说明：打开浏览器 DevTools Network 面板查看。

5. 基础 SEO
   - 每个工具页有唯一 title、description、H1。
   - 首页嵌入压缩主工具，长尾页嵌入对应工具组件。
   - sitemap.xml、robots.txt、canonical、Open Graph。
   - 首期必须有 FAQ、Guide、Terms、Privacy、About 页面。
   - FAQ 和 Guide 要解决真实搜索问题，不做空泛文章。

### MVP 不做功能

- 不做账号系统。
- 不做云端历史记录。
- 不做上传 URL 压缩。
- 不做服务端压缩。
- 不做 AI 修图。
- 不做复杂编辑器。
- 不做 HEIC、RAW、GIF 动图高级处理。

这些功能会拖慢上线，并且不是验证 SEO 和工具价值的必要条件。

## 4. 技术架构

### 推荐技术栈

首选：

- 框架：Next.js App Router。
- 部署：Vercel。
- 样式：Tailwind CSS。
- 压缩：MVP 直接使用 Wasm 编码器，Canvas 只做预览、尺寸处理和兜底。
- 并发：Web Worker。
- 打包下载：fflate 或 JSZip。
- 图片元数据：exifr。
- 监控：Google Search Console、PageSpeed Insights、Vercel Analytics、Plausible 或 GA4。

既然部署目标是 Vercel，不建议首期再纠结 Astro。Astro 适合纯内容站，但 PicZip 是“SEO 页面 + 强交互工具 + Wasm Worker + 后续工具矩阵”，在 Vercel 上用 Next.js App Router 更稳。

建议选择 Next.js，原因：

- Vercel 对 Next.js 的构建、缓存、预览部署、图片和路由支持最成熟。
- 方便做多语言和动态 SEO 页面。
- 方便生成 sitemap。
- React 生态更适合复杂工具组件。
- 后续接广告、会员、API、插件落地页更自然。

### Vercel 部署原则

- 不使用服务端图片上传和压缩，避免违背“本地处理”的定位，也避免 Vercel Function 文件体积、运行时长和带宽成本。
- SEO 页面、Guide、FAQ、Privacy、Terms 尽量静态生成。
- 压缩工具组件使用 Client Component，并尽量下沉到 `components/compressor/CompressorApp.tsx`，不要让整页都变成 client。
- Wasm 文件放在 `public/wasm/` 或通过稳定的静态资源路径输出，使用按需加载。
- Web Worker 单独打包，避免阻塞主线程。
- Vercel Preview Deployments 用于每次改版预览，Production 只从主分支发布。
- 如果后续使用 Wasm threads / SharedArrayBuffer，再配置 COOP/COEP headers；首期优先不用 threads，避免影响广告、统计脚本和第三方资源。
- `next.config.ts` 需要配置必要的 headers、sitemap 生成、静态资源缓存策略。

### 核心模块

```txt
src/
  app/
    page.tsx
    compress-jpg/page.tsx
    compress-png/page.tsx
    compress-webp/page.tsx
    compress-to-100kb/page.tsx
    compress-to-200kb/page.tsx
    compress-image-without-upload/page.tsx
    local-image-compressor/page.tsx
    guide/page.tsx
    faq/page.tsx
    privacy/page.tsx
    terms/page.tsx
  components/
    layout/
      ToolNavigation.tsx
    compressor/
      CompressorApp.tsx
      FileDropzone.tsx
      CompressionSettings.tsx
      ResultTable.tsx
      BeforeAfterPreview.tsx
    tools/
      ToolShell.tsx
      ToolCard.tsx
  lib/
    compression/
      types.ts
      engine-registry.ts
      mozjpeg-wasm-engine.ts
      webp-wasm-engine.ts
      png-wasm-engine.ts
      canvas-fallback-engine.ts
      target-size.ts
      worker-client.ts
      zip.ts
    seo/
      metadata.ts
      schema.ts
  workers/
    compression.worker.ts
  next.config.ts
  public/
    wasm/
    robots.txt
```

### 数据流

```txt
用户选择文件
  -> File / Blob
  -> 主线程生成列表和预览 URL
  -> Web Worker 读取 ArrayBuffer
  -> 解码图片
  -> 修正 EXIF orientation
  -> 按设置 resize
  -> 调用 Wasm 编码器 compress
  -> 必要时降级到 Canvas fallback
  -> 返回压缩后的 Blob、尺寸、大小
  -> 主线程展示结果
  -> 用户下载单张或 ZIP
```

### 隐私边界

- 不把图片发往服务器。
- 不把图片写入 IndexedDB。
- 不把图片写入 Cache Storage。
- 不在 analytics 里记录文件名、图片内容、图片 hash。
- 只统计事件级数据，例如 `compress_started`、`compress_completed`、`format=jpg`、`file_count_bucket=2-5`。

### 浏览器安全限制

需要提前规避：

- 文件读取必须由用户主动选择或拖拽触发。
- 浏览器不能静默写回原文件，只能下载或让用户选择保存。
- 批量下载多个文件可能被拦，默认用 ZIP。
- 远程 URL 图片会遇到 CORS 和 tainted canvas，MVP 不做。
- Safari、iOS Safari 对 Web Worker、OffscreenCanvas、Wasm 性能要单独测试。
- 大图解码后的内存会远大于文件体积，必须限制像素数和批量数量。

建议 MVP 限制：

- 单张最大 40MP。
- 单张原文件建议 50MB 以内。
- 一次最多 50 张。
- 移动端一次建议 20 张以内。

## 5. Wasm 策略

### Wasm 值不值得用？

值得用，而且 PicZip 可以从第一版就使用 Wasm。原因是这个站的核心差异点是“本地、隐私、压缩质量好”，Wasm 能让这个定位更可信，也避免后期从 Canvas 方案迁移到专业编码器时重写核心逻辑。

Wasm 的价值：

- 可以在浏览器里运行 MozJPEG、libwebp、OxiPNG、AVIF 等更专业的编码器。
- 压缩质量和压缩率通常优于简单 Canvas 输出。
- 非常契合“本地处理、不上传服务器”的产品定位。
- 后续可以作为和普通工具站拉开差距的技术卖点。
- 从第一版开始使用统一引擎接口，后续增加裁剪、拼接、格式转换时也能复用解码、编码、Worker、下载和隐私能力。

Wasm 的成本：

- 首屏包体变大。
- 编码器初始化慢。
- 移动端性能不稳定。
- AVIF 编码可能非常慢。
- Web Worker、内存释放、任务取消、进度反馈更复杂。
- 如果使用 Wasm threads，需要 COOP/COEP 跨源隔离，可能影响广告、统计和第三方脚本。

### 前期用不用？

建议：

- MVP 直接使用 Wasm。
- `CompressionEngine` 从第一天就作为核心接口。
- 首屏不立即加载所有 Wasm 包，用户选择文件或进入具体工具时再按需加载。
- Canvas 作为 fallback，而不是主压缩方案。
- 第一版先接 MozJPEG 和 WebP Wasm；PNG 可以先用浏览器编码兜底，再接 OxiPNG 或 pngquant Wasm。
- AVIF 放到后续高级模式，不进入第一版默认流程。

### 推荐演进路线

第一阶段：Wasm MVP

- 目标：上线时就具备专业压缩质量，同时控制首屏性能。
- 支持 JPG、PNG、WebP 基础压缩。
- JPG 优先使用 MozJPEG Wasm。
- WebP 优先使用 libwebp Wasm。
- PNG 第一版可先用 Canvas fallback，透明 PNG 保持正确，再补 Wasm 优化。
- 用 Web Worker 避免 UI 卡顿。
- 所有 Wasm 编码器按需加载。

第二阶段：PNG Wasm 和压缩效果优化

- 接入 OxiPNG 或 pngquant Wasm。
- 增加快速模式、均衡模式、极限压缩模式。
- 建立样本图片集，持续比较压缩率、耗时、画质。

第三阶段：图片工具矩阵复用

- 图片裁剪复用解码、预览、下载、EXIF 处理。
- 图片拼接复用 Canvas 合成、Wasm 输出编码、ZIP 下载。
- 格式转换复用同一套输出格式引擎。

第四阶段：AVIF

- 只作为高级选项。
- 明确提示“压缩更慢，但体积可能更小”。

### 接口设计

```ts
export interface CompressionInput {
  file: File;
  outputFormat: "auto" | "jpeg" | "png" | "webp" | "avif";
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  targetBytes?: number;
  stripMetadata: boolean;
}

export interface CompressionOutput {
  blob: Blob;
  outputFormat: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  durationMs: number;
}

export interface CompressionEngine {
  id: string;
  label: string;
  supports(input: CompressionInput): boolean;
  load(): Promise<void>;
  compress(input: CompressionInput): Promise<CompressionOutput>;
}
```

第一版就使用引擎注册表：

```txt
engineRegistry
mozjpegWasmEngine
webpWasmEngine
pngWasmEngine
canvasFallbackEngine
avifWasmEngine
```

选择策略：

```txt
用户选择输出格式
  -> engineRegistry 查找最佳 Wasm engine
  -> 如果 Wasm 不支持或加载失败，降级 canvasFallbackEngine
  -> 如果目标大小未达成，执行质量和尺寸迭代
  -> 返回最接近目标的结果
```

### Wasm 首屏性能原则

- 首页首屏只加载 UI、上传组件和轻量预览逻辑。
- Wasm 文件在用户选择图片、切换格式或进入工具页后再加载。
- 编码器单独拆包，不要把 MozJPEG、WebP、PNG、AVIF 全塞进首屏 bundle。
- Service Worker 可以缓存 Wasm 文件，但不能缓存用户图片。
- 如果 Wasm 初始化超过 2 秒，显示明确进度状态。
- 移动端默认较低并发，避免多个 Wasm 任务同时抢内存。

## 6. 开发路线

### Phase 1：项目搭建

任务：

- 初始化 Next.js + TypeScript。
- 配置 ESLint、Prettier、Tailwind。
- 创建基础页面布局。
- 配置 SEO metadata 工具。
- 配置 sitemap 和 robots。
- 配置 Vercel 项目和 Preview Deployment。
- 配置 Wasm 静态资源路径和缓存策略。

验收：

- 首页可访问。
- Lighthouse 基础分数正常。
- 移动端布局不破。
- Vercel Preview URL 可正常访问。

### Phase 2：压缩核心

任务：

- 实现文件上传和拖拽。
- 实现图片类型校验。
- 实现 Wasm 引擎注册表。
- 接入 MozJPEG Wasm。
- 接入 WebP Wasm。
- 实现 Canvas fallback。
- 实现目标大小迭代压缩。
- 实现 Web Worker。
- 实现任务取消。
- 实现错误处理。

目标大小算法：

```txt
输入 targetBytes
  -> 先按最大尺寸限制 resize
  -> 选择最佳 Wasm engine
  -> 用 quality=0.82 编码
  -> 如果过大，二分降低 quality
  -> 如果 quality 低于阈值仍过大，继续降低尺寸
  -> 最多迭代 8-12 次
  -> 返回最接近且不超过目标大小的结果
```

验收：

- 5MB JPG 能压缩到 200KB 左右。
- 10 张图片批量压缩不卡主线程。
- 用户能取消正在执行的任务。
- 错误文件不会中断整个批次。
- Wasm 加载失败时可以降级到 Canvas fallback。

### Phase 3：结果体验

任务：

- 结果表格。
- 压缩前后对比。
- 单张下载。
- ZIP 下载。
- 压缩历史只保存在内存。
- 关闭页面后不保留图片。

验收：

- 批量 50 张能 ZIP 下载。
- 下载文件名可读，例如 `photo-piczip.jpg`。
- Blob URL 在不需要时会 revoke。

### Phase 4：PWA 和隐私可信度

任务：

- 添加 manifest。
- 添加 Service Worker。
- 缓存静态资源、字体、Wasm 文件。
- 不缓存用户图片。
- 添加隐私说明页。
- 添加“本地处理如何验证”页面。

验收：

- 首次打开后可离线使用基础工具。
- Network 面板中压缩过程没有图片上传请求。
- 隐私页清楚说明数据边界。

### Phase 5：更多图片工具

任务：

- 新增图片裁剪工具页。
- 新增图片拼接工具页。
- 新增图片尺寸调整工具页。
- 新增格式转换工具页。
- 复用现有 Wasm 编码、Worker、下载、隐私说明和 SEO 模板。
- 记录匿名性能指标：耗时、压缩率、格式，不记录图片内容。

验收：

- 新工具不改变首页核心 H1、title、canonical 和首屏压缩入口。
- 新工具通过首页工具区、导航和相关工具内链进入。
- 移动端慢设备有降级逻辑。

## 7. SEO 策略

### 总原则

不要用文章页骗流量。每个 SEO 页面都应该提供可直接使用的工具，并且页面内容围绕该页面的具体搜索意图展开。

核心策略：

- 英文默认，Google 优先。默认首页 `/` 使用英文内容，中文放在 `/zh/`。
- 首页首期定位为“本地图片压缩主入口”，信息架构保留未来扩展空间，但 UI 不提前展示未上线工具。
- 格式词做工具页。
- 指定大小词做批量页面。
- 场景词做垂直页面。
- 图片裁剪、图片拼接、尺寸调整、格式转换未来分别做独立工具页；首期不上线时不要在首页展示入口。
- 多语言使用独立目录，不要中英混排。英文默认不需要 `/en/` 前缀；中文使用 `/zh/`。

### 首页长期结构和 SEO 稳定性

首页一开始就按可扩展信息架构设计，但首期 UI 只展示图片压缩能力。这样后期新增图片拼接、图片裁剪、图片尺寸调整时，不需要重写首页的核心语义，也不需要改 URL；但在工具未上线前，不提前放入口，避免用户点击空功能，也避免 Google 看到薄页面。

首页固定不变的部分：

- URL 永远保持 `/`。
- H1 首期保持围绕 `PicZip` 和 `image compressor`，不要频繁更换。
- Title 可以从 `PicZip - Private Image Compressor` 演进为 `PicZip - Private Image Compressor and Image Tools`，但不要每次新增工具都改。
- 首屏继续保留压缩工具入口，因为早期主要排名资产会来自图片压缩。
- 首页 canonical 永远指向 `/`。
- 首页保留“本地处理、不上传服务器”的核心卖点。

首页首期展示这些区块：

```txt
H1：PicZip - Private Image Compressor
首屏：图片压缩工具
热门任务区：Compress to 100KB, Compress JPG, Batch Compress
隐私说明：All tools run locally in your browser
使用场景：forms, websites, email, social media, ecommerce
Guide 入口：How to compress images locally
FAQ
页脚：Guide, FAQ, Privacy, Terms, Sitemap
```

后期新增工具时只做增量更新：

- 在工具上线后增加工具入口卡片。
- 在相关工具内链中增加链接。
- 新增独立工具页，例如 `/crop-image`、`/stitch-images`。
- 不删除首页已有压缩内容。
- 不大幅改变首屏 DOM 结构。
- 不把首页 H1 从压缩突然改成裁剪或拼接。

这样可以保护首页已经积累的排名信号，同时让 Google 逐步理解 PicZip 是一个更大的图片工具站。

### URL 结构

英文默认：

```txt
/
/compress-jpg
/compress-png
/compress-webp
/compress-image-to-20kb
/compress-image-to-50kb
/compress-image-to-100kb
/compress-image-to-200kb
/compress-image-to-500kb
/photo-compressor
/passport-photo-compressor
/batch-image-compressor
/compress-image-without-upload
/local-image-compressor
/offline-image-compressor
/faq
/guide
/privacy
/terms
```

中文：

```txt
/zh/
/zh/compress-jpg
/zh/compress-png
/zh/compress-webp
/zh/compress-to-50kb
/zh/compress-to-100kb
/zh/compress-to-200kb
/zh/image-compress-no-upload
/zh/local-image-compress
/zh/batch-image-compress
/zh/faq
/zh/guide
/zh/privacy
/zh/terms
```

未来扩展 URL，等对应工具真正上线后再创建：

```txt
/crop-image
/stitch-images
/resize-image
/convert-image
/zh/crop-image
/zh/stitch-images
/zh/resize-image
/zh/convert-image
```

### 第一批关键词

英文优先：

| Page | Primary keyword | Intent |
|---|---|---|
| `/` | image compressor | Tool |
| `/compress-image-without-upload` | compress image without upload | Privacy |
| `/local-image-compressor` | local image compressor | Privacy |
| `/offline-image-compressor` | offline image compressor | PWA |
| `/compress-image-to-50kb` | compress image to 50kb | Exact size |
| `/compress-image-to-100kb` | compress image to 100kb | Exact size |
| `/compress-image-to-200kb` | compress image to 200kb | Exact size |
| `/batch-image-compressor` | batch image compressor | Batch |
| `/compress-jpg` | compress jpg | Format |
| `/compress-png` | compress png | Format |
| `/compress-webp` | compress webp | Format |
| `/passport-photo-compressor` | passport photo compressor | Scenario |
| `/guide` | how to compress images | Guide |
| `/faq` | image compression faq | Support |

中文辅助：

| 页面 | 主关键词 | 搜索意图 |
|---|---|---|
| `/zh/` | 在线图片压缩 | 找工具 |
| `/zh/image-compress-no-upload` | 图片压缩 不上传 | 隐私工具 |
| `/zh/local-image-compress` | 本地图片压缩 | 隐私工具 |
| `/zh/compress-to-100kb` | 图片压缩到100kb | 指定大小 |
| `/zh/compress-to-200kb` | 图片压缩到200k | 指定大小 |
| `/zh/batch-image-compress` | 批量图片压缩 | 批处理 |
| `/zh/guide` | 图片压缩教程 | Guide |
| `/zh/faq` | 图片压缩常见问题 | Support |

### 页面模板

每个 SEO 工具页结构：

```txt
H1：Compress Image to 100KB
首屏：工具组件
简短说明：1-2 段，直接回答这个页面能做什么
使用步骤：3 步
适用场景：表单、报名、网站上传、邮件附件
压缩建议：尺寸、格式、质量怎么选
隐私说明：图片不上传服务器
FAQ：6-8 个问题
相关工具内链：100KB、200KB、JPG、PNG、本地压缩
```

首页结构：

```txt
H1：PicZip - Private Image Compressor
首屏：工具组件
核心卖点：Local, Private, Batch, Exact Size
格式支持：JPG, PNG, WebP
场景入口：100KB, 200KB, No Upload, Batch
Guide 入口
隐私说明
FAQ
页脚链接：Guide, FAQ, Privacy, Terms, Sitemap
```

### On-page 要求

- Title 控制在 50-60 字符左右。
- Meta description 控制在 150-160 字符左右。
- 每页一个 H1。
- 主关键词放在 title、H1、URL、首段。
- 每页 FAQ 不能完全重复。
- 每页 canonical 指向自身。
- 英文和中文页面使用 hreflang。

### Schema

建议使用：

- `SoftwareApplication`：首页和核心工具页。
- `FAQPage`：FAQ 内容可见时使用。
- `HowTo`：指定大小页面可使用。
- `BreadcrumbList`：所有非首页页面。

不要使用虚假评分、虚假评论、不可见 FAQ。

### 内容发布节奏

第 1 周：

- 英文默认首页。
- 10 个核心英文工具页。
- 隐私页。
- Terms 页面。
- FAQ 页面。
- Guide 页面。
- 关于页。

第 2-4 周：

- 每周 10-15 个长尾页面。
- 优先英文指定大小：20KB、50KB、100KB、150KB、200KB、300KB、500KB、1MB。
- 再做格式组合：JPG to 100KB、PNG to 200KB、WebP compressor。

第 2-3 个月：

- 中文页面矩阵作为辅助入口。
- 场景页面：passport photo、application form、email attachment、website image optimization。
- 对比页面：TinyPNG alternative、Squoosh alternative、browser-based vs upload-based。

### 外链和分发

可做：

- Product Hunt 发布。
- Hacker News / Reddit 以技术透明和隐私为角度分享。
- GitHub 开源核心压缩组件或完整项目。
- 写技术文章：How PicZip compresses images locally in the browser。
- 做 Chrome 插件引流到网站。
- 在设计师、前端、独立开发者社区分享。

不要做：

- 买垃圾外链。
- 伪造评论。
- 批量 AI 生成低质文章。
- 做和工具无关的流量词。

## 8. 商业化路线

### 短期

- 不要第一天就堆广告。
- 先保证工具体验和索引。
- 当月 UV 超过 10,000 后再测试 AdSense。

### 中期

可加入：

- AdSense：工具页底部、结果页附近、FAQ 前后。
- Affiliate：图片 CDN、建站工具、设计工具、压缩 API、存储服务。
- 赞助位：面向开发者工具、设计工具。

### 长期

可做付费：

- 无广告版本。
- 更大批量处理。
- 高级编码模式，例如 AVIF、极限压缩、更高并发。
- 离线桌面版。
- Chrome 插件高级版。
- 团队版：本地处理 + 统一配置 + 不上传合规说明。

## 9. 指标体系

### 产品指标

- 上传开始率。
- 压缩完成率。
- 压缩失败率。
- 平均压缩耗时。
- 平均压缩率。
- ZIP 下载率。
- 移动端失败率。

### SEO 指标

- GSC impressions。
- GSC clicks。
- CTR。
- 平均排名。
- 被索引页面数。
- 每页自然入口 UV。
- 页面加载速度。
- Core Web Vitals。

### 商业指标

- RPM。
- 每 1000 UV 收入。
- 广告点击率。
- Affiliate 点击率。
- Pro 转化率。

## 10. 风险和应对

### 风险：大词竞争太强

应对：

- 不从大词开始。
- 先做指定大小、隐私、本地处理、场景词。
- 每个页面必须有工具能力，而不是纯内容。

### 风险：压缩效果不如 TinyPNG

应对：

- MVP 不主打“最强压缩”，主打“本地、不上传、指定大小、批量”。
- MVP 直接使用 MozJPEG / WebP Wasm 提升基础压缩质量。
- 给用户快速模式和高质量模式。

### 风险：移动端卡顿

应对：

- Worker。
- 限制并发。
- 限制最大像素。
- 移动端默认较低并发。
- 提供任务取消。

### 风险：Wasm 影响首屏

应对：

- Wasm 延迟加载。
- 默认使用 Wasm 处理压缩，但不要进入页面就加载全部编码器。
- 按输出格式加载对应 Wasm 编码器。
- Canvas fallback 只用于兼容和失败兜底。
- 用缓存和 PWA 减少二次加载成本。

### 风险：首页后期改版影响 SEO

应对：

- 首页第一版就按图片工具站信息架构设计。
- 保持 `/`、H1、canonical、首屏主工具稳定。
- 新增裁剪、拼接、尺寸调整时使用独立 URL。
- 首页只增量增加工具入口和内链，不删除已有压缩内容。
- 核心压缩页继续承接压缩关键词，不把所有关键词都压在首页。

### 风险：AdSense 影响体验和 CWV

应对：

- 先做流量，后加广告。
- 控制广告数量。
- 避免首屏阻塞。
- 定期监控 LCP、INP、CLS。

## 11. 首月执行清单

### 第 1 周：MVP 基础

- 注册 `piczip.app`。
- 初始化 Next.js 项目。
- 创建 Vercel 项目并绑定 Git 仓库。
- 确认 Preview Deployment 和 Production Deployment 流程。
- 完成首页 UI。
- 首页只展示图片压缩能力，不展示未上线工具入口。
- 完成上传、压缩、下载基础流程。
- 接入 MozJPEG Wasm 和 WebP Wasm。
- 实现 Canvas fallback。
- 完成移动端适配。
- 写英文 Privacy、Terms、FAQ、Guide、About 页面。

### 第 2 周：批量和指定大小

- 实现批量任务队列。
- 实现目标大小压缩。
- 实现 ZIP 下载。
- 实现错误处理和任务取消。
- 完成 10 个英文 SEO 页面。

### 第 3 周：上线和索引

- 部署正式站。
- 在 Vercel 绑定 `piczip.app`。
- 配置 HTTPS。
- 配置 sitemap、robots、canonical。
- 接入 GSC。
- 提交 sitemap。
- 检查 `/sitemap.xml`、`/robots.txt`、`/privacy`、`/terms`、`/faq`、`/guide` 可访问。
- 用 PageSpeed Insights 检查核心页面。

### 第 4 周：内容矩阵和反馈

- 扩展到 30 个页面。
- 加入中文首页和 5 个中文页面。
- 收集用户反馈。
- 记录失败图片类型。
- 评估 PNG Wasm、图片裁剪、图片拼接的下一阶段优先级。

## 12. 技术验收标准

上线前必须满足：

- 压缩过程没有图片上传请求。
- 10 张 5MB JPG 批量压缩不阻塞 UI。
- JPG 压缩默认走 MozJPEG Wasm。
- WebP 输出默认走 WebP Wasm。
- Wasm 加载失败时有 Canvas fallback。
- 单张过大图片有明确错误提示。
- Safari 和 iOS Safari 可完成基础压缩。
- ZIP 下载在 Chrome、Edge、Safari 可用。
- 首页 LCP 小于 2.5s。
- INP 小于 200ms。
- CLS 小于 0.1。
- 每个 SEO 页面 title、description、H1 不重复。
- FAQ、Guide、Privacy、Terms 页面可访问并有内链入口。
- sitemap 可访问。
- robots.txt 可访问。

## 13. 参考

- Squoosh：浏览器本地图片压缩，使用 Wasm 编码器，图片不上传服务器。https://squoosh.app/
- Squoosh GitHub：说明其本地处理和隐私边界。https://github.com/GoogleChromeLabs/squoosh
- web.dev libSquoosh：介绍浏览器端 Wasm 图片压缩。https://web.dev/blog/introducing-libsquoosh
- browser-image-compression：浏览器端压缩库，支持 Web Worker。https://www.npmjs.com/package/browser-image-compression
- Google AdSense RPM 定义。https://support.google.com/adsense/answer/190515

## 14. 最终建议

PicZip 第一版应该追求“Wasm 压缩质量 + 首屏性能可控 + SEO 可扩展”。既然项目定位是本地隐私图片工具，前期直接用 Wasm 是合理的，但必须做按需加载、Worker 隔离和 Canvas fallback。

具体决策：

- 域名：优先 `piczip.app`。
- 市场：英文默认，主做 Google；中文作为辅助多语言。
- 技术：MVP 用 Wasm 编码器 + Web Worker，Canvas 只做预览、尺寸处理和兜底。
- Wasm：第一版就用，优先 MozJPEG 和 WebP，PNG Wasm 第二阶段补强，AVIF 后置。
- 首页：第一版只展示压缩能力，后续裁剪、拼接等功能等真正上线后再通过独立页面和入口增量扩展。
- SEO：主攻“本地处理、不上传、指定大小、批量压缩”，同时预留图片裁剪、图片拼接、尺寸调整等工具词。
- 商业化：先流量，后广告；AdSense 只是基础收入，后续应叠加 affiliate、插件和 Pro 功能。
