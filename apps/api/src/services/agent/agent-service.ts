export const agentServiceFactory = (
  agentDal: ReturnType<typeof import("./agent-dal").agentDalFactory>,
  auditService: ReturnType<typeof import("../audit/audit-service").auditServiceFactory>
) => ({
  create(input: import("./agent-types").CreateAgentServiceInput) {
    const agent = agentDal.create(input);
    auditService.create({
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "agent.created",
      metadata: { agentId: agent.id, name: agent.name }
    });
    return agent;
  },
  findById(id: string) {
    return agentDal.findById(id);
  }
});
