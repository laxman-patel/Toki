import type {
  CreateAgentInput,
  CreateInvocationInput,
  CreateLeaseInput,
  CreatePolicyInput,
  CreateToolInput,
  CreateWorkflowInput,
  ListAuditEventsQuery
} from "@toki/core";

type TokiClientOptions = {
  baseUrl: string;
  token?: string;
};

export class TokiClient {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(options: TokiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
  }

  private async request<T>(path: string, init?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Request failed (${response.status}): ${body}`);
    }

    return (await response.json()) as T;
  }

  createAgent(input: CreateAgentInput) {
    return this.request("/v1/agents", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  createWorkflow(input: CreateWorkflowInput) {
    return this.request("/v1/workflows", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  createTool(input: CreateToolInput) {
    return this.request("/v1/tools", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  applyPolicy(input: CreatePolicyInput) {
    return this.request("/v1/policies", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  createLease(input: CreateLeaseInput) {
    return this.request("/v1/leases", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  invokeWithLease(input: CreateInvocationInput) {
    return this.request("/v1/invocations", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  revokeLease(id: string) {
    return this.request(`/v1/leases/${id}/revoke`, {
      method: "POST"
    });
  }

  listAuditEvents(query: Partial<ListAuditEventsQuery> = {}) {
    const search = new URLSearchParams();
    if (query.actorType) search.set("actorType", query.actorType);
    if (query.actorId) search.set("actorId", query.actorId);
    if (query.eventType) search.set("eventType", query.eventType);
    if (query.limit) search.set("limit", String(query.limit));
    const suffix = search.toString() ? `?${search.toString()}` : "";

    return this.request(`/v1/audit-events${suffix}`);
  }
}
