# OAuth 应用程序注册指南

> **目的**：在每个平台上注册 OAuth 应用程序的具体步骤。
> 这应该与[清单](oauth-registration-checklist.md)配合使用以跟踪进度。

> **重要事实**：PKCE 客户端 ID 是 **公开的**（不是秘钥）。它们可以安全地提交到代码库并随二进制文件一起发布。
> 发行的**客户端秘钥 **(Client Secrets) 存储在 Bitwarden 中，绝不提交。

---

## 标准值（用于每个服务）

| 字段 | 填入值 |
|-------|---------|
| **应用名称** | `OpenPawz` |
| **描述** | `基于AI的桌面助手` |
| **应用程序类型** | 原生 / 桌面 / 已安装（选择不是"网络服务器"的选项） |
| **网站/主页** | `https://openpawz.com` |
| **重定向URI** | `http://127.0.0.1:0/callback` |
| **备用重定向URI** | `http://localhost:19284/callback` （如果门户拒绝端口 0） |
| **隐私政策** | `https://openpawz.com/privacy` |
| **服务条款** | `https://openpawz.com/terms` |
| **联系邮箱** | `dev@openpawz.ai` |

---

## 字段名称翻译

不同的登录门户对相同概念使用不同名称：

| 我们称呼它 | 在门户上你将看到的其他名称 |
|------------|-----------------------------------|
| **客户端ID** | App ID, Application ID, Consumer Key, API Key, App Key |
| **客户端秘钥** | App Secret, Consumer Secret, API Secret, Secret Key |
| **重定向URI** | Callback URL, Redirect URL, OAuth redirect, Return URL, Authorization callback URL |
| **范围 **(Scopes) | Permissions, Access levels, API permissions |
| **原生/桌面** | Installed app, Public client, Mobile app, SPA, Single-page app |

---

## 每次注册后

1. 打开 Bitwarden → 找到该服务条目
2. 将**客户端ID**粘贴到 `client_id` 自定义字段中
3. 将（如发放的）**客户端秘钥**粘贴到 `client_secret` 自定义字段中
4. 保存条目
5. 标记 [清单](oauth-registration-checklist.md) 中的行 ✅

---

## 逐项服务指南

### 生产力及项目管理

#### Asana
1. 访问 https://app.asana.com/0/developer-console
2. 点击 **"创建新应用"**
3. **应用名称:** `OpenPawz` → 点击 **"创建应用程序"**
4. 在侧面菜单点击 **"OAuth"**
5. **重定向URL:** `http://127.0.0.1:0/callback` → **"添加"**
6. 复制此页面上的**客户端ID**和**客户端密钥**
7. 存储在 Bitwarden

#### Basecamp
1. 访问 https://launchpad.37signals.com/integrations
2. 点击 **"注册您的应用程序"**（如有需要，先注册 37signals ID）
3. **姓名:** `OpenPawz`, **公司:** `OpenPawz`
4. **重定向 URI:** `http://127.0.0.1:0/callback`
5. 复制**客户端ID**和**客户端秘钥**
6. 存储在 Bitwarden

#### ClickUp
1. 登录 ClickUp → 访问 https://app.clickup.com/settings/integrations
2. 滚动至**"ClickUp API"** → 点击 **"创建应用程序"**
3. **应用名称:** `OpenPawz`
4. **重定向 URL(s):** `http://127.0.0.1:0/callback`
5. 复制**客户端ID**和**客户端秘钥**
6. 存储在 Bitwarden

#### Figma
1. 访问 https://www.figma.com/developers/apps → **"创建新应用程序"**
2. **应用名称:** `OpenPawz`, **网站URL:** `https://openpawz.com`
3. **回调URL:** `http://127.0.0.1:0/callback`
4. 点击 **"保存"**
5. 复制**客户端ID**和**客户端秘钥**
6. 存储在 Bitwarden

#### Harvest
1. 访问 https://id.getharvest.com/oauth2/access_tokens
2. 点击 **"创建新的OAuth2应用程序"**
3. **姓名:** `OpenPawz`, **重定向URL:** `http://127.0.0.1:0/callback`
4. 复制**客户端ID**和**客户端秘钥**
5. 存储在 Bitwarden

#### Linear
1. 访问 https://linear.app/settings/api → **"OAuth 应用程序"** 选项卡
2. 点击 **"创建新"**
3. **应用程序名称:** `OpenPawz`
4. **重定向回调URL:** `http://127.0.0.1:0/callback`
5. **开发者URL:** `https://openpawz.com`
6. 点击 **"创建"**
7. 复制**客户端ID**和**客户端秘钥**
8. 存储在 Bitwarden

#### Miro
1. 访问 https://developers.miro.com → 登录 → 点击 **"你的应用程序"**
2. 点击 **"创建新应用程序"**
3. **应用程序名称:** `OpenPawz`
4. 在应用程序设置中, 查找 **"OAuth2.0 的重定向URI"**
5. 输入 `http://127.0.0.1:0/callback`
6. 复制**客户端ID**和**客户端秘钥**
7. 存储在 Bitwarden

#### Monday.com
1. 访问 https://monday.com/developers/apps → **"创建应用程序"**
2. **应用程序名称:** `OpenPawz`
3. 在侧边栏中, 进入 **"OAuth & 权限"**
4. **重定向 URL:** 添加 `http://127.0.0.1:0/callback`
5. 选择你需要的**范围**(Scopes)（开始时选择 `boards:read`, `me:read`）
6. 进入 **"基本信息"** → 复制**客户端ID**和**客户端秘钥**
7. 存储在 Bitwarden

#### ProductBoard
1. 访问 https://developer.productboard.com → 登录
2. 导航到你的应用程序设置 → **"创建应用程序"**
3. **名称:** `OpenPawz`
4. **重定向 URI:** `http://127.0.0.1:0/callback`
5. 复制**客户端ID**和**客户端秘钥**
6. 存储在 Bitwarden

#### Slack
1. 访问 https://api.slack.com/apps → **"创建新应用程序"** → **"从头开始"**
2. **应用程序名称:** `OpenPawz`, 选择工作空间
3. 侧边栏目中点击 "OAuth & 权限"
4. 在 "重定向URLs"下方点击 "添加新重定向URL"
5. 输入 `http://127.0.0.1:0/callback` → "添加" → "保存URL"
6. 往下滚动到 "作用域" → 添加Bot Token作用域: `chat:write`, `channels:read`, `users:read`
7. 转到 "基本信息" → 复制 **客户端ID** 和 **客户端密钥**
8. 保存于 Bitwarden

