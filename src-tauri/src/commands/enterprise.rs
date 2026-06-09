// commands/enterprise.rs — Enterprise auth and cloud model gateway controls.
//
// MVP design:
// - Store enterprise state in the existing engine_config KV table.
// - Use an OpenAI-compatible Custom provider pointed at the enterprise gateway.
// - Gate enterprise-cloud chat requests in Rust, not in the frontend.

use crate::brand;
use crate::commands::state::EngineState;
use crate::engine::oauth::parse_urlencoded_query;
use crate::engine::platform::{require_feature, EntitlementProvider, FEATURE_MODELS_PROXY};
use crate::engine::types::{EngineConfig, ProviderConfig, ProviderKind};
use base64::Engine as _;
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use tauri::State;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

pub const ENTERPRISE_CONFIG_KEY: &str = "enterprise_config";
pub const ENTERPRISE_PROVIDER_ID: &str = "enterprise-cloud";
pub const ENTERPRISE_BUILD_EDITION: Option<&str> = option_env!("OPENPAWZ_BUILD_EDITION");
const ENTERPRISE_BUILD_ISSUER_URL: Option<&str> = option_env!("OPENPAWZ_ENTERPRISE_ISSUER_URL");
const ENTERPRISE_BUILD_AUTH_URL: Option<&str> = option_env!("OPENPAWZ_ENTERPRISE_AUTH_URL");
const ENTERPRISE_BUILD_TOKEN_URL: Option<&str> = option_env!("OPENPAWZ_ENTERPRISE_TOKEN_URL");
const ENTERPRISE_BUILD_USERINFO_URL: Option<&str> = option_env!("OPENPAWZ_ENTERPRISE_USERINFO_URL");
const ENTERPRISE_BUILD_ENTITLEMENTS_URL: Option<&str> =
    option_env!("OPENPAWZ_ENTERPRISE_ENTITLEMENTS_URL");
const ENTERPRISE_BUILD_GATEWAY_URL: Option<&str> = option_env!("OPENPAWZ_ENTERPRISE_GATEWAY_URL");
const ENTERPRISE_BUILD_CLIENT_ID: Option<&str> = option_env!("OPENPAWZ_ENTERPRISE_CLIENT_ID");
const ENTERPRISE_BUILD_DEFAULT_MODEL: Option<&str> =
    option_env!("OPENPAWZ_ENTERPRISE_DEFAULT_MODEL");
const ENTERPRISE_BUILD_SCOPES: Option<&str> = option_env!("OPENPAWZ_ENTERPRISE_SCOPES");
const ENTERPRISE_BUILD_RESET_SESSION: Option<&str> =
    option_env!("OPENPAWZ_ENTERPRISE_RESET_SESSION");

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnterpriseDataToken {
    pub token: String,
    #[serde(default)]
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnterpriseConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default)]
    pub issuer_url: String,
    #[serde(default)]
    pub auth_url: String,
    #[serde(default)]
    pub token_url: String,
    #[serde(default)]
    pub userinfo_url: Option<String>,
    #[serde(default)]
    pub entitlements_url: Option<String>,
    #[serde(default = "default_enterprise_client_id")]
    pub client_id: String,
    #[serde(default = "default_enterprise_scopes")]
    pub scopes: Vec<String>,
    #[serde(default)]
    pub gateway_url: String,
    #[serde(default)]
    pub access_token: String,
    #[serde(default)]
    pub refresh_token: Option<String>,
    #[serde(default)]
    pub data_token: Option<String>,
    #[serde(default)]
    pub data_token_version: Option<String>,
    #[serde(default)]
    pub previous_data_tokens: Vec<EnterpriseDataToken>,
    #[serde(default)]
    pub user_email: Option<String>,
    #[serde(default)]
    pub organization_id: Option<String>,
    #[serde(default)]
    pub plan: Option<String>,
    #[serde(default)]
    pub user_points: Option<f64>,
    #[serde(default)]
    pub entitlements: Vec<String>,
    #[serde(default)]
    pub expires_at: Option<String>,
    #[serde(default)]
    pub default_model: Option<String>,
}

fn default_enterprise_client_id() -> String {
    "openpawz-desktop".to_string()
}

fn default_enterprise_scopes() -> Vec<String> {
    [
        "openid",
        "profile",
        "email",
        "offline_access",
        "entitlements",
        "models",
    ]
    .iter()
    .map(|s| s.to_string())
    .collect()
}

impl Default for EnterpriseConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            issuer_url: String::new(),
            auth_url: String::new(),
            token_url: String::new(),
            userinfo_url: None,
            entitlements_url: None,
            client_id: default_enterprise_client_id(),
            scopes: default_enterprise_scopes(),
            gateway_url: String::new(),
            access_token: String::new(),
            refresh_token: None,
            data_token: None,
            data_token_version: None,
            previous_data_tokens: Vec::new(),
            user_email: None,
            organization_id: None,
            plan: None,
            user_points: None,
            entitlements: Vec::new(),
            expires_at: None,
            default_model: None,
        }
    }
}

