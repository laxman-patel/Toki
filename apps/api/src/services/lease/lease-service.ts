import { evaluatePolicies } from "@toki/policy-engine";

export const leaseServiceFactory = (
  leaseDal: ReturnType<typeof import("./lease-dal").leaseDalFactory>,
  policyService: ReturnType<typeof import("../policy/policy-service").policyServiceFactory>,
  agentService: ReturnType<typeof import("../agent/agent-service").agentServiceFactory>,
  workflowService: ReturnType<typeof import("../workflow/workflow-service").workflowServiceFactory>,
  toolService: ReturnType<typeof import("../tool/tool-service").toolServiceFactory>,
  auditService: ReturnType<typeof import("../audit/audit-service").auditServiceFactory>
) => ({
  create(input: import("@toki/core").CreateLeaseInput) {
    if (!agentService.findById(input.agentId)) {
      throw new Error(`Agent ${input.agentId} does not exist.`);
    }

    if (input.workflowId && !workflowService.findById(input.workflowId)) {
      throw new Error(`Workflow ${input.workflowId} does not exist.`);
    }

    if (!toolService.findById(input.toolId)) {
      throw new Error(`Tool ${input.toolId} does not exist.`);
    }

    const decision = evaluatePolicies({
      policies: policyService.list(),
      agentId: input.agentId,
      workflowId: input.workflowId,
      toolId: input.toolId,
      action: input.action,
      resource: input.resource,
      environment: input.environment,
      requestedTtl: input.ttl
    });

    if (!decision.allowed) {
      auditService.create({
        actorType: "agent",
        actorId: input.agentId,
        eventType: "lease.denied",
        metadata: { reason: decision.reason, toolId: input.toolId, action: input.action }
      });
      throw new Error(decision.reason);
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + decision.effectiveTtlMs);
    const lease = leaseDal.create({
      policyId: decision.policy.id,
      agentId: input.agentId,
      workflowId: input.workflowId,
      toolId: input.toolId,
      action: input.action,
      resource: input.resource,
      environment: input.environment,
      status: "active",
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    auditService.create({
      actorType: "agent",
      actorId: input.agentId,
      eventType: "lease.issued",
      metadata: { leaseId: lease.id, policyId: lease.policyId, toolId: lease.toolId }
    });

    return lease;
  },
  findById(id: string) {
    return leaseDal.findById(id);
  },
  revoke(id: string) {
    const lease = leaseDal.findById(id);
    if (!lease) {
      throw new Error(`Lease ${id} does not exist.`);
    }

    const revoked = leaseDal.update({
      ...lease,
      status: "revoked",
      revokedAt: new Date().toISOString()
    });

    auditService.create({
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "lease.revoked",
      metadata: { leaseId: revoked.id }
    });

    return revoked;
  }
});
