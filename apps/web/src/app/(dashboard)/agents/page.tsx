"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Agent {
  id: string;
  name: string;
  accessToken: string;
  isActive: boolean;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [newToken, setNewToken] = useState("");

  const load = useCallback(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents);
  }, []);

  useEffect(load, [load]);

  async function create() {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const agent = await res.json();
    setNewToken(agent.accessToken);
    setName("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setNewToken(""); }}>
          <DialogTrigger render={<Button />}>
            Create agent
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create agent</DialogTitle>
            </DialogHeader>
            {newToken ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Copy this token now — it won&apos;t be shown again.
                </p>
                <code className="block break-all rounded bg-muted p-3 text-sm">
                  {newToken}
                </code>
                <Button onClick={() => { setOpen(false); setNewToken(""); }}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="my-agent"
                  />
                </div>
                <Button onClick={create} disabled={!name}>
                  Create
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell>
                <code className="text-xs text-muted-foreground">
                  {a.accessToken.slice(0, 12)}...
                </code>
              </TableCell>
              <TableCell>
                <Badge variant={a.isActive ? "default" : "secondary"}>
                  {a.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => remove(a.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {agents.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No agents yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
