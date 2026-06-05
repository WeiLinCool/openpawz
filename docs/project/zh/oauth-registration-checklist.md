# OAuth 应用程序注册清单

> **总共：** 174 个下面列出的服务。
> **247 个提供者端点配置** 在 `providers.json` 中可用 (来自 Nango 开源，MIT 许可)。
> 别名 (YouTube = Google, Outlook = Microsoft,等) 共享一个注册 — 不重复工作。

## 注册说明

**下面列出的每个开发者门户网站都是免费的。** 你正在注册一个 OAuth *应用* (客户端 ID)，而不签署付费产品。开发者门户总是与产品的定价分开。不要跳过任何服务。

**有关每个服务的详细指导，参见[注册指南](oauth-app-registration.md)。** 它告诉你在每一个门户上应精确点击什么。

### 你需要什么

| 字段 | 值 |
|--------|-------|
| **应用名称** | `OpenPawz` |
| **应用类型** | 原生 / 桌面 / 已安装（不是 "Web 服务器"） |
| **网站** | `https://openpawz.com` |
| **重定向 URI** | `http://127.0.0.1:0/callback` （如果门户拒绝端口 0，使用 `http://localhost:19284/callback`） |
| **电子邮件** | `dev@openpawz.ai` |

### 步骤（适用于每个服务的相同步骤）

1. 点击下面表格中的 **开发者控制台** 链接
2. 注册或登录（免费 — 使用 `dev@openpawz.ai`）
3. 使用上面的值创建一个新的 OAuth2 应用
4. 复制 **客户端 ID** （和 **客户端密钥**（如有的话））
5. 将两者都保存在你为该服务准备的 Bitwarden 条目中
6. 在此清单中的行中标记 ✅

### 平台特定注意事项

一些平台除了基本注册外还有一个额外的步骤。这些**不是阻止条件** — 你仍然可以注册应用并取得客户端 ID。此额外步骤仅在生产/公共使用时才重要。

| 平台 | 额外步骤 | 影响 |
|--------|---------|--------|
| **Facebook / Instagram / Meta 营销** | 需要用于生产的审核 | 应用立即在开发模式下工作 — 限于测试用户。稍后提交审核。 |
| **TikTok** | 需要用于生产的审核 | 类似于 Facebook — 开发模式即时生效，稍后审核。 |
| **Twitter/X** | 需要开发者访问申请 | 通常审批需要同一天。在 developer.twitter.com 申请。 |
| **Shopify** | 需要免费合作伙伴账户 | 在 partners.shopify.com 上注册（免费）。然后从那里创建应用。 |

**状态图例：** ⬜ 未开始 | 🔄 进行中 | ✅ 已注册

---

## ✅ 当前工作中

| 服务 | 客户端 ID | 级别 | 配置 |
|---|---|---|---|
| ✅ **Google工作区** | `797133120028-...` | 1a static | `oauth.rs GOOGLE_OAUTH` |
| ✅ **Microsoft 365** | `e1026883-ecd3-...` | 1a static | `oauth.rs MICROSOFT_OAUTH` |

---

