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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Secret {
  id: string;
  name: string;
  type: string;
  hostPattern: string;
  pathPattern: string | null;
  createdAt: string;
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "generic",
    value: "",
    hostPattern: "",
    pathPattern: "",
    headerName: "",
    valueFormat: "",
  });

  const load = useCallback(() => {
    fetch("/api/secrets")
      .then((r) => r.json())
      .then(setSecrets);
  }, []);

  useEffect(load, [load]);

  async function create() {
    const body: Record<string, unknown> = {
      name: form.name,
      type: form.type,
      value: form.value,
      hostPattern: form.hostPattern,
      pathPattern: form.pathPattern || null,
    };
    if (form.type === "generic" && form.headerName) {
      body.injectionConfig = {
        headerName: form.headerName,
        valueFormat: form.valueFormat || undefined,
      };
    }
    await fetch("/api/secrets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setForm({ name: "", type: "generic", value: "", hostPattern: "", pathPattern: "", headerName: "", valueFormat: "" });
    setOpen(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/secrets/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Secrets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            Add secret
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add secret</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="anthropic-key"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => v && setForm({ ...form, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="generic">Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="password"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="sk-ant-..."
                />
              </div>
              <div className="space-y-2">
                <Label>Host pattern</Label>
                <Input
                  value={form.hostPattern}
                  onChange={(e) => setForm({ ...form, hostPattern: e.target.value })}
                  placeholder="api.anthropic.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Path pattern (optional)</Label>
                <Input
                  value={form.pathPattern}
                  onChange={(e) => setForm({ ...form, pathPattern: e.target.value })}
                  placeholder="/v1/*"
                />
              </div>
              {form.type === "generic" && (
                <>
                  <div className="space-y-2">
                    <Label>Header name</Label>
                    <Input
                      value={form.headerName}
                      onChange={(e) => setForm({ ...form, headerName: e.target.value })}
                      placeholder="authorization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value format (optional)</Label>
                    <Input
                      value={form.valueFormat}
                      onChange={(e) => setForm({ ...form, valueFormat: e.target.value })}
                      placeholder="Bearer {value}"
                    />
                  </div>
                </>
              )}
              <Button onClick={create} disabled={!form.name || !form.value || !form.hostPattern}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {secrets.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{s.type}</Badge>
              </TableCell>
              <TableCell>
                <code className="text-xs">{s.hostPattern}</code>
              </TableCell>
              <TableCell>
                <code className="text-xs">{s.pathPattern ?? "*"}</code>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(s.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => remove(s.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {secrets.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No secrets yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