#### Teamwork
1. 访问 https://developer.teamwork.com → 登录
2. 点击 "创建应用程序"
3. **应用程序名称:** `OpenPawz`
4. **重定向 URI:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端密钥**
6. 保存于 Bitwarden

#### TickTick
1. 访问 https://developer.ticktick.com/manage → 登录
2. 点击 "创建应用程序" 或 "添加应用程序"
3. **应用程序名:** `OpenPawz`
4. **重定向 URL:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端密钥**
6. 保存于 Bitwarden

#### Timely
1. 访问 https://timelyapp.com/developer → 登入
2. **"创建一个应用"**
3. **应用名:** `OpenPawz`
4. **重定向URI:** `http://127.0.0.1:0/callback`
5. 复制**应用程序ID **(= 客户端ID) 和 **密码**
6. 保存于 Bitwarden

#### Wrike
1. 访问 https://www.wrike.com/apps/api → 登入
2. 点击 **API应用** 下的 **"创建新的"**
3. **App Name:** `OpenPawz`
4. **Redirect URI:** `http://127.0.0.1:0/callback`
5. 复制 **Client ID** 和 **Client Secret**
6. 保存于 Bitwarden

#### Canva
1. 访问 https://www.canva.com/developers/ → 注册 → **"创建一个应用"**
2. **应用名称:** `OpenPawz`
3. **重定向 URL:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存于 Bitwarden

#### Mural
1. 访问 https://developers.mural.co → 注册 → **"创建应用"**
2. **应用名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存于 Bitwarden

#### Envoy
1. 访问 https://developers.envoy.com → 登录
2. **"创建集成"** 或 **"新建应用"**
3. **名称:** `OpenPawz`
4. **重定向 URI:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端密钥**
6. 保存于 Bitwarden

#### Workable
1. 访问 https://developer.workable.com → 登录
2. **"创建应用"**
3. **名称:** `OpenPawz`
4. **重定向 URL:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端密钥**
6. 保存于 Bitwarden

---

### CRM & 销售

#### HubSpot
1. 访问 https://developers.hubspot.com → 注册/登录
2. 如需要，请点击查看 **"创建开发者账户"**（免费）
3. 转到顶部导航栏中的 **"应用"** → **"创建应用"**
4. **应用名称:** `OpenPawz`
5. 转到 **"授权"** 标签页
6. **重定向 URL:** `http://127.0.0.1:0/callback`
7. 在 **权限范围** 下，添加 `crm.objects.contacts.read`
8. 从授权标签页复制 **客户端ID** 和 **客户端密钥**
9. 保存到 Bitwarden

#### Salesforce
1. 访问 https://developer.salesforce.com 注册免费开发者版本
2. 登陆后，点击齿轮图标 → **"设置"**
3. 在左侧搜索栏输入 **"应用管理器"** → 点击它
4. 点击 **"新建连接应用"**
5. **连接应用名称:** `OpenPawz`, **联系邮箱:** `dev@openpawz.ai`
6. 勾选 **"启用OAuth设置"**
7. **回掉URL:** `http://127.0.0.1:0/callback`
8. **选定OAuth权限范围:** 增加 `完全访问(full)` 及 `可随时执行请求(refresh_token, offline_access)`
9. 点击 **"保存"** → **"继续"**
10. 等待 2-10 分钟，然后返回应用管理器 → 找到 OpenPawz → 下拉菜单 → **"查看"**
11. 点击 **"管理消费者详细信息"** → 复制 **消费者密钥**(= 客户端ID) 及 **消费者密钥**
12. 保存到 Bitwarden

#### Pipedrive
1. 进入 https://developers.pipedrive.com 登陆
2. 前往 **"开发者中心"** → **"创建一个应用"** → 选择 **"OAuth"**
3. **应用名称:** `OpenPawz`
4. **回调-url:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端密钥**
6. 保存到 Bitwarden

#### Close
1. 进入 https://developer.close.com 登陆
2. **"创建应用"**
3. **姓名:** `OpenPawz`, **重定向-uri:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Copper
1. 进入 https://developer.copper.com 登陆
2. 创建新的OAuth应用
3. **姓名:** `OpenPawz`, **重定向-uri:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Attio
1. 进入 https://developers.attio.com 登陆
2. **"创建应用"**
3. **姓名:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Zoho
1. 访问 https://api-console.zoho.com 登录或创建免费 Zoho 账户
2. 点击 **"新增客户"** → 选择 **"服务器应用程序"**（或桌面应用）
3. **客户名称:** `OpenPawz`, **首页 URL:** `https://openpawz.com`
4. **授权重定向 URI:** `http://127.0.0.1:0/callback`
5. 点击 **"创建"**
6. 复制 **客户端ID** 和 **客户端密钥**
7. 保存于 Bitwarden

#### Zendesk Sell
1. 访问 https://developer.zendesk.com 登录
2. 导航到 API 设置 → **"OAuth 客户端"** → **"添加 OAuth 客户端"**
3. **名字:** `OpenPawz`, **重定向 URL:** `http://127.0.0.1:0/callback`
4. 复制 **客户端 ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Wealthbox
1. 访问 https://dev.wealthbox.com 登录
2. **"创建应用"**
3. **名字:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端 ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### PreciseFP
1. 访问 https://developer.precisefp.com 登录
2. **"创建应用程序"**
3. **名字:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端 ID** 和 **客户端密钥**
5. 保存到 Bitwarden

---

### 沟通与社交

#### Discord
1. 访问 https://discord.com/developers/applications → **"新建应用程序"**
2. **名字:** `OpenPawz` → **"创建"**
3. 在侧边栏中，点击 **"OAuth2"**
4. 复制 **客户端ID** 和 **客户端密钥**
5. 在 **重定向** 下，点击 **"添加重定向"** → `http://127.0.0.1:0/callback` → **"保存更改"**
6. 保存到 Bitwarden

#### Microsoft 365
> 已注册。客户端 ID: `e1026883-ecd3-4116-a2dd-49cd43eea191`

如果需要重新注册:
1. 访问 https://portal.azure.com → **"应用注册"** → **"新注册"**
2. **名字:** `OpenPawz`
3. **支持的账户类型:** 任何目录中的账户+个人账户
4. **重定向 URI:** 平台 = **公共客户端/本地**, URI = `http://127.0.0.1:0/callback`
5. 点击 **"注册"**
6. 复制 **应用程序（客户端）ID**
7. 转到 **证书和密钥** → **"新客户端密钥"** → 复制 **值**
8. 保存到 Bitwarden

