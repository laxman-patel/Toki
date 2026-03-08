import type { ToolDescriptor } from "@toki/core";

import type { AppStore } from "../../lib/store";

export const toolDalFactory = (store: AppStore) => ({
  create(input: import("@toki/core").CreateToolInput): ToolDescriptor {
    const tool: ToolDescriptor = {
      id: crypto.randomUUID(),
      name: input.name,
      kind: input.kind,
      targetUrl: input.targetUrl,
      createdAt: new Date().toISOString()
    };
    store.tools.set(tool.id, tool);
    return tool;
  },
  findById(id: string) {
    return store.tools.get(id);
  }
});
