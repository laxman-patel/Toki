import { zValidator } from "@hono/zod-validator";
import {
  createAgentInputSchema,
  createInvocationInputSchema,
  createLeaseInputSchema,
  createPolicyInputSchema,
  createToolInputSchema,
  createWorkflowInputSchema,
  listAuditEventsQuerySchema,
  revokeLeaseParamsSchema
} from "@toki/core";
import { Hono } from "hono";

import { createStore } from "./lib/store";
import { agentDalFactory } from "./services/agent/agent-dal";
import { agentServiceFactory } from "./services/agent/agent-service";
import { auditDalFactory } from "./services/audit/audit-dal";
import { auditServiceFactory } from "./services/audit/audit-service";
import { authServiceFactory } from "./services/auth/auth-service";
import { invocationDalFactory } from "./services/invocation/invocation-dal";
import { invocationServiceFactory } from "./services/invocation/invocation-service";
import { leaseDalFactory } from "./services/lease/lease-dal";
import { leaseServiceFactory } from "./services/lease/lease-service";
import { policyDalFactory } from "./services/policy/policy-dal";
import { policyServiceFactory } from "./services/policy/policy-service";
import { toolDalFactory } from "./services/tool/tool-dal";
import { toolServiceFactory } from "./services/tool/tool-service";
import { workflowDalFactory } from "./services/workflow/workflow-dal";
import { workflowServiceFactory } from "./services/workflow/workflow-service";

export const createApp = () => {
  const store = createStore();

  const auditDal = auditDalFactory(store);
  const auditService = auditServiceFactory(auditDal);
  const authService = authServiceFactory();
  const agentService = agentServiceFactory(agentDalFactory(store), auditService);
  const workflowService = workflowServiceFactory(workflowDalFactory(store), agentService, auditService);
  const toolService = toolServiceFactory(toolDalFactory(store), auditService);
  const policyService = policyServiceFactory(policyDalFactory(store), toolService, agentService, workflowService, auditService);
  const leaseService = leaseServiceFactory(leaseDalFactory(store), policyService, agentService, workflowService, toolService, auditService);
  const invocationService = invocationServiceFactory(invocationDalFactory(store), leaseService, toolService, auditService);

  const app = new Hono();

  app.get("/healthz", (c) =>
    c.json({
      ok: true,
      service: "toki-api",
      workos: authService.getWorkOsStatus()
    })
  );

  app.post("/v1/agents", zValidator("json", createAgentInputSchema), (c) => {
    const agent = agentService.create(c.req.valid("json"));
    return c.json({ agent }, 201);
  });

  app.post("/v1/workflows", zValidator("json", createWorkflowInputSchema), (c) => {
    const workflow = workflowService.create(c.req.valid("json"));
    return c.json({ workflow }, 201);
  });

  app.post("/v1/tools", zValidator("json", createToolInputSchema), (c) => {
    const tool = toolService.create(c.req.valid("json"));
    return c.json({ tool }, 201);
  });

  app.post("/v1/policies", zValidator("json", createPolicyInputSchema), (c) => {
    const policy = policyService.create(c.req.valid("json"));
    return c.json({ policy }, 201);
  });

  app.post("/v1/leases", zValidator("json", createLeaseInputSchema), (c) => {
    const lease = leaseService.create(c.req.valid("json"));
    return c.json({ lease }, 201);
  });

  app.post("/v1/invocations", zValidator("json", createInvocationInputSchema), async (c) => {
    const result = await invocationService.invoke(c.req.valid("json"));
    return c.json(result, 201);
  });

  app.post("/v1/leases/:id/revoke", zValidator("param", revokeLeaseParamsSchema), (c) => {
    const lease = leaseService.revoke(c.req.valid("param").id);
    return c.json({ lease });
  });

  app.get("/v1/audit-events", zValidator("query", listAuditEventsQuerySchema), (c) => {
    const auditEvents = auditService.list(c.req.valid("query"));
    return c.json({ auditEvents });
  });

  app.onError((error, c) => {
    return c.json(
      {
        error: error.message
      },
      400
    );
  });

  return app;
};