## 生产力及项目管理

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 1 | **Asana** | https://app.asana.com/0/developer-console | `https://app.asana.com/-/oauth_authorize` | `default` | ✓ | ⬜ |
| 2 | **Basecamp** | https://launchpad.37signals.com/integrations | `https://launchpad.37signals.com/authorization/new` | — | ✓ | ⬜ |
| 3 | **ClickUp** | https://app.clickup.com/settings/integrations | `https://app.clickup.com/api` | — | ✓ | ⬜ |
| 4 | **Figma** | https://www.figma.com/developers/apps | `https://www.figma.com/oauth` | — | ✗ | ⬜ |
| 5 | **Harvest** | https://id.getharvest.com/oauth2/access_tokens | `https://id.getharvest.com/oauth2/authorize` | — | ✓ | ⬜ |
| 6 | **Linear** | https://linear.app/settings/api | `https://linear.app/oauth/authorize` | — | ✗ | ⬜ |
| 7 | **Miro** | https://developers.miro.com/page/get-started | `https://miro.com/oauth/authorize` | — | ✓ | ⬜ |
| 8 | **Monday.com** | https://monday.com/developers/apps | `https://auth.monday.com/oauth2/authorize` | — | ✓ | ⬜ |
| 9 | **ProductBoard** | https://developer.productboard.com | `https://app.productboard.com/oauth2/authorize` | — | ✓ | ⬜ |
| 10 | **Slack** | https://api.slack.com/apps | `https://slack.com/oauth/v2/authorize` | — | ✗ | ⬜ |
| 11 | **Teamwork** | https://developer.teamwork.com | `https://www.teamwork.com/launchpad/login` | — | ✓ | ⬜ |
| 12 | **TickTick** | https://developer.ticktick.com/manage | `https://ticktick.com/oauth/authorize` | — | ✓ | ⬜ |
| 13 | **Timely** | https://timelyapp.com/developer | `https://api.timelyapp.com/1.1/oauth/authorize` | — | ✗ | ⬜ |
| 14 | **Wrike** | https://www.wrike.com/apps/api | `https://login.wrike.com/oauth2/authorize/v4` | — | ✓ | ⬜ |
| 15 | **Canva** | https://www.canva.com/developers/ | `https://www.canva.com/api/oauth/authorize` | — | ✓ | ⬜ |
| 16 | **Mural** | https://developers.mural.co | `https://app.mural.co/api/public/v1/authorization/oauth2` | — | ✓ | ⬜ |
| 17 | **Envoy** | https://developers.envoy.com | `https://app.envoy.com/a/auth/v0/authorize` | — | ✓ | ⬜ |
| 18 | **Workable** | https://developer.workable.com | `https://www.workable.com/oauth/authorize` | — | ✓ | ⬜ |

## CRM 及销售

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 19 | **HubSpot** | https://developers.hubspot.com | `https://app.hubspot.com/oauth/authorize` | — | ✓ | ⬜ |
| 20 | **Salesforce** | https://developer.salesforce.com | `https://login.salesforce.com/services/oauth2/authorize` | `offline_access` | ✓ | ⬜ |
| 21 | **Pipedrive** | https://developers.pipedrive.com | `https://oauth.pipedrive.com/oauth/authorize` | — | ✗ | ⬜ |
| 22 | **Close** | https://developer.close.com | `https://app.close.com/oauth2/authorize` | `offline_access` | ✓ | ⬜ |
| 23 | **Copper** | https://developer.copper.com | `https://app.copper.com/oauth/authorize` | `developer/v1/all` | ✓ | ⬜ |
| 24 | **Attio** | https://developers.attio.com | `https://app.attio.com/authorize` | — | ✓ | ⬜ |
| 25 | **Zoho** | https://api-console.zoho.com | `https://accounts.zoho.com/oauth/v2/auth` | — | ✓ | ⬜ |
| 26 | **Zendesk Sell** | https://developer.zendesk.com | `https://api.getbase.com/oauth2/authorize` | — | ✓ | ⬜ |
| 27 | **Wealthbox** | https://dev.wealthbox.com | `https://app.crmworkspace.com/oauth/authorize` | — | ✓ | ⬜ |
| 28 | **PreciseFP** | https://developer.precisefp.com | `https://app.precisefp.com/oauth/authorize` | `*` | ✓ | ⬜ |

## 通讯与社交

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 29 | **Discord** | https://discord.com/developers/applications | `https://discord.com/api/oauth2/authorize` | — | ✓ | ⬜ |
| 30 | **Microsoft** | https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps | `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` | `offline_access .default` | ✗ | ⬜ |
| 31 | **Webex** | https://developer.webex.com/my-apps | `https://webexapis.com/v1/authorize` | — | ✓ | ⬜ |
| 32 | **Tumblr** | https://www.tumblr.com/oauth/apps | `https://www.tumblr.com/oauth2/authorize` | — | ✓ | ⬜ |
| 33 | **Reddit** | https://www.reddit.com/prefs/apps | `https://www.reddit.com/api/v1/authorize` | `permanent` | ✓ | ⬜ |

