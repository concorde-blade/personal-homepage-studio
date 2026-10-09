# Personal Homepage Studio

一个可以在本机可视化编辑、发布到 GitHub Pages 的个人网站模板。写博客、展示技术项目，也给摄影留一面安静的墙。

[在线示例](https://concorde-blade.github.io/personal-homepage/) · [Windows 下载](https://github.com/concorde-blade/personal-homepage-studio/releases/latest) · [发布指南](docs/DEPLOY.md) · [参与贡献](CONTRIBUTING.md)

## 能做什么

- 按年份排列的博客归档，独立文章页与技术项目页。
- 摄影画廊、衬线标题、照片放大浏览。
- 简约素描背景、淡出格点鼠标轨迹，没有跟随鼠标的圆圈。
- 明暗主题、适配手机的布局。
- 中文内容工作室：新增文章、上传照片、调整顺序、导入导出 JSON、保存前备份。
- Windows / macOS 双击启动；发布时备份到私有源码仓库，再生成公开的静态网页。

## 快速开始

先安装 [Node.js 22 或 24 LTS](https://nodejs.org/)。第一次安装依赖和加载字体需要联网。

| 系统 | 操作 |
| --- | --- |
| Windows 10 / 11 | 下载并完整解压 ZIP，双击 `start-windows.cmd`；详见 [Windows 说明](docs/WINDOWS.md) |
| macOS | 双击 `启动内容工作室.command`；若没有执行权限，先在目录中执行 `chmod +x 启动内容工作室.command` |
| Linux / 命令行 | 在项目目录执行下方命令 |

```sh
npm ci
npm run studio
```

浏览器会打开 **http://127.0.0.1:3307/studio**。启动窗口在编辑期间需要保持打开；按 Ctrl+C 停止。

这是在本机运行、通过浏览器使用的内容工作室。ZIP 不包含 Node.js 或依赖，也不是 `.exe` 安装包。网站发布后，访客直接通过公网网址访问，不需要安装任何东西。

## 自己改内容

1. 在工作室里选择「首页与关于 / 博客 / 摄影 / 项目 / 站点设置」。
2. 修改后点「保存到网页」，打开网站预览检查效果。
3. 完成 [首次发布设置](docs/DEPLOY.md)，再点「发布到公网」。

博客正文目前支持纯文本段落；照片支持 JPEG、PNG、WebP，单张最多 20 MB，上传时生成适合网页的 WebP。文章/项目的链接标识决定公开网址。内置的姓名、文字、项目和摄影均为示例，请换成自己的内容。

| 文件 | 用途 |
| --- | --- |
| `src/content/site.json` | 姓名、页面文案、博客、摄影清单、项目 |
| `public/images/uploads/` | 工作室上传的照片 |
| `.content-backups/` | 保存前的本机 JSON 备份 |
| `publish-config.json` | 自己的仓库和网址配置；模板默认未配置 |
| `.publish-state/publish.log` | 最近发布日志 |

JSON 备份只包含图片路径；迁移电脑时也要复制 `public/images/`。本机未发布的修改不会自动同步。

## 部署和协作

点击本仓库 **Use this template → Create a new repository**，创建自己的 **Private** 副本。不要把公共模板直接作为个人草稿仓库；发布流程需要一个私有源码仓库和一个公开网页仓库。

[发布指南](docs/DEPLOY.md) 包含 GitHub 登录、首次配置、发布、换电脑和更新代码的步骤。GitHub Pages 提供免费网址，不需要购买域名。

模板欢迎 Issue 与 Pull Request。当前内容模型面向单个站点作者；多人独立空间、作者筛选与审核流程列在 [路线图](ROADMAP.md)，尚未实现。

## 开发

```sh
npm run dev          # 开发服务，127.0.0.1:3307
npm test             # 启动器隔离与发布配置检查
npm run typecheck    # 生成路由类型并检查 TypeScript
npm run export:web   # 生成 .publish-build/site/out，不上传
npm run setup:github # 为自己的私有副本配置发布
npm run publish:web  # 备份内容并发布到 GitHub Pages
```

技术栈：Next.js 16、React 19、TypeScript、Once UI、SCSS、Sharp。静态导出不包含内容编辑器、API 或本机备份。Windows 导出使用 junction，不要求管理员权限或开发者模式。

当前已在 macOS 验证类型检查、启动器与生产导出；Windows 适配已实现，尚未在 Windows 实机验收。欢迎附系统版本与日志反馈问题。

## 来源与许可

本项目由 [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio) 改编，保留 **CC BY-NC 4.0**：允许署名分享与改编，**仅限非商业用途**。这是一份公开源码的衍生模板，不是 MIT/Apache 等允许自由商用的 OSI 开源许可。商业使用需取得原作者相应授权。

Once UI 组件库、Anthony Fu 与 Astro Bento 的 MIT 代码继续遵循各自许可。摄影、字体排版参考及具体改动见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。署名集中在网站的「项目说明」页，页脚使用简洁入口。

## English

A personal website with a local, browser-based content studio for writing, photography and projects. Supports Windows/macOS launchers and GitHub Pages publishing. Install Node.js 22/24 LTS, run `npm ci`, then `npm run studio`. Create your own private template copy before configuring publishing. This derivative retains **CC BY-NC 4.0 (non-commercial use only)**. See the deployment and attribution documents above.