#### Webex
1. 访问 https://developer.webex.com/my-apps → **"创建新应用"**
2. 选择 **"集成"**
3. **名字:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 选择作用域: `spark:messages_read`, `spark:rooms_read`
5. 点击 **"添加集成"**
6. 复制 **客户端ID** 和 **客户端密钥**
7. 保存到 Bitwarden

#### Tumblr
1. 访问 https://www.tumblr.com/oauth/apps → **"注册应用程序"**
2. **应用程序名称:** `OpenPawz`, **默认回调URL:** `http://127.0.0.1:0/callback`
3. **应用程序网站:** `https://openpawz.com`
4. 点击 **"注册"**
5. 复制 **OAuth 消费者密钥** (= 客户端ID) 和 **密钥**
6. 保存到 Bitwarden

#### Reddit
1. 访问 https://www.reddit.com/prefs/apps → 向下滚动 → **"创建另一个应用程序..."**
2. **名字:** `OpenPawz`
3. 选择 **"已安装的应用程序"** （本地/桌面类型）
4. **重定向uri:** `http://127.0.0.1:0/callback`
5. 点击 **"创建应用程序"**
6. 客户端ID 在应用名称下的字符串
7. 已安装的应用程序不会发出客户端密钥——PKCE会处理它
8. 保存到 Bitwarden

---

### 开发工具与DevOps

#### GitHub
1. 访问 https://github.com/settings/developers → **"OAuth Apps"** 选项卡
2. 点击 **"新建OAuth App"**
3. **应用程序名称:** `OpenPawz`
4. **首页URL:** `https://openpawz.com`
5. **授权回调URL:** `http://127.0.0.1:0/callback`
6. 点击 **"注册应用程序"**
7. 复制 **客户端ID**，然后点击 **"生成新的客户端密钥"** → 复制密钥
8. 保存到 Bitwarden

#### Bitbucket
1. 访问 https://bitbucket.org/account/settings/app-authorizations/
2. 点击 **"添加消费者"**
3. **名字:** `OpenPawz`, **回调URL:** `http://127.0.0.1:0/callback`
4. **URL:** `https://openpawz.com`
5. 根据需要选择权限
6. 点击 **"保存"**
7. 复制 **密钥** (= 客户端ID) 和 **密钥**
8. 保存到 Bitwarden

#### Atlassian / Jira
1. 访问 https://developer.atlassian.com/console/myapps/
2. 点击 **"创建"** → **"OAuth 2.0 集成"**
3. **名字:** `OpenPawz` → **"创建"**
4. 在侧边栏中，点击 **"授权"** → **"OAuth 2.0 (3LO)"** 旁的 **"添加"**
5. **回调 URL:** `http://127.0.0.1:0/callback` → **"保存更改"**
6. 在侧边栏，**"权限"** → **"Jira API"** → 配置权限范围
7. 转到 **"设置"** → 复制 **客户端ID**
8. **密钥**可能只显示一次——立即复制
9. 保存到 Bitwarden

#### DigitalOcean
1. 访问 https://cloud.digitalocean.com/account/api/applications → **"注册一个新的OAuth应用程序"**
2. **名字:** `OpenPawz`, **首页 URL:** `https://openpawz.com`
3. **回调 URL:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### PagerDuty
1. 访问 https://developer.pagerduty.com/apps → **"新建应用"**
2. **名字:** `OpenPawz`, **说明:** `AI 桌面助手`
3. 添加 **OAuth 2.0** 功能
4. **重定向 URL:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端密钥**
6. 保存到 Bitwarden

#### Webflow
1. 访问 https://developers.webflow.com → 登录 → **"创建应用"**
2. **应用程序名称:** `OpenPawz`, **首页:** `https://openpawz.com`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Zapier
1. 访问 https://developer.zapier.com → 登录
2. **"创建集成"**
3. **名字:** `OpenPawz`
4. 在 **认证** 中，选择 **OAuth 2.0**
5. **重定向 URI:** `http://127.0.0.1:0/callback`
6. 复制 **客户端ID** 和 **客户端密钥**
7. 保存到 Bitwarden

#### WakaTime
1. 访问 https://wakatime.com/apps → **"创建新应用"**
2. **应用程序名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **应用程序 ID** (= 客户端 ID) 和 **应用程序密钥**
5. 保存到 Bitwarden

#### Snowflake
1. 前往您的 Snowflake 帐户 → **管理员** → **安全性** → **OAuth**
2. 创建一个新的 OAuth 集成（SQL 命令）：
    ```sql
    CREATE SECURITY INTEGRATION openpawz
      TYPE = OAUTH
      OAUTH_CLIENT = CUSTOM
      OAUTH_REDIRECT_URI = 'http://127.0.0.1:0/callback'
      ENABLED = TRUE;
    ```
3. 运行 `DESCRIBE INTEGRATION openpawz;` 获取客户端 ID
4. 保存到 Bitwarden

> Snowflake 是特定实例的——验证 URL 使用您的账户子域名。

#### Squarespace
1. 前往 https://developers.squarespace.com → 登录 → **"创建应用"**
2. **应用名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

---

### 营销与邮件

#### Mailchimp
1. 前往 https://admin.mailchimp.com/account/oauth2/ → **"注册并测试 OAuth2 应用程序"**
2. **应用程序名称:** `OpenPawz`
3. **重定向 URL:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Constant Contact
1. 前往 https://app.constantcontact.com/pages/dma/portal/ → **"创建应用程序"**
2. **名字:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback` → **"保存"**
4. 复制 **API 密钥** (= 客户端ID) 和 **应用秘密**
5. 保存到 Bitwarden

#### Outreach
1. 前往 https://developers.outreach.io → 登录 → **"创建应用"**
2. **名字:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **应用程序 ID** (= 客户端ID) 和 **应用程序密钥**
5. 保存到 Bitwarden

#### SalesLoft
1. 前往 https://developers.salesloft.com → 登录 → **"创建应用"**
2. **名字:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **应用程序 ID** 和 **密钥**
5. 保存到 Bitwarden

#### Keap (Infusionsoft)
1. 前往 https://developer.keap.com → 登录 → **"创建"**
2. **应用程序名称:** `OpenPawz`
3. 在 OAuth 设置下，**重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### HighLevel
1. 前往 https://marketplace.gohighlevel.com → 登录 → **"创建应用"**
2. **名字:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Brex
1. 前往 https://developer.brex.com → 登录
2. **"创建应用"**
3. **名字:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

---

### 社交媒体与视频

#### Twitter/X
1. 访问 https://developer.twitter.com/en/portal
2. 如尚未申请则申请开发者访问权限（免费 — 通常当天获批）
3. 一旦获得批准，**项目和应用程序** → **"+ 添加应用程序"**
4. **应用程序名称:** `OpenPawz`
5. 复制 **API 密钥** 和 **API 密钥的秘密**（保存但是我们主要需要 OAuth 2.0 客户端 ID）
6. 前往应用 **设置** → **"用户身份验证设置"** → **"设置"**
7. **应用程序权限:** 读取和写入
8. **应用程序类型:** 本地应用程序
9. **回调URI:** `http://127.0.0.1:0/callback`
10. **网站URL:** `https://openpawz.com`
11. 点击**"保存"** → 复制显示的 **OAuth 2.0 客户端 ID**（这是我们所需的）
12. 保存到 Bitwarden

