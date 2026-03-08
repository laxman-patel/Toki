import type { Agent, AuditEvent, Invocation, Lease, PolicyRule, ToolDescriptor, Workflow } from "@toki/core";

export type AppStore = {
  agents: Map<string, Agent>;
  workflows: Map<string, Workflow>;
  tools: Map<string, ToolDescriptor>;
  policies: Map<string, PolicyRule>;
  leases: Map<string, Lease>;
  invocations: Map<string, Invocation>;
  auditEvents: AuditEvent[];
};

export const createStore = (): AppStore => ({
  agents: new Map(),
  workflows: new Map(),
  tools: new Map(),
  policies: new Map(),
  leases: new Map(),
  invocations: new Map(),
  auditEvents: []
});