pub fn enterprise_build_mode_enabled() -> bool {
    build_env("OPENPAWZ_BUILD_EDITION", ENTERPRISE_BUILD_EDITION).as_deref() == Some("enterprise")
}

fn build_env(key: &str, compiled: Option<&str>) -> Option<String> {
    compiled
        .map(ToOwned::to_owned)
        .or_else(|| std::env::var(key).ok())
}

fn build_scopes() -> Vec<String> {
    build_env("OPENPAWZ_ENTERPRISE_SCOPES", ENTERPRISE_BUILD_SCOPES)
        .map(|s| {
            s.split_whitespace()
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .map(ToOwned::to_owned)
                .collect::<Vec<_>>()
        })
        .filter(|scopes| !scopes.is_empty())
        .unwrap_or_else(default_enterprise_scopes)
}

pub fn enterprise_build_reset_session_enabled() -> bool {
    matches!(
        build_env(
            "OPENPAWZ_ENTERPRISE_RESET_SESSION",
            ENTERPRISE_BUILD_RESET_SESSION
        )
        .as_deref(),
        Some("1" | "true" | "yes")
    )
}

pub fn enterprise_build_config() -> Option<EnterpriseConfig> {
    if !enterprise_build_mode_enabled() {
        return None;
    }

    let issuer_url = build_env(
        "OPENPAWZ_ENTERPRISE_ISSUER_URL",
        ENTERPRISE_BUILD_ISSUER_URL,
    )
    .unwrap_or_else(|| "http://localhost:3000".to_string())
    .trim_end_matches('/')
    .to_string();
    Some(EnterpriseConfig {
        enabled: true,
        auth_url: build_env("OPENPAWZ_ENTERPRISE_AUTH_URL", ENTERPRISE_BUILD_AUTH_URL)
            .unwrap_or_else(|| endpoint(&issuer_url, "/oauth/authorize")),
        token_url: build_env("OPENPAWZ_ENTERPRISE_TOKEN_URL", ENTERPRISE_BUILD_TOKEN_URL)
            .unwrap_or_else(|| endpoint(&issuer_url, "/oauth/token")),
        userinfo_url: build_env(
            "OPENPAWZ_ENTERPRISE_USERINFO_URL",
            ENTERPRISE_BUILD_USERINFO_URL,
        )
        .or_else(|| Some(endpoint(&issuer_url, "/oauth/userinfo"))),
        entitlements_url: build_env(
            "OPENPAWZ_ENTERPRISE_ENTITLEMENTS_URL",
            ENTERPRISE_BUILD_ENTITLEMENTS_URL,
        )
        .or_else(|| Some(endpoint(&issuer_url, "/api/entitlements"))),
        gateway_url: build_env(
            "OPENPAWZ_ENTERPRISE_GATEWAY_URL",
            ENTERPRISE_BUILD_GATEWAY_URL,
        )
        .unwrap_or_else(|| endpoint(&issuer_url, "/api/llm/v1")),
        client_id: build_env("OPENPAWZ_ENTERPRISE_CLIENT_ID", ENTERPRISE_BUILD_CLIENT_ID)
            .unwrap_or_else(default_enterprise_client_id),
        scopes: build_scopes(),
        issuer_url,
        default_model: build_env(
            "OPENPAWZ_ENTERPRISE_DEFAULT_MODEL",
            ENTERPRISE_BUILD_DEFAULT_MODEL,
        ),
        ..EnterpriseConfig::default()
    })
}

