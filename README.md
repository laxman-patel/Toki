# Toki

Toki is an agent-first control plane for secure tool access.

This repo now contains:

- `apps/api`: Bun + Hono backend for Toki's control plane
- `apps/cli`: TypeScript CLI built with Commander.js
- `apps/docs`: Mintlify docs
- `packages/core`: shared domain types and API contracts
- `packages/policy-engine`: runtime policy evaluation
- `packages/db`: Drizzle ORM schema and database client
- `packages/sdk-node`: Node SDK for Toki API access
- `infisical/`: reference implementation only; not Toki's runtime base

The initial implementation focuses on the core loop:

`agent/workflow -> policy -> lease -> invocation -> audit event`
