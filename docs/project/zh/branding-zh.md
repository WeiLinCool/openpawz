# 产品品牌

OpenPawz可以通过在`branding/<brand-id>/brand.json`下添加品牌定义，与不同的产品名称和标志一起打包。

## 品牌定义

使用`branding/openpawz/brand.json`作为模板：

```json

{
"id": "openpawz",
"appName": "OpenPawz",
"shortName": "Pawz",
"productName": "Open Pawz Desktop",
"windowTitle": "Open Pawz Desktop",
"identifier": "com.openpawz.openpawz",
"tagline": "您的AI指挥中心",
"aboutLine": "Pawz比Claws更安全",
"repositoryUrl": "https://github.com/OpenPawz/openpawz",
"logo": "../../images/pawz-logo-transparent.png",
"favicon": "../../images/pawz-favicon.png",
"iconsDir": "../../src-tauri/icons",
"iconFiles": [
"32x32.png",
"128x128.png",
"128x128@2x.png",
"icon.icns",
"icon.ico"
]
}
```

- `id`: 产品id
- `appName`: 前端标题和启动品牌。
- `shortName`: 紧凑的UI名称，例如侧边栏标题。
- `productName`: Tauri捆绑产品名称。
- `windowTitle`: 桌面窗口标题。
- `identifier`: 平台捆绑标识符。
- `logo`: 启动/侧边栏标志源图像。
- `favicon`: 浏览器/开发favicon源图像。
- `iconsDir`和`iconFiles`: Tauri捆绑图标。

路径相对于`brand.json`文件解析。

## 构建命令

默认OpenPawz构建：

```bash
npm run build
npm run tauri:build
```

构建另一个品牌：

```bash
OPENPAWZ_BRAND=my-product npm run build
OPENPAWZ_BRAND=my-product npm run tauri:build
```

对于直接Tauri命令，通过包装器传递品牌：

```bash
node scripts/brand.mjs tauri dev --brand my-product
node scripts/brand.mjs tauri build --brand my-product
```

## 开发名称覆盖

对于快速开发测试，只需覆盖显示的产品名称，无需创建新的品牌目录：

```bash
npm run dev -- --name "Acme Agents"
npm run dev:tauri -- --name "Acme Agents"
```

相同的覆盖也适用于环境变量：

```bash
OPENPAWZ_NAME="Acme Agents" npm run dev
OPENPAWZ_NAME="Acme Agents" npm run dev:tauri
```

当紧凑UI名称或捆绑标识符应该不同时，使用更具体的覆盖：

```bash
npm run dev:tauri -- \
--app-name "Acme Agents" \
--short-name "Acme" \
--product-name "Acme Agents Desktop" \
--window-title "Acme Agents" \
--identifier "com.acme.agents"
```

包装器将生成的文件写入`.brand/`和`src-tauri/tauri.brand.generated.conf.json`；两者都故意忽略。