#[derive(Debug, Clone, Serialize)]
pub struct EnterpriseStatus {
    pub enabled: bool,
    pub enterprise_build_mode: bool,
    pub configured: bool,
    pub authenticated: bool,
    pub expired: bool,
    pub can_manage_model_providers: bool,
    pub crypto_ready: bool,
    pub gateway_url: Option<String>,
    pub user_email: Option<String>,
    pub organization_id: Option<String>,
    pub plan: Option<String>,
    pub user_points: Option<f64>,
    pub entitlements: Vec<String>,
    pub expires_at: Option<String>,
    pub default_model: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct EnterpriseConfigureRequest {
    #[serde(default)]
    pub issuer_url: Option<String>,
    #[serde(default)]
    pub auth_url: Option<String>,
    #[serde(default)]
    pub token_url: Option<String>,
    #[serde(default)]
    pub userinfo_url: Option<String>,
    #[serde(default)]
    pub entitlements_url: Option<String>,
    #[serde(default)]
    pub client_id: Option<String>,
    #[serde(default)]
    pub scopes: Vec<String>,
    pub gateway_url: String,
    pub access_token: String,
    #[serde(default)]
    pub refresh_token: Option<String>,
    #[serde(default)]
    pub data_token: Option<String>,
    #[serde(default)]
    pub data_token_version: Option<String>,
    #[serde(default)]
    pub user_email: Option<String>,
    #[serde(default)]
    pub organization_id: Option<String>,
    #[serde(default)]
    pub plan: Option<String>,
    #[serde(default)]
    pub user_points: Option<f64>,
    #[serde(default)]
    pub entitlements: Vec<String>,
    #[serde(default)]
    pub expires_at: Option<String>,
    #[serde(default)]
    pub default_model: Option<String>,
    #[serde(default)]
    pub make_default: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct EnterpriseOAuthStartRequest {
    pub issuer_url: String,
    #[serde(default)]
    pub auth_url: Option<String>,
    #[serde(default)]
    pub token_url: Option<String>,
    #[serde(default)]
    pub userinfo_url: Option<String>,
    #[serde(default)]
    pub entitlements_url: Option<String>,
    #[serde(default)]
    pub gateway_url: Option<String>,
    #[serde(default)]
    pub client_id: Option<String>,
    #[serde(default)]
    pub scopes: Vec<String>,
    #[serde(default)]
    pub default_model: Option<String>,
    #[serde(default)]
    pub make_default: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct EntitlementCheck {
    pub feature: String,
    pub allowed: bool,
}

pub struct EnterpriseEntitlements<'a> {
    config: &'a EnterpriseConfig,
}

impl<'a> EnterpriseEntitlements<'a> {
    pub fn new(config: &'a EnterpriseConfig) -> Self {
        Self { config }
    }
}

impl EntitlementProvider for EnterpriseEntitlements<'_> {
    fn is_authenticated(&self) -> bool {
        self.config.enabled
            && !self.config.access_token.trim().is_empty()
            && !enterprise_session_expired(self.config)
    }

    fn has_entitlement(&self, feature: &str) -> bool {
        self.is_authenticated() && has_entitlement(self.config, feature)
    }
}

pub fn load_enterprise_config(state: &EngineState) -> EnterpriseConfig {
    let config = state
        .store
        .get_config(ENTERPRISE_CONFIG_KEY)
        .ok()
        .flatten()
        .and_then(|json| serde_json::from_str::<EnterpriseConfig>(&json).ok())
        .unwrap_or_default();
    sync_enterprise_sso_key_vault_mode(&config);
    config
}

fn save_enterprise_config(state: &EngineState, config: &EnterpriseConfig) -> Result<(), String> {
    sync_enterprise_sso_key_vault_mode(config);
    let json = serde_json::to_string(config).map_err(|e| format!("Serialize error: {e}"))?;
    state
        .store
        .set_config(ENTERPRISE_CONFIG_KEY, &json)
        .map_err(|e| e.to_string())
}

fn sync_enterprise_sso_key_vault_mode(config: &EnterpriseConfig) {
    crate::engine::key_vault::set_enterprise_sso_mode(
        enterprise_build_mode_enabled() || config.enabled,
    );
    let material = enterprise_sso_key_material(config);
    crate::engine::key_vault::set_enterprise_sso_material(material.as_deref());
}

fn apply_data_token_rotation(previous: &EnterpriseConfig, next: &mut EnterpriseConfig) {
    next.previous_data_tokens = previous.previous_data_tokens.clone();
    let Some(old_token) = previous
        .data_token
        .as_ref()
        .filter(|token| !token.trim().is_empty())
    else {
        return;
    };
    let Some(new_token) = next
        .data_token
        .as_ref()
        .filter(|token| !token.trim().is_empty())
    else {
        return;
    };
    if old_token == new_token {
        return;
    }
    if !next
        .previous_data_tokens
        .iter()
        .any(|entry| entry.token == *old_token)
    {
        next.previous_data_tokens.push(EnterpriseDataToken {
            token: old_token.clone(),
            version: previous.data_token_version.clone(),
        });
    }
}

fn enterprise_sso_key_material(config: &EnterpriseConfig) -> Option<String> {
    let data_token = config.data_token.as_deref()?.trim();
    if !config.enabled
        || data_token.is_empty()
        || config.access_token.trim().is_empty()
        || enterprise_session_expired(config)
    {
        return None;
    }
    Some(format!(
        "issuer={}|gateway={}|org={}|user={}|data_token_version={}|data_token={}",
        config.issuer_url,
        config.gateway_url,
        config.organization_id.as_deref().unwrap_or(""),
        config.user_email.as_deref().unwrap_or(""),
        config.data_token_version.as_deref().unwrap_or(""),
        data_token,
    ))
}

pub fn enterprise_configured_provider(config: &EnterpriseConfig) -> Option<ProviderConfig> {
    if !config.enabled
        || config.gateway_url.trim().is_empty()
        || config.access_token.trim().is_empty()
    {
        return None;
    }

    Some(ProviderConfig {
        id: ENTERPRISE_PROVIDER_ID.to_string(),
        kind: ProviderKind::Custom,
        api_key: config.access_token.clone(),
        base_url: Some(config.gateway_url.trim_end_matches('/').to_string()),
        default_model: config.default_model.clone().filter(|m| !m.trim().is_empty()),
    })
}

async fn list_enterprise_model_ids(gateway_url: &str, access_token: &str) -> Option<Vec<String>> {
    let base = gateway_url.trim_end_matches('/');
    if base.is_empty() || access_token.trim().is_empty() {
        return None;
    }

    let response = reqwest::Client::new()
        .get(format!("{}/models", base))
        .bearer_auth(access_token)
        .header("Accept", "application/json")
        .send()
        .await
        .ok()?;

    if !response.status().is_success() {
        return None;
    }

    let body = response.json::<Value>().await.ok()?;
    let ids = body
        .get("data")?
        .as_array()?
        .iter()
        .filter_map(|item| item.get("id").and_then(Value::as_str))
        .map(str::trim)
        .filter(|id| !id.is_empty())
        .map(ToOwned::to_owned)
        .collect::<Vec<_>>();
    Some(ids)
}

async fn discover_enterprise_default_model(gateway_url: &str, access_token: &str) -> Option<String> {
    list_enterprise_model_ids(gateway_url, access_token)
        .await?
        .into_iter()
        .next()
}

pub fn enterprise_session_expired(config: &EnterpriseConfig) -> bool {
    let Some(expires_at) = &config.expires_at else {
        return false;
    };
    let Ok(dt) = DateTime::parse_from_rfc3339(expires_at) else {
        return true;
    };
    dt.with_timezone(&Utc) <= Utc::now() + Duration::seconds(30)
}

pub fn enforce_enterprise_access(config: &EnterpriseConfig) -> Result<(), String> {
    if !config.enabled {
        return Err("Enterprise cloud is disabled. Sign in before using enterprise models.".into());
    }
    if config.gateway_url.trim().is_empty() || config.access_token.trim().is_empty() {
        return Err(
            "Enterprise cloud is not configured. Sign in before using enterprise models.".into(),
        );
    }
    if enterprise_session_expired(config) {
        return Err(
            "Enterprise session expired. Sign in again before using enterprise models.".into(),
        );
    }
    require_feature(&EnterpriseEntitlements::new(config), FEATURE_MODELS_PROXY)
}

pub fn has_entitlement(config: &EnterpriseConfig, feature: &str) -> bool {
    if feature.trim().is_empty() {
        return false;
    }
    config
        .entitlements
        .iter()
        .any(|e| e == "all" || e == feature)
}

fn endpoint(base: &str, path: &str) -> String {
    format!("{}{}", base.trim_end_matches('/'), path)
}

fn derive_auth_url(req: &EnterpriseOAuthStartRequest) -> String {
    req.auth_url
        .clone()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| endpoint(&req.issuer_url, "/oauth/authorize"))
}

