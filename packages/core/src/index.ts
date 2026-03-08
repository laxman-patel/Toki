import { z } from "zod";

export const actorTypeSchema = z.enum(["user", "agent", "workflow"]);
export const toolKindSchema = z.enum(["http", "mcp"]);
export const policyEffectSchema = z.enum(["allow", "deny"]);
export const leaseStatusSchema = z.enum(["active", "revoked", "expired"]);
export const invocationStatusSchema = z.enum(["succeeded", "failed", "blocked"]);

export const agentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().datetime()
});

export const workflowSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().datetime()
});

export const toolDescriptorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  kind: toolKindSchema,
  targetUrl: z.string().url(),
  createdAt: z.string().datetime()
});

export const policyRuleSchema = z.object({
  id: z.string().uuid(),
  effect: policyEffectSchema,
  subjectType: z.enum(["agent", "workflow"]),
  subjectId: z.string().uuid(),
  toolId: z.string().uuid(),
  action: z.string().min(1),
  resource: z.string().min(1),
  environment: z.string().min(1),
  maxTtl: z.string().optional(),
  createdAt: z.string().datetime()
});

export const leaseSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  agentId: z.string().uuid(),
  workflowId: z.string().uuid().optional(),
  toolId: z.string().uuid(),
  action: z.string().min(1),
  resource: z.string().min(1),
  environment: z.string().min(1),
  status: leaseStatusSchema,
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  revokedAt: z.string().datetime().optional()
});

export const invocationSchema = z.object({
  id: z.string().uuid(),
  leaseId: z.string().uuid(),
  agentId: z.string().uuid(),
  workflowId: z.string().uuid().optional(),
  toolId: z.string().uuid(),
  action: z.string().min(1),
  resource: z.string().min(1),
  environment: z.string().min(1),
  status: invocationStatusSchema,
  responseStatus: z.number().int().optional(),
  createdAt: z.string().datetime()
});

export const auditEventSchema = z.object({
  id: z.string().uuid(),
  actorType: actorTypeSchema,
  actorId: z.string(),
  eventType: z.string().min(1),
  createdAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown())
});

export const createAgentInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const createWorkflowInputSchema = z.object({
  agentId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional()
});

export const createToolInputSchema = z.object({
  name: z.string().min(1),
  kind: toolKindSchema,
  targetUrl: z.string().url()
});

export const createPolicyInputSchema = z.object({
  effect: policyEffectSchema.default("allow"),
  subjectType: z.enum(["agent", "workflow"]),
  subjectId: z.string().uuid(),
  toolId: z.string().uuid(),
  action: z.string().min(1),
  resource: z.string().min(1),
  environment: z.string().min(1),
  maxTtl: z.string().optional()
});

export const createLeaseInputSchema = z.object({
  agentId: z.string().uuid(),
  workflowId: z.string().uuid().optional(),
  toolId: z.string().uuid(),
  action: z.string().min(1),
  resource: z.string().min(1),
  environment: z.string().min(1),
  ttl: z.string().optional()
});

export const createInvocationInputSchema = z.object({
  leaseId: z.string().uuid(),
  toolId: z.string().uuid(),
  action: z.string().min(1),
  resource: z.string().min(1),
  environment: z.string().min(1),
  payload: z.unknown().optional()
});

export const revokeLeaseParamsSchema = z.object({
  id: z.string().uuid()
});

export const listAuditEventsQuerySchema = z.object({
  actorType: actorTypeSchema.optional(),
  actorId: z.string().optional(),
  eventType: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).default(50)
});

export type Agent = z.infer<typeof agentSchema>;
export type Workflow = z.infer<typeof workflowSchema>;
export type ToolDescriptor = z.infer<typeof toolDescriptorSchema>;
export type PolicyRule = z.infer<typeof policyRuleSchema>;
export type Lease = z.infer<typeof leaseSchema>;
export type Invocation = z.infer<typeof invocationSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;

export type CreateAgentInput = z.infer<typeof createAgentInputSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowInputSchema>;
export type CreateToolInput = z.infer<typeof createToolInputSchema>;
export type CreatePolicyInput = z.infer<typeof createPolicyInputSchema>;
export type CreateLeaseInput = z.infer<typeof createLeaseInputSchema>;
export type CreateInvocationInput = z.infer<typeof createInvocationInputSchema>;
export type ListAuditEventsQuery = z.infer<typeof listAuditEventsQuerySchema>;