## 开发工具与 DevOps

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 34 | **GitHub** | https://github.com/settings/developers | `https://github.com/login/oauth/authorize` | — | ✓ | ⬜ |
| 35 | **Bitbucket** | https://bitbucket.org/account/settings/app-authorizations/ | `https://bitbucket.org/site/oauth2/authorize` | — | ✓ | ⬜ |
| 36 | **Atlassian/Jira** | https://developer.atlassian.com/console/myapps/ | `https://auth.atlassian.com/authorize` | `offline_access` | ✓ | ⬜ |
| 37 | **DigitalOcean** | https://cloud.digitalocean.com/account/api/applications | `https://cloud.digitalocean.com/v1/oauth/authorize` | — | ✓ | ⬜ |
| 38 | **PagerDuty** | https://developer.pagerduty.com/apps | `https://app.pagerduty.com/oauth/authorize` | — | ✓ | ⬜ |
| 39 | **Webflow** | https://developers.webflow.com | `https://webflow.com/oauth/authorize` | — | ✓ | ⬜ |
| 40 | **Zapier** | https://developer.zapier.com | `https://api.zapier.com/v2/authorize` | — | ✗ | ⬜ |
| 41 | **WakaTime** | https://wakatime.com/apps | `https://wakatime.com/oauth/authorize` | — | ✓ | ⬜ |
| 42 | **Snowflake** | https://docs.snowflake.com/en/user-guide/oauth-custom | `https://{account}.snowflakecomputing.com/oauth/authorize` | — | ✓ | ⬜ |
| 43 | **Squarespace** | https://developers.squarespace.com | `https://login.squarespace.com/api/1/login/oauth/provider/authorize` | — | ✓ | ⬜ |

## 营销与邮件

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 44 | **Mailchimp** | https://admin.mailchimp.com/account/oauth2/ | `https://login.mailchimp.com/oauth2/authorize` | — | ✓ | ⬜ |
| 45 | **Constant Contact** | https://app.constantcontact.com/pages/dma/portal/ | `https://authz.constantcontact.com/oauth2/default/v1/authorize` | `offline_access` | ✗ | ⬜ |
| 46 | **Outreach** | https://developers.outreach.io | `https://api.outreach.io/oauth/authorize` | — | ✓ | ⬜ |
| 47 | **SalesLoft** | https://developers.salesloft.com | `https://accounts.salesloft.com/oauth/authorize` | — | ✓ | ⬜ |
| 48 | **Keap (Infusionsoft)** | https://developer.keap.com | `https://accounts.infusionsoft.com/app/oauth/authorize` | — | ✓ | ⬜ |
| 49 | **HighLevel** | https://marketplace.gohighlevel.com | `https://marketplace.gohighlevel.com/oauth/chooselocation` | — | ✗ | ⬜ |
| 50 | **Brex** | https://developer.brex.com | `https://accounts-api.brex.com/oauth2/default/v1/authorize` | — | ✓ | ⬜ |

## 社交媒体和视频

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 51 | **Twitter/X (v2)** | https://developer.twitter.com/en/portal | `https://twitter.com/i/oauth2/authorize` | `offline.access` | ✓ | ⬜ |
| 52 | **LinkedIn** | https://www.linkedin.com/developers/apps | `https://www.linkedin.com/oauth/v2/authorization` | — | ✗ | ⬜ |
| 53 | **TikTok 账户** | https://developers.tiktok.com | `https://www.tiktok.com/v2/auth/authorize/` | — | ✓ | ⬜ |
| 54 | **TikTok 广告** | https://business.tiktok.com/apps | `https://business-api.tiktok.com/portal/auth` | — | ✓ | ⬜ |
| 55 | **TikTok 个人** | https://developers.tiktok.com | `https://www.tiktok.com/v2/auth/authorize/` | — | ✓ | ⬜ |
| 56 | **Snapchat** | https://business.snapchat.com/developer | `https://accounts.snapchat.com/login/oauth2/authorize` | — | ✗ | ⬜ |
| 57 | **Pinterest** | https://developers.pinterest.com | `https://www.pinterest.com/oauth` | — | ✓ | ⬜ |
| 58 | **Spotify** | https://developer.spotify.com/dashboard | `https://accounts.spotify.com/authorize` | — | ✓ | ⬜ |
| 59 | **Twitch** | https://dev.twitch.tv/console/apps | `https://id.twitch.tv/oauth2/authorize` | — | ✓ | ⬜ |
| 60 | **Vimeo** | https://developer.vimeo.com/apps | `https://api.vimeo.com/oauth/authorize` | — | ✓ | ⬜ |
| 61 | **YouTube** | https://console.cloud.google.com/apis | _（别名: Google OAuth）_ | — | ✓ | ⬜ |
| 62 | **Strava** | https://www.strava.com/settings/api | `https://www.strava.com/oauth/authorize` | — | ✓ | ⬜ |
| 63 | **Osu** | https://osu.ppy.sh/home/account/edit#oauth | `https://osu.ppy.sh/oauth/authorize` | `identify` | ✓ | ⬜ |
| 64 | **Yahoo** | https://developer.yahoo.com/apps | `https://api.login.yahoo.com/oauth2/request_auth` | — | ✓ | ⬜ |
| 65 | **Yandex** | https://oauth.yandex.com/client/new | `https://oauth.yandex.com/authorize` | — | ✓ | ⬜ |
| 66 | **LinkHut** | https://ln.ht | `https://ln.ht/_/oauth/authorize` | — | ✓ | ⬜ |

