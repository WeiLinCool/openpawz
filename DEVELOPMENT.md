# DEVELOPMENT - OpenPawz Repository Guide

This is the first development guide to read after `AGENTS.md`. It reflects the current repository shape: a Tauri v2 desktop app with a plain TypeScript frontend, a Rust engine backend, and Mintlify documentation configured by `docs.json`.

`AGENTS.md` stays concise. Put durable contributor guidance here or in focused docs under `docs/project/`, and keep public product documentation aligned with `docs.json`.

## 1. Current Baseline

OpenPawz is a native desktop AI agent OS.

Core stack:

- Frontend: Vite, TypeScript, direct DOM APIs, no React/Vue app layer.
- Desktop shell: Tauri v2.
- Backend: Rust engine in `src-tauri/`, plus Rust workspace crates under `src-tauri/crates/`.
- IPC: typed frontend wrappers in `src/engine/molecules/ipc_client.ts` calling Tauri commands.
- Docs: Mintlify documentation under `docs/`, with public navigation declared in `docs.json`.
- Distribution: Tauri bundles plus packaging manifests under `packaging/`.

Do not use older Next.js, Drizzle, or server-route assumptions in this repository. Those are not part of the current source layout.

## 2. Source Layout

Use CodeGraph first for current source discovery, then `rg` for exact text and file search.

Top-level buckets:

- `src/`: TypeScript frontend, UI state, view routing, DOM components, and frontend engine client.
- `src/components/`: shared UI pieces and generic DOM helpers.
- `src/engine/`: frontend-side engine client, chat controller, and reusable atoms/molecules/organisms.
- `src/features/`: reusable feature modules, usually following the same atoms/molecules split as views.
- `src/state/`: shared frontend application state.
- `src/views/`: screen-level modules and settings tabs.
- `src-tauri/`: Tauri app, Rust commands, engine modules, tests, capabilities, and desktop config.
- `src-tauri/src/commands/`: Tauri command boundary modules.
- `src-tauri/src/engine/`: core Rust runtime, providers, tools, sessions, memory, channels, orchestration, sandboxing, and integrations.
- `src-tauri/crates/openpawz-core/`: reusable Rust engine/core crate code.
- `src-tauri/crates/openpawz-cli/`: CLI surface for engine access.
- `src-tauri/crates/openpawz-bench/`: benchmark crate.
- `docs/`: product docs, reference docs, community docs, research docs, and project contributor docs.
- `scripts/`: brand selection, enterprise build, credential data generation, and hook setup automation.
- `packaging/`: Flatpak, Homebrew, and Snap manifests.

## 3. Commands

Run frontend commands from the repository root.

- Install dependencies: `pnpm install`
- Frontend dev server only: `pnpm dev`
- Tauri desktop dev app: `pnpm dev:tauri`
- Enterprise Tauri dev app: `pnpm dev:tauri:enterprise`
- Clean local app state and start desktop dev: `pnpm dev:tauri:clean`
- Build frontend assets: `pnpm build`
- Build desktop bundle: `pnpm tauri:build`
- Platform bundles: `pnpm tauri:build:macos`, `pnpm tauri:build:linux`, `pnpm tauri:build:windows`
- Enterprise bundle: `pnpm tauri:build:enterprise`
- Type-check frontend: `pnpm typecheck`
- Lint frontend: `pnpm lint`
- Fix frontend lint: `pnpm lint:fix`
- Run frontend tests: `pnpm test`
- Check TypeScript formatting: `pnpm format:check`
- Full frontend check script: `pnpm check`
- Prepare hooks: `pnpm prepare`

Run Rust commands from `src-tauri/`.

- Format check: `cargo fmt -- --check`
- Build/check Rust: `cargo check`
- Run Rust tests: `cargo test`
- Clippy with CI policy: `cargo clippy -- -D warnings`
- Security audit when available: `cargo audit`

The CI workflow uses pnpm 10, Node 20, stable Rust, `cargo fmt`, `cargo check`, `cargo test`, `cargo clippy -- -D warnings`, `vitest`, `eslint`, `prettier`, `cargo audit`, and `pnpm audit --audit-level=high`.

## 4. Task Triage

Classify work as Small or Large before implementation.

Small:

- Localized, low-risk changes.
- One view, helper, command, test, or doc page with clear ownership.
- No durable state, security, permission, channel, provider, or cross-boundary behavior change.

Large:

- New features or meaningful behavior changes.
- Changes to Tauri capabilities, CSP, credential handling, sandboxing, prompt-injection defenses, approval flows, provider routing, tool execution, channels, MCP/n8n integration, agent orchestration, or persisted engine state.
- Changes crossing frontend view/client, IPC, Tauri commands, Rust engine modules, and storage.
- Public documentation navigation changes that move or rename docs pages in `docs.json`.