fn derive_token_url(req: &EnterpriseOAuthStartRequest) -> String {
    req.token_url
        .clone()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| endpoint(&req.issuer_url, "/oauth/token"))
}

fn derive_userinfo_url(req: &EnterpriseOAuthStartRequest) -> Option<String> {
    req.userinfo_url
        .clone()
        .filter(|s| !s.trim().is_empty())
        .or_else(|| Some(endpoint(&req.issuer_url, "/oauth/userinfo")))
}

fn derive_entitlements_url(req: &EnterpriseOAuthStartRequest) -> Option<String> {
    req.entitlements_url
        .clone()
        .filter(|s| !s.trim().is_empty())
        .or_else(|| Some(endpoint(&req.issuer_url, "/api/entitlements")))
}

fn derive_gateway_url(req: &EnterpriseOAuthStartRequest) -> String {
    req.gateway_url
        .clone()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| endpoint(&req.issuer_url, "/api/llm/v1"))
}

fn generate_pkce_pair() -> Result<(String, String), String> {
    let mut verifier_bytes = [0u8; 32];
    getrandom::getrandom(&mut verifier_bytes).map_err(|e| format!("CSPRNG failed: {e}"))?;
    let code_verifier = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(verifier_bytes);
    let digest = Sha256::digest(code_verifier.as_bytes());
    let code_challenge = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(digest);
    Ok((code_verifier, code_challenge))
}

fn generate_state() -> Result<String, String> {
    let mut state = [0u8; 16];
    getrandom::getrandom(&mut state).map_err(|e| format!("CSPRNG failed: {e}"))?;
    Ok(base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(state))
}

async fn wait_for_oauth_callback(
    listener: TcpListener,
    expected_state: &str,
) -> Result<String, String> {
    let result = tokio::time::timeout(std::time::Duration::from_secs(120), async {
        let (mut stream, _) = listener
            .accept()
            .await
            .map_err(|e| format!("Failed to accept OAuth callback: {e}"))?;
        let mut buf = vec![0u8; 4096];
        let n = stream
            .read(&mut buf)
            .await
            .map_err(|e| format!("Failed to read OAuth callback: {e}"))?;
        let request = String::from_utf8_lossy(&buf[..n]);
        let first_line = request.lines().next().unwrap_or("");
        let path = first_line.split_whitespace().nth(1).unwrap_or("");
        let query_string = path.split_once('?').map(|x| x.1).unwrap_or("");
        let params = parse_urlencoded_query(query_string);

        if let Some(err) = params.get("error") {
            let desc = params
                .get("error_description")
                .map(String::as_str)
                .unwrap_or("Unknown error");
            let _ = stream
                .write_all(
                    format!(
                        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n\
                        <html><head><meta charset='utf-8'></head><body><h2>授权失败</h2><p>{}</p></body></html>",
                        desc
                    )
                    .as_bytes(),
                )
                .await;
            return Err(format!("OAuth authorization denied: {err} — {desc}"));
        }

        if params.get("state").map(String::as_str) != Some(expected_state) {
            let _ = stream
                .write_all(b"HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\nState mismatch")
                .await;
            return Err("OAuth state mismatch".to_string());
        }

        let code = params
            .get("code")
            .cloned()
            .ok_or_else(|| "No authorization code in callback".to_string())?;
        let success_html = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n\
            <html><head><meta charset='utf-8'></head><body><h2>企业登录完成</h2><p>你可以关闭此标签页并返回 {}。</p><script>setTimeout(()=>window.close(),2000)</script></body></html>",
            brand::escape_html(brand::active_brand().app_name)
        );
        let _ = stream.write_all(success_html.as_bytes()).await;
        Ok(code)
    })
    .await;

    result.map_err(|_| "OAuth authorization timed out after 120 seconds".to_string())?
}

