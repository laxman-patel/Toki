# AI-Native Secrets Manager (Developer-First) - Master Plan

## 0) Project Name

Toki

## 1) Project Summary

Build a developer-first "1Password for AI agents": a secure access layer that prevents hardcoded credentials, issues short-lived task-scoped access, and provides complete auditability for agent tool calls.

Core strategy:
- Start with small teams and individual developers for speed, iteration, and product polish.
- Keep architecture enterprise-ready from day one (identity model, policy engine, audit schema).
- Support both:
  - BYO secrets backend (Vault, AWS Secrets Manager, 1Password, Infisical, etc.)
  - Managed default backend (our own agent-native backend)

## 2) Why This Product

The market already proves "X for AI agents" wins when X is a core primitive (browser infra, runtime sandbox, auth/integration layer, web data layer).

Agentic systems are creating a new security gap:
- secrets in env files and MCP configs
- static API keys with broad permissions
- no per-action governance
- weak traceability for autonomous tool calls

Existing secrets products are strong foundations, but many teams still lack an agent-native control plane for runtime delegation, policy enforcement, and action-level observability.

## 3) Product Vision

### Vision statement
The safest and easiest way for AI agents to access tools, APIs, and data without exposing static credentials.

### Product promise
- No hardcoded credentials in agents
- Short-lived, scoped access for every task
- Explainable and auditable agent actions

### Positioning (initial)
"Secure tool access for AI agents" (clear and concrete for developers).

## 4) Product Principles

1. Developer-first UX: install and first secure call in < 10 minutes.
2. Secure by default: least privilege, TTLs, revocation, no plaintext secrets.
3. Runtime-native: policies are enforced at invocation time, not just at storage.
4. Portable by design: cloud-agnostic APIs, adapters for existing secret systems.
5. Enterprise-ready internals: auditable identity chains and policy decisions.

## 5) Core Product Scope

## 5.1 MVP (must ship)

1. Agent Gateway
- One endpoint between agent runtimes and tools/MCP servers.
- Enforce policy before tool/API invocation.

2. Credential Broker
- Mint short-lived credentials/tokens per task/session.
- Lease issuance, renewal, revocation, expiration.

3. Policy Engine (v1)
- Allow/deny by:
  - agent identity
  - tool/action
  - resource scope
  - environment (dev/stage/prod)
- Static policy language in v1 with deterministic evaluation.

4. Audit Timeline
- Immutable event log for each credential issuance and tool call.
- Actor chain: user -> workflow -> agent -> tool action.

5. Managed Backend (default)
- Our own agent-native backend (not just a thin AWS Secrets Manager wrapper).
- Designed around short-lived leases, delegation, and runtime controls.

6. BYO backend adapters (initial set)
- AWS Secrets Manager
- HashiCorp Vault
- 1Password Secrets Automation
- Infisical

7. Developer Interfaces
- CLI
- Node SDK
- Python SDK
- Quickstart docs with local dev flow

8. High-risk action approvals (basic)
- Optional manual approval gate for flagged actions.

## 5.2 V1.1 / near-term enhancements

- Policy conditions on input patterns (arg-level controls)
- Team/project multi-tenancy hardening
- Better dashboards and investigation filters
- Additional adapters (GCP Secret Manager, Azure Key Vault, Doppler)

## 5.3 Out of scope for MVP

- Full enterprise SSO/SCIM suite
- Private/VPC-only deployment
- Dedicated compliance packs (SOC2/HIPAA workflow automation)
- Cross-region HA and DR guarantees beyond initial SLA targets

## 6) Architecture Direction

## 6.1 Recommended architecture

1. Control Plane (our product)
- identity graph (users, agents, workflows, tools)
- policy management + evaluation
- lease/session management
- approval workflows
- audit/event ingestion and query

2. Data Plane
- Agent Gateway for invocation-time checks
- Credential Broker for JIT secret/token issuance

3. Storage and crypto
- Secrets encrypted at rest via envelope encryption
- KMS-backed key hierarchy
- Hot lease/session state in low-latency store