#### LinkedIn
1. 访问 https://www.linkedin.com/developers/apps → **"创建应用程序"**
2. **应用程序名称:** `OpenPawz`
3. **LinkedIn 页面:** （如果没有，请创建一个 OpenPawz 公司页面）
4. **应用徽标:** 上传 OpenPawz 徽标
5. **隐私政策 URL:** `https://openpawz.com/privacy`
6. 同意条款 → **"创建应用"**
7. 前往 **"授权**" → 在 **已授权重定向 URL** 下，添加 `http://127.0.0.1:0/callback`
8. 复制 **客户端ID** 和 **客户端密钥**
9. 保存到 Bitwarden

#### TikTok (账户 / 个人)
1. 访问 https://developers.tiktok.com → 登录 → **"我的应用"** → **"创建应用"**
2. **应用名称:** `OpenPawz`
3. 在 **登录工具包** 下，添加 **重定向 URI:** `http://127.0.0.1:0/callback`
4. 选择权限范围: `user.info.basic`
5. 提交 — 应用可在 **沙盒/开发模式**立即工作（限制为测试用户）
6. 复制 **客户端密钥** (= 客户端 ID) 和 **客户端秘密**
7. 保存到 Bitwarden

> 之后申请应用审查以获取公众访问。不会阻碍当前操作。

#### TikTok Ads
1. 访问 https://business.tiktok.com/apps → **"创建应用"**
2. **应用名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **应用程序 ID** (= 客户端ID) 和 **机密**
5. 保存到 Bitwarden

#### Snapchat
1. 访问 https://business.snapchat.com/developer → 登录 → **"创建应用"**
2. **应用名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Pinterest
1. 访问 https://developers.pinterest.com → 登录 → **"我的应用"** → **"创建应用"**
2. **应用名称:** `OpenPawz`, **描述:** `AI桌面助手`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **应用 ID** (= 客户端ID) 和 **应用密钥**
5. 保存到 Bitwarden

#### Spotify
1. 访问 https://developer.spotify.com/dashboard → **"创建应用"**
2. **应用名称:** `OpenPawz`, **应用描述:** `AI桌面助手`
3. **重定向 URI:** `http://127.0.0.1:0/callback` → **"添加"**
4. **哪些 API/SDK:** 勾选 **"Web API"**
5. 同意条款 → **"保存"**
6. 点击 **"设置** → 复制 **客户端ID**，点击 **"查看客户端密钥"** → 复制
7. 保存到 Bitwarden

#### Twitch
1. 访问 https://dev.twitch.tv/console/apps → **"注册您的应用程序"**
2. **名字:** `OpenPawz`
3. **OAuth 重定向 URI:** `http://127.0.0.1:0/callback`
4. **类别:** 应用程序集成
5. 点击 **"创建"**
6. 在应用程序上点击 **"管理"** → 复制 **客户端ID**，生成 **客户端密钥**
7. 保存到 Bitwarden

#### Vimeo
1. 访问 https://developer.vimeo.com/apps → **"创建一个应用"**
2. **应用名:** `OpenPawz`, **說明:** `AI桌面助手`
3. **應用網址:** `https://openpawz.com`
4. **回傳網址:** `http://127.0.0.1:0/callback`
5. 複製 **客戶端識別碼** （= 客戶端ID）和 **客戶端密碼**
6. 保存至 Bitwarden

#### YouTube
> 建立在 Google 上. 已在 Google Workspace 中註冊.
> 不需要額外的註冊 — 使用相同的 Google OAuth 客戶端ID.

#### Strava
1. 訪問 https://www.strava.com/settings/api → （創建帳戶或登錄）
2. **應用名稱:** `OpenPawz`
3. **類型:** 實用工具
4. **網站:** `https://openpawz.com`
5. **授權回調域名:** `127.0.0.1`
6. 保存 → 複製 **客戶端ID** 和 **客戶端密碼**
7. 保存至 Bitwarden

#### Osu
1. 訪問 https://osu.ppy.sh/home/account/edit#oauth → 滾動到 **"OAuth"**
2. 點擊 **"新 OAuth 應用程序"**
3. **應用程序名:** `OpenPawz`
4. **應用程序回調 URL:** `http://127.0.0.1:0/callback`
5. 點擊 **"註冊應用程序"**
6. 複製 **客戶端ID** 和 **客戶端密碼**
7. 保存至 Bitwarden

#### Yahoo
1. 訪問 https://developer.yahoo.com/apps → **"創建一個App"**
2. **應用程序名:** `OpenPawz`
3. **應用程序類型:** 已安裝應用程序
4. **重定向 URI(s):** `http://127.0.0.1:0/callback`
5. 選擇API權限: 選中 **配置文件 (社交目錄) — 讀取**
6. 點擊 **"創建App"**
7. 複製 **客戶端ID (消費者密鑰)** 和 **客戶端密碼 (消費者密碼)**
8. 保存至 Bitwarden

#### Yandex
1. 訪問 https://oauth.yandex.com/client/new
2. **應用名:** `OpenPawz`
3. **平台:** 選中 **"Web服務"**
4. **回調URI:** `http://127.0.0.1:0/callback`
5. 根據需要選擇作用域
6. 點擊 **"創建"**
7. 複製 **客戶端ID** 和 **客戶端密碼**
8. 保存至 Bitwarden

#### LinkHut
1. 訪問 https://ln.ht → 登錄 → 帳戶設置 → **"OAuth"**
2. **"註冊一個新的OAuth客戶端"**
3. **名字:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端密碼**
5. 保存至 Bitwarden

---

### 會計&金融

#### QuickBooks / Intuit
1. 訪問 https://developer.intuit.com/app/developer/dashboard → 註冊（免費）
2. 點擊 **"創建應用程序"**
3. 選擇 **"QuickBooks Online and Payments"**
4. **應用名:** `OpenPawz`
5. 在您的應用程序的 **"密鑰和憑證"** 部分：
    - **重定向 URI:** `http://127.0.0.1:0/callback`
