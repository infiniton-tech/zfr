"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditLogEntry {
  _id: string;
  actorName: string;
  actorEmail: string;
  action: "create" | "update" | "delete";
  entity: string;
  entityId?: string;
  entityLabel?: string;
  summary?: string;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800 border-green-200",
  update: "bg-blue-100 text-blue-800 border-blue-200",
  delete: "bg-red-100 text-red-800 border-red-200",
};

const ENTITIES = [
  "product",
  "category",
  "order",
  "hero-section",
  "trending",
  "look",
  "nav-item",
  "store-setting",
  "media",
  "user",
  "parcel-order",
];

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: "50" });
        if (entity) params.set("entity", entity);
        const res = await fetch(`/api/v1/audit-logs?${params.toString()}`);
        const json = await res.json();
        setLogs(json.data || []);
        setMeta(json.meta || null);
      } catch {
        setLogs([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, entity]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <select
          className="border rounded-md p-2 text-sm bg-background"
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All entities</option>
          {ENTITIES.map((en) => (
            <option key={en} value={en}>
              {en}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{log.actorName}</div>
                      <div className="text-xs text-muted-foreground">{log.actorEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionColors[log.action] || ""}>
                        {log.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold uppercase tracking-wider">{log.entity}</div>
                      {log.entityLabel && (
                        <div className="text-xs text-muted-foreground max-w-[200px] truncate">{log.entityLabel}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[280px]">
                      {log.summary || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      No activity recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} entries)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
