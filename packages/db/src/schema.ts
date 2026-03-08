import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ...timestamps
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull(),
  name: text("name").notNull(),
  ...timestamps
});

export const environments = pgTable("environments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  name: text("name").notNull(),
  ...timestamps
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  workosUserId: text("workos_user_id"),
  ...timestamps
});

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ...timestamps
});

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ...timestamps
});

export const tools = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  targetUrl: text("target_url").notNull(),
  ...timestamps
});

export const policies = pgTable("policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  effect: text("effect").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  toolId: uuid("tool_id").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  environment: text("environment").notNull(),
  maxTtl: text("max_ttl"),
  ...timestamps
});

export const leases = pgTable("leases", {
  id: uuid("id").defaultRandom().primaryKey(),
  policyId: uuid("policy_id").notNull(),
  agentId: uuid("agent_id").notNull(),
  workflowId: uuid("workflow_id"),
  toolId: uuid("tool_id").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  environment: text("environment").notNull(),
  status: text("status").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true })
});

export const invocations = pgTable("invocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  leaseId: uuid("lease_id").notNull(),
  agentId: uuid("agent_id").notNull(),
  workflowId: uuid("workflow_id"),
  toolId: uuid("tool_id").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  environment: text("environment").notNull(),
  status: text("status").notNull(),
  responseStatus: text("response_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id").notNull(),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
