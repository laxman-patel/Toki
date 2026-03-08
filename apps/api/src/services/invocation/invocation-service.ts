export const invocationServiceFactory = (
  invocationDal: ReturnType<typeof import("./invocation-dal").invocationDalFactory>,
  leaseService: ReturnType<typeof import("../lease/lease-service").leaseServiceFactory>,
  toolService: ReturnType<typeof import("../tool/tool-service").toolServiceFactory>,
  auditService: ReturnType<typeof import("../audit/audit-service").auditServiceFactory>
) => ({
  async invoke(input: import("@toki/core").CreateInvocationInput) {
    const lease = leaseService.findById(input.leaseId);
    if (!lease) {
      throw new Error(`Lease ${input.leaseId} does not exist.`);
    }

    if (lease.status !== "active") {
      throw new Error(`Lease ${input.leaseId} is not active.`);
    }

    if (new Date(lease.expiresAt) <= new Date()) {
      throw new Error(`Lease ${input.leaseId} has expired.`);
    }

    if (
      lease.toolId !== input.toolId ||
      lease.action !== input.action ||
      lease.resource !== input.resource ||
      lease.environment !== input.environment
    ) {
      throw new Error("Invocation is outside the lease scope.");
    }

    const tool = toolService.findById(input.toolId);
    if (!tool) {
      throw new Error(`Tool ${input.toolId} does not exist.`);
    }

    let responseStatus: number | undefined;
    let status: import("@toki/core").Invocation["status"] = "blocked";
    let body: unknown = { message: "No invocation attempted." };

    if (tool.kind === "http") {
      const response = await fetch(tool.targetUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-toki-lease-id": lease.id
        },
        body: JSON.stringify(input.payload ?? {})
      });

      responseStatus = response.status;
      status = response.ok ? "succeeded" : "failed";
      body = await response.text();
    } else {
      status = "blocked";
      body = {
        message: "MCP tool invocation is not implemented in the initial scaffold. Start with HTTP tools first."
      };
    }

    const invocation = invocationDal.create({
      leaseId: lease.id,
      agentId: lease.agentId,
      workflowId: lease.workflowId,
      toolId: lease.toolId,
      action: lease.action,
      resource: lease.resource,
      environment: lease.environment,
      status,
      responseStatus,
      createdAt: new Date().toISOString()
    });

    auditService.create({
      actorType: "agent",
      actorId: lease.agentId,
      eventType: "invocation.created",
      metadata: {
        invocationId: invocation.id,
        leaseId: lease.id,
        toolId: lease.toolId,
        status,
        responseStatus
      }
    });

    return {
      invocation,
      body
    };
  }
});
