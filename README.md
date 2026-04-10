# Toki

Credential security for AI agents. Zero-knowledge proxy that injects credentials at the network boundary — agents never see, store, or transmit raw secrets.

## Architecture

```
Agent (SDK/fetch) → Toki Proxy (:4080) → injects real creds → upstream API
                         ↑
                    token auth (tok_xxx)
                    host/path matching
                    AES-256-GCM decrypt
                    audit logging
```

Bun monorepo · Next.js · better-auth · Drizzle ORM · Neon Postgres · shadcn/ui v4

## Structure

```
packages/
  crypto/    AES-256-GCM encrypt/decrypt/keygen
  shared/    Types, host/path matching, constants
  db/        Drizzle schema + Neon client
  sdk/       @toki/sdk — wrapped fetch routing through proxy
apps/
  web/       Next.js admin dashboard
  proxy/     Bun HTTP credential proxy
  cli/       CLI (Commander.js)
  mcp/       MCP server (STDIO transport)
```

## Quick Start

```bash
bun install
cp .env.example .env   # fill in DATABASE_URL, SECRET_ENCRYPTION_KEY, BETTER_AUTH_SECRET
bun run db:push        # push schema to Neon

# start services
bun run --filter web dev          # dashboard on :3000
bun run --filter @toki/proxy dev  # proxy on :4080
```

## CLI

```bash
# Auth
bun run apps/cli/src/index.ts login --email x --password y
bun run apps/cli/src/index.ts whoami

# Agents
bun run apps/cli/src/index.ts agent list
bun run apps/cli/src/index.ts agent create my-agent --json
bun run apps/cli/src/index.ts agent delete <id>

# Secrets
bun run apps/cli/src/index.ts secret list
bun run apps/cli/src/index.ts secret create --name anthropic --type anthropic --value sk-ant-... --host api.anthropic.com
bun run apps/cli/src/index.ts secret create --name openai --type generic --value sk-... --host api.openai.com --header authorization --format "Bearer {value}"
bun run apps/cli/src/index.ts secret rotate <id> --value sk-ant-new...
bun run apps/cli/src/index.ts secret delete <id>

# Proxy + audit
bun run apps/cli/src/index.ts proxy start
bun run apps/cli/src/index.ts audit list --json

# Make a proxied request directly
bun run apps/cli/src/index.ts fetch https://api.anthropic.com/v1/models
```

## SDK

```ts
import { createTokiProxy } from "@toki/sdk";

// token from arg or TOKI_TOKEN env var; proxyUrl defaults to http://localhost:4080
const fetch = createTokiProxy({ token: "tok_xxx" });

// credentials injected transparently at the proxy
await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ ... }),
});
```

## MCP

Add to Claude config:
```json
{ "mcpServers": { "toki": { "command": "bun", "args": ["run", "apps/mcp/src/index.ts"] } } }
```

Tools: `toki_agent_list`, `toki_agent_create`, `toki_secret_list`, `toki_secret_create`, `toki_secret_delete`, `toki_audit_list`, `toki_proxy_status`, `toki_fetch`

---

## Implementation Status

