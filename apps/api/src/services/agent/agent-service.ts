import type { AppContext } from "../../lib/app-context";
import { auditService } from "../audit/audit-service";
import { agentDal } from "./agent-dal";

export const agentService = {
  create(context: AppContext, input: import("./agent-types").CreateAgentServiceInput) {
    const agent = agentDal.create(context, input);
    auditService.create(context, {
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "agent.created",
      metadata: { agentId: agent.id, name: agent.name }
    });
    return agent;
  },
  findById(context: AppContext, id: string) {
    return agentDal.findById(context, id);
  }
};
