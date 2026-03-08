import type { Workflow } from "@toki/core";

import type { AppStore } from "../../lib/store";

export const workflowDalFactory = (store: AppStore) => ({
  create(input: import("@toki/core").CreateWorkflowInput): Workflow {
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      agentId: input.agentId,
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString()
    };
    store.workflows.set(workflow.id, workflow);
    return workflow;
  },
  findById(id: string) {
    return store.workflows.get(id);
  }
});
