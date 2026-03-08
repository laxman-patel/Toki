export const policyServiceFactory = (
  policyDal: ReturnType<typeof import("./policy-dal").policyDalFactory>,
  toolService: ReturnType<typeof import("../tool/tool-service").toolServiceFactory>,
  agentService: ReturnType<typeof import("../agent/agent-service").agentServiceFactory>,
  workflowService: ReturnType<typeof import("../workflow/workflow-service").workflowServiceFactory>,
  auditService: ReturnType<typeof import("../audit/audit-service").auditServiceFactory>
) => ({
  create(input: import("@toki/core").CreatePolicyInput) {
    if (!toolService.findById(input.toolId)) {
      throw new Error(`Tool ${input.toolId} does not exist.`);
    }

    if (input.subjectType === "agent" && !agentService.findById(input.subjectId)) {
      throw new Error(`Agent ${input.subjectId} does not exist.`);
    }

    if (input.subjectType === "workflow" && !workflowService.findById(input.subjectId)) {
      throw new Error(`Workflow ${input.subjectId} does not exist.`);
    }

    const policy = policyDal.create(input);
    auditService.create({
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "policy.created",
      metadata: { policyId: policy.id, subjectType: policy.subjectType, subjectId: policy.subjectId }
    });
    return policy;
  },
  list() {
    return policyDal.list();
  }
});
