import { evaluatePolicies } from "@toki/policy-engine";

import type { AppContext } from "../../lib/app-context";
import { agentService } from "../agent/agent-service";
import { auditService } from "../audit/audit-service";
import { toolService } from "../tool/tool-service";
import { workflowService } from "../workflow/workflow-service";
import { policyService } from "../policy/policy-service";
import { leaseDal } from "./lease-dal";

export const leaseService = {
  create(context: AppContext, input: import("@toki/core").CreateLeaseInput) {
    if (!agentService.findById(context, input.agentId)) {
      throw new Error(`Agent ${input.agentId} does not exist.`);
    }

    if (input.workflowId && !workflowService.findById(context, input.workflowId)) {
      throw new Error(`Workflow ${input.workflowId} does not exist.`);
    }

    if (!toolService.findById(context, input.toolId)) {
      throw new Error(`Tool ${input.toolId} does not exist.`);
    }

    const decision = evaluatePolicies({
      policies: policyService.list(context),
      agentId: input.agentId,
      workflowId: input.workflowId,
      toolId: input.toolId,
      action: input.action,
      resource: input.resource,
      environment: input.environment,
      requestedTtl: input.ttl
    });

    if (!decision.allowed) {
      auditService.create(context, {
        actorType: "agent",
        actorId: input.agentId,
        eventType: "lease.denied",
        metadata: { reason: decision.reason, toolId: input.toolId, action: input.action }
      });
      throw new Error(decision.reason);
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + decision.effectiveTtlMs);
    const lease = leaseDal.create(context, {
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

    auditService.create(context, {
      actorType: "agent",
      actorId: input.agentId,
      eventType: "lease.issued",
      metadata: { leaseId: lease.id, policyId: lease.policyId, toolId: lease.toolId }
    });

    return lease;
  },
  findById(context: AppContext, id: string) {
    return leaseDal.findById(context, id);
  },
  revoke(context: AppContext, id: string) {
    const lease = leaseDal.findById(context, id);
    if (!lease) {
      throw new Error(`Lease ${id} does not exist.`);
    }

    const revoked = leaseDal.update(context, {
      ...lease,
      status: "revoked",
      revokedAt: new Date().toISOString()
    });

    auditService.create(context, {
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "lease.revoked",
      metadata: { leaseId: revoked.id }
    });

    return revoked;
  }
};