## 会计与财务

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 67 | **QuickBooks** | https://developer.intuit.com/app/developer/dashboard | `https://appcenter.intuit.com/connect/oauth2` | — | ✓ | ⬜ |
| 68 | **Intuit** | https://developer.intuit.com | `https://appcenter.intuit.com/connect/oauth2` | — | ✓ | ⬜ |
| 69 | **Xero** | https://developer.xero.com/app/manage | `https://login.xero.com/identity/connect/authorize` | `offline_access` | ✓ | ⬜ |
| 70 | **Sage** | https://developer.sage.com | `https://www.sageone.com/oauth2/auth/central` | — | ✓ | ⬜ |
| 71 | **Wave Accounting** | https://developer.waveapps.com | `https://api.waveapps.com/oauth2/authorize` | — | ✓ | ⬜ |
| 72 | **FreshBooks** | https://my.freshbooks.com/#/developer | `https://auth.freshbooks.com/oauth/authorize` | — | ✓ | ⬜ |
| 73 | **Exact Online** | https://apps.exactonline.com | `https://start.exactonline.{ext}/api/oauth2/auth` | — | ✓ | ⬜ |
| 74 | **Mercury** | https://dashboard.mercury.com/developers | `https://oauth2.mercury.com/oauth2/auth` | `offline_access` | ✓ | ⬜ |
| 75 | **Twinfield** | https://login.twinfield.com | `https://login.twinfield.com/auth/authentication/connect/authorize` | `openid twf.user offline_access` | ✓ | ⬜ |
| 76 | **Schwab** | https://developer.schwab.com | `https://api.schwabapi.com/v1/oauth/authorize` | — | ✗ | ⬜ |

## 电商与支付

| # | 服务 | 开发者控制台 | 授权URL | 作用域范围 | PKCE | 状态 |
|---|---------|----------|---------|--------|------|--------|
| 77 | **Stripe App** | https://dashboard.stripe.com/apps | `https://marketplace.stripe.com/oauth/v2/authorize` | — | ✗ | ⬜ |
| 78 | **PayPal** | https://developer.paypal.com/developer/applications | `https://www.paypal.com/signin/authorize` | — | ✓ | ⬜ |
| 79 | **Square** | https://developer.squareup.com/apps | `https://connect.squareup.com/oauth2/authorize` | — | ✗ | ⬜ |
| 80 | **Mollie** | https://my.mollie.com/dashboard/developers/applications | `https://my.mollie.com/oauth2/authorize` | — | ✗ | ⬜ |
| 81 | **Braintree** | https://developer.paypal.com/braintree | `https://api.braintreegateway.com/oauth/connect` | — | ✓ | ⬜ |
| 82 | **Amazon** | https://developer.amazon.com/loginwithamazon | `https://www.amazon.com/ap/oa` | — | ✓ | ⬜ |
| 83 | **eBay** | https://developer.ebay.com/my/keys | `https://auth.ebay.com/oauth2/authorize` | — | ✓ | ⬜ |
| 84 | **Printful** | https://developers.printful.com | `https://www.printful.com/oauth/authorize` | — | ✗ | ⬜ |
| 85 | **ThriveCart** | https://thrivecart.com/developers | `https://thrivecart.com/authorization/new` | — | ✓ | ⬜ |
| 86 | **Ramp** | https://developer.ramp.com | `https://app.ramp.com/v1/authorize` | — | ✓ | ⬜ |

