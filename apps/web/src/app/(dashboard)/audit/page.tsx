"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditEntry {
  id: string;
  agentId: string | null;
  action: string;
  service: string | null;
  path: string | null;
  secretName: string | null;
  createdAt: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  const load = useCallback(() => {
    fetch("/api/audit?limit=50")
      .then((r) => r.json())
      .then(setLogs);
  }, []);

  useEffect(load, [load]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Secret</TableHead>
            <TableHead>Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(l.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{l.action}</Badge>
              </TableCell>
              <TableCell>
                <code className="text-xs">{l.service ?? "—"}</code>
              </TableCell>
              <TableCell>
                <code className="text-xs">{l.path ?? "—"}</code>
              </TableCell>
              <TableCell className="text-sm">{l.secretName ?? "—"}</TableCell>
              <TableCell>
                <code className="text-xs">{l.agentId?.slice(0, 8) ?? "—"}</code>
              </TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No audit events yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
