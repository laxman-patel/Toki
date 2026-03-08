import type { Agent } from "@toki/core";

import type { AppStore } from "../../lib/store";
import type { CreateAgentServiceInput } from "./agent-types";

export const agentDalFactory = (store: AppStore) => ({
  create(input: CreateAgentServiceInput): Agent {
    const agent: Agent = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString()
    };
    store.agents.set(agent.id, agent);
    return agent;
  },
  findById(id: string) {
    return store.agents.get(id);
  }
});
