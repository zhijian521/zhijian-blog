# Zhijian Blog

基于 Astro 5 构建的个人博客，采用内容集合（Content Collections）管理 Markdown/MDX 文章，并提供标签索引、分类索引、文章详情目录、RSS 与 Sitemap。

## 技术栈

- Astro 5
- TypeScript（strict）
- Markdown/MDX（`@astrojs/mdx`）
- RSS（`@astrojs/rss`）
- Sitemap（`@astrojs/sitemap`）

## 本地开发

```bash
npm install
npm run dev
```

默认本地地址：`http://localhost:4321`

## 可用命令

- `npm run dev`：启动开发服务器
- `npm run build`：生产构建到 `dist/`
- `npm run preview`：预览构建产物
- `npm run check`：执行 Astro 类型与内容检查
- `npm run lint`：当前等价于 `npm run check`

## 站点 URL 配置

`astro.config.mjs` 使用 `SITE_URL` 环境变量作为优先站点地址，默认值为：

- `https://home.yuwb.dev`

如需在不同环境覆盖：

```bash
SITE_URL=https://your-domain.com npm run build
```

## 内容目录与路由

文章源文件位于 `blog/` 目录，支持 `.md` 与 `.mdx`。

- 文章详情：`/<id>`
- 文章列表：`/blog/`
- 标签索引：`/blog/tags/`
- 标签详情：`/blog/tags/<tag>/`
- 分类索引：`/blog/categories/`
- 分类详情：`/blog/categories/<path>/`

## Frontmatter 规范

`src/content.config.ts` 对 `blog` 集合做了校验与字段归一化。

建议至少包含：

```yaml
---
id: your-post-id
title: 文章标题
date: 2026-01-01
category: 开发/前端
tags:
  - Astro
  - TypeScript
description: 文章摘要
---
```

其中：

- `id` 必填，且将用于文章详情路由
- `date` 或 `pubDate` 至少存在一个
- `description` 为空时会回退到 `excerpt` 或 `title`

## 项目结构

```text
src/
  components/
  layouts/
  pages/
  styles/
  utils/
blog/
public/
```
