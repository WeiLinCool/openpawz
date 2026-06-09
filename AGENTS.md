# OpenPawz Agent Navigation

This file is the minimal entry point for agents working in this repository. Keep detailed explanations in `docs/` and link to them from here instead of duplicating content.

## Project Map

- `src/`: TypeScript frontend and UI state.
- `src-tauri/`: Tauri backend, Rust engine, CLI, and core crates.
- `docs/`: Project documentation, guides, and reference material.
- `scripts/`: Repository automation and data generation scripts.
- `packaging/`: Distribution manifests for Flatpak, Homebrew, and Snap.

## Documentation Layout

- English docs live under `docs/<section>/`.
- Chinese docs live under `docs/<section>/zh/`.
- Former `/start` content is now under `docs/start/`.
- Former `/providers` content is now under `docs/providers/`.
- Former `/guides` content is now under `docs/guides/`.
- Former `/channels` content is now under `docs/guides/channels/`.
- Former `/reference` content is now under `docs/reference/`.
- Former root `.AGENT_EXECUTION_ROADMAP.md` content is now `docs/reference/agent-execution-roadmap-internal.md`.
- The public execution architecture reference is `docs/reference/agent-execution-roadmap.mdx`.
- Project-level contributor notes are under `docs/project/`.
- Community and governance docs are under `docs/community/`.
- Research and whitepaper-style docs are under `docs/research/`.
- Root-level Markdown is intentionally limited to `README.md` and this file.

## High-Signal Reading Paths

- Product onboarding: `docs/start/` and `docs/start/zh/`.
- Product and feature guides: `docs/guides/` and `docs/guides/zh/`.
- Channel bridge guides: `docs/guides/channels/` and `docs/guides/channels/zh/`.
- Provider setup guides: `docs/providers/`.
- Architecture, quality, security, and protocols: `docs/reference/` and `docs/reference/zh/`.
- Full architecture and security docs: `docs/reference/architecture-full.md`, `docs/reference/security-full.md`, and their `zh/` counterparts.
- Engine/module contributor notes: `docs/project/engine-module-guide.md` and `docs/project/zh/engine-module-guide.md`.
- Frontend conventions: `docs/project/frontend-patterns.md` and `docs/project/zh/frontend-patterns.md`.
- OAuth and integration notes: `docs/project/oauth-app-registration.md`, `docs/project/hybrid-oauth-architecture.md`, and their `zh/` counterparts.
- Community docs: `docs/community/contributing.md`, `docs/community/code-of-conduct.md`, and their `zh/` counterparts.
- Research docs: `docs/research/engram.md`, `docs/research/the-forge.md`, `docs/research/paw-architecture.md`, and their `zh/` counterparts when available.

## Working Rules

- Do not expose long internal documentation in this file.
- When adding documentation, place English content in `docs/<section>/` and Chinese content in `docs/<section>/zh/`.
- When moving docs, update `docs.json` if the page is part of the public docs navigation.
- Preserve existing user changes in the worktree; do not revert unrelated files.