4. Backend modes
- managed mode: our native agent backend
- BYO mode: adapter abstraction over external secret stores

## 6.2 AWS decision

Use AWS for initial infrastructure velocity, but keep product APIs and data model cloud-agnostic.

Use AWS primitives as implementation details:
- KMS for key management
- managed DB for metadata and audit records
- Redis-compatible store for leases/sessions

Do not tie product identity/policy semantics to AWS-only concepts.

## 7) Data Model (initial)

Core entities:
- Workspace
- Project
- Environment
- User
- Agent
- Workflow
- Secret
- SecretVersion
- SecretBackend
- Policy
- Lease
- Delegation
- ToolIntegration
- Invocation
- ApprovalRequest
- AuditEvent

## 7.1 Key relationships

- Agent belongs to Project and Environment.
- Workflow may spawn one or many Agent runs.
- Policy binds subject(s) to allowed tool/action/resource constraints.
- Lease references source secret backend + policy decision + TTL.
- Invocation references agent, lease/delegation, tool action, result.

## 8) Security Model

1. Identity
- Every agent has a unique identity.
- Support user-attributed and service-attributed execution.

2. Authorization
- Default deny.
- Least privilege per tool/action/scope.
- Time-boxed delegated access.

3. Secrets handling
- Never return long-lived secrets if avoidable.
- Prefer ephemeral credentials or short-lived derived tokens.

4. Auditability
- Log policy decision input/output.
- Log issued leases and downstream invocations.
- Tamper-evident event storage strategy.

5. Runtime safety
- Optional approval step for risky actions.
- Budget and rate limits per agent/project.

## 9) Developer Experience Plan

## 9.1 CLI (initial commands)

- `ansm init`
- `ansm login`
- `ansm project create`
- `ansm backend add`
- `ansm secret set`
- `ansm policy apply`
- `ansm run simulate`
- `ansm logs tail`

## 9.2 SDK usage goals

- Single-call runtime secret retrieval with automatic TTL handling.
- Simple policy-aware tool invocation wrapper.
- Friendly errors with actionable remediation.

## 9.3 Onboarding success criteria

- first secure agent call < 10 minutes
- first policy + audit trail < 20 minutes

## 10) ICP and GTM

## 10.1 Initial ICP (developer-first)

- AI-native startups
- small engineering teams building internal/external agents
- early platform teams running MCP tools in production

## 10.2 Initial wedge

Secure coding-agent and MCP workflows:
- GitHub tools
- cloud APIs
- CI/CD actions

## 10.3 Distribution

- open-source gateway or local dev edition for adoption
- hosted control plane upsell for teams
- technical content focused on "stop secrets in MCP/env"

## 11) Pricing Hypothesis

1. Free
- solo developer
- limited secure invocations/month

2. Pro
- per-developer seat
- higher invocation and policy limits

3. Team
- base platform fee + usage overage

4. Enterprise (later)
- SSO/SCIM/SIEM
- private networking/deployment
- advanced governance and support

## 12) Metrics and PMF Signals

North star:
- secure invocations per active workspace

Adoption:
- time to first secure invocation
- weekly active workspaces
- SDK integration completion rate

Security value:
- reduction in static token usage
- number of blocked risky invocations
- secret TTL median and long-lived secret reduction

Retention:
- 4-week and 8-week workspace retention
- expansion from free -> pro/team

## 13) Delivery Roadmap

## Phase 0 - Foundation (Weeks 1-2)
- repository setup and service boundaries
- core schema for identity/policy/audit/lease
- local dev infra and test harness
- threat model draft

## Phase 1 - Core runtime (Weeks 3-6)
- Agent Gateway and Credential Broker
- managed backend v0
- policy engine v1 (allow/deny + scope + environment)
- audit event pipeline and timeline API

## Phase 2 - Developer productization (Weeks 7-9)
- CLI, Node SDK, Python SDK
- quickstarts and starter templates
- sample MCP integration
- basic approval workflow

## Phase 3 - BYO adapters + beta (Weeks 10-12)
- AWS SM adapter
- Vault adapter
- 1Password adapter
- Infisical adapter
- private beta with 5-10 design partners

