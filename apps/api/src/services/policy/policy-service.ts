import type { AppContext } from "../../lib/app-context";
import { agentService } from "../agent/agent-service";
import { auditService } from "../audit/audit-service";
import { toolService } from "../tool/tool-service";
import { workflowService } from "../workflow/workflow-service";
import { policyDal } from "./policy-dal";

export const policyService = {
  create(context: AppContext, input: import("@toki/core").CreatePolicyInput) {
    if (!toolService.findById(context, input.toolId)) {
      throw new Error(`Tool ${input.toolId} does not exist.`);
    }

    if (input.subjectType === "agent" && !agentService.findById(context, input.subjectId)) {
      throw new Error(`Agent ${input.subjectId} does not exist.`);
    }

    if (input.subjectType === "workflow" && !workflowService.findById(context, input.subjectId)) {
      throw new Error(`Workflow ${input.subjectId} does not exist.`);
    }

    const policy = policyDal.create(context, input);
    auditService.create(context, {
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "policy.created",
      metadata: { policyId: policy.id, subjectType: policy.subjectType, subjectId: policy.subjectId }
    });
    return policy;
  },
  list(context: AppContext) {
    return policyDal.list(context);
  }
};