## HR 与招聘

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 87 | **BambooHR** | https://documentation.bamboohr.com | `https://{subdomain}.bamboohr.com/authorize.php` | — | ✓ | ⬜ |
| 88 | **Deel** | https://developer.deel.com | `https://app.deel.com/oauth2/authorize` | — | ✓ | ⬜ |
| 89 | **Employment Hero** | https://developer.employmenthero.com | `https://oauth.employmenthero.com/oauth2/authorize` | — | ✗ | ⬜ |
| 90 | **Gusto** | https://dev.gusto.com | `https://api.gusto.com/oauth/authorize` | — | ✓ | ⬜ |
| 91 | **JobAdder** | https://developers.jobadder.com | `https://id.jobadder.com/connect/authorize` | `offline_access` | ✓ | ⬜ |
| 92 | **Namely** | https://developers.namely.com | `https://{company}.namely.com/api/v1/oauth2/authorize` | — | ✓ | ⬜ |
| 93 | **Paycor** | https://developers.paycor.com | `https://hcm.paycor.com/AppActivation/Authorize` | `offline_access` | ✓ | ⬜ |
| 94 | **Payfit** | https://developers.payfit.io | `https://oauth.payfit.com/authorize` | — | ✓ | ⬜ |
| 95 | **Sage People** | https://developer.salesforce.com | `https://login.salesforce.com/services/oauth2/authorize` | `offline_access api` | ✓ | ⬜ |
| 96 | **Workday** | https://community.workday.com | `https://{domain}/{tenant}/authorize` | — | ✓ | ⬜ |
| 97 | **Zenefits** | https://developers.zenefits.com | `https://secure.zenefits.com/oauth2/platform-authorize` | — | ✓ | ⬜ |
| 98 | **TSheets** | https://developer.tsheets.com | `https://rest.tsheets.com/api/v1/authorize` | — | ✓ | ⬜ |

## 支持与票务系统

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 99 | **Zendesk** | https://developer.zendesk.com/api-reference | `https://{subdomain}.zendesk.com/oauth/authorizations/new` | — | ✓ | ⬜ |
| 100 | **Intercom** | https://app.intercom.com/a/apps/_/developer-hub | `https://app.intercom.com/oauth` | — | ✓ | ⬜ |
| 101 | **Help Scout** | https://developer.helpscout.com | `https://secure.helpscout.net/authentication/authorizeClientApplication` | — | ✓ | ⬜ |
| 102 | **ServiceNow** | https://developer.servicenow.com | `https://{subdomain}.service-now.com/oauth_auth.do` | — | ✓ | ⬜ |
| 103 | **NinjaOne RMM** | https://app.ninjarmm.com | `https://app.ninjarmm.com/ws/oauth/authorize` | `offline_access` | ✓ | ⬜ |
| 104 | **Aircall** | https://developer.aircall.io | `https://dashboard.aircall.io/oauth/authorize` | — | ✓ | ⬜ |

## 云端存储与文件

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 105 | **Dropbox** | https://www.dropbox.com/developers/apps | `https://www.dropbox.com/oauth2/authorize` | — | ✓ | ⬜ |
| 106 | **Box** | https://developer.box.com/guides/applications/ | `https://account.box.com/api/oauth2/authorize` | — | ✓ | ⬜ |
| 107 | **OneDrive 个人版** | https://portal.azure.com | `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize` | `offline_access` | ✗ | ⬜ |
| 108 | **Egnyte** | https://developers.egnyte.com | `https://{subdomain}.egnyte.com/puboauth/token` | — | ✓ | ⬜ |
| 109 | **Google Drive** | https://console.cloud.google.com/apis | _(别名：Google OAuth)_ | — | ✓ | ⬜ |
| 110 | **Contentful** | https://app.contentful.com/account/profile/developers/applications | `https://be.contentful.com/oauth/authorize` | — | ✓ | ⬜ |

## 法律与电子签名

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 111 | **DocuSign** | https://admindemo.docusign.com/apps-and-keys | `https://account.docusign.com/oauth/auth` | — | ✓ | ⬜ |
| 112 | **Dropbox Sign (HelloSign)** | https://app.hellosign.com/home/myAccount#integrations | `https://app.hellosign.com/oauth/authorize` | — | ✓ | ⬜ |
| 113 | **Ironclad** | https://developer.ironcladapp.com | `https://ironcladapp.com/oauth/authorize` | — | ✗ | ⬜ |
| 114 | **SignNow** | https://app.signnow.com/api/integrations | `https://app.signnow.com/authorize` | — | ✗ | ⬜ |
| 115 | **DATEV** | https://developer.datev.de | `https://login.datev.de/openid/authorize` | `openid` | ✓ | ⬜ |