## Phase 4 - Hardening and growth (post-beta)
- reliability, alerting, SLOs
- policy enhancements (arg-level conditions)
- richer observability and investigations
- pricing and self-serve billing

## 14) Engineering Work Breakdown (detailed)

## 14.1 Backend services

- Identity service
- Policy service + evaluator
- Lease service
- Secret backend abstraction + managed backend
- Invocation proxy/gateway
- Audit event service + query API
- Approval service

## 14.2 Connectors/adapters

- AWS SM
- Vault
- 1Password
- Infisical
- adapter contract tests

## 14.3 SDK/CLI

- auth/session management
- secure secret retrieval primitives
- policy-aware invoke helpers
- retries, backoff, and error taxonomy

## 14.4 UI/control plane

- project/environment setup
- policy editor
- audit timeline and filters
- backend connection management

## 14.5 Platform/SRE

- observability baseline (logs/metrics/traces)
- deployment pipelines
- secret/key rotation procedures
- incident response runbooks

## 14.6 Security engineering

- threat model and abuse cases
- cryptography review
- pen test prep checklist
- secure defaults review per release

## 15) Definition of Done (MVP)

MVP is done when all are true:
- a developer can secure an agent workflow end-to-end in < 20 minutes
- no static secret required in runtime config for core path
- policies are enforced at runtime with deterministic decisions
- all credential issuance + tool invocations are auditable
- managed backend and at least 2 BYO adapters are production-usable
- SDK + CLI + docs support self-serve onboarding

## 16) Enterprise-Readiness Track (built in parallel)

Implement early, expose later:
- actor attribution chain and immutable audit schema
- multi-tenant RBAC scaffolding
- policy versioning + approval workflow support
- SIEM-friendly event export format
- control-plane separation for future private deployment

## 17) Risks and Mitigations

1. Commodity risk ("just a wrapper")
- Mitigation: lead with runtime enforcement, delegation, and audit graph.

2. Complexity risk for developers
- Mitigation: opinionated defaults, CLI scaffolding, one-command quickstart.

3. Security incident risk
- Mitigation: minimal blast radius via short TTLs, revocation, default deny, strong audit.

4. Adapter reliability risk
- Mitigation: strict adapter contracts, conformance tests, circuit breakers.

5. Enterprise trust gap
- Mitigation: build auditability and governance semantics from day one.

## 18) Open Questions to Resolve

1. First deployment topology: single-tenant or multi-tenant control plane from day one?
2. Which 2 adapters are mandatory for first public beta beyond managed backend?
3. Should approval workflows be synchronous block or async hold/replay in MVP?
4. What policy language format to standardize on (JSON DSL vs Rego subset)?
5. What free-tier usage cap best balances growth and abuse prevention?

## 19) Immediate Next Actions (Execution Checklist)

- [ ] Create architecture decision records (ADR) for control plane, managed backend, and policy engine.
- [ ] Finalize entity schema and API contracts for `Agent`, `Policy`, `Lease`, `Invocation`, `AuditEvent`.
- [ ] Implement service skeletons and local dev environment.
- [ ] Build Credential Broker and Lease lifecycle first (issue/renew/revoke/expire).
- [ ] Implement policy evaluator and gateway enforcement path.
- [ ] Ship initial audit pipeline with searchable timeline.
- [ ] Build CLI alpha with init/login/policy/logs commands.
- [ ] Release Node and Python SDK alpha.
- [ ] Add managed backend v0 with envelope encryption and key rotation plan.
- [ ] Implement first BYO adapter (recommended: Vault), then AWS SM.
- [ ] Run closed beta with 5-10 developer teams.
- [ ] Collect onboarding metrics and tighten time-to-first-secure-call.

## 20) Build Order Recommendation

Recommended sequence:
1. Policy + Lease + Gateway core loop
2. Managed backend v0
3. CLI + SDK quickstart
4. Audit timeline
5. BYO adapters
6. Approvals and advanced policy conditions

This order maximizes time-to-value for developers while preserving the path to enterprise controls.
