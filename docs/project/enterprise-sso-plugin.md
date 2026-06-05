# Enterprise SSO Plugin API Contract

> Purpose: define the server-side OAuth2/OIDC and entitlement APIs required by
> the OpenPawz enterprise plugin.
>
> Audience: enterprise SSO, license, billing, and model-gateway implementers.

## Overview

OpenPawz enterprise builds start in platform-license mode. The desktop app does
not ship a user session. It ships OAuth/gateway endpoints and requires the user
to sign in remotely before enterprise features are enabled.

Default local development issuer:

```text
http://localhost:3000
```

Default endpoints derived from the issuer:

```text
GET  /oauth/authorize
POST /oauth/token
GET  /oauth/userinfo
GET  /api/entitlements
GET  /api/llm/v1/models
POST /api/llm/v1/chat/completions
```

The desktop client uses OAuth2 Authorization Code with PKCE. Client secrets are
not required for the desktop client.

## Build-Time Configuration

Enterprise builds can override endpoint defaults with environment variables:

```text
OPENPAWZ_BUILD_EDITION=enterprise
OPENPAWZ_ENTERPRISE_ISSUER_URL=http://localhost:3000
OPENPAWZ_ENTERPRISE_AUTH_URL=http://localhost:3000/oauth/authorize
OPENPAWZ_ENTERPRISE_TOKEN_URL=http://localhost:3000/oauth/token
OPENPAWZ_ENTERPRISE_USERINFO_URL=http://localhost:3000/oauth/userinfo
OPENPAWZ_ENTERPRISE_ENTITLEMENTS_URL=http://localhost:3000/api/entitlements
OPENPAWZ_ENTERPRISE_GATEWAY_URL=http://localhost:3000/api/llm/v1
OPENPAWZ_ENTERPRISE_CLIENT_ID=openpawz-desktop
OPENPAWZ_ENTERPRISE_DEFAULT_MODEL=gpt-4o-mini
OPENPAWZ_ENTERPRISE_SCOPES="openid profile email offline_access entitlements models"
```

Local dev entry:

```bash
pnpm dev:tauri:enterprise
```

Enterprise package build:

```bash
pnpm tauri:build:enterprise
```

## OAuth Flow

1. OpenPawz creates a PKCE `code_verifier` and `code_challenge`.
2. OpenPawz starts a short-lived loopback callback server:

```text
http://127.0.0.1:{random_port}/callback
```

3. OpenPawz opens the system browser to `/oauth/authorize`.
4. Your SSO service authenticates the user.
5. Your SSO service redirects to the loopback callback with `code` and `state`.
6. OpenPawz exchanges the code at `/oauth/token`.
7. OpenPawz calls `/oauth/userinfo` and `/api/entitlements`.
8. OpenPawz enables enterprise features according to entitlements.

## Required Endpoint: Authorization

```http
GET /oauth/authorize
```

### Request Query Parameters

| Parameter | Required | Description |
|---|---:|---|
| `response_type` | Yes | Must be `code`. |
| `client_id` | Yes | Default: `openpawz-desktop`. |
| `redirect_uri` | Yes | Loopback callback, e.g. `http://127.0.0.1:49231/callback`. |
| `code_challenge` | Yes | PKCE S256 challenge. |
| `code_challenge_method` | Yes | Must be `S256`. |
| `state` | Yes | CSRF token. Must be returned unchanged. |
| `scope` | Recommended | Space-separated scopes. |

Example:

```text
http://localhost:3000/oauth/authorize?response_type=code&client_id=openpawz-desktop&redirect_uri=http%3A%2F%2F127.0.0.1%3A49231%2Fcallback&code_challenge=abc&code_challenge_method=S256&state=xyz&scope=openid%20profile%20email%20offline_access%20entitlements%20models
```

### Success Redirect

```http
302 Location: http://127.0.0.1:{port}/callback?code={authorization_code}&state={state}
```

### Error Redirect

```http
302 Location: http://127.0.0.1:{port}/callback?error=access_denied&error_description=User%20cancelled&state={state}
```

