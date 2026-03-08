# Toki Repo Instructions

## Infisical-First Planning Rule

The `infisical/` directory is kept in this repo as a reference implementation for product patterns, architecture, service boundaries, schemas, APIs, workflows, and UI flows.

When planning any Toki feature, architecture, or subsystem, first inspect how Infisical implements the closest equivalent before proposing a Toki design.

Required workflow for planning:
1. Find the closest relevant Infisical implementation.
2. Identify the relevant backend, frontend, schema, API, service, or workflow files.
3. Summarize how Infisical does it today, with concrete file paths/components/services.
4. Explain whether Toki should reuse, adapt, simplify, or replace that pattern.
5. Explain what parts are reusable for Toki.
6. Explain what must change for Toki's AI-agent-native use case.
7. State the proposed Toki design only after that comparison.

Planning responses should usually include:
- Infisical reference
- What it does today
- Why it does or doesn't fit Toki
- Toki adaptation
- Open gaps or risks

Scope:
- architecture
- APIs
- entities and schemas
- auth and policy
- leases and credential brokering
- audit and event timelines
- gateway behavior
- SDK and CLI design
- approvals
- UI flows

Do not assume Toki should copy Infisical exactly. Use Infisical as the baseline reference, then justify reuse, adaptation, simplification, or divergence explicitly.

If there is no close Infisical equivalent, state that clearly and proceed with a greenfield design.
