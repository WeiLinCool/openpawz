# Product Branding

OpenPawz can be packaged with a different product name and logo by adding a brand
definition under `branding/<brand-id>/brand.json`.

## Brand Definition

Use `branding/taiji/brand.json` as the default template:

```json
{
  "id": "taiji",
  "appName": "太极台",
  "shortName": "太极",
  "productName": "太极台",
  "windowTitle": "太极",
  "identifier": "com.openpawz.taiji-dragon",
  "tagline": "你的 AI 指挥中心",
  "aboutLine": "本地优先的智能桌面工作台",
  "repositoryUrl": "https://github.com/OpenPawz/openpawz",
  "logo": "./logo.png",
  "favicon": "./favicon.png",
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

- `appName`: frontend title and startup branding.
- `shortName`: compact UI name, such as the sidebar title.
- `productName`: Tauri bundle product name.
- `windowTitle`: desktop window title.
- `identifier`: platform bundle identifier.
- `logo`: startup/sidebar logo source image.
- `favicon`: browser/dev favicon source image.
- `iconsDir` and `iconFiles`: Tauri package icons.

Paths are resolved relative to the `brand.json` file.

## Build Commands

Default Taiji build:

```bash
npm run build
npm run tauri:build
```

Build another brand:

```bash
OPENPAWZ_BRAND=my-product npm run build
OPENPAWZ_BRAND=my-product npm run tauri:build
```

If `OPENPAWZ_BRAND` is not set, the build defaults to `taiji`.

For direct Tauri commands, pass the brand through the wrapper:

```bash
node scripts/brand.mjs tauri dev --brand my-product
node scripts/brand.mjs tauri build --brand my-product
```

## Dev Name Overrides

For quick dev testing, override only the displayed product name without creating a
new brand directory:

```bash
npm run dev -- --name "Acme Agents"
npm run dev:tauri -- --name "Acme Agents"
```

The same override works through environment variables:

```bash
OPENPAWZ_NAME="Acme Agents" npm run dev
OPENPAWZ_NAME="Acme Agents" npm run dev:tauri
```

Use more specific overrides when the compact UI name or bundle identifier should
differ:

```bash
npm run dev:tauri -- \
  --app-name "Acme Agents" \
  --short-name "Acme" \
  --product-name "Acme Agents Desktop" \
  --window-title "Acme Agents" \
  --identifier "com.acme.agents"
```

The wrapper writes generated files to `.brand/` and
`src-tauri/tauri.brand.generated.conf.json`; both are intentionally ignored.