## Required Endpoint: Token Exchange

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
Accept: application/json
```

### Request Body

| Field | Required | Description |
|---|---:|---|
| `grant_type` | Yes | Must be `authorization_code`. |
| `code` | Yes | Authorization code from callback. |
| `redirect_uri` | Yes | Same redirect URI used in authorize request. |
| `client_id` | Yes | Default: `openpawz-desktop`. |
| `code_verifier` | Yes | Original PKCE verifier. |

Example:

```text
grant_type=authorization_code&
code=AUTH_CODE&
redirect_uri=http%3A%2F%2F127.0.0.1%3A49231%2Fcallback&
client_id=openpawz-desktop&
code_verifier=PKCE_VERIFIER
```

### Success Response

```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "optional-refresh-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "openid profile email offline_access entitlements models"
}
```

Required fields:

```text
access_token
```

Recommended fields:

```text
refresh_token
token_type
expires_in
scope
```

`expires_in` is seconds from now. OpenPawz converts it into an absolute expiry.

### Error Response

Use standard OAuth error shape:

```json
{
  "error": "invalid_grant",
  "error_description": "Authorization code expired or already used"
}
```

Return a 4xx status for OAuth errors.

## Recommended Endpoint: UserInfo

```http
GET /oauth/userinfo
Authorization: Bearer {access_token}
Accept: application/json
```

### Success Response

```json
{
  "sub": "user_123",
  "email": "alice@example.com",
  "name": "Alice Example",
  "preferred_username": "alice",
  "organization_id": "org_123",
  "org_id": "org_123",
  "tenant_id": "tenant_123"
}
```

OpenPawz reads the first available user identifier from:

```text
email
preferred_username
sub
```

OpenPawz reads the first available organization identifier from:

```text
organization_id
org_id
tenant_id
```

## Required Endpoint: Entitlements

```http
GET /api/entitlements
Authorization: Bearer {access_token}
Accept: application/json
```

### Success Response: Array Form

```json
{
  "plan": "enterprise",
  "entitlements": [
    "models:proxy",
    "flows:advanced",
    "integrations:premium",
    "security:audit-log",
    "teams:workspace"
  ]
}
```

### Success Response: Object Form

```json
{
  "plan": "enterprise",
  "entitlements": {
    "models:proxy": true,
    "flows:advanced": true,
    "integrations:premium": false,
    "security:audit-log": true,
    "teams:workspace": true
  }
}
```

OpenPawz accepts both array and object forms.

### Required Entitlement for Cloud Models

```text
models:proxy
```

Without `models:proxy` or `all`, OpenPawz blocks `enterprise-cloud` model
requests.

### Reserved Entitlement Names

Recommended platform feature names:

```text
all
models:proxy
agents:multi
flows:advanced
integrations:premium
memory:cloud-sync
security:audit-log
teams:workspace
billing:admin
```

`all` grants every enterprise feature.

## Required Endpoint: Model Gateway

The enterprise gateway must expose an OpenAI-compatible API base URL.

Default:

```text
http://localhost:3000/api/llm/v1
```

OpenPawz stores this as the `enterprise-cloud` provider base URL.

### List Models

```http
GET /api/llm/v1/models
Authorization: Bearer {access_token}
Accept: application/json
```

Recommended response:

```json
{
  "data": [
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "owned_by": "enterprise"
    },
    {
      "id": "claude-sonnet-4-6",
      "object": "model",
      "owned_by": "enterprise"
    }
  ]
}
```

### Chat Completions

```http
POST /api/llm/v1/chat/completions
Authorization: Bearer {access_token}
Content-Type: application/json
```

OpenPawz sends OpenAI-compatible chat completion payloads, including tools when
available.

Example request:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": "Summarize this project"
    }
  ],
  "stream": true
}
```

Your gateway should route the request according to tenant policy, subscription,
rate limits, and model availability.

### Streaming Response

Use OpenAI-compatible Server-Sent Events:

```text
data: {"choices":[{"delta":{"content":"Hello"}}]}

data: {"choices":[{"delta":{"content":" world"}}]}

data: [DONE]
```

## Authorization Rules

Every protected endpoint must validate:

```text
Authorization: Bearer {access_token}
```

Recommended token requirements:

```text
aud includes openpawz-desktop or your gateway audience
sub is stable per user
tenant/org claim is present for enterprise accounts
exp is enforced
entitlements are resolved server-side, not trusted from the desktop client
```

OpenPawz treats the desktop app as an untrusted client. Feature access must be
enforced by the server as well as by the desktop entitlement gate.

## Local Development Checklist

1. Start your SSO/admin server:

```bash
pnpm dev
```

or equivalent for your server at:

```text
http://localhost:3000
```

2. Start OpenPawz enterprise dev mode:

```bash
pnpm dev:tauri:enterprise
```

3. Confirm `/oauth/authorize` opens in the browser.
4. Complete login.
5. Confirm `/api/entitlements` returns `models:proxy`.
6. Confirm OpenPawz creates the `enterprise-cloud` provider.
7. Send a chat request using the enterprise model.

## Minimal Mock Server Contract

For a local mock server, these are enough:

```text
GET  /oauth/authorize
POST /oauth/token
GET  /oauth/userinfo
GET  /api/entitlements
POST /api/llm/v1/chat/completions
```

The minimum entitlements response for model access:

```json
{
  "plan": "enterprise-dev",
  "entitlements": ["models:proxy"]
}
```
