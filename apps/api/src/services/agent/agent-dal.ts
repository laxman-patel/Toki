import type { Agent } from "@toki/core";

import type { AppContext } from "../../lib/app-context";
import type { CreateAgentServiceInput } from "./agent-types";

export const agentDal = {
  create(context: AppContext, input: CreateAgentServiceInput): Agent {
    const agent: Agent = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString()
    };
    context.store.agents.set(agent.id, agent);
    return agent;
  },
  findById(context: AppContext, id: string) {
    return context.store.agents.get(id);
  }
};
