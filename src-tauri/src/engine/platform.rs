// engine/platform.rs — OSS extension points for platform capabilities.
//
// Enterprise builds should plug into these traits instead of scattering
// edition-specific checks through command handlers.

pub const FEATURE_CORE_CHAT: &str = "core:chat";
pub const FEATURE_CORE_LOCAL_MODELS: &str = "core:local-models";
pub const FEATURE_SKILLS_PERSONAL: &str = "skills:personal";
pub const FEATURE_MODELS_PROXY: &str = "models:proxy";

pub trait EntitlementProvider {
    fn is_authenticated(&self) -> bool;
    fn has_entitlement(&self, feature: &str) -> bool;

    fn require(&self, feature: &str) -> Result<(), String> {
        if self.has_entitlement(feature) {
            Ok(())
        } else if self.is_authenticated() {
            Err(format!("Your account does not include '{}'.", feature))
        } else {
            Err(format!("Sign in to use '{}'.", feature))
        }
    }
}

pub struct FreeEntitlements;

impl EntitlementProvider for FreeEntitlements {
    fn is_authenticated(&self) -> bool {
        true
    }

    fn has_entitlement(&self, feature: &str) -> bool {
        matches!(
            feature,
            FEATURE_CORE_CHAT | FEATURE_CORE_LOCAL_MODELS | FEATURE_SKILLS_PERSONAL
        )
    }
}

pub fn require_feature<P: EntitlementProvider>(provider: &P, feature: &str) -> Result<(), String> {
    provider.require(feature)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn free_entitlements_allow_only_personal_core_features() {
        let free = FreeEntitlements;
        assert!(free.has_entitlement(FEATURE_CORE_CHAT));
        assert!(free.has_entitlement(FEATURE_CORE_LOCAL_MODELS));
        assert!(!free.has_entitlement(FEATURE_MODELS_PROXY));
    }
}
