# Reference-Driven Engineering

Use this method when a task belongs to a problem class that mature products, protocols, platforms, or teams have probably already solved. The goal is not to copy external implementation. The goal is to turn external promises, ownership models, invariants, fallbacks, and trade-offs into a local design that fits OpenPawz.

Current repository context: OpenPawz is a Tauri v2 desktop app with a plain TypeScript/DOM frontend in `src/`, a Rust engine and Tauri command layer in `src-tauri/`, reusable Rust crates under `src-tauri/crates/`, and Mintlify documentation under `docs/` with public navigation controlled by `docs.json`.

## 1. When Research Is Required

Default to research before design when the task involves any of:

- Tauri permissions, CSP, updater behavior, filesystem scope, shell/process access, or desktop security boundaries.
- Credential storage, keychain behavior, local encryption, secret redaction, prompt-injection defenses, or human approval flows.
- Rust engine behavior that crosses providers, tools, sessions, memory, orchestration, sandboxing, channels, or persisted state.
- Provider APIs, streaming, tool calling, constrained decoding, model routing, pricing, proxy configuration, or fallback behavior.
- Channel bridges such as Telegram, Discord, Slack, Matrix, IRC, Mattermost, Nextcloud, Nostr, Twitch, WebChat, WhatsApp, or Discourse.
- MCP, n8n, browser automation, container sandboxing, Tailscale, Google Workspace, email, webhook, or integration-health workflows.
- Durable local data, SQLite/session storage, migrations or schema-like changes, idempotency, import/export, sync, cache, recovery, or cleanup.
- User-visible navigation, forms, dashboards, settings tabs, onboarding, documentation information architecture, or content hierarchy.
- Packaging and release behavior for Tauri bundles, Flatpak, Homebrew, Snap, Windows installers, or enterprise builds.
- A local patch that fixes one case while making adjacent cases harder to explain.

Quick test: if the issue is something other desktop apps, automation tools, provider SDKs, or platform integrations have likely shipped, broken, and documented, research it first.

## 2. Source Priority

Start with local ownership, then verify mature external practice from primary sources.

1. This repository's source, tests, `DEVELOPMENT.md`, `AGENTS.md`, and focused docs under `docs/project/`.
2. Public OpenPawz docs under `docs/start/`, `docs/guides/`, `docs/providers/`, and `docs/reference/`, especially when user-facing behavior or `docs.json` navigation may change.
3. Official product, protocol, framework, and platform documentation: Tauri, Rust, provider APIs, MCP, n8n, channel platform docs, browser/container/security guidance, and packaging docs.
4. Official examples, source code, tests, RFCs, specs, changelogs, and maintainer comments explaining trade-offs or pitfalls.
5. Issues and discussions from maintainers or experienced integrators when official docs omit operational constraints.

Avoid designing from random snippets, SEO blogs, or context-free examples unless they are only used to discover better primary sources.

When current external APIs, package behavior, security guidance, or platform rules matter, verify against up-to-date official sources before finalizing the design.

## 3. Research Output

Do not collect pages for volume. For each useful reference, extract only:

- Promise: what behavior is committed to users or callers.
- State owner and authority owner.
- Local owner and call path.
- 1-3 invariants.
- Fallback, retry, manual override, or failure behavior.
- Trade-off, limitation, or reason not to copy directly.

Suggested note format:

```md
Reference: <name / URL / file>

- Promise:
- State owner:
- Authority owner:
- Local owner / call path:
- Invariants:
- Fallback / override:
- Transferable principle:
- Not directly copied because:
```

For OpenPawz code, the local call path usually looks like one of these:

- Frontend action: `view/component -> pawEngine -> ipc_client.ts -> Tauri command -> engine module -> storage/provider/tool/channel`.
- Channel bridge: `channel engine module -> commands/channels.rs -> lib.rs registration -> ipc_client.ts -> channels view atoms/molecules`.
- Documentation route: `docs/<section>/<page> -> docs.json navigation -> internal links/translations`.

## 4. Translate Before Designing

A local proposal must show this chain:

`External consensus -> Transferable principle -> OpenPawz constraints -> Local design`

OpenPawz constraints usually include:

- Plain TypeScript and direct DOM rendering; there is no React/Vue component model.
- View modules generally use `atoms.ts`, `molecules.ts`, and `index.ts`.
- `src/views/router.ts` owns view activation and lazy loading.
- Frontend backend calls should flow through `src/engine/molecules/ipc_client.ts`.
- Tauri commands live under `src-tauri/src/commands/` and delegate durable behavior to `src-tauri/src/engine/`.
- `src-tauri/src/lib.rs` registers command handlers and initializes plugins/background tasks.
- Tauri capabilities and CSP are least-privilege security surfaces.
- Rust engine modules own provider calls, tools, sessions, memory, channels, orchestration, sandboxing, and integrations.
- Public docs live under `docs/`; `docs.json` is the public navigation source of truth.
- CI expects TypeScript checks and Rust checks to stay clean.

## 5. Conservative Defaults