For Large work, write down the owner, call path, state changes, invariants, and verification plan before editing.

When the change touches a mature external problem space such as Tauri security, provider APIs, channel bridges, MCP/n8n, sandboxing, packaging, or user-facing information architecture, use `REFERENCE_RESEARCH_METHOD.md` before finalizing the design.

## 5. Frontend Development

The frontend is plain TypeScript plus DOM APIs. Read `docs/project/frontend-patterns.md` before changing screen structure.

Common structure:

- `atoms.ts`: pure types, constants, config, and transformation helpers.
- `molecules.ts`: DOM rendering, listeners, and IPC-heavy behavior.
- `index.ts`: public entry point and orchestration.

Routing starts in `src/views/router.ts`.

If a new view must appear in the app:

1. Add the view files under `src/views/<name>/`.
2. Add the DOM container in the app shell.
3. Update `allViewIds` and `viewMap` in `src/views/router.ts`.
4. Add a loader case in `switchView()`.
5. Use existing shared helpers in `src/components/` before creating new helpers.

Frontend code should call the backend through `pawEngine` and `src/engine/molecules/ipc_client.ts`. Do not scatter raw Tauri `invoke()` calls across views or components.

When rendering user-controlled text, use the existing escaping helpers such as `escHtml()` and `escAttr()`.

## 6. Backend And IPC Development

The backend entry point is `src-tauri/src/lib.rs`. The engine module map is `src-tauri/src/engine/mod.rs`. Read `docs/project/engine-module-guide.md` before adding or moving engine behavior.

Typical IPC path:

1. Frontend view/component calls `pawEngine.*`.
2. `src/engine/molecules/ipc_client.ts` invokes a Tauri command.
3. A command in `src-tauri/src/commands/` validates and adapts the request.
4. The command delegates to the owning module in `src-tauri/src/engine/`.
5. Results return by command response or `engine-event` Tauri events.

When adding a Tauri command:

1. Put durable logic in the owning engine module.
2. Add or extend the command boundary under `src-tauri/src/commands/`.
3. Register the handler in `src-tauri/src/lib.rs`.
4. Add a typed frontend method in `src/engine/molecules/ipc_client.ts`.
5. Add tests near the changed Rust module or under `src-tauri/tests/` when behavior is non-trivial.

Keep Tauri permissions least-privilege. Capability changes belong in `src-tauri/capabilities/default.json`; CSP and bundle behavior live in `src-tauri/tauri.conf.json`. Treat both as security-sensitive.

## 7. Channels, Providers, And Integrations

Channel bridge work should follow `docs/project/channel-bridge-guide.md`.

Standard channel flow:

1. Receive a platform message.
2. Check access control.
3. Route to the configured agent.
4. Run the agent loop.
5. Split the reply if the platform requires it.
6. Send the response.

Prefer the shared helpers in `src-tauri/src/engine/channels/mod.rs` and the command macro pattern in `src-tauri/src/commands/channels.rs`. Telegram is a known exception because of its numeric user ID and custom status shape.

Provider docs live under `docs/providers/`, while provider/runtime code is under Rust engine provider modules and provider registry files. Keep public setup docs separate from engine implementation details.

n8n, MCP, browser, container sandbox, integration guardrails, integration health, and related workflows are documented under `docs/guides/`. If behavior changes, update the matching guide when the user-facing workflow changes.

## 8. Documentation And `docs.json`

`docs.json` is the public Mintlify navigation source of truth. If a public page is added, moved, renamed, or removed, update `docs.json` in the same change.

Current public navigation tabs:

- `Get Started`: `docs/start/`
- `Guides`: core guides, integrations, workflows, tools, and platform pages under `docs/guides/`
- `Channels`: channel bridge docs under `docs/guides/channels/`
- `Providers`: AI provider setup docs under `docs/providers/`
- `Reference`: architecture, security, quality, troubleshooting, and original research under `docs/reference/`

Documentation placement rules:

- Product onboarding: `docs/start/`
- Feature and workflow guides: `docs/guides/`
- Channel docs: `docs/guides/channels/`
- Provider setup: `docs/providers/`
- Public architecture/security/quality/protocol references: `docs/reference/`
- Internal or contributor-oriented docs: `docs/project/`
- Community and governance docs: `docs/community/`
- Research and whitepaper-style docs: `docs/research/`
- Chinese translations: use the corresponding `zh/` directory under the same section.

