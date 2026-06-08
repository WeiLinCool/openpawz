#[derive(Debug, Clone, Copy)]
pub struct BrandConfig {
    pub id: &'static str,
    pub app_name: &'static str,
    pub short_name: &'static str,
    pub product_name: &'static str,
    pub window_title: &'static str,
    pub repository_url: &'static str,
    pub tagline: &'static str,
    pub about_line: &'static str,
}

pub fn active_brand() -> BrandConfig {
    BrandConfig {
        id: option_env!("OPENPAWZ_BRAND_ID").unwrap_or("taiji"),
        app_name: option_env!("OPENPAWZ_APP_NAME").unwrap_or("太极台"),
        short_name: option_env!("OPENPAWZ_SHORT_NAME").unwrap_or("太极"),
        product_name: option_env!("OPENPAWZ_PRODUCT_NAME").unwrap_or("太极台"),
        window_title: option_env!("OPENPAWZ_WINDOW_TITLE").unwrap_or("太极"),
        repository_url: option_env!("OPENPAWZ_REPOSITORY_URL")
            .unwrap_or("https://github.com/OpenPawz/openpawz"),
        tagline: option_env!("OPENPAWZ_TAGLINE").unwrap_or("你的 AI 指挥中心"),
        about_line: option_env!("OPENPAWZ_ABOUT_LINE").unwrap_or("本地优先的智能桌面工作台"),
    }
}

pub fn protocol_name() -> String {
    title_case_slug(active_brand().id)
}

pub fn http_user_agent() -> String {
    format!("{}/{}", http_user_agent_token(), env!("CARGO_PKG_VERSION"))
}

pub fn escape_html(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

pub fn escape_js_single_quoted(input: &str) -> String {
    input
        .replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
}

fn http_user_agent_token() -> String {
    let mut token = String::new();

    for ch in active_brand().id.chars() {
        if ch.is_ascii_alphanumeric() {
            token.push(ch.to_ascii_lowercase());
            continue;
        }

        if matches!(ch, '-' | '_' | '.')
            && !matches!(token.chars().last(), Some('-' | '_' | '.'))
        {
            token.push(ch);
        }
    }

    let trimmed = token.trim_matches(|c| matches!(c, '-' | '_' | '.'));
    if trimmed.is_empty() {
        "taiji".to_string()
    } else {
        trimmed.to_string()
    }
}

fn title_case_slug(value: &str) -> String {
    let words: Vec<String> = value
        .split(|c: char| !c.is_ascii_alphanumeric())
        .filter(|part| !part.is_empty())
        .map(|part| {
            let lower = part.to_ascii_lowercase();
            let mut chars = lower.chars();
            match chars.next() {
                Some(first) => first.to_ascii_uppercase().to_string() + chars.as_str(),
                None => String::new(),
            }
        })
        .filter(|part| !part.is_empty())
        .collect();

    if words.is_empty() {
        "Taiji".to_string()
    } else {
        words.join(" ")
    }
}
