import WebSocket from "ws";
import { TunnelEvent } from "../lib/timescale";

const MAX_ORGS = 1000;
const MAX_LOG_ENTRIES_WITH_SUBSCRIBERS = 100;
const MAX_LOG_ENTRIES_WITHOUT_SUBSCRIBERS = 15;
const CLEANUP_INTERVAL_MS = 60000;

export class LogManager {
  private logs = new Map<string, TunnelEvent[]>();
  private subscribers = new Map<string, Set<WebSocket>>();
  private cleanupTimer: NodeJS.Timeout;

  constructor() {
    this.cleanupTimer = setInterval(() => this.pruneColdOrgs(), CLEANUP_INTERVAL_MS);
    if (typeof this.cleanupTimer.unref === "function") {
      this.cleanupTimer.unref();
    }
  }

  addLog(event: TunnelEvent) {
    const orgId = event.organization_id;
    if (!orgId) return;

    // Enforce max org limit — drop events from excess orgs
    if (!this.logs.has(orgId) && this.logs.size >= MAX_ORGS) {
      return;
    }

    let orgLogs = this.logs.get(orgId);
    if (!orgLogs) {
      orgLogs = [];
      this.logs.set(orgId, orgLogs);
    }

    orgLogs.unshift(event);

    const subs = this.subscribers.get(orgId);
    const hasSubscribers = subs && subs.size > 0;
    const limit = hasSubscribers
      ? MAX_LOG_ENTRIES_WITH_SUBSCRIBERS
      : MAX_LOG_ENTRIES_WITHOUT_SUBSCRIBERS;

    if (orgLogs.length > limit) {
      orgLogs.length = limit;
    }

    if (hasSubscribers) {
      const message = JSON.stringify({ type: "log", data: event });
      for (const ws of subs) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      }
    }
  }

  subscribe(orgId: string, ws: WebSocket) {
    let subs = this.subscribers.get(orgId);
    if (!subs) {
      subs = new Set();
      this.subscribers.set(orgId, subs);
    }
    subs.add(ws);

    const currentLogs = this.logs.get(orgId) || [];
    ws.send(JSON.stringify({ type: "history", data: currentLogs }));

    ws.on("close", () => {
      this.unsubscribe(orgId, ws);
    });
  }

  unsubscribe(orgId: string, ws: WebSocket) {
    const subs = this.subscribers.get(orgId);
    if (subs) {
      subs.delete(ws);
      if (subs.size === 0) {
        this.subscribers.delete(orgId);
        const orgLogs = this.logs.get(orgId);
        if (orgLogs && orgLogs.length > MAX_LOG_ENTRIES_WITHOUT_SUBSCRIBERS) {
          orgLogs.length = MAX_LOG_ENTRIES_WITHOUT_SUBSCRIBERS;
        }
      }
    }
  }

  private pruneColdOrgs(): void {
    const now = Date.now();
    const STALE_THRESHOLD_MS = 5 * 60 * 1000;
    for (const [orgId] of this.subscribers) {
      const subs = this.subscribers.get(orgId);
      if (subs) {
        for (const ws of subs) {
          if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
            subs.delete(ws);
          }
        }
        if (subs.size === 0) {
          this.subscribers.delete(orgId);
          const orgLogs = this.logs.get(orgId);
          if (orgLogs && orgLogs.length > MAX_LOG_ENTRIES_WITHOUT_SUBSCRIBERS) {
            orgLogs.length = MAX_LOG_ENTRIES_WITHOUT_SUBSCRIBERS;
          }
        }
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupTimer);
  }
}
