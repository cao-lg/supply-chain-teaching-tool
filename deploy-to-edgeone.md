# EdgeOne Pages 部署指南

## 项目信息

- **项目名称**: 供应链管理教学工具
- **项目类型**: 静态网站
- **技术栈**: Vue.js 3 + Bootstrap 5 + ECharts 5

## 部署方式

### 方式一：通过 EdgeOne 控制台直接上传（推荐）

1. **登录 EdgeOne 控制台**
   - 访问: https://edgeone.cloud.tencent.com/pages
   - 使用腾讯云账号登录

2. **创建新项目**
   - 点击「创建项目」
   - 选择「直接上传」方式

3. **配置项目**
   - 项目名称: `supply-chain-teaching-tool`
   - 加速区域: 根据用户群体选择
     - 国内用户: 选择「中国大陆」(需要域名备案)
     - 全球用户: 选择「全球」

4. **上传文件**
   - 将以下文件打包为 ZIP:
     ```
     index.html
     css/style.css
     js/main.js
     js/store.js
     js/modules/basicData.js
     js/modules/productionPlan.js
     js/modules/purchasePlan.js
     js/modules/inventory.js
     js/modules/dataManager.js
     ```
   - 拖拽上传 ZIP 文件到控制台

5. **开始部署**
   - 点击「开始部署」
   - 等待部署完成

### 方式二：通过 EdgeOne CLI 部署

1. **安装 CLI**
   ```bash
   npm install -g edgeone
   ```

2. **登录**
   ```bash
   edgeone login
   ```

3. **部署**
   ```bash
   edgeone pages deploy . -n supply-chain-teaching-tool
   ```

### 方式三：通过 Git 集成自动部署

1. **在 EdgeOne 控制台创建项目**
   - 选择「导入 Git 仓库」
   - 授权 GitHub/GitLab 账号
   - 选择 `supply_chain_tearch` 仓库

2. **配置构建设置**
   - 构建命令: (留空，因为是纯静态网站)
   - 输出目录: `.`
   - 部署分支: `master`

3. **自动部署**
   - 每次推送到 master 分支会自动触发部署

## 项目结构

```
supply_chain_demo/
├── index.html              # 入口文件
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── main.js            # 主应用逻辑
│   ├── store.js           # 数据存储
│   └── modules/           # 功能模块
│       ├── basicData.js   # 基础资料管理
│       ├── productionPlan.js  # 生产计划
│       ├── purchasePlan.js    # 采购计划
│       ├── inventory.js       # 库存管理
│       └── dataManager.js     # 数据管理
└── edgeone.json           # EdgeOne 配置文件
```

## 注意事项

1. **纯静态网站**: 本项目是纯静态网站，无需构建步骤
2. **CDN 资源**: 使用 CDN 加载 Vue.js、Bootstrap、ECharts
3. **数据存储**: 使用浏览器 LocalStorage 存储数据
4. **域名备案**: 如果选择中国大陆加速区域，需要域名备案

## 部署后验证

部署完成后，访问分配的域名，验证以下功能:
- [ ] 首页正常加载
- [ ] 导航菜单功能正常
- [ ] 基础资料管理功能正常
- [ ] 生产计划功能正常
- [ ] 采购计划功能正常
- [ ] 库存管理功能正常
- [ ] 数据管理功能正常

## 自定义域名（可选）

1. 在 EdgeOne 控制台添加自定义域名
2. 在域名 DNS 设置中添加 CNAME 记录
3. 等待 SSL 证书自动颁发
