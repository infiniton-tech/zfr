import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models";

interface AuditActor {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

interface AuditEntry {
  action: "create" | "update" | "delete";
  entity: string;
  entityId?: string;
  entityLabel?: string;
  summary?: string;
  changes?: Record<string, unknown>;
}

/**
 * Records an admin action in the audit log. Fire-and-forget:
 * never throws and never blocks the main request.
 */
export function logAudit(session: AuditActor | null, entry: AuditEntry): void {
  const actor = session?.user;
  void (async () => {
    try {
      await connectDB();
      await AuditLog.create({
        actorId: actor?.id || undefined,
        actorName: actor?.name || "Unknown",
        actorEmail: actor?.email || "unknown",
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        entityLabel: entry.entityLabel,
        summary: entry.summary,
        changes: entry.changes,
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  })();
}

/** Builds a short summary from an update payload, e.g. "Updated fields: price, stock" */
export function summarizeChanges(body: Record<string, unknown>): string {
  const keys = Object.keys(body).filter((k) => body[k] !== undefined);
  return keys.length > 0 ? `Updated fields: ${keys.join(", ")}` : "Updated";
}
