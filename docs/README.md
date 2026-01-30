# NetMock Chrome 插件

一个基于 Chrome Extension Manifest V3 的插件，可以拦截和覆盖网络请求的返回值。

## 功能特性

- **URL 模式匹配**: 支持通配符，如 `https://api.example.com/*` 或 `*://*.example.com/api/*`
- **自定义响应**: 配置 JSON/文本、状态码、Content-Type、优先级
- **实时生效**: 规则添加后立即生效
- **规则管理**: 添加、编辑、删除、启用/禁用、拖拽排序
- **批量操作**: 全选、批量启用/禁用/删除
- **筛选与排序**: 按 URL/状态/类型/状态码/标签过滤与排序
- **分组与标签**: 项目/环境/模块/标签维度管理
- **JSON 增强**: 高亮、行号、格式化/压缩、错误定位
- **模板与快捷复制**: 常用响应模板、复制规则/URL/响应
- **导入导出**: 追加/覆盖/去重三种导入策略
- **拦截模式切换**: DNR 重定向 / 页面拦截
- **调试面板**: 最近拦截日志

## 支持的请求类型

- Fetch API
- XMLHttpRequest
- Axios (如果页面使用)

## 安装方法

1. 下载或克隆此项目到本地
2. 打开 Chrome 浏览器，进入扩展程序页面 (`chrome://extensions/`)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹
6. 插件安装完成，可以在工具栏看到插件图标

## 使用方法

### 添加规则

1. 点击插件图标，打开管理面板
2. 在“规则编辑”区域填写：
   - **URL模式**: 支持通配符，如 `https://api.example.com/users/*`
   - **响应数据**: JSON格式的响应数据
   - **HTTP状态码**: 如 200、404、500 等
   - **Content-Type**: 如 `application/json`、`text/plain` 等
3. 点击“保存”按钮

### 管理规则

- **编辑**: 点击规则右侧的"编辑"按钮
- **启用/禁用**: 点击"启用"或"禁用"按钮
- **删除**: 点击"删除"按钮
- **清除所有**: 点击"清除所有规则"按钮

### 导入导出

- **导出**: 点击"导出规则"按钮，将规则保存为JSON文件
- **导入**: 点击"导入规则"按钮，选择之前导出的JSON文件

## URL模式示例

```
https://api.example.com/users/*          # 匹配所有用户相关接口
*://*.example.com/api/*                 # 匹配所有example.com的API接口
https://jsonplaceholder.typicode.com/*  # 匹配JSONPlaceholder的所有接口
*://localhost:3000/api/*                # 匹配本地开发服务器的API接口
```

## 响应数据示例

### JSON响应
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "测试用户",
    "email": "test@example.com"
  },
  "message": "数据已覆盖"
}
```

### 错误响应
```json
{
  "error": true,
  "message": "自定义错误信息",
  "code": "CUSTOM_ERROR"
}
```

## 文件结构

```
ResourceOverrideV3/
├── manifest.json          # 插件配置文件
├── src/                   # 后台与内容脚本
│   ├── background.js
│   ├── content.js
│   └── injected.js
├── ui/                    # 管理界面
│   ├── tab.html
│   ├── popup.html
│   ├── css/
│   │   └── panel.css
│   └── js/
│       ├── tab.js
│       └── popup.js
├── rules/
│   └── rules.json         # declarativeNetRequest规则
├── assets/
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── docs/
│   ├── README.md
│   ├── INSTALL.md
│   ├── TROUBLESHOOTING.md
│   └── DECLARATIVE_NET_REQUEST.md
└── examples/
    ├── test.html
    └── simple-test.html
```

## 技术实现

- **Manifest V3**: 使用最新的Chrome扩展API
- **Service Worker**: 后台脚本使用Service Worker
- **Declarative Net Request**: 网络请求拦截
- **Content Scripts**: 页面脚本注入
- **Chrome Storage**: 本地数据存储
- **Web Request API**: 网络请求监听

## 注意事项

1. 插件需要访问所有网站的权限才能正常工作
2. 某些网站可能因为安全策略无法注入内容脚本
3. 规则匹配是大小写不敏感的
4. 建议在开发环境中使用，生产环境请谨慎使用

## 故障排除

### 插件不工作
1. 检查插件是否已启用
2. 检查浏览器控制台是否有错误信息
3. 确认URL模式是否正确
4. 验证JSON格式是否正确

### 规则不生效
1. 检查规则是否已启用
2. 确认URL模式是否匹配目标接口
3. 刷新页面重新加载
4. 检查网络请求是否被正确拦截

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个插件。



