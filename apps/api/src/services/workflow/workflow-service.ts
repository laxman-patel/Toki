import type { AppContext } from "../../lib/app-context";
import { agentService } from "../agent/agent-service";
import { auditService } from "../audit/audit-service";
import { workflowDal } from "./workflow-dal";

export const workflowService = {
  create(context: AppContext, input: import("@toki/core").CreateWorkflowInput) {
    const agent = agentService.findById(context, input.agentId);
    if (!agent) {
      throw new Error(`Agent ${input.agentId} does not exist.`);
    }

    const workflow = workflowDal.create(context, input);
    auditService.create(context, {
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "workflow.created",
      metadata: { workflowId: workflow.id, agentId: workflow.agentId }
    });
    return workflow;
  },
  findById(context: AppContext, id: string) {
    return workflowDal.findById(context, id);
  }
};
