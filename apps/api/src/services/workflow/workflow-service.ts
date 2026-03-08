export const workflowServiceFactory = (
  workflowDal: ReturnType<typeof import("./workflow-dal").workflowDalFactory>,
  agentService: ReturnType<typeof import("../agent/agent-service").agentServiceFactory>,
  auditService: ReturnType<typeof import("../audit/audit-service").auditServiceFactory>
) => ({
  create(input: import("@toki/core").CreateWorkflowInput) {
    const agent = agentService.findById(input.agentId);
    if (!agent) {
      throw new Error(`Agent ${input.agentId} does not exist.`);
    }

    const workflow = workflowDal.create(input);
    auditService.create({
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "workflow.created",
      metadata: { workflowId: workflow.id, agentId: workflow.agentId }
    });
    return workflow;
  },
  findById(id: string) {
    return workflowDal.findById(id);
  }
});
