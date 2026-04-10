# Landing Page Copy

## HERO

**Eyebrow:** `// open source · auth for the agentic era`

**Headline:**
> your agents are powerful.
> your secrets shouldn't be vulnerable.

**Subhead:**
> one command to secure every AI agent in your stack. credentials injected in-memory, scoped per task, revoked on completion. no .env files. no leaked keys. no trust required.

**Terminal block:**
```
$ toki run --agent cursor
# ✓ environment virtualized
# ✓ 4 credentials injected (in-memory only)
# ✓ policy enforced: github.contents:write, anthropic:messages
# ✓ session logging active

# agent writes code, pushes to github, calls APIs
# it never sees a single secret

$ ^C
# ✓ session ended. credentials gone. audit saved.
```

---

## FEATURES

**Section eyebrow:** `// features`

**Section headline:** `agents get power. you keep control.`

### Tab 1: `toki run`
**Title:** one command. every agent secured.
**Description:** run `$ toki run --agent cursor` and you're done. virtualizes the environment, injects scoped credentials straight into memory — never touches disk — enforces policy, logs everything. session ends, credentials vanish. your 3-person team ships with agents safely on day 1.
**Details:**
- works with Cursor, Claude Code, Windsurf
- in-memory only — no disk, no .env
- instant policy enforcement
- full session audit trail

### Tab 2: `SDKs & MCP`
**Title:** 5-minute integration. any framework.
**Description:** drop in `TokiAuth()` and go. handles binding, caching, refresh, token exchange, and MCP handshake automatically. one toki token becomes scoped access to GitHub + Linear + Gmail without proxying data. no rewriting auth when protocols change.
**Details:**
- TypeScript / Python / Go SDKs
- native MCP support
- works with any LLM provider
- token exchange for multi-service access

### Tab 3: `scoped creds`
**Title:** every token is born to die.
**Description:** every tool call gets a fresh JWT minted on-demand. scoped exactly to the task — "github.contents:write only for this bug fix" — bound to composite identity, expires on completion. never enters the LLM context window. if an agent goes rogue, blast radius is zero.
**Details:**
- task-scoped JWTs / OAuth tokens
- 15–30 min TTL, auto-expire
- instant revocation
- transaction-based pricing, not headcount

### Tab 4: `policy engine`
**Title:** autonomous but not dangerous.
**Description:** policy evaluates at credential issuance — before the agent even sees a token. visual + code rules with resource tags. observe-only mode tests new policies on live traffic without blocking. instant rollback. a 12-person team gets enterprise-grade least-privilege without a security hire.
**Details:**
- RBAC / ABAC / ReBAC
- observe-only mode for safe testing
- immutable policy versioning
- department-scoped access

### Tab 5: `the loop`
**Title:** human when it matters. autonomous when it doesn't.
**Description:** high-risk actions route to Slack or dashboard for approval. the system learns from your decisions — week 1: 70% auto-approved, week 12: 94%+. full autonomy sounds great until your agent drops a prod table. this is the safety net that gets out of your way.
**Details:**
- Slack / dashboard approvals
- adaptive learning from decisions
- zero consent fatigue over time
- founders sleep, agents run

### Tab 6: `audit & telemetry`
**Title:** "what did the agent do last night?"
**Description:** every credential issuance, tool call, policy decision, and session — logged with full attribution. who + agent + task + why. real-time dashboard. streams to Datadog/Splunk. answer "who accessed prod?" in one click. investors and customers will ask. you'll have the answer.
**Details:**
- tamper-resistant logs
- real-time governance dashboard
- Datadog / Splunk streaming
- 7-day retention free

### Tab 7: `identity`
**Title:** agents aren't humans. stop treating them like one.
**Description:** composite identity resolution combines user (Okta/SSO), device, agent workload (SPIFFE/mTLS), and task context into one resolved identity before any credential is issued. "agent claude-code on Sarah's MacBook committed to main at 2am" — automatically, without custom code.
**Details:**
- user + device + agent + task
- SPIFFE / mTLS / cloud ID
- perfect attribution out of the box
- workload attestation

### Tab 8: `integrations`
**Title:** set it and forget it.
**Description:** automatic key rotation — transparent, zero downtime. one-click catalog for GitHub, Slack, Gmail, Linear, Datadog, Postgres, S3, and more. agents discover available tools based on their identity instead of hardcoded lists. saves hours every week you didn't know you were losing.
**Details:**
- automatic key rotation
- 100+ one-click integrations
- identity-based tool discovery
- always-current resource catalog

---

## HOW IT WORKS

**Section eyebrow:** `// how it works`

**Section headline:** `one command. zero secrets exposed.`

**Step 01 — run**
> `$ toki run --agent cursor`. environment virtualized, credentials loaded in-memory, policy attached. agent launches with everything it needs and nothing it shouldn't have.

**Step 02 — agent works**
> agent writes code, calls APIs, pushes to repos. every outbound request is intercepted. real credentials injected at the network boundary. the agent never sees them.

**Step 03 — policy enforces**
> each action checked against scoped policy in real-time. high-risk ops route to Slack for approval. low-risk ops fly through. the system learns your threshold.

**Step 04 — session ends**
> `^C` or task completes. credentials wiped from memory. full audit trail saved — who, what, when, why. nothing lingers.

**Architecture block:**
```
toki run --agent cursor
  │
  ├── virtualizes env, loads policy
  ├── injects scoped creds (memory only)
  │
  ▼
agent (Cursor / Claude Code / any)
  │ fetch("https://api.github.com/repos/...")
  │ fetch("https://api.anthropic.com/v1/messages")
  ▼
toki proxy
  → identity resolve (user + device + agent + task)
  → policy check (RBAC/ABAC/ReBAC)
  → credential mint (scoped JWT, 15min TTL)
  → inject real header → forward upstream
  → log everything
  ▼
upstream API (with real credentials)

session end → creds wiped → audit saved
```

---

## GET STARTED

**Section eyebrow:** `// get started`

**Section headline:** `secure your first agent in 2 minutes.`

**Install block:**
```
# install
$ curl -sSL https://toki.dev/install | sh

# login & store your first secret
$ toki login
$ toki secret add github-token \
    --host api.github.com \
    --header "Authorization: Bearer"

# run any agent, securely
$ toki run --agent cursor
$ toki run --agent "claude code"
$ toki run -- python my_agent.py
```

**Three columns:**

**[SDK]**
```
import { TokiAuth } from "@toki/sdk"

const auth = TokiAuth({
  issuer: process.env.TOKI_ISSUER
})

// that's it. tokens, refresh,
// MCP handshake — all handled.
```

**[CLI]**
```
$ toki run --agent cursor
$ toki run -- npm start
$ toki secret list
$ toki policy set \
    --scope github:write \
    --require-approval
$ toki audit last-session
```

**[MCP]**
```
toki_run
toki_secret_add
toki_policy_set
toki_audit_query
toki_session_list
toki_identity_resolve
```

---

## FOOTER TAGLINE

> stop trusting agents with your keys. start trusting your system.
