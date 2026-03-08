import type { AuditEvent } from "@toki/core";

import type { AppStore } from "../../lib/store";
import type { CreateAuditEventInput } from "./audit-types";

export const auditDalFactory = (store: AppStore) => ({
  create(input: CreateAuditEventInput): AuditEvent {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };
    store.auditEvents.unshift(event);
    return event;
  },
  list() {
    return store.auditEvents;
  }
});
