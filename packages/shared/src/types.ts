export type InjectionAction =
  | { type: "SetHeader"; name: string; value: string }
  | { type: "RemoveHeader"; name: string };

export interface ConnectRule {
  pathPattern: string | null;
  actions: InjectionAction[];
}

export interface ResolveResult {
  intercept: boolean;
  rules: ConnectRule[];
}

export interface InjectionConfig {
  headerName: string;
  valueFormat?: string; // e.g. "Bearer {value}"
}

export type SecretType = "anthropic" | "generic";
