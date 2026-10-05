# Shifan Yu — Academic homepage

基于 [AcademicPages](https://github.com/academicpages/academicpages.github.io) 的英文个人学术主页框架。

已搭建完整首页及独立的 About、Research、Publications、Portfolio、Gallery、Blog 和 Contact 页面，支持手机布局、深色模式，以及首页精选论文。点击顶栏姓名返回完整首页；About 只显示自我介绍。
已填入 Shifan Yu 的姓名、头像、学校、学院、本科生身份、研究兴趣和邮箱，首页展示一篇精选论文。Publications 页面按已发表或已接收论文、投稿稿件分类；Portfolio 展示九个项目。Blog、Gallery 和新闻可按需补充。

## 修改内容

| 内容 | 修改位置 |
|---|---|
| 姓名、职位、单位、邮箱、学术链接 | `_config.yml` → `author` |
| 顶栏名称、站点地址 | `_config.yml` → `title`、`name`、`url`、`repository` |
| 个人照片 | 放入 `images/`，设置 `author.avatar` |
| 自我介绍（首页与 About 共用） | `_includes/about-me.md` |
| 首页栏目与独立 About 页面 | `_pages/home.md`、`_pages/about.md` |
| 研究方向 | `_data/research.yml`；研究总述在 `_pages/research.html` |
| Publications 页的论文及投稿稿件 | `_data/publications.yml` |
| 首页精选论文 | `_data/publications.yml` → `selected: true` |
| Portfolio 项目信息与配图说明 | `_data/portfolio.json` |
| Portfolio 列表与项目详情 | `_pages/portfolio.html`、`_portfolio/`、`_includes/portfolio-project.html` |
| Blog 首页与文章布局 | `_pages/blog.html`、`_layouts/blog-post.html` |
| Blog 文章 | `_posts/YYYY-MM-DD-your-post-slug.md` |
| Gallery 图片 | `images/gallery/` |
| Gallery 图片标题、说明和替代文字（可选） | `_data/gallery.yml` |
| Research 页中与具体方向关联的论文 | `_data/publications.yml` → `research_topic` |
| 个人信息栏的简历 PDF 附件 | `_data/cv.yml` → `pdf` |
| 新闻 | `_data/news.yml` |
| 地址 | `_data/contact.yml` |
| 导航 | `_data/navigation.yml` |
| 额外样式 | `_sass/_academic.scss` |

联系方式和下载链接为空时自动隐藏。个人信息栏的 Curriculum vitae 链接指向 `files/CV.pdf`，可直接替换此附件；链接路径在 `_data/cv.yml` 的 `pdf: /files/CV.pdf` 中配置。
三处论文展示共用 `_data/publications.yml` 和同一条目格式：作者全名、论文题名链接、期刊名及发表信息。作者的 `highlight: true` 加粗姓名。资料按显示顺序维护，Publications 页每个栏目独立倒序编号；`category` 设为 `published` 或 `submitted`，`status` 设为 `published`、`accepted`、`submitted` 或 `under_review`。只有已有公开链接的题名会显示链接。模板中的示例论文不用于正式页面。

页脚的 Total page views 使用[不蒜子](https://ibruce.info/2015/04/04/busuanzi/)统计全站累计浏览次数。仅在 `_config.yml` 的 `url` 所指定的正式域名上启用，本地和其他预览地址不计数。尚未上线或计数服务无法读取时显示 `—`；它表示暂无数据，而非零次访问。更换正式域名时应同步更新 `url`，计数也会随域名变化。

## Blog 文章

Blog 当前没有公开文章，页面显示简短的空状态。文章发布后，会自动按年份和日期倒序排列，显示标题、日期、摘要和可选主题标签；点击标题进入文章详情。RSS Feed 同步收录已发布文章。

`_drafts/post-draft.md` 是未公开的写作模板，`published: false` 会让它保持隐藏。发布时，把它复制到 `_posts/`，使用 `YYYY-MM-DD-your-post-slug.md` 命名，填好正文，并把 `published` 改为 `true`。日期应使用实际发布日期，文章地址为 `/blog/your-post-slug/`。未来日期的文章在到达该日期前不会出现；上线后需要重新生成网站才能显示。

文章开头的设置示例：

```yaml
---
title: "Your actual title"
date: 2026-10-05 12:00:00 +0800
excerpt: "A short introduction to the post."
tags: [Physics, Notes]
published: true
---
```

正文支持 Markdown 的标题、链接、图片、代码块和脚注。标签只作文字分类展示，暂时不生成空的分类页。无文章时 RSS Feed 没有条目，首篇文章发布后会自动更新。

## Gallery 上传图片

Gallery 公开展示 `images/gallery/` 中的 JPG、JPEG、PNG、WebP、GIF 和 AVIF 图片，支持点击放大、前后切换和键盘方向键；按 Esc 关闭后焦点返回原图片。没有图片时显示空相册。当前不包含示例照片。

1. 登录 `yuytkuy-eng` 的 GitHub 账户，打开[相册上传入口](https://github.com/yuytkuy-eng/yuytkuy-eng.github.io/upload/main/images/gallery)。
2. 选择或拖入图片，然后点击 **Commit changes**，提交到 `main`。
3. 等待仓库 Actions 的发布完成，新图片便会自动出现在[公开 Gallery](https://yuytkuy-eng.github.io/gallery/)，无需逐张修改网页。

建议文件名使用 `YYYY-MM-DD-short-description.jpg`，相册按文件名倒序排列；缩略图会适度裁切，点击后显示完整原图。文件名中的连字符和下划线默认显示为空格。可先压缩较大的照片，以便访客更快打开。GitHub 网页上传每个文件上限 25 MiB。

如需更自然的标题或补充说明，在 `_data/gallery.yml` 中把 `[]` 替换成以下列表。未添加说明的图片也会正常显示。

```yaml
- filename: "2026-10-06-campus.jpg"
  title: "An afternoon on campus"
  caption: "A short description of this photo."
  alt: "Trees and a walkway on campus in afternoon sunlight."
```

`filename` 必须与上传文件名完全一致。`alt` 用于屏幕阅读器，可简短描述图片内容。维护入口使用 GitHub 的仓库写入权限，访客无法修改你的相册。

## 本地预览

交付包已包含生成后的 `_site/`。Windows 在此目录运行 `./start-preview.ps1`，即可用本机 Node.js 打开 http://127.0.0.1:4173 ，无需先配置 Ruby。
这项快捷预览显示上次生成的版本；修改源文件后应重新生成。

在此目录中运行（需要 Ruby 3.3 和 Bundler）：

```sh
bundle install
bundle exec jekyll serve --config _config.yml,_config_local.yml --host 127.0.0.1 --port 4000
```

浏览器打开 http://127.0.0.1:4000 。Windows 可以在 WSL Ubuntu 中运行以上命令。
修改 `_config.yml` 后需重启预览；页面和数据修改可自动重建。

仅重新生成：`bundle exec jekyll build --strict_front_matter`。然后运行 `npm run preview` 查看生成结果。
Linux 首次安装依赖若缺少编译环境，请安装 `ruby-dev`、`build-essential` 和 `libssl-dev`。

## GitHub Pages 发布

1. 在自己的 GitHub 账户创建公开仓库 `<username>.github.io`，上传本目录内容（无需上传 `_site/`）。
2. `_config.yml` 的 `url` 设为 `https://<username>.github.io`，`repository` 设为 `<username>/<username>.github.io`，`baseurl` 保持 `""`。
3. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
4. 推送到 `main` 或 `master`，随附的 `pages.yml` 自动生成并发布网站。查看 Actions 确认成功。

当前配置根据本机已登录账户预填为 `yuytkuy-eng.github.io`，尚未创建远程仓库或发布。
若使用普通项目仓库（如 `academic-homepage`），`url` 保持 `https://<username>.github.io`，`baseurl` 改为 `/academic-homepage`，`repository` 填对应仓库。

发布流程依据 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
模板来源与许可见 `UPSTREAM.md` 和 `LICENSE`。
