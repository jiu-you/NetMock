# 安装说明

## 准备工作

在安装插件之前，您需要准备图标文件。由于Chrome扩展需要PNG格式的图标，请按照以下步骤操作：

### 1. 生成图标文件

您可以使用以下方法之一来生成所需的图标文件：

#### 方法一：使用在线工具
1. 访问 [Convertio](https://convertio.co/svg-png/) 或其他SVG转PNG工具
2. 上传 `assets/icons/icon.svg` 文件
3. 分别生成以下尺寸的PNG文件：
   - `icon16.png` (16x16像素)
   - `icon48.png` (48x48像素)
   - `icon128.png` (128x128像素)
4. 将生成的PNG文件保存到 `assets/icons/` 文件夹中

#### 方法二：使用图像编辑软件
1. 打开 `assets/icons/icon.svg` 文件
2. 导出为不同尺寸的PNG文件
3. 保存到 `assets/icons/` 文件夹中

#### 方法三：使用命令行工具（如果安装了ImageMagick）
```bash
convert assets/icons/icon.svg -resize 16x16 assets/icons/icon16.png
convert assets/icons/icon.svg -resize 48x48 assets/icons/icon48.png
convert assets/icons/icon.svg -resize 128x128 assets/icons/icon128.png
```

### 2. 验证文件结构

确保您的项目文件夹包含以下文件：

```
ResourceOverrideV3/
├── manifest.json
├── src/
│   ├── background.js
│   ├── content.js
│   └── injected.js
├── ui/
│   ├── tab.html
│   ├── popup.html
│   ├── css/
│   │   └── panel.css
│   └── js/
│       ├── tab.js
│       └── popup.js
├── rules/
│   └── rules.json
├── assets/
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── docs/
│   ├── README.md
│   └── INSTALL.md
└── examples/
    ├── test.html
    └── simple-test.html
```

## 安装步骤

### 1. 打开Chrome扩展管理页面
- 在Chrome浏览器地址栏输入：`chrome://extensions/`
- 或者点击Chrome菜单 → 更多工具 → 扩展程序

### 2. 启用开发者模式
- 在扩展程序页面的右上角，找到"开发者模式"开关
- 点击开关启用开发者模式

### 3. 加载插件
- 点击"加载已解压的扩展程序"按钮
- 在弹出的文件选择器中，选择 `ResourceOverrideV3` 文件夹
- 点击"选择文件夹"按钮

### 4. 验证安装
- 插件应该出现在扩展程序列表中
- 您应该能在Chrome工具栏看到插件图标
- 点击图标将在新标签页中打开插件管理界面

## 权限说明

安装时，Chrome会显示插件需要的权限：

- **读取和更改您访问的网站上的所有数据**: 用于拦截和修改网络请求
- **访问文件网址**: 用于访问本地文件
- **存储数据**: 用于保存规则配置

这些权限是插件正常工作所必需的。

## 故障排除

### 插件无法加载
1. 检查所有必需文件是否存在
2. 确认 `manifest.json` 文件格式正确
3. 检查图标文件是否为PNG格式
4. 查看Chrome控制台是否有错误信息

### 图标不显示
1. 确认图标文件路径正确
2. 检查图标文件是否为有效的PNG格式
3. 确认图标文件尺寸正确

### 插件功能异常
1. 检查浏览器控制台是否有错误信息
2. 确认插件已启用
3. 尝试重新加载插件

## 更新插件

当您修改了插件代码后：

1. 回到 `chrome://extensions/` 页面
2. 找到插件卡片
3. 点击刷新图标按钮
4. 或者点击"重新加载"按钮

## 卸载插件

1. 打开 `chrome://extensions/` 页面
2. 找到插件卡片
3. 点击"移除"按钮
4. 确认卸载

## 注意事项

- 插件仅在Chrome浏览器中工作
- 某些网站可能因为安全策略限制插件功能
- 建议在开发环境中使用此插件
- 请遵守相关法律法规，不要用于恶意目的




https://dockyard.qianxin-inc.cn/api/v1/projects/4996/project-info


{
    "id": 3527,
    "createdAt": "2025-08-13T10:03:24.951Z",
    "updatedAt": "2025-08-13T10:03:24.951Z",
    "deletedAt": null,
    "categoryFields": [
        {
            "name": "dockyardProject",
            "order": 0,
            "fields": [
                {
                    "id": 53,
                    "name": "baseProjectId",
                    "order": 99,
                    "value": 4547,
                    "visible": true
                },
                {
                    "id": 49,
                    "name": "baseProjectName",
                    "order": 99,
                    "value": "TAC_v3_4_1_SP1",
                    "visible": false
                },
                {
                    "id": 61,
                    "name": "baseProjectProjectVersion",
                    "order": 99,
                    "visible": false
                },
                {
                    "id": 48,
                    "name": "baseProjectSnapShotId",
                    "order": 99,
                    "visible": false
                },
                {
                    "id": 60,
                    "name": "baseProjectSnapshotVersion",
                    "order": 99,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 46,
                    "name": "description",
                    "order": 8,
                    "value": "中国国家博物馆",
                    "visible": true
                },
                {
                    "id": 62,
                    "name": "majorTengyunProjectId",
                    "order": 99,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 63,
                    "name": "majorTengyunProjectName",
                    "order": 6,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 41,
                    "name": "name",
                    "order": 1,
                    "value": "TAC_v3_4_1_SP1_CCHNMUSEUM",
                    "visible": true
                },
                {
                    "id": 42,
                    "name": "productDisplayName",
                    "order": 2,
                    "value": "零信任身份服务系统TAC",
                    "visible": true
                },
                {
                    "id": 59,
                    "name": "productId",
                    "order": 99,
                    "value": 339,
                    "visible": false
                },
                {
                    "id": 43,
                    "name": "projectVersion",
                    "order": 4,
                    "value": "3.4.1.SP1.CCHNMUSEUM-U1",
                    "visible": true
                },
                {
                    "id": 44,
                    "name": "status",
                    "order": 5,
                    "value": "developing",
                    "visible": true
                },
                {
                    "id": 45,
                    "name": "tengyunInfos",
                    "order": 7,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 58,
                    "name": "type",
                    "order": 3,
                    "value": "custom",
                    "visible": true
                },
                {
                    "id": 47,
                    "name": "version",
                    "order": 9,
                    "value": "3.4.1.SP1.CCHNMUSEUM-U1-alpha.0",
                    "visible": false
                }
            ],
            "visible": true,
            "layoutConfig": {
                "h": 240,
                "i": 0,
                "w": 0,
                "x": 0,
                "y": 0
            }
        },
        {
            "name": "devInfo",
            "order": 1,
            "fields": [
                {
                    "id": 35,
                    "name": "env_info_dev",
                    "order": 2,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 36,
                    "name": "env_info_integration",
                    "order": 3,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 37,
                    "name": "env_info_test",
                    "order": 4,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 34,
                    "name": "jira_link",
                    "order": 1,
                    "value": "",
                    "visible": false
                }
            ],
            "visible": false,
            "layoutConfig": {
                "h": 240,
                "i": 25,
                "w": 0,
                "x": 2,
                "y": 0
            }
        },
        {
            "name": "plan",
            "order": 2,
            "fields": [
                {
                    "id": 16,
                    "name": "end_scheduled",
                    "order": 6,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 11,
                    "name": "start_scheduled",
                    "order": 1,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 12,
                    "name": "tr3EstimatedEndDate",
                    "order": 2,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 13,
                    "name": "tr4EstimatedEndDate",
                    "order": 3,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 14,
                    "name": "tr5EstimatedEndDate",
                    "order": 4,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 15,
                    "name": "tr6EstimatedEndDate",
                    "order": 5,
                    "value": "",
                    "visible": true
                }
            ],
            "visible": true,
            "layoutConfig": {
                "h": 240,
                "i": 21,
                "w": 0,
                "x": 2,
                "y": 0
            }
        },
        {
            "name": "progress",
            "order": 3,
            "fields": [
                {
                    "id": 40,
                    "name": "jira_task_progress",
                    "order": 3,
                    "value": null,
                    "visible": false
                },
                {
                    "id": 18,
                    "name": "man_day_budget",
                    "order": 2,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 55,
                    "name": "man_days",
                    "order": 3,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 17,
                    "name": "work_hours",
                    "order": 1,
                    "value": "",
                    "visible": false
                }
            ],
            "visible": true,
            "layoutConfig": {
                "h": 240,
                "i": 24,
                "w": 0,
                "x": 2,
                "y": 0
            }
        },
        {
            "name": "team",
            "order": 4,
            "fields": [
                {
                    "id": 25,
                    "name": "dev_fe_members",
                    "order": 7,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 21,
                    "name": "dev_leader",
                    "order": 3,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 24,
                    "name": "dev_server_members",
                    "order": 6,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 19,
                    "name": "pm",
                    "order": 1,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 23,
                    "name": "pm_members",
                    "order": 5,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 20,
                    "name": "po",
                    "order": 2,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 22,
                    "name": "qa_leader",
                    "order": 4,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 26,
                    "name": "qa_members",
                    "order": 8,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 27,
                    "name": "stakeholders",
                    "order": 9,
                    "value": "",
                    "visible": false
                }
            ],
            "visible": true
        },
        {
            "name": "document",
            "order": 5,
            "fields": [
                {
                    "id": 28,
                    "name": "charterUrl",
                    "order": 1,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 33,
                    "name": "doc_api",
                    "order": 6,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 57,
                    "name": "doc_mrd",
                    "order": 1,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 32,
                    "name": "doc_tech_design",
                    "order": 5,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 31,
                    "name": "doc_ue",
                    "order": 4,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 29,
                    "name": "mrdDocUrl",
                    "order": 2,
                    "value": "",
                    "visible": true
                }
            ],
            "visible": false
        },
        {
            "name": "meta",
            "order": 6,
            "fields": [
                {
                    "id": 6,
                    "name": "background",
                    "order": 6,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 10,
                    "name": "customer",
                    "order": 10,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 4,
                    "name": "full_name",
                    "order": 4,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 3,
                    "name": "importance",
                    "order": 3,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 2,
                    "name": "jira_type2",
                    "order": 2,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 7,
                    "name": "keyFeatures",
                    "order": 7,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 1,
                    "name": "name",
                    "order": 1,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 5,
                    "name": "objective",
                    "order": 5,
                    "value": "",
                    "visible": true
                },
                {
                    "id": 8,
                    "name": "t_productLineId",
                    "order": 8,
                    "value": "",
                    "visible": false
                },
                {
                    "id": 9,
                    "name": "t_productName",
                    "order": 9,
                    "value": "",
                    "visible": false
                }
            ],
            "visible": false,
            "layoutConfig": {
                "h": 240,
                "i": 20,
                "w": 0,
                "x": 2,
                "y": 0
            }
        },
        {
            "name": "notice",
            "order": 7,
            "fields": [
                {
                    "id": 38,
                    "name": "notice",
                    "order": 1,
                    "value": null,
                    "visible": true
                }
            ],
            "visible": true,
            "layoutConfig": {
                "h": 240,
                "i": 10,
                "w": 0,
                "x": 1,
                "y": 0
            }
        },
        {
            "name": "logs",
            "order": 8,
            "fields": [
                {
                    "id": 39,
                    "name": "logs",
                    "order": 1,
                    "value": "",
                    "visible": true
                }
            ],
            "visible": true,
            "layoutConfig": {
                "h": 240,
                "i": 1,
                "w": 0,
                "x": 0,
                "y": 0
            }
        },
        {
            "name": "frontCourtTeam",
            "order": 9,
            "fields": [
                {
                    "id": 65,
                    "name": "forecourtDelivery",
                    "order": 1,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 66,
                    "name": "forecourtOperation",
                    "order": 2,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 67,
                    "name": "forecourtSecurityService",
                    "order": 3,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 64,
                    "name": "marketingManager",
                    "order": 0,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 68,
                    "name": "residentDeveloper",
                    "order": 4,
                    "value": "",
                    "visible": 1
                }
            ],
            "visible": false
        },
        {
            "name": "deploy",
            "order": 10,
            "fields": [
                {
                    "id": 71,
                    "name": "cloudVendor",
                    "order": 2,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 73,
                    "name": "cores",
                    "order": 4,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 72,
                    "name": "cpuOrg",
                    "order": 3,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 77,
                    "name": "dataDiskDetails",
                    "order": 8,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 70,
                    "name": "isCloud",
                    "order": 1,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 81,
                    "name": "machineCount",
                    "order": 12,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 74,
                    "name": "memorySize",
                    "order": 5,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 78,
                    "name": "operatingSystemManufacturer",
                    "order": 9,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 79,
                    "name": "operatingSystemModel",
                    "order": 10,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 80,
                    "name": "operatingSystemVersion",
                    "order": 11,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 69,
                    "name": "platformVersion",
                    "order": 0,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 82,
                    "name": "supportsXinChuang",
                    "order": 13,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 75,
                    "name": "systemDiskIsSSD",
                    "order": 6,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 76,
                    "name": "systemDiskSizeIs500GB",
                    "order": 7,
                    "value": "",
                    "visible": 1
                }
            ],
            "visible": false
        },
        {
            "name": "network",
            "order": 11,
            "fields": [
                {
                    "id": 87,
                    "name": "epsEstimate",
                    "order": 4,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 84,
                    "name": "hasFrontUnit",
                    "order": 1,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 83,
                    "name": "isIsolationNet",
                    "order": 0,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 85,
                    "name": "outgoingBandwidth",
                    "order": 2,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 86,
                    "name": "traffic",
                    "order": 3,
                    "value": "",
                    "visible": 1
                }
            ],
            "visible": false
        },
        {
            "name": "requirement",
            "order": 12,
            "fields": [
                {
                    "id": 93,
                    "name": "interactsWithCustomers",
                    "order": 5,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 94,
                    "name": "otherRequirements",
                    "order": 6,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 88,
                    "name": "remoteDelivery",
                    "order": 0,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 89,
                    "name": "remoteMethod",
                    "order": 1,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 90,
                    "name": "requireResident",
                    "order": 2,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 92,
                    "name": "residentOEMStaffCount",
                    "order": 4,
                    "value": "",
                    "visible": 1
                },
                {
                    "id": 91,
                    "name": "residentStaffCount",
                    "order": 3,
                    "value": "",
                    "visible": 1
                }
            ],
            "visible": false
        },
        {
            "name": "atic",
            "order": 13,
            "fields": [],
            "visible": false
        }
    ],
    "project": {
        "id": 4996,
        "name": "TAC_v3_4_1_SP1_CCHNMUSEUM",
        "description": "中国国家博物馆",
        "jiraId": "",
        "status": "developing",
        "category": "ipd",
        "type": "custom",
        "baseProjectId": null,
        "version": "3.4.1.SP1.CCHNMUSEUM-U1-beta.0",
        "incrementalVersion": null,
        "projectVersion": "3.4.1.SP1.CCHNMUSEUM-U1",
        "customVersion": "CCHNMUSEUM-U1",
        "productId": 339,
        "webhookParams": null,
        "createdAt": "2025-08-13T10:03:12.174Z",
        "updatedAt": "2025-08-13T10:26:10.000Z",
        "finishedAt": "2025-08-13",
        "tengyunInfos": null,
        "notify": null
    },
    "projectTengyun": null
}

