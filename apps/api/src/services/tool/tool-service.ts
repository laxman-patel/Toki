import type { AppContext } from "../../lib/app-context";
import { auditService } from "../audit/audit-service";
import { toolDal } from "./tool-dal";

export const toolService = {
  create(context: AppContext, input: import("@toki/core").CreateToolInput) {
    const tool = toolDal.create(context, input);
    auditService.create(context, {
      actorType: "user",
      actorId: "control-plane-user",
      eventType: "tool.created",
      metadata: { toolId: tool.id, kind: tool.kind, targetUrl: tool.targetUrl }
    });
    return tool;
  },
  findById(context: AppContext, id: string) {
    return toolDal.findById(context, id);
  }
};