#[derive(Debug, Deserialize)]
struct OAuthTokenResponse {
    access_token: String,
    #[serde(default)]
    refresh_token: Option<String>,
    #[serde(default)]
    data_token: Option<String>,
    #[serde(default)]
    data_token_version: Option<String>,
    #[serde(default)]
    expires_in: Option<i64>,
    #[serde(default)]
    scope: Option<String>,
}

async fn exchange_enterprise_code(
    token_url: &str,
    client_id: &str,
    code: &str,
    code_verifier: &str,
    redirect_uri: &str,
) -> Result<OAuthTokenResponse, String> {
    let client = reqwest::Client::new();
    let mut params = HashMap::new();
    params.insert("grant_type", "authorization_code");
    params.insert("code", code);
    params.insert("redirect_uri", redirect_uri);
    params.insert("client_id", client_id);
    params.insert("code_verifier", code_verifier);

    let response = client
        .post(token_url)
        .header("Accept", "application/json")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Token exchange failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Token exchange failed (HTTP {status}): {body}"));
    }

    response
        .json::<OAuthTokenResponse>()
        .await
        .map_err(|e| format!("Failed to parse token response: {e}"))
}

async fn fetch_json_bearer(url: &str, access_token: &str) -> Result<Value, String> {
    let response = reqwest::Client::new()
        .get(url)
        .bearer_auth(access_token)
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| format!("Request failed for {url}: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Request failed for {url} (HTTP {status}): {body}"));
    }

    response
        .json::<Value>()
        .await
        .map_err(|e| format!("Failed to parse JSON from {url}: {e}"))
}

fn string_field(value: &Value, keys: &[&str]) -> Option<String> {
    keys.iter()
        .find_map(|key| value.get(*key).and_then(Value::as_str))
        .map(ToOwned::to_owned)
}

fn number_field(value: &Value, keys: &[&str]) -> Option<f64> {
    keys.iter().find_map(|key| {
        value.get(*key).and_then(Value::as_f64).or_else(|| {
            value
                .get(*key)
                .and_then(Value::as_str)
                .and_then(|s| s.trim().replace(',', "").parse::<f64>().ok())
        })
    })
}

fn enterprise_data_token_from_payloads(
    token: &OAuthTokenResponse,
    userinfo: Option<&Value>,
    entitlements: Option<&Value>,
) -> (Option<String>, Option<String>) {
    let token_value = token
        .data_token
        .clone()
        .or_else(|| userinfo.and_then(enterprise_data_token_from_value))
        .or_else(|| entitlements.and_then(enterprise_data_token_from_value));
    let token_version = token
        .data_token_version
        .clone()
        .or_else(|| userinfo.and_then(enterprise_data_token_version_from_value))
        .or_else(|| entitlements.and_then(enterprise_data_token_version_from_value));
    (token_value, token_version)
}

fn enterprise_data_token_from_value(value: &Value) -> Option<String> {
    string_field(
        value,
        &[
            "data_token",
            "dataToken",
            "encryption_token",
            "encryptionToken",
            "xtyx_token",
            "xtyxToken",
        ],
    )
}

fn enterprise_data_token_version_from_value(value: &Value) -> Option<String> {
    string_field(
        value,
        &[
            "data_token_version",
            "dataTokenVersion",
            "encryption_token_version",
            "encryptionTokenVersion",
            "xtyx_token_version",
            "xtyxTokenVersion",
        ],
    )
}

fn entitlements_from_value(value: &Value) -> Vec<String> {
    let source = value
        .get("entitlements")
        .or_else(|| value.get("features"))
        .or_else(|| value.get("permissions"))
        .unwrap_or(value);

    match source {
        Value::Array(items) => items
            .iter()
            .filter_map(Value::as_str)
            .map(ToOwned::to_owned)
            .collect(),
        Value::Object(map) => map
            .iter()
            .filter(|&(_k, v)| v.as_bool().unwrap_or(false))
            .map(|(k, _v)| k.clone())
            .collect(),
        _ => Vec::new(),
    }
}