## 时间规划与调查

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 116 | **Acuity Scheduling** | https://acuityscheduling.com/oauth2 | `https://acuityscheduling.com/oauth2/authorize` | `api-v1` | ✓ | ⬜ |
| 117 | **SurveyMonkey** | https://developer.surveymonkey.com/apps | `https://api.surveymonkey.com/oauth/authorize` | — | ✗ | ⬜ |
| 118 | **Qualtrics** | https://developer.qualtrics.com | `https://{subdomain}.qualtrics.com/oauth2/auth` | — | ✓ | ⬜ |
| 119 | **Fillout** | https://build.fillout.com | `https://build.fillout.com/authorize/oauth` | — | ✓ | ⬜ |
| 120 | **Aimfox** | https://aimfox.com/developers | `https://id.aimfox.com/realms/aimfox-prod/protocol/openid-connect/auth` | — | ✗ | ⬜ |

## Google 工作空间（单一注册）

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 121 | **Google（所有服务）** | https://console.cloud.google.com/apis/credentials | `https://accounts.google.com/o/oauth2/auth` | `offline_access` + per-API scopes | ✓ | ⬜ |

> 单一 Google OAuth 应用涵盖：Gmail、日历、驱动器、表格、文档、YouTube、云存储、Workspace 管理员、Google Play 等。

## 设计与创作

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 122 | **Autodesk** | https://aps.autodesk.com/myapps | `https://developer.api.autodesk.com/authentication/v2/authorize` | — | ✗ | ⬜ |
| 123 | **WordPress** | https://developer.wordpress.com/apps | `https://public-api.wordpress.com/oauth2/authorize` | — | ✓ | ⬜ |

## 分析与数据

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 124 | **Segment** | https://segment.com/docs/connections | `https://id.segmentapis.com/oauth2/auth` | — | ✓ | ⬜ |
| 125 | **Addepar** | https://developers.addepar.com | `https://id.addepar.com/oauth2/authorize` | — | ✗ | ⬜ |
| 126 | **Bitly** | https://dev.bitly.com | `https://bitly.com/oauth/authorize` | — | ✓ | ⬜ |
| 127 | **Strava** | _(见社交媒体/体育)_ | — | — | — | — |
| 128 | **Stack Exchange** | https://stackapps.com/apps/oauth/register | `https://stackoverflow.com/oauth` | `no_expiry` | ✓ | ⬜ |

## ERP 与运营

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 129 | **NetSuite** | https://system.netsuite.com | `https://{accountId}.app.netsuite.com/app/login/oauth2/authorize.nl` | `rest_webservices` | ✓ | ⬜ |
| 130 | **Procore** | https://developers.procore.com/documentation/building-apps | `https://login.procore.com/oauth/authorize` | — | ✓ | ⬜ |
| 131 | **Apaleo** | https://apaleo.dev | `https://identity.apaleo.com/connect/authorize` | — | ✓ | ⬜ |
| 132 | **Bullhorn** | https://developer.bullhorn.com | `https://auth-west.bullhwndstaffing.com/oauth/authorize` | — | ✗ | ⬜ |
| 133 | **Odoo** | https://www.odoo.com/documentation/developer | `https://{serverUrl}/restapi/1.0/common/oauth2/authorize` | — | ✓ | ⬜ |

## 沟通 / 视频

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 134 | **Zoom** | https://marketplace.zoom.us/develop/create | `https://zoom.us/oauth/authorize` | — | ✓ | ⬜ |
| 135 | **HeyGen** | https://app.heygen.com/settings | `https://app.heygen.com/oauth/authorize` | — | ✓ | ⬜ |
| 136 | **Grain** | https://grain.com/developers | `https://grain.com/_/public-api/oauth2/authorize` | — | ✓ | ⬜ |
| 137 | **Gong** | https://app.gong.io/company/api-authentication | `https://app.gong.io/oauth2/authorize` | — | ✗ | ⬜ |
| 138 | **Fathom** | https://fathom.video/developers | `https://fathom.video/external/v1/oauth2/authorize` | — | ✗ | ⬜ |
| 139 | **Ring Central** | https://developers.ringcentral.com/my-account.html | `https://platform.ringcentral.com/restapi/oauth/authorize` | — | ✓ | ⬜ |
| 140 | **Dialpad** | https://developers.dialpad.com | `https://dialpad.com/oauth2/authorize` | — | ✓ | ⬜ |

