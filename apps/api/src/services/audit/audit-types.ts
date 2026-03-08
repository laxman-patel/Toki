import type { AuditEvent } from "@toki/core";

export type CreateAuditEventInput = Omit<AuditEvent, "id" | "createdAt">;