fn expires_at_from_token(token: &OAuthTokenResponse) -> Option<String> {
    token
        .expires_in
        .map(|secs| (Utc::now() + Duration::seconds(secs)).to_rfc3339())
}

fn status_from_config(config: EnterpriseConfig) -> EnterpriseStatus {
    let configured =
        !config.gateway_url.trim().is_empty() && !config.access_token.trim().is_empty();
    let expired = enterprise_session_expired(&config);
    let can_manage_model_providers = !config.enabled || !configured || expired;
    let crypto_ready = config.enabled && configured && !expired;
    EnterpriseStatus {
        enabled: config.enabled,
        enterprise_build_mode: enterprise_build_mode_enabled(),
        configured,
        authenticated: config.enabled && configured && !expired,
        expired,
        can_manage_model_providers,
        crypto_ready,
        gateway_url: if config.gateway_url.is_empty() {
            None
        } else {
            Some(config.gateway_url)
        },
        user_email: config.user_email,
        organization_id: config.organization_id,
        plan: config.plan,
        user_points: config.user_points,
        entitlements: config.entitlements,
        expires_at: config.expires_at,
        default_model: config.default_model,
    }
}

async fn refresh_enterprise_userinfo(
    state: &EngineState,
    mut config: EnterpriseConfig,
) -> EnterpriseConfig {
    if !config.enabled
        || config.access_token.trim().is_empty()
        || enterprise_session_expired(&config)
    {
        return config;
    }

    let Some(userinfo_url) = config
        .userinfo_url
        .clone()
        .filter(|url| !url.trim().is_empty())
    else {
        return config;
    };

    let Ok(userinfo) = fetch_json_bearer(&userinfo_url, &config.access_token).await else {
        return config;
    };

    config.user_email =
        string_field(&userinfo, &["email", "preferred_username", "sub"]).or(config.user_email);
    config.organization_id = string_field(&userinfo, &["organization_id", "org_id", "tenant_id"])
        .or(config.organization_id);
    config.user_points =
        number_field(&userinfo, &["points", "credits", "balance"]).or(config.user_points);

    let _ = save_enterprise_config(state, &config);
    config
}

fn upsert_enterprise_provider(config: &mut EngineConfig, provider: ProviderConfig) {
    if let Some(existing) = config
        .providers
        .iter_mut()
        .find(|p| p.id == ENTERPRISE_PROVIDER_ID)
    {
        *existing = provider;
    } else {
        config.providers.push(provider);
    }
}

async fn refresh_enterprise_default_model_if_needed(
    state: &EngineState,
    mut config: EnterpriseConfig,
) -> EnterpriseConfig {
    if !config.enabled
        || config.gateway_url.trim().is_empty()
        || config.access_token.trim().is_empty()
        || enterprise_session_expired(&config)
    {
        return config;
    }

    let Some(models) = list_enterprise_model_ids(&config.gateway_url, &config.access_token).await
    else {
        return config;
    };
    let Some(first_model) = models.first().cloned() else {
        return config;
    };

    let current_model = config
        .default_model
        .as_deref()
        .map(str::trim)
        .filter(|m| !m.is_empty());
    if current_model.is_some_and(|model| models.iter().any(|available| available == model)) {
        return config;
    }

    config.default_model = Some(first_model);
    let _ = save_enterprise_config(state, &config);

    if let Some(provider) = enterprise_configured_provider(&config) {
        let mut engine_cfg = state.config.lock();
        let was_default = engine_cfg.default_provider.as_deref() == Some(ENTERPRISE_PROVIDER_ID);
        upsert_enterprise_provider(&mut engine_cfg, provider);
        if was_default || engine_cfg.default_provider.is_none() {
            engine_cfg.default_provider = Some(ENTERPRISE_PROVIDER_ID.to_string());
            engine_cfg.default_model = config.default_model.clone();
        }
        let _ = persist_engine_config(state, &engine_cfg);
    }

    config
}