## 身份识别和SSO

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 141 | **Okta** | https://developer.okta.com | `https://{subdomain}.okta.com/oauth2/v1/authorize` | — | ✓ | ⬜ |
| 142 | **Auth0** | https://manage.auth0.com | `https://{subdomain}.auth0.com/authorize` | — | ✓ | ⬜ |
| 143 | **PingOne** | https://docs.pingidentity.com | `https://auth.pingone.{tld}/{envId}/as/authorize` | — | ✓ | ⬜ |

## ATS / Greenhouse

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 144 | **Greenhouse Harvest** | https://developers.greenhouse.io | `https://app.greenhouse.io/oauth/authorize` | — | ✓ | ⬜ |

## 房地产和物业管理

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 145 | **Reapit** | https://developers.reapit.cloud | `https://connect.reapit.cloud/authorize` | — | ✗ | ⬜ |
| 146 | **Wiseagent** | https://developer.thewiseagent.com | `https://sync.thewiseagent.com/WiseAuth/auth` | — | ✗ | ⬜ |
| 147 | **Cloudbeds** | https://developer.cloudbeds.com | `https://hotels.cloudbeds.com/api/v1.3/oauth` | — | ✗ | ⬜ |

## 发票和计费

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 148 | **Sellsy** | https://developers.sellsy.com | `https://login.sellsy.com/oauth2/authorization` | — | ✓ | ⬜ |
| 149 | **Teamleader Focus** | https://developer.teamleader.eu | `https://focus.teamleader.eu/oauth2/authorize` | — | ✓ | ⬜ |
| 150 | **ServiceM8** | https://developer.servicem8.com | `https://go.servicem8.com/oauth/authorize` | — | ✓ | ⬜ |

## 游戏

| # | 服务 | 开发者控制台 | 授权 URL | Scopes | PKCE | 状态 |
|---|---------|-------------------|-----------|-------|------|--------|
| 151 | **Epic Games** | https://dev.epicgames.com/portal | `https://www.epicgames.com/id/authorize` | — | ✓ | ⬜ |

## 健康与健身

| # | 服务 | 开发者控制台 | 授权URL | 范围 | PKCE | 状态 |
|---|---------|-----------------|--------|-------|------|--------|
| 152 | **Oura** | https://cloud.ouraring.com/v2/docs | `https://cloud.ouraring.com/oauth/authorize` | — | ✓ | ⬜ |
| 153 | **Whoop** | https://developer.whoop.com | `https://api.prod.whoop.com/oauth/oauth2/auth` | — | ✓ | ⬜ |
| 154 | **Health Gorilla** | https://developer.healthgorilla.com | `https://api.healthgorilla.com/oauth/authorize` | — | ✓ | ⬜ |

## 旅游及酒店业

| # | 服务 | 开发者控制台 | 授权URL | 范围 | PKCE | 状态 |
|---|---------|-----------------|--------|-------|------|--------|
| 155 | **Uber** | https://developer.uber.com | `https://login.uber.com/oauth/v2/authorize` | — | ✓ | ⬜ |

## 建筑业

| # | 服务 | 开发者控制台 | 授权URL | 范围 | PKCE | 状态 |
|---|---------|-----------------|--------|-------|------|--------|
| 156 | **Hover** | https://developer.hover.to | `https://hover.to/oauth/authorize` | — | ✗ | ⬜ |

## Adobe 套件

| # | 服务 | 开发者控制台 | 授权URL | 范围 | PKCE | 状态 |
|---|---------|-----------------|--------|-------|------|--------|
| 157 | **Adobe** | https://developer.adobe.com/console | `https://ims-na1.adobelogin.com/ims/authorize/v2` | `offline_access` | ✓ | ⬜ |
| 158 | **Adobe Workfront** | https://experience.adobe.com | `https://{hostname}/integrations/oauth2/authorize` | — | ✓ | ⬜ |

## 其他注意事项