6. 複製 **客戶端ID** 和 **客戶端密碼** （使用 **開發** 密鑰進行測試）
7. 保存至 Bitwarden

> QuickBooks 和 Intuit 共享同一個開發者入口 – 一個註冊涵蓋兩者。

#### Xero
1. 訪問 https://developer.xero.com/app/manage → **"新應用"**
2. **應用名:** `OpenPawz`
3. **集成類型:** Web 應用
4. **公司或應用程序 URL:** `https://openpawz.com`
5. **重定向 URI:** `http://127.0.0.1:0/callback`
6. 點擊 **"創建應用"**
7. 點擊 **"生成密鑰"** → 複製 **客戶端ID** 和 **客戶端密碼**
8. 保存至 Bitwarden

#### Sage
1. 訪問 https://developer.sage.com → 註冊 → **"創建應用"**
2. **名字:** `OpenPawz`
3. **回調 URL:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端密碼**
5. 保存至 Bitwarden

#### Wave Accounting
1. 前往 https://developer.waveapps.com → 註冊（免費） → **”創建應用程序“**
2. **名稱：** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端Secret**
5. 保存至 Bitwarden

#### FreshBooks
1. 前往 https://my.freshbooks.com/#/developer → 登入 → **"創建應用程式"**
2. **名稱：** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** (= 應用程式 ID) 和 **客戶端Secret**
5. 保存至 Bitwarden

#### Exact Online
1. 前往 https://apps.exactonline.com → 登入 → **"管理應用"** → **"登記"**
2. **名稱：** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端Secret**
5. 保存至 Bitwarden

#### Mercury
1. 前往 https://dashboard.mercury.com/developers → 登入
2. **"創建應用程式"**
3. **名稱：** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端Secret**
5. 保存至 Bitwarden

#### Twinfield
1. 前往 https://login.twinfield.com → 登入 → 導航到開發設置
2. 創建一個 OAuth 應用程式
3. **名稱：** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端Secret**
5. 保存至 Bitwarden

#### Schwab
1. 前往 https://developer.schwab.com → 註冊（免費） → **"創建應用程式"**
2. **應用名稱：** `OpenPawz`
3. **回調 URL:** `http://127.0.0.1:0/callback`
4. 複製 **應用金鑰** (= 客戶端ID) 和 **秘密**
5. 保存至 Bitwarden

---

### 電商和支付

#### Stripe
1. 前往 https://dashboard.stripe.com/apps → **"創建應用程式"** （或者使用 Stripe Connect OAuth）
2. **應用名稱：** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **密碼金鑰**
5. 保存至 Bitwarden

#### PayPal
1. 前往 https://developer.paypal.com/developer/applications → 登錄（免費）
2. 在 **REST API applications** 中, 點擊 **"創建應用程式"**
3. **应用名:** `OpenPawz`
4. 點擊 **"創建應用程式"** → 你將被帶到應用程式詳細頁面
5. 複製 **客戶端ID** 和 **機密** （在沙箱/實時之間切換）
6. 對於 OAuth 重定向, 轉到應用設定 → 添加 `http://127.0.0.1:0/callback` 作為返回 URL
7. 保存至 Bitwarden

#### Square
1. 前往 https://developer.squareup.com/apps → **"創建應用程序"**
2. **應用程序名:** `OpenPawz`
3. 前往 **"OAuth"** 標籤 → 添加 **重定向 URL:** `http://127.0.0.1:0/callback`
4. 複製 **應用 ID** (= 客户ID) 和 **應用程序機密**
5. 保存於 Bitwarden

#### Mollie
1. 前往 https://my.mollie.com/dashboard/developers/applications → **"創建應用程序"**
2. **名稱:** `OpenPawz`
3. **重定向 URL:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端 ID** 和 **客戶端機密**
5. 保存於 Bitwarden

#### Braintree
1. 前往 https://developer.paypal.com/braintree → 註冊（免費沙盒） → **"創建應用程序"**
2. **名稱:** `OpenPawz`
3. **OAuth 重定向 URL:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端 ID** 和 **客戶端機密**
5. 保存於 Bitwarden

#### 亚马逊 (登录亚马逊)
1. 前往 https://developer.amazon.com/loginwithamazon → 登錄 → **"創建新的安全配置文件"**
2. **安全配置文件名稱:** `OpenPawz`
3. **安全配置描述:** `AI 地面助手`
4. **同意隱私權通知 URL:** `https://openpawz.com/privacy`
5. 點擊 **"保存"**
6. 點擊 **"顯示客戶端 ID 和客戶端密碼"** 或齒輪圖標 → **"網路上設置"**
7. **允許返回 URL:** `http://127.0.0.1:0/callback`
8. 複製 **客戶端 ID** 和 **客戶端機密**
9. 保存於 Bitwarden

#### eBay
1. 前往 https://developer.ebay.com/my/keys → 登錄（免費開發者計劃）
2. 點擊 **"創建"** 下的申請鍵
3. **申請標題:** `OpenPawz`
4. 選擇 **沙盒** 或 **生產** 環境
5. 在 **OAuth 詳細信息** 下，添加 **RuName** (eBay 的重定向 URI 別名)
6. 設定 **接受 URL:** `http://127.0.0.1:0/callback`
7. 複製 **App ID** (= 客戶端 ID) 和 **Cert ID** (= 客戶端密碼)
8. 保存於 Bitwarden

#### Printful
1. 前往 https://developers.printful.com → 登入 → **"創建 App"**
2. **名稱:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端ID** 和 **客戶端Secret**
4. 保存於 Bitwarden

#### ThriveCart
1. 前往 https://thrivecart.com/developers → 登入
2. **"創建App"**, **名稱:** `OpenPawz`
3. **重定向URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端Secret**
5. 保存於 Bitwarden

#### Ramp
1. 前往 https://developer.ramp.com → 註冊（免費） → **"創建App"**
2. **名稱:** `OpenPawz`
3. **重定向URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端Secret**
5. 保存於 Bitwarden

---

### HR & Recruiting

#### BambooHR
1. 前往 https://documentation.bamboohr.com → 登入您自己的 BambooHR 實例
2. 前往 **Account** → **Apps** → **"創建新應用"**
3. **名稱:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端ID** 和 **客戶端Secret**
5. 保存於 Bitwarden

> BambooHR 授權 URL 使用 `{subdomain}.bamboohr.com` — 子域名是用戶的公司名稱。

