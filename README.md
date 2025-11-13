# 📚 书虫阅读网站

> 书虫·牛津英汉双语读物（L0-L6）在线阅读网站

## 🌐 在线访问

网站地址：**https://zhangxinyong12.github.io/**

## 📖 关于

这是一个静态网站，包含《书虫·牛津英汉双语读物》系列的所有内容，从入门级（L0）到高级（L6），共 137 册。

## 🎯 功能特性

- ✅ 完整的书虫系列内容（L0-L6，共 137 册）
- ✅ 精美的阅读界面
- ✅ 响应式设计，支持移动端和桌面端
- ✅ 快速导航和章节跳转
- ✅ 双语对照阅读

## 📁 项目结构

```
static-site/
├── index.html              # 首页（级别选择）
├── favicon.svg             # 网站图标
├── css/
│   └── index.css          # 样式文件
├── chapters/              # 所有章节内容
│   ├── 总目录/           # 总目录页面
│   └── ...               # 各级别书籍
├── Images/                # 图片资源
└── directory-structure.json # 目录结构数据
```

## 🚀 部署说明

本网站已部署到 GitHub Pages，通过以下方式自动更新：

1. 修改 `static-site` 目录中的文件
2. 提交并推送到 GitHub 仓库
3. GitHub Pages 会自动重新部署

### 本地预览

如果需要本地预览，可以使用：

```bash
# 使用 Python 简单服务器
python -m http.server 8080

# 或使用 Node.js http-server
npx http-server -p 8080
```

然后访问 `http://localhost:8080`

## 📝 更新内容

如需更新网站内容：

1. 修改相应的 HTML 文件
2. 提交更改：
   ```bash
   git add .
   git commit -m "更新内容"
   git push origin master
   ```
3. 等待 GitHub Pages 自动部署（通常 1-2 分钟）

## 🎨 技术栈

- 纯 HTML + CSS + JavaScript
- 静态网站，无需服务器
- 可部署到任何静态网站托管服务

## 📄 许可证

MIT License

---

**让阅读成为一种习惯，让学习成为一种力量** ✨