fn persist_engine_config(state: &EngineState, config: &EngineConfig) -> Result<(), String> {
    let json = serde_json::to_string(config).map_err(|e| format!("Serialize error: {e}"))?;
    state
        .store
        .set_config("engine_config", &json)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn engine_enterprise_status(
    state: State<'_, EngineState>,
) -> Result<EnterpriseStatus, String> {
    let config = refresh_enterprise_userinfo(&state, load_enterprise_config(&state)).await;
    let config = refresh_enterprise_default_model_if_needed(&state, config).await;
    Ok(status_from_config(config))
}

#[tauri::command]
pub async fn engine_enterprise_configure(
    state: State<'_, EngineState>,
    request: EnterpriseConfigureRequest,
) -> Result<EnterpriseStatus, String> {
    let previous = load_enterprise_config(&state);
    let gateway_url = request.gateway_url.trim_end_matches('/').to_string();
    let default_model = if let Some(model) = request
        .default_model
        .clone()
        .filter(|m| !m.trim().is_empty())
    {
        Some(model)
    } else {
        discover_enterprise_default_model(&gateway_url, &request.access_token).await
    };
    let mut config = EnterpriseConfig {
        enabled: true,
        issuer_url: request.issuer_url.unwrap_or_default(),
        auth_url: request.auth_url.unwrap_or_default(),
        token_url: request.token_url.unwrap_or_default(),
        userinfo_url: request.userinfo_url,
        entitlements_url: request.entitlements_url,
        client_id: request
            .client_id
            .filter(|s| !s.trim().is_empty())
            .unwrap_or_else(default_enterprise_client_id),
        scopes: if request.scopes.is_empty() {
            default_enterprise_scopes()
        } else {
            request.scopes
        },
        gateway_url,
        access_token: request.access_token,
        refresh_token: request.refresh_token,
        data_token: request.data_token,
        data_token_version: request.data_token_version,
        previous_data_tokens: Vec::new(),
        user_email: request.user_email,
        organization_id: request.organization_id,
        plan: request.plan,
        user_points: request.user_points,
        entitlements: request.entitlements,
        expires_at: request.expires_at,
        default_model,
    };
    apply_data_token_rotation(&previous, &mut config);

    enforce_enterprise_access(&config)?;
    save_enterprise_config(&state, &config)?;

    if let Some(provider) = enterprise_configured_provider(&config) {
        let mut engine_cfg = state.config.lock();
        upsert_enterprise_provider(&mut engine_cfg, provider);
        if request.make_default {
            engine_cfg.default_provider = Some(ENTERPRISE_PROVIDER_ID.to_string());
            engine_cfg.default_model = config.default_model.clone();
        }
        persist_engine_config(&state, &engine_cfg)?;
    }

    Ok(status_from_config(config))
}

#[tauri::command]
pub async fn engine_enterprise_oauth_start(
    app_handle: tauri::AppHandle,
    state: State<'_, EngineState>,
    request: EnterpriseOAuthStartRequest,
) -> Result<EnterpriseStatus, String> {
    let auth_url = derive_auth_url(&request);
    let token_url = derive_token_url(&request);
    let userinfo_url = derive_userinfo_url(&request);
    let entitlements_url = derive_entitlements_url(&request);
    let gateway_url = derive_gateway_url(&request);
    let client_id = request
        .client_id
        .clone()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(default_enterprise_client_id);
    let scopes = if request.scopes.is_empty() {
        default_enterprise_scopes()
    } else {
        request.scopes.clone()
    };

    let (code_verifier, code_challenge) = generate_pkce_pair()?;
    let state_token = generate_state()?;
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("Failed to start OAuth callback server: {e}"))?;
    let port = listener
        .local_addr()
        .map_err(|e| format!("Failed to read callback port: {e}"))?
        .port();
    let redirect_uri = format!("http://127.0.0.1:{port}/callback");

    let mut browser_url = format!(
        "{}?response_type=code&client_id={}&redirect_uri={}&code_challenge={}&code_challenge_method=S256&state={}",
        auth_url,
        urlencoding::encode(&client_id),
        urlencoding::encode(&redirect_uri),
        urlencoding::encode(&code_challenge),
        urlencoding::encode(&state_token),
    );
    if !scopes.is_empty() {
        browser_url.push_str(&format!(
            "&scope={}",
            urlencoding::encode(&scopes.join(" "))
        ));
    }

    use tauri_plugin_opener::OpenerExt;
    app_handle
        .opener()
        .open_url(&browser_url, None::<&str>)
        .map_err(|e| format!("Failed to open enterprise login: {e}"))?;

    let code = wait_for_oauth_callback(listener, &state_token).await?;
    let token =
        exchange_enterprise_code(&token_url, &client_id, &code, &code_verifier, &redirect_uri)
            .await?;

    let userinfo = match &userinfo_url {
        Some(url) => fetch_json_bearer(url, &token.access_token).await.ok(),
        None => None,
    };
    let entitlement_payload = match &entitlements_url {
        Some(url) => fetch_json_bearer(url, &token.access_token).await.ok(),
        None => None,
    };

    let mut entitlements = entitlement_payload
        .as_ref()
        .map(entitlements_from_value)
        .unwrap_or_default();
    if entitlements.is_empty() {
        entitlements = token
            .scope
            .as_deref()
            .unwrap_or("")
            .split_whitespace()
            .filter(|scope| scope.contains(':'))
            .map(ToOwned::to_owned)
            .collect();
    }

    let expires_at = expires_at_from_token(&token);
    let (data_token, data_token_version) = enterprise_data_token_from_payloads(
        &token,
        userinfo.as_ref(),
        entitlement_payload.as_ref(),
    );

    let previous = load_enterprise_config(&state);
    let gateway_url = gateway_url.trim_end_matches('/').to_string();
    let default_model = if let Some(model) = request
        .default_model
        .clone()
        .filter(|m| !m.trim().is_empty())
    {
        Some(model)
    } else {
        discover_enterprise_default_model(&gateway_url, &token.access_token).await
    };
    let mut config = EnterpriseConfig {
        enabled: true,
        issuer_url: request.issuer_url.trim_end_matches('/').to_string(),
        auth_url,
        token_url,
        userinfo_url,
        entitlements_url,
        client_id,
        scopes,
        gateway_url,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        data_token,
        data_token_version,
        previous_data_tokens: Vec::new(),
        user_email: userinfo
            .as_ref()
            .and_then(|v| string_field(v, &["email", "preferred_username", "sub"])),
        organization_id: userinfo
            .as_ref()
            .and_then(|v| string_field(v, &["organization_id", "org_id", "tenant_id"])),
        plan: entitlement_payload
            .as_ref()
            .and_then(|v| string_field(v, &["plan", "tier"])),
        user_points: userinfo
            .as_ref()
            .and_then(|v| number_field(v, &["points", "credits", "balance"])),
        entitlements,
        expires_at,
        default_model,
    };
    apply_data_token_rotation(&previous, &mut config);

    enforce_enterprise_access(&config)?;
    save_enterprise_config(&state, &config)?;

    if let Some(provider) = enterprise_configured_provider(&config) {
        let mut engine_cfg = state.config.lock();
        upsert_enterprise_provider(&mut engine_cfg, provider);
        if request.make_default {
            engine_cfg.default_provider = Some(ENTERPRISE_PROVIDER_ID.to_string());
            engine_cfg.default_model = config.default_model.clone();
        }
        persist_engine_config(&state, &engine_cfg)?;
    }

    Ok(status_from_config(config))
}

