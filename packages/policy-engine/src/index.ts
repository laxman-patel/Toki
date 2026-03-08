import type { PolicyRule } from "@toki/core";

type EvaluatePoliciesInput = {
  policies: PolicyRule[];
  agentId: string;
  workflowId?: string;
  toolId: string;
  action: string;
  resource: string;
  environment: string;
  requestedTtl?: string;
};

type PolicyDecision =
  | {
      allowed: true;
      policy: PolicyRule;
      effectiveTtlMs: number;
    }
  | {
      allowed: false;
      reason: string;
    };

const DURATION_RE = /^(\d+)(ms|s|m|h|d)$/;

export const parseDurationToMs = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(DURATION_RE);
  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const [, amountRaw, unit] = match;
  if (!amountRaw || !unit) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number.parseInt(amountRaw, 10);
  const multiplier = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000
  }[unit];
  if (!multiplier) {
    throw new Error(`Unsupported duration unit: ${unit}`);
  }

  return amount * multiplier;
};

const matchesPolicy = (policy: PolicyRule, input: EvaluatePoliciesInput) => {
  const subjectMatches =
    (policy.subjectType === "agent" && policy.subjectId === input.agentId) ||
    (policy.subjectType === "workflow" && policy.subjectId === input.workflowId);

  return (
    subjectMatches &&
    policy.toolId === input.toolId &&
    policy.action === input.action &&
    policy.resource === input.resource &&
    policy.environment === input.environment
  );
};

export const evaluatePolicies = (input: EvaluatePoliciesInput): PolicyDecision => {
  const matchingPolicies = input.policies.filter((policy) => matchesPolicy(policy, input));
  if (!matchingPolicies.length) {
    return {
      allowed: false,
      reason: "No matching policy found. Toki defaults to deny."
    };
  }

  const denyPolicy = matchingPolicies.find((policy) => policy.effect === "deny");
  if (denyPolicy) {
    return {
      allowed: false,
      reason: `Denied by policy ${denyPolicy.id}`
    };
  }

  const policy = matchingPolicies.find((candidate) => candidate.effect === "allow");
  if (!policy) {
    return {
      allowed: false,
      reason: "Matching policies were found, but none allowed the request."
    };
  }

  const requestedTtlMs = parseDurationToMs(input.requestedTtl) ?? 15 * 60_000;
  const policyMaxTtlMs = parseDurationToMs(policy.maxTtl) ?? requestedTtlMs;

  return {
    allowed: true,
    policy,
    effectiveTtlMs: Math.min(requestedTtlMs, policyMaxTtlMs)
  };
};

export type { PolicyDecision };
