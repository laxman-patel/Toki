import type { Workflow } from "@toki/core";

import type { AppContext } from "../../lib/app-context";

export const workflowDal = {
  create(context: AppContext, input: import("@toki/core").CreateWorkflowInput): Workflow {
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      agentId: input.agentId,
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString()
    };
    context.store.workflows.set(workflow.id, workflow);
    return workflow;
  },
  findById(context: AppContext, id: string) {
    return context.store.workflows.get(id);
  }
};