#### Deel
1. 前往 https://developer.deel.com → 登入 → **"創建App"**
2. **名稱:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端ID** 和 **客戶端Secret**
4. 保存於 Bitwarden

#### Employment Hero
1. 前往 https://developer.employmenthero.com → 登入 → **"創建App"**
2. **名稱:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端ID** 和 **客戶端Secret**
4. 保存於 Bitwarden

#### Gusto
1. 前往 https://dev.gusto.com → 註冊（免費） → **"創建應用"**
2. **名稱:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端ID** 和 **客戶端Secret**
4. 保存於 Bitwarden

#### JobAdder
1. 前往 https://developers.jobadder.com → 登入 → **"創建App"**
2. **名稱:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端ID** 和 **客戶端Secret**
4. 保存於 Bitwarden

#### Namely
1. 前往 https://developers.namely.com → 登入 → **"創建App"**
2. **名稱:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端ID** 和 **客戶端Secret**
4. 保存於 Bitwarden

> 授權 URL 使用 `{company}.namely.com` — 公司子域名是特定實例的。

#### Paycor
1. 前往 https://developers.paycor.com → 註冊（免費） → **"創建App"**
2. **名稱:** `OpenPawz`, **重定向URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端ID** 和 **客戶端Secret**
4. 保存於 Bitwarden

#### Payfit
1. 前往 https://developers.payfit.io → 登入 → **"創建應用"**
2. **名稱:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端 ID** 和 **客戶端密鑰**
4. 保留在 Bitwarden

#### Sage People
1. 与 Salesforce 相同 — Sage People 运行在 Salesforce 平台上
2. 遵循上面的 **Salesforce** 操作指南
3. 范围: `offline_access api`
4. 保留在 Bitwarden

#### Workday
1. 前往 https://community.workday.com → 登入 → 导航至 **"API Clients"**
2. **"注册 API Client"**
3. **名稱:** `OpenPawz`
4. **重定向 URI:** `http://127.0.0.1:0/callback`
5. 複製 **客戶端 ID** 和 **客戶端密鑰**
6. 保留在 Bitwarden

> 认证 URL 使用 `{domain}/{tenant}` — 特定实例的。

#### Zenefits
1. 前往 https://developers.zenefits.com → 登入 → **"創建應用"**
2. **名稱:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端 ID** 和 **客戶端密鑰**
4. 保留在 Bitwarden

#### TSheets
1. 前往 https://developer.tsheets.com → 註冊（免費） → **"創建應用"**
2. **名稱:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端 ID** 和 **客戶端密鑰**
4. 保留在 Bitwarden

---

### 支持與工單系統

#### Zendesk
1. 前往您的 Zendesk 管理员 → **Admin Center** → **Apps and integrations** → **APIs** → **Zendesk API**
2. 点击 **"OAuth Clients"** 选项卡 → **"添加 OAuth 客户端"**
3. **客户名称:** `OpenPawz`
4. **重定向 URL:** `http://127.0.0.1:0/callback`
5. 复制 **唯一标识符** (= 客户端 ID) 和 **密鑰**
6. 保留在 Bitwarden

> 认证 URL 使用 `{subdomain}.zendesk.com` — 实例特定的。

#### Intercom
1. 前往 https://app.intercom.com/a/apps/_/developer-hub → **"新建应用"**
2. **应用名称:** `OpenPawz`
3. 在应用设置中，前往 **"认证"** → **"OAuth"**
4. **重定向 URL:** `http://127.0.0.1:0/callback`
5. 复制 **客户端 ID** 和 **客户端密鑰**
6. 保留在 Bitwarden

#### Help Scout
1. 前往 https://developer.helpscout.com → **"我的应用程序"** → **"创建我的应用程序"**
2. **应用名称:** `OpenPawz`
3. **重定向 URL:** `http://127.0.0.1:0/callback`
4. 复制 **应用程序 ID** (= 客户端 ID) 和 **应用密鑰**
5. 保留在 Bitwarden

#### ServiceNow
1. 前往您的 ServiceNow 实例 → **System OAuth** → **Application Registry**
2. 点击 **"新建"** → **"连接第三方 OAuth 提供者"** （或者创建一个 OAuth 客户端）
3. **名称:** `OpenPawz`
4. **重定向 URL:** `http://127.0.0.1:0/callback`
5. 复制 **客户端 ID** 和 **客户端密鑰**
6. 保留在 Bitwarden

> 认证 URL 使用 `{subdomain}.service-now.com` — 实例特定的。

#### NinjaOne RMM
1. 前往 https://app.ninjarmm.com → **Administration** → **Apps** → **API**
2. **"添加"** 新的客户端应用
3. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密码**
5. 保留在 Bitwarden

#### Aircall
1. 前往 https://developer.aircall.io → 登录 → **"创建App"**
2. **名字:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密码**
5. 保留在 Bitwarden

---

### 云存储与文件

#### Dropbox
1. 前往 https://www.dropbox.com/developers/apps → **"创建应用程序"**
2. 选择 **"有范围访问权限"** → **"完整的 Dropbox"**
3. **名字:** `OpenPawz` → **"创建应用程序"**
4. 在 **OAuth 2 - 重定向 URI** 下，添加 `http://127.0.0.1:0/callback`
5. 复制 **应用密钥** (= 客户端ID) 和 **应用秘密**
6. 保留在 Bitwarden

#### Box
1. 前往 https://developer.box.com → 登录 → **"我的应用程序"** → **"创建新的应用程序"**
2. 选择 **"自定义应用程序"** → **"用户认证 (OAuth 2.0)"**
3. **应用名字:** `OpenPawz`
4. 在 **配置** 选项卡 → **OAuth 2.0重定向 URI:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端秘密**
6. 保留在 Bitwarden

#### OneDrive Personal
> 使用微软 OAuth。已经在 Microsoft 365 中注册。
> 如果您需要为个人（仅限消费者）单独注册：
1. 前往 Azure 门户 → 应用注册 → 新注册
2. **支持的账户类型:** 仅个人微软账户
3. 重定向 URI: **公共客户端/本机** → `http://127.0.0.1:0/callback`
4. 复制 **应用程序（客户端）ID**
5. 保留在 Bitwarden

#### Egnyte
1. 前往 https://developers.egnyte.com → 注册（免费） → **"注册应用程序"**
2. **应用程序名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密码**
5. 保留在 Bitwarden

> 认证 URL 使用 `{subdomain}.egnyte.com` — 特定实例。

#### Google Drive
> 属于 Google。已经在 Google Workspace 中注册。

#### Contentful
1. 访问 https://app.contentful.com/account/profile/developers/applications → **"新应用程序"**
2. **名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