#[tauri::command]
pub fn engine_enterprise_has_entitlement(
    state: State<'_, EngineState>,
    feature: String,
) -> Result<EntitlementCheck, String> {
    let config = load_enterprise_config(&state);
    Ok(EntitlementCheck {
        allowed: config.enabled
            && !enterprise_session_expired(&config)
            && has_entitlement(&config, &feature),
        feature,
    })
}

pub fn enterprise_provider_management_locked(state: &EngineState) -> bool {
    let config = load_enterprise_config(state);
    config.enabled && !config.access_token.trim().is_empty() && !enterprise_session_expired(&config)
}

#[tauri::command]
pub fn engine_enterprise_enable(
    state: State<'_, EngineState>,
    enabled: bool,
) -> Result<EnterpriseStatus, String> {
    let mut config = load_enterprise_config(&state);
    config.enabled = enabled;
    if enabled {
        enforce_enterprise_access(&config)?;
    }
    save_enterprise_config(&state, &config)?;

    if let Some(provider) = enterprise_configured_provider(&config) {
        let mut engine_cfg = state.config.lock();
        upsert_enterprise_provider(&mut engine_cfg, provider);
        persist_engine_config(&state, &engine_cfg)?;
    }

    Ok(status_from_config(config))
}

#[tauri::command]
pub fn engine_enterprise_logout(
    state: State<'_, EngineState>,
    remove_provider: bool,
) -> Result<EnterpriseStatus, String> {
    let config = EnterpriseConfig::default();
    save_enterprise_config(&state, &config)?;

    if remove_provider {
        let mut engine_cfg = state.config.lock();
        engine_cfg
            .providers
            .retain(|p| p.id != ENTERPRISE_PROVIDER_ID);
        if engine_cfg.default_provider.as_deref() == Some(ENTERPRISE_PROVIDER_ID) {
            engine_cfg.default_provider = engine_cfg.providers.first().map(|p| p.id.clone());
            engine_cfg.default_model = engine_cfg
                .default_provider
                .as_ref()
                .and_then(|id| engine_cfg.providers.iter().find(|p| &p.id == id))
                .and_then(|p| p.default_model.clone());
        }
        persist_engine_config(&state, &engine_cfg)?;
    }

    Ok(status_from_config(config))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn configured(entitlements: Vec<String>, expires_at: Option<String>) -> EnterpriseConfig {
        EnterpriseConfig {
            enabled: true,
            gateway_url: "https://gateway.example.com/v1".to_string(),
            access_token: "token".to_string(),
            entitlements,
            expires_at,
            ..EnterpriseConfig::default()
        }
    }

    #[test]
    fn enterprise_access_requires_explicit_model_proxy_entitlement() {
        let config = configured(Vec::new(), None);
        assert!(enforce_enterprise_access(&config).is_err());
    }

    #[test]
    fn enterprise_access_requires_model_proxy_entitlement_when_present() {
        let config = configured(vec!["billing:read".to_string()], None);
        assert!(enforce_enterprise_access(&config).is_err());

        let config = configured(vec!["models:proxy".to_string()], None);
        assert!(enforce_enterprise_access(&config).is_ok());
    }

    #[test]
    fn enterprise_access_allows_all_entitlement() {
        let config = configured(vec!["all".to_string()], None);
        assert!(enforce_enterprise_access(&config).is_ok());
    }

    #[test]
    fn enterprise_access_rejects_expired_sessions() {
        let expired = (Utc::now() - Duration::minutes(5)).to_rfc3339();
        let config = configured(vec!["models:proxy".to_string()], Some(expired));
        assert!(enforce_enterprise_access(&config).is_err());
    }
}
