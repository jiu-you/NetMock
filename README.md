# NetMock - Professional API Mocking Tool / 专业 API Mock 工具

<p align="center">
  <img src="assets/icons/icon128.png" alt="NetMock Logo" width="128" height="128">
</p>

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## English

NetMock is a powerful Chrome extension for intercepting and mocking network requests. Built with Manifest V3, it offers a modern, professional interface for developers to debug, test, and prototype APIs with ease.

### ✨ Features

- **🌐 Dual Interception Modes**:
  - **Network Layer (DNR)**: Fast, reliable redirection using Declarative Net Request API.
  - **Injected Layer (JS)**: Flexible interception via injected scripts (XHR/Fetch/Axios) for complex scenarios.
- **🚀 Professional UI**: Clean, dark-themed sidebar, intuitive rule management, and grouped view by domain.
- **📝 Advanced Editor**: JSON editor with syntax validation, formatting, minification, and template support.
- **🌍 Internationalization**: Full English and Chinese (Simplified) support, auto-detected.
- **⚡ Live Debugging**: Real-time request logs to verify rule matches and troubleshoot issues.
- **📦 Import/Export**: Share rules easily with JSON export/import.
- **📂 Organization**: Group rules by domain origin automatically.

### 🚀 Getting Started

#### Installation

1.  Clone this repository or download the source code.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked** and select the project directory.
5.  The **NetMock** dashboard will open automatically upon installation.

#### Usage Guide

1.  **Open Dashboard**: Click the NetMock extension icon or pin it to your toolbar.
2.  **Create Rule**: Click "+ New Rule" to start.
3.  **Define Pattern**: Enter a URL pattern (e.g., `https://api.example.com/v1/users/*`).
4.  **Set Response**: Choose a status code (200, 404, 500...) and provide the response body.
5.  **Save & Test**: Save the rule and refresh your target page. The request will be intercepted!

### 🛠 Tech Stack

-   **Core**: Manifest V3, Vue 3, Vite
-   **UI**: Element Plus
-   **Styling**: Modern CSS variables, dark mode aesthetics

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📄 License

MIT License

---

<a name="chinese"></a>
## 中文 (Chinese)

NetMock 是一款强大的 Chrome 扩展程序，用于拦截和模拟网络请求。基于 Manifest V3 构建，它为开发者提供了一个现代、专业的界面，以便轻松调试、测试和原型化 API。

### ✨ 主要功能

- **🌐 双重拦截模式**:
  - **网络层 (DNR)**: 使用 Declarative Net Request API 进行快速、可靠的重定向。
  - **注入层 (JS)**: 通过注入脚本灵活拦截 (XHR/Fetch/Axios)，适用于复杂场景。
- **🚀 专业 UI**: 简洁的深色侧边栏，直观的规则管理，支持按域名分组查看。
- **📝 高级编辑器**: JSON 编辑器支持语法验证、格式化、压缩和模板功能。
- **🌍 国际化支持**: 自动检测并支持英文和简体中文。
- **⚡ 实时调试**: 实时请求日志，方便验证规则匹配和排查问题。
- **📦 导入/导出**: 通过 JSON 导入/导出轻松分享规则。
- **📂 自动归类**: 自动按域名来源对规则进行分组。

### 🚀 快速开始

#### 安装步骤

1.  克隆本仓库或下载源代码。
2.  打开 Chrome 浏览器，进入 `chrome://extensions/`。
3.  开启右上角的 **开发者模式**。
4.  点击 **加载已解压的扩展程序**，选择本项目目录。
5.  安装完成后，**NetMock** 仪表盘将自动打开。

#### 使用指南

1.  **打开仪表盘**: 点击 NetMock 扩展图标或将其固定在工具栏上。
2.  **创建规则**: 点击 "+ 新建规则" (New Rule)。
3.  **定义模式**: 输入 URL 模式 (例如: `https://api.example.com/v1/users/*`)。
4.  **设置响应**: 选择状态码 (200, 404, 500...) 并提供响应体内容。
5.  **保存测试**: 保存规则并刷新目标页面，请求即会被拦截！

### 🛠 技术栈

-   **核心**: Manifest V3, Vue 3, Vite
-   **界面**: Element Plus
-   **样式**: 现代 CSS 变量，深色模式美学

### 🤝 贡献

欢迎贡献代码！请随时提交 Pull Request。

### 📄 许可证

MIT License
