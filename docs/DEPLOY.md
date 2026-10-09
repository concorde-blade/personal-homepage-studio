# 发布到 GitHub Pages

发布使用两个仓库：私有源码保存文章与图片历史，公开网页仓库保存生成的页面。工作室和编辑 API 只在本机运行；发布完成后，你的电脑关机不影响公网访问。

## 首次设置

1. 在 [模板仓库](https://github.com/concorde-blade/personal-homepage-studio) 点击 **Use this template → Create a new repository**。
2. 名称例如 `homepage-source`，可见性选 **Private**，只复制默认分支。
3. 安装 Node.js 22/24 LTS、Git 和 GitHub CLI。在终端（Windows 推荐命令提示符）完成：

```sh
gh auth login
gh auth setup-git
gh repo clone YOUR_ACCOUNT/homepage-source
cd homepage-source
npm ci
npm run setup:github -- --repository personal-homepage
```

将 `YOUR_ACCOUNT` 换成自己的 GitHub 用户名。配置脚本会从 origin 读取源码仓库，核对它属于当前账号且为私有，然后生成 `publish-config.json`。这个步骤只写本机设置，不发布网站。

4. 记录设置到自己的源码仓库：

```sh
git add publish-config.json
git commit -m "Configure my homepage publishing"
npm run studio
```

若 Git 提示未设置作者，先在这个项目中运行 `git config user.name "你的名字"` 与 `git config user.email "你的 GitHub noreply 邮箱"`，再提交。

5. 在工作室修改并保存内容，点击 **发布到公网**。首次会创建公开网页仓库并启用 GitHub Pages；看到「已发布」后打开提示的网址。

默认网址为 `https://YOUR_ACCOUNT.github.io/personal-homepage/`。免费网址不需要注册域名。如果把网页仓库命名为 `YOUR_ACCOUNT.github.io`，配置脚本会使用根路径网址。

本发布器目前支持当前登录用户拥有的仓库、main 分支和 GitHub Pages 默认域名。组织账号、其他分支、自定义域名与其他托管平台尚未纳入自动发布配置。

## 已经下载 ZIP 并编辑过

ZIP 可以直接本机编辑，但不包含 Git 历史。完成上面的私有副本创建与克隆后，把 ZIP 项目中的 `src/content/site.json` 和 `public/images/` 复制到新克隆的项目，保留新项目的 `.git` 与发布设置，再保存、发布。原 ZIP 文件夹可继续保留作备份。

## 以后更新内容

修改 → 保存到网页 → 本机预览 → 发布到公网。发布按钮会自动提交内容文件和引用的图片，并上传已经提交的代码。若修改了源代码、依赖或配置，请先自行 Git 提交。

另一台电脑或协作者更新了源码仓库时，先 `git pull --ff-only` 同步，再继续编辑。不要同时在两台电脑发布同一个站点；发布器不会强制覆盖已有远端更新。

## 只导出网页

```sh
npm run export:web
```

静态文件位于 `.publish-build/site/out`。模板尚未配置发布时导出使用根路径和本机元数据，仅适合本机检查；发布到实际域名之前应填写正确配置再重新导出。编辑器和 API 不在导出结果中。

## 备份与迁移

内容数据在 `src/content/site.json`，上传图片在 `public/images/uploads/`。完整迁移要包含图片，不能只导出 JSON。每次保存前的备份保留在 `.content-backups/`，默认不上传 GitHub。私有仓库保存已发布内容的版本历史。

## 常见发布问题

- **gh 未登录或账号不匹配**：用目标仓库所属的账号执行 `gh auth login`。
- **目标仓库不是编辑器生成的网站**：换一个未使用的网页仓库名，重新配置；发布器会拒绝覆盖其他项目。
- **源码已在远端更新**：先拉取远端修改、处理冲突，再发布。
- **页面仍显示旧内容**：等发布状态成功后再刷新；必要时查看 GitHub Pages 的构建状态。
- **普通 Git 网络通道不可用**：网页和已提交源码上传使用 GitHub 官方 API；首次克隆和跨电脑拉取仍需正常的 Git 访问。