The current `docs.json` navigation lists English public docs. Chinese docs exist under `zh/` directories but are not listed as separate navigation pages unless `docs.json` is updated to expose them.

When moving docs from old root-level buckets, preserve the current routing:

- Former `/start` content belongs under `docs/start/`.
- Former `/providers` content belongs under `docs/providers/`.
- Former `/guides` content belongs under `docs/guides/`.
- Former `/channels` content belongs under `docs/guides/channels/`.
- Former `/reference` content belongs under `docs/reference/`.
- The public execution architecture reference is `docs/reference/agent-execution-roadmap.mdx`.
- The internal execution roadmap is `docs/reference/agent-execution-roadmap-internal.md`.

Root-level Markdown should stay minimal. Prefer `docs/project/` for new contributor docs unless a root file is explicitly requested.

## 9. State And Storage Ownership

Before changing persisted, restored, synced, or cross-layer state, define:

- State name.
- Owner module.
- Write entry point.
- Allowed transitions.
- Restart/source-of-truth behavior.
- UI-derived state versus durable state.

Frontend view state may be module-local. Shared frontend state belongs in `src/state/`. Durable engine state belongs in the Rust engine storage/session modules or another clearly owned backend module.

Multiple writers for one durable truth are a design risk. Resolve ownership before coding.

## 10. Security And Safety Boundaries

Treat these as high-risk changes:

- Credential storage or keychain behavior.
- Tauri capabilities, filesystem scope, shell access, updater permissions, or CSP.
- Prompt-injection scanning and command risk classification.
- Human approval flows and side-effect tool execution.
- Container sandboxing and browser network policies.
- Channel access-control modes and user approval/deny flows.
- Provider proxy configuration and outbound HTTP behavior.

Security-sensitive behavior should fail closed, preserve auditability where applicable, and include focused tests or explicit manual verification.

## 11. Reference Research

Use `REFERENCE_RESEARCH_METHOD.md` when the task would benefit from mature external practice or primary-source verification.

Default triggers:

- Tauri permissions, CSP, updater, filesystem, shell/process, or desktop security behavior.
- Credential storage, local encryption, secret redaction, prompt injection, or approval flows.
- Provider APIs, model routing, streaming, constrained decoding, pricing, or fallback behavior.
- Channel bridges and platform-specific bot/message/access-control rules.
- MCP, n8n, browser automation, container sandboxing, integration health, or guardrails.
- Durable engine state, sessions, memory, cleanup, sync, import/export, idempotency, or recovery.
- Public docs navigation or information architecture changes that affect `docs.json`.

Research output should be translated into local design using:

`External consensus -> Transferable principle -> OpenPawz constraints -> Local design`

The learning should become a reusable asset before handoff: a test, a rule in this guide, a focused `docs/project/` note, a public docs update, or a small code abstraction.

## 12. Verification Strategy

Use the lowest meaningful layer first.

- TypeScript-only logic: `pnpm typecheck`, `pnpm lint`, `pnpm test`, or targeted `vitest`.
- Frontend formatting: `pnpm format:check`.
- Full frontend validation: `pnpm check`.
- Rust-only logic: `cargo fmt -- --check`, `cargo check`, `cargo test`, `cargo clippy -- -D warnings` from `src-tauri/`.
- Desktop wiring: `pnpm dev:tauri` for local manual verification.
- Bundle/runtime compatibility: `pnpm tauri:build` or a platform-specific build script.
- Security/dependency changes: `cargo audit` and `pnpm audit --audit-level=high` when tools and network are available.
- UI behavior: run the app and verify the changed workflow in a browser/app window. Use screenshots for layout-sensitive changes.

If a command cannot run because of missing system dependencies, credentials, local services, audit tooling, or platform-specific bundle requirements, record the exact blocker in the handoff.

## 13. Debugging

When a command, build, test, or workflow fails:

1. Reproduce with the narrowest command.
2. Identify the failing layer: TypeScript, lint, frontend test, Tauri IPC, Rust command, engine module, storage, provider, channel, or packaging.
3. Inspect the owner module before patching callers.
4. Add or update a focused test when fixing a real bug.

For frontend action bugs, trace:

`view/component -> pawEngine method -> ipc_client.ts -> Tauri command -> engine module -> storage/provider/tool/channel`.

For channel bugs, trace:

`channel engine module -> commands/channels.rs -> lib.rs registration -> ipc_client.ts -> channels view atoms/molecules`.

## 14. Handoff

Final handoff should include:

- Files changed.
- Verification commands run and results.
- Commands not run and why.
- Any residual risk or follow-up that matters.