| # | 服务 | 开发者控制台 | 授权URL | 范围 | PKCE | 状态 |
|---|---------|-----------------|--------|-------|------|--------|
| 159 | **Apollo** | https://developer.apollo.io | `https://app.apollo.io/oauth/authorize` | — | ✗ | ⬜ |
| 160 | **Blackbaud** | https://developer.blackbaud.com/apps | `https://app.blackbaud.com/oauth/authorize` | — | ✓ | ⬜ |
| 161 | **Canvas LMS** | https://canvas.instructure.com/doc/api | `https://{hostname}/login/oauth2/auth` | — | ✓ | ⬜ |
| 162 | **Candis** | https://developer.candis.io | `https://id.my.candis.io/auth/realms/candis/...` | — | ✗ | ⬜ |
| 163 | **Kintone** | https://developer.kintone.com | `https://{subdomain}.kintone.com/oauth2/authorization` | — | ✓ | ⬜ |
| 164 | **Maximizer** | https://developer.maximizer.com | `https://{region}.maximizercrmlive.com/oauth2/{alias}/authorize` | — | ✗ | ⬜ |
| 165 | **NationBuilder** | https://nationbuilder.com/api | `https://{accountId}.nationbuilder.com/oauth/authorize` | `default` | ✓ | ⬜ |
| 166 | **Podium** | https://developer.podium.com | `https://api.podium.com/oauth/authorize` | — | ✓ | ⬜ |
| 167 | **Splitwise** | https://dev.splitwise.com | `https://secure.splitwise.com/oauth/authorize` | — | ✓ | ⬜ |
| 168 | **Salesmsg** | https://developer.salesmessage.com | `https://app.salesmessage.com/auth/oauth` | — | ✗ | ⬜ |
| 169 | **Sentry** | https://sentry.io/settings/developer-settings/ | `https://sentry.io/oauth/authorize` | — | ✓ | ⬜ |
| 170 | **Wildix PBX** | https://developer.wildix.com | `https://{subdomain}.wildixin.com/authorization/oauth2` | — | ✓ | ⬜ |
| 171 | **UKG Pro WFM** | https://developer.ukg.com | `https://welcome-us.ukg.net/authorize` | — | ✓ | ⬜ |
| 172 | **Adyen** | https://docs.adyen.com | `https://ca-{environment}.adyen.com/ca/ca/oauth/connect.shtml` | — | ✓ | ⬜ |
| 173 | **Meta Marketing** | https://developers.facebook.com | _(别名：Facebook OAuth)_ | — | ✓ | ⬜ |
| 174 | **AWS Cognito** | https://console.aws.amazon.com/cognito | `https://{subdomain}.auth.{region}.amazoncognito.com/oauth2/authorize` | `openid` | ✓ | ⬜ |

---

## 注册完成后 - 连接客户端ID

一旦您注册了应用并将凭据保存在Bitwarden中，导出保险库并将它们移交给相关部门。客户端ID将连接到代码：

- **高优先级服务** （GitHub，Slack，Discord等） → 在`oauth.rs`中通过环境变量硬编码为`OPENPAWZ_GITHUB_CLIENT_ID`
- **所有其他服务** → 在`registrations.json`中添加，环境变量`OPENPAWZ_{SERVICE}_CLIENT_ID`
- **不需要按服务更改代码** → 通用提供商系统自动处理其他部分

---

## 备注

- **动态域名** (标记为`{subdomain}`或`{hostname}`)：用户在连接时提供其实例URL。在中央开发者门户注册该应用 — 认证/令牌URL是实例特定的，但客户端ID相同。
- **PKCE ✗**：这些服务不支持PKCE。仍然可以通过授权码流工作，但需要客户端秘密。
- **别名**：YouTube = Google，Outlook = Microsoft，SharePoint = Microsoft等等。注册一个覆盖全部。
- **范围**：如果范围列显示`—`，默认范围即可。仅请求所列项。

## 进度摘要

| 类别 | 完成 | 总计 |
|---------|------|-------|
| ✅ 已注册（真实客户端ID） | 2 | 174 |
| Google Workspace | ✅ | — |
| Microsoft 365 | ✅ | — |
| 其他所有 | 0 | 172 |

## 优先顺序（首先注册这些）

1. ~~**Google** — 涵盖 Gmail、日历、Drive、表单、YouTube~~ ✅ 已完成
2. ~~**Microsoft** — 涵盖 Outlook、OneDrive、Teams、SharePoint~~ ✅ 已完成
3. **GitHub** — 最常用的开发者集成
4. **Slack** — 最常用的团队聊天
5. **Discord** — 社区平台
6. **Salesforce** — #1 CRM
7. **HubSpot** — #2 CRM
8. **Jira/Atlassian** — 项目管理
9. **Zoom** — 视频会议
10. **Notion** — 知识库