### Implemented (MVP)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 01 | **Zero-Knowledge Credential Proxy** | ✅ MVP | SDK-mode forward proxy. URL rewriting, Proxy-Authorization auth, host/path matching, header injection, streaming response forwarding. No CONNECT/MITM yet. |
| 03 | **Agent Identity Registry** | ✅ MVP | CRUD agents w/ `tok_` access tokens. Active/inactive status. Scoped to user. |
| 05 | **Framework-Native SDKs** | ✅ MVP | TypeScript SDK only (`createTokiProxy` wrapped fetch, `TokiClient` URL rewriter). No Python/Go/framework plugins yet. |
| 06 | **MCP Credential Gateway** | ✅ MVP | MCP server exposing 8 tools over STDIO. Manages agents, secrets, audit, proxy status, and proxied fetch. No STDIO interception or HTTP transport proxy yet. |
| 11 | **Full Audit Trail** | ✅ MVP | Logs credential injections (agent, service, path, timestamp). No reasoning chain capture, tamper-proofing, or compliance exports yet. |
| 13 | **Secret Rotation Engine** | ✅ Partial | Manual rotation via CLI (`secret rotate`) and API (`PATCH /api/secrets/:id`). No automated rotation, dual-credential strategy, or provider-specific rotators. |
| 18 | **CLI & Local Dev Experience** | ✅ MVP | `toki` CLI: login/whoami, agent/secret CRUD, secret rotate, proxy start/status, audit list, config, fetch. JSON output mode. No pre-commit secret scanning, debug mode, or env profiles. |
| 19 | **Admin Console** | ✅ MVP | Next.js dashboard: auth (email+password), agent management, secret management, audit log viewer. No RBAC, team management, SSO, or multi-tenant. |

### Partially Implemented

| Aspect | What exists | What's missing |
|--------|------------|----------------|
| Encryption | AES-256-GCM at rest | No envelope encryption, no HSM/KMS integration, no CMEK |
| Proxy | Forward proxy (URL rewrite) | CONNECT tunnel, MITM TLS, mTLS, request signing, mlock memory isolation |
| Secret types | `anthropic` + `generic` (configurable header + format string) | No per-provider handlers beyond anthropic |
| Caching | In-memory TTL cache (60s) | No distributed cache, no invalidation on secret update |
| Auth | Email+password via better-auth | No API key auth for programmatic access |

### Not Implemented

| # | Feature | Category | Complexity |
|---|---------|----------|------------|
| 02 | Task-Scoped Ephemeral Credentials | Core | High — lease model, heartbeats, framework lifecycle hooks, cascading revocation |
| 04 | Delegation Chain Management | Identity | High — transaction tokens (JWT), scope attenuation per hop, chain depth limits, session smuggling prevention |
| 07 | OAuth 2.1 Token Broker | Auth | High — DPoP, RAR, CIBA, multi-provider token lifecycle, automatic refresh, cross-app token exchange |
| 08 | Human-in-the-Loop Approval | Access Control | Medium — risk-based triggers, Slack/email approval channels, async agent execution, time-bounded approvals |
| 09 | Policy Engine | Access Control | High — Cedar-like policy language, ABAC, compiled evaluation engine, policy-as-code w/ Git sync, dry-run mode |
| 10 | Dynamic Scope Reduction | Access Control | High — behavioral baselines, anomaly detection, graduated response, canary credentials |
| 12 | Real-Time Monitoring Dashboard | Observability | Medium — WebSocket live feed, topology map, alert config, OpenTelemetry export, SLO tracking |
| 14 | Multi-Vault Backend Support | Credential Lifecycle | Medium — adapters for Vault/AWS SM/GCP SM/Azure KV/1Password, dynamic secrets, credential sync |
| 15 | Sandbox Integration Layer | Runtime Security | High — Wasm sandbox, container isolation, process isolation, network policy enforcement |
| 16 | Prompt Injection Defense | Runtime Security | Medium — output credential scanning, tool definition integrity verification, request validation, exfiltration prevention |
| 17 | Multi-Agent Orchestration | Orchestration | High — shared task contexts, agent-to-agent credential passing, supervisor patterns, competitive isolation |
| 20 | Compliance & Export Controls | Platform | Medium — SOC 2/GDPR/HIPAA/PCI-DSS control mapping, data residency, retention policies, post-quantum readiness |

### Infrastructure Gaps

- [ ] CI/CD pipeline
- [ ] Docker / container deployment
- [ ] Rate limiting on API + proxy
- [ ] Structured logging (not just console.log)
- [ ] Error handling middleware (web app)
- [ ] Input validation / zod schemas on API routes
- [ ] E2E tests
- [ ] Landing page / docs site