For automation or heuristics such as auto-detect, auto-approve, auto-retry, auto-recover, capability selection, provider fallback, tool selection, channel routing, or status inference:

- Switch state only with high confidence.
- Keep behavior stable when ambiguous.
- Preserve explicit user/admin override where appropriate.
- Make retries idempotent where side effects are possible.
- Prefer auditable state transitions over hidden local flags.
- Keep local/private defaults stronger than cloud-style defaults unless the user explicitly opts in.

## 6. Common Local Patterns

### Tauri IPC And Security

Research should clarify:

- Tauri command and permission expectations.
- Capability scope and CSP implications.
- Shell, filesystem, process, SQL, updater, and opener plugin risks.
- Fail-closed behavior and user consent expectations.

Local design should keep durable policy in Rust engine modules, adapt requests in `src-tauri/src/commands/`, register handlers in `src-tauri/src/lib.rs`, and expose typed frontend wrappers in `src/engine/molecules/ipc_client.ts`.

### Agent Runtime, Providers, And Tools

Research should clarify:

- Provider request/response contracts.
- Streaming and cancellation semantics.
- Tool schema and constrained decoding behavior.
- Retry, fallback, pricing, and rate-limit implications.
- Secret handling and prompt-injection boundaries.

Local design should reuse provider, tool, chat, session, memory, and orchestration modules under `src-tauri/src/engine/` before adding new top-level modules.

### Channel Bridges

Research should clarify:

- Platform authentication and bot permission model.
- Message length, formatting, attachments, and rate limits.
- User identity stability and access-control options.
- Reconnect, backoff, webhook, or polling behavior.

Local design should follow `docs/project/channel-bridge-guide.md`, reuse shared helpers from `src-tauri/src/engine/channels/mod.rs`, add command coverage in `src-tauri/src/commands/channels.rs`, and update the Channels UI atoms/molecules when the bridge is user-configurable.

### Integrations, MCP, And Automation

Research should clarify:

- MCP server/tool schema promises.
- n8n credential and workflow behavior.
- Browser/container sandbox boundaries.
- Health checks, guardrails, retries, and failure visibility.

Local design should keep the agent-facing integration contract separate from user-facing setup docs in `docs/guides/`.

### Frontend UI And Information Architecture

Research should clarify:

- Mature desktop app conventions for the task.
- Navigation model and settings placement.
- Form validation and recovery.
- Dense operational layout versus marketing layout.
- Accessibility, keyboard behavior, and responsive behavior.

Local design should follow `docs/project/frontend-patterns.md`, reuse existing view/component helpers, and verify user-visible changes in the running Tauri app when practical.

### Documentation And Public Navigation

Research should clarify:

- Whether the change is contributor-facing or public user-facing.
- Which `docs.json` tab and group owns the page.
- Whether English and Chinese pages both need updates.
- Whether old internal links need route updates.

Local design should place docs in the correct `docs/` section and update `docs.json` whenever public navigation changes.

## 7. Verification

Tie verification to the learned invariant:

- TypeScript logic: `pnpm typecheck`, `pnpm lint`, `pnpm test`, or targeted `vitest`.
- Frontend formatting: `pnpm format:check`.
- Rust logic: `cargo fmt -- --check`, `cargo check`, `cargo test`, and `cargo clippy -- -D warnings` from `src-tauri/`.
- IPC wiring: exercise the frontend action through `pawEngine` and the registered Tauri command.
- Channel/provider/integration behavior: use focused local tests or manual verification with clear credentials/setup notes.
- Security-sensitive changes: verify capabilities, CSP, approvals, secret handling, and fail-closed behavior.
- Documentation navigation: verify the file path, links, translations when applicable, and `docs.json` entry.
- Packaging changes: run the narrowest relevant Tauri or packaging build command for the target platform.

If infrastructure such as credentials, local providers, Docker, n8n, platform accounts, audit tooling, or OS-specific build dependencies is unavailable, record the exact blocker and still run checks that do not depend on it.

## 8. Assetization

Before handoff, convert the learning into at least one reusable asset:

- Test or focused regression check.
- Rule in `DEVELOPMENT.md` or a topic doc under `docs/project/`.
- User-facing doc update under `docs/start/`, `docs/guides/`, `docs/providers/`, or `docs/reference/`.
- Owner/invariant note in the module or contributor doc.
- Review checklist item.
- Small code abstraction that removes duplicated interpretation.

Research that only remains in chat is incomplete.

## 9. Anti-Patterns

- Waiting for the user to explicitly ask for references when the task is high-risk or mature elsewhere.
- Copying implementation shape without copying the promise or invariant.
- Importing external patterns that violate local Tauri, Rust engine, or plain DOM boundaries.
- Designing security, credential, provider, channel, or storage behavior from UI convenience.
- Adding hidden state instead of clarifying owner and transition rules.
- Scattering raw `invoke()` calls instead of using `pawEngine` and `ipc_client.ts`.
- Expanding Tauri permissions or CSP without a specific local need.
- Adding a public doc page without updating `docs.json`.
- Shipping UI information architecture without checking mature design references.
