import type { ToolDescriptor } from "@toki/core";

import type { AppContext } from "../../lib/app-context";

export const toolDal = {
  create(context: AppContext, input: import("@toki/core").CreateToolInput): ToolDescriptor {
    const tool: ToolDescriptor = {
      id: crypto.randomUUID(),
      name: input.name,
      kind: input.kind,
      targetUrl: input.targetUrl,
      createdAt: new Date().toISOString()
    };
    context.store.tools.set(tool.id, tool);
    return tool;
  },
  findById(context: AppContext, id: string) {
    return context.store.tools.get(id);
  }
};