---

### 法律 & 电子签名

#### DocuSign
1. 访问 https://admindemo.docusign.com/apps-and-keys (演示/沙箱) → 注册（免费）
2. 点击 **"添加应用和集成键"**
3. **应用名称:** `OpenPawz`
4. 复制 **集成键** (= 客户端ID)
5. 点击 **"添加秘密键"** → 复制密码
6. 在 **"更多设置"** 下，添加 **重定向 URI:** `http://127.0.0.1:0/callback`
7. 保存到 Bitwarden

#### Dropbox Sign (HelloSign)
1. 查看 https://app.hellosign.com/home/myAccount#integrations → **"API"** 标签页
2. 点击 **"创建应用程序"**
3. **名称:** `OpenPawz`, **OAuth 回调 URL:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Ironclad
1. 查看 https://developer.ironcladapp.com → 登录 → **"创建应用程序"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### SignNow
1. 查看 https://app.signnow.com/api/integrations → **"创建应用程序"**
2. **名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### DATEV
1. 查看 https://developer.datev.de → 注册（免费） → **"创建应用程序"**
2. **名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

---

### 调度 & 调查

#### Acuity Scheduling
1. 访问 https://acuityscheduling.com/oauth2 → 登录
2. **"注册新应用"**
3. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### SurveyMonkey
1. 访问 https://developer.surveymonkey.com/apps → **"创建应用程序"**
2. **应用名称:** `OpenPawz`
3. **OAuth 重定向 URL:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Qualtrics
1. 访问您的 Qualtrics 账户 → **账户设置** → **Qualtrics IDs**
2. 在 **OAuth** 下，注册新的客户端
3. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

> 授权 URL 使用 `{subdomain}.qualtrics.com` — 实例指定的。

#### Fillout
1. 访问 https://build.fillout.com → 登录 → API 设置 → **"创建 OAuth 应用程序"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Aimfox
1. 访问 https://aimfox.com/developers → 登录 → **"创建应用程序"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0,callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

---

### Google 工作区
> **已注册。** 一个 Google OAuth 应用包括 Gmail, 日历, 驱动器, 表格, 文档, YouTube, 等。
> 客户端ID: `797133120028-...`
> 无需额外注册。

---

### 设计与创意

#### Autodesk
1. 访问 https://aps.autodesk.com/myapps → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **应用描述:** `AI 桌面助理`
3. **回调URL:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### WordPress
1. 访问 https://developer.wordpress.com/apps → **"创建新应用程序"**
2. **应用名称:** `OpenPawz`
3. **描述:** `AI 桌面助理`
4. **网站 URL:** `https://openpawz.com`
5. **重定向 URL:** `http://127.0.0.1:0/callback`
6. 点击 **"创建"**
7. 复制 **客户端ID** 和 **客户端密钥**
8. 保存到 Bitwarden

---

### 分析与数据

#### Segment
1. 访问 https://segment.com → 登录 → **设置** → **扩展** 或 **OAuth**
2. 创建新的 OAuth 客户端
3. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Addepar
1. 访问 https://developers.addepar.com → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Bitly
1. 访问 https://dev.bitly.com → 登录 → **"管理应用程序"** → **"注册新应用程序"**
2. **应用名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Stack Exchange
1. 访问 https://stackapps.com/apps/oauth/register
2. **应用名称:** `OpenPawz`
3. **OAuth 域名:** `127.0.0.1`
4. **应用网站:** `https://openpawz.com`
5. 点击 **"注册应用程序"**
6. 复制 **客户端 ID** 和 **客户密钥**
7. 保存到 Bitwarden

---

### ERP 和运营

#### NetSuite
1. 访问您的 NetSuite 账户 → **设置** → **集成** → **管理集成** → **"新建"**
2. **应用名称:** `OpenPawz`
3. 选中 **"基于令牌的身份验证"** 和/或 **"OAuth 2.0"**
4. **重定向 URI:** `http://127.0.0.1:0/callback`
5. 复制 **消费密钥** (= 客户端ID) 和 **消费密钥**
6. 保存到 Bitwarden

> 授权 URL 使用 `{accountId}.app.netsuite.com` — 实例特定的。

#### Procore
1. 访问 https://developers.procore.com → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Apaleo
1. 访问 https://apaleo.dev → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Bullhorn
1. 访问 https://developer.bullhorn.com → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Odoo
1. 访问您的 Odoo 实例 → **设置** → **技术** → **OAuth** → **"创建"**
2. **应用名称:** `OpenPawz`
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

> OAuth URL 使用 `{serverUrl}` — 实例特定的。

---

### 通讯 / 视频

#### Zoom
1. 访问 https://marketplace.zoom.us/develop/create → 选择 **"通用应用"** → **"创建"**
2. **应用名称:** `OpenPawz`
3. 在 **OAuth 信息** 下:
    - **OAuth 的重定向 URL:** `http://127.0.0.1:0/callback`
    - **添加允许列表:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 在 **Scope** 中，添加: `meeting:read`, `user:read`
6. 保存到 Bitwarden

#### HeyGen
1. 访问 https://app.heygen.com/settings → API / 开发者设置
2. 创建一个 OAuth 应用程序
3. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

#### Grain
1. 访问 https://grain.com/developers → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Gong
1. 访问 https://app.gong.io → **公司设置** → **API** → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Fathom
1. 访问 https://fathom.video/developers → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Ring Central
1. 访问 https://developers.ringcentral.com/my-account.html → **"创建应用程序"**
2. **应用名称:** `OpenPawz`
3. **应用类型:** 服务器/网页
4. **OAuth 重定向 URI:** `http://127.0.0.1:0/callback`
5. 复制 **客户端ID** 和 **客户端密钥**
6. 保存到 Bitwarden

#### Dialpad
1. 访问 https://developers.dialpad.com → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

---

### 身份验证和SSO

#### Okta
1. 访问 https://developer.okta.com → 注册（免费开发者账户）
2. 在管理控制台中，前往 **应用程序** → **"创建应用集成"**
3. **登录方法:** OIDC - OpenID Connect
4. **应用程序类型:** 本机应用程序
5. **应用集成名称:** `OpenPawz`
6. **登录重定向 URI:** `http://127.0.0.1:0/callback`
7. **分配:** 暂跳过组分配
8. 点击 **"保存"**
9. 复制 **客户端ID** （以及如果显示 **客户端密钥**）
10. 保存到 Bitwarden

> 授权 URL 使用 `{subdomain}.okta.com` — 实例特定的。

