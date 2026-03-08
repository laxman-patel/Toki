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

import type { AppContext } from "./lib/app-context";
import { createStore } from "./lib/store";
import { agentService } from "./services/agent/agent-service";
import { auditService } from "./services/audit/audit-service";
import { authService } from "./services/auth/auth-service";
import { invocationService } from "./services/invocation/invocation-service";
import { leaseService } from "./services/lease/lease-service";
import { policyService } from "./services/policy/policy-service";
import { toolService } from "./services/tool/tool-service";
import { workflowService } from "./services/workflow/workflow-service";

export const createApp = () => {
  const context: AppContext = {
    store: createStore()
  };

  const app = new Hono();

  app.get("/healthz", (c) =>
    c.json({
      ok: true,
      service: "toki-api",
      workos: authService.getWorkOsStatus()
    })
  );

  app.post("/v1/agents", zValidator("json", createAgentInputSchema), (c) => {
    const agent = agentService.create(context, c.req.valid("json"));
    return c.json({ agent }, 201);
  });

  app.post("/v1/workflows", zValidator("json", createWorkflowInputSchema), (c) => {
    const workflow = workflowService.create(context, c.req.valid("json"));
    return c.json({ workflow }, 201);
  });

  app.post("/v1/tools", zValidator("json", createToolInputSchema), (c) => {
    const tool = toolService.create(context, c.req.valid("json"));
    return c.json({ tool }, 201);
  });

  app.post("/v1/policies", zValidator("json", createPolicyInputSchema), (c) => {
    const policy = policyService.create(context, c.req.valid("json"));
    return c.json({ policy }, 201);
  });

  app.post("/v1/leases", zValidator("json", createLeaseInputSchema), (c) => {
    const lease = leaseService.create(context, c.req.valid("json"));
    return c.json({ lease }, 201);
  });

  app.post("/v1/invocations", zValidator("json", createInvocationInputSchema), async (c) => {
    const result = await invocationService.invoke(context, c.req.valid("json"));
    return c.json(result, 201);
  });

  app.post("/v1/leases/:id/revoke", zValidator("param", revokeLeaseParamsSchema), (c) => {
    const lease = leaseService.revoke(context, c.req.valid("param").id);
    return c.json({ lease });
  });

  app.get("/v1/audit-events", zValidator("query", listAuditEventsQuerySchema), (c) => {
    const auditEvents = auditService.list(context, c.req.valid("query"));
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
