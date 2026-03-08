export const toolServiceFactory = (
  toolDal: ReturnType<typeof import("./tool-dal").toolDalFactory>,
  auditService: ReturnType<typeof import("../audit/audit-service").auditServiceFactory>
) => ({
  create(input: import("@toki/core").CreateToolInput) {
    const tool = toolDal.create(input);
    auditService.create({
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "tool.created",
      metadata: { toolId: tool.id, kind: tool.kind, targetUrl: tool.targetUrl }
    });
    return tool;
  },
  findById(id: string) {
    return toolDal.findById(id);
  }
});
