"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OverviewPage() {
  const [stats, setStats] = useState({ agents: 0, secrets: 0, audits: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/agents").then((r) => r.json()),
      fetch("/api/secrets").then((r) => r.json()),
      fetch("/api/audit?limit=1").then((r) => r.json()),
    ]).then(([agents, secrets, audits]) => {
      setStats({
        agents: agents.length ?? 0,
        secrets: secrets.length ?? 0,
        audits: audits.length ?? 0,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.agents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Secrets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.secrets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Audit Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.audits > 0 ? "✓" : "—"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