#### Auth0
1. 访问 https://manage.auth0.com → 注册（免费） → **"应用程序"** → **"创建应用程序"**
2. **应用名称:** `OpenPawz`
3. **应用程序类型:** 本机
4. 点击 **"创建"**
5. 在 **设置** 选项卡:
    - **允许回调URL:** `http://127.0.0.1:0/callback`
6. 复制 **客户端ID** 和 **客户端密钥** （还显示域名）
7. 保存到 Bitwarden

> 授权 URL 使用 `{subdomain}.auth0.com` — 实例特定的。

#### PingOne
1. 访问 https://docs.pingidentity.com  → 注册（免费试用） → **"应用程序"** → **"+"**
2. **名称:** `OpenPawz`, **类型:** 本机
3. **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

---

### ATS / 招聘

#### Greenhouse Harvest
1. 访问 https://developers.greenhouse.io → 登录 → **"创建应用程序"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

---

### 房地产和物业

#### Reapit
1. 访问 https://developers.reapit.cloud → 登录 → **"创建应用程序"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Wiseagent
1. 访问 https://developer.thewiseagent.com → 登录 → **"创建应用程序"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Cloudbeds
1. 访问 https://developer.cloudbeds.com → 登录 → **"注册应用"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

---

### 发票与账单

#### Sellsy
1. 访问 https://developers.sellsy.com → 登录 → **"创建应用"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Teamleader Focus
1. 访问 https://developer.teamleader.eu → 登录 → **"创建整合"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### ServiceM8
1. 访问 https://developer.servicem8.com → 注册 → **"创建应用"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

---

### 游戏

#### Epic Games
1. 访问 https://dev.epicgames.com/portal → 登录 → **"创建应用程序"**
2. **应用名称:** `OpenPawz`
3. 在 **"客户端凭据"** 下，添加 **重定向 URI:** `http://127.0.0.1:0/callback`
4. 复制 **客户端ID** 和 **客户端密钥**
5. 保存到 Bitwarden

---

### 健康与健身

#### Oura
1. 访问 https://cloud.ouraring.com/v2/docs → 登录 → **"创建应用"** (或个人访问令牌)
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Whoop
1. 访问 https://developer.whoop.com → 登录 → **"创建应用"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

#### Health Gorilla
1. 访问 https://developer.healthgorilla.com → 注册 → **"创建应用"**
2. **名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

---

### 旅行

#### Uber
1. 访问 https://developer.uber.com → 登录 → **"创建应用"**
2. **应用名称:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 复制 **客户端ID** 和 **客户端密钥**
4. 保存到 Bitwarden

---

### 建筑業

#### Hover
1. 訪問 https://developer.hover.to → 登入 → **"建立應用程式"**
2. **名稱:** `OpenPawz`, **重新導向 URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端 ID** 和 **客戶端密碼**
4. 保存到 Bitwarden

---

### Adobe 套件

#### Adobe
1. 訪問 https://developer.adobe.com/console → 登入 (免費 Adobe ID)
2. **"建立新專案"** → **"加入 API"**
3. 選取您想要的 Adobe API → 選取 **"OAuth Server-to-Server"** 或 **"User Authentication"**
4. **重新導向 URI:** `http://127.0.0.1:0/callback`
5. **應用程式名稱:** `OpenPawz`
6. 複製 **客戶端 ID** 和 **客戶端密碼**
7. 保存到 Bitwarden

#### Adobe Workfront
1. 訪問 https://experience.adobe.com → 登入 → 導覽至 **Workfront** → **Setup** → **System** → **OAuth2 Applications**
2. **"建立新"**
3. **名稱:** `OpenPawz`, **重新導向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端 ID** 和 **客戶端密碼**
5. 保存到 Bitwarden

---

### 其他服務

#### Apollo
1. 訪問 https://developer.apollo.io → 登入 → **"建立應用程式"**
2. **名稱:** `OpenPawz`, **重新導向 URI:** `http://127.0.0.1:0/callback`
3. 複製 **客戶端 ID** 和 **客戶端密碼**
4. 保存到 Bitwarden

#### Blackbaud
1. 訪問 https://developer.blackbaud.com/apps → **"註冊應用程式"**
2. **名稱:** `OpenPawz`, **重新導向 URI:** `http://127.0.0.1:0/callback`
3. 複製 **應用程式 ID** （= 客戶端 ID）和 **應用程式密碼**
4. 保存到 Bitwarden

#### Canvas LMS
1. 登入您的 Canvas 實例管理員介面
2. 前往 **管理** → **開發者金鑰** → **"+ 開發者金鑰"** → **"+ API 鍵"**
3. **金鑰名稱:** `OpenPawz`, **重新導向 URI:** `http://127.0.0.1:0/callback`
4. 按下 **"儲存"**
5. 複製 **ID** （= 客戶端 ID）和 **鑰匙** （= 客戶端密碼）
6. 保存到 Bitwarden

> 授權 URL 使用 `{hostname}` — 您的 Canvas 實例 URL。

#### Candis
1. 訪問 https://developer.candis.io → 登入
2. 建立一個 OAuth 應用程式
3. **名稱:** `OpenPawz`, **重新導向 URI:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端 ID** 和 **客戶端密碼**
5. 保存到 Bitwarden

#### Kintone
1. 登入您的 Kintone 管理員 → **系統管理** → **OAuth**
2. **"註冊新的 OAuth 客戶端"**
3. **名稱:** `OpenPawz`, **重新導向端點:** `http://127.0.0.1:0/callback`
4. 複製 **客戶端 ID** 和 **客戶端密碼**
5. 保存到 Bitwarden

> 授權 URL 使用 `{subdomain}.kintone.com` — 特定實例。

#### Maximizer
1. 訪問 https://developer.maximizer.com → 登錄 → **"创建应用"**
2. **名稱:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 複制 **客戶端ID** 和 **客戶端密钥**
4. 保存到 Bitwarden

#### NationBuilder
1. 訪問 https://nationbuilder.com → 登錄 → **設置** → **開發者** → **"註冊應用"**
2. **名稱:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 複制 **客戶端ID** 和 **客戶端密钥**
4. 保存到 Bitwarden

> 授權 URL 使用 `{accountId}.nationbuilder.com` — 實例特定。

#### Podium
1. 訪問 https://developer.podium.com → 登錄 → **"创建应用"**
2. **名稱:** `OpenPawz`, **重定向 URI:** `http://127.0.0.1:0/callback`
3. 複制 **客戶端ID** 和 **客戶端密钥**
4. 保存到 Bitwarden

#### Splitwise
1. 訪問 https://dev.splitwise.com → 登录 → **"註冊您的應用程序"**
