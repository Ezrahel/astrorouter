import { Search, MoreVertical, Radio } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "@tanstack/react-router";
import { appClient } from "@/lib/app-client";
import { authClient } from "@/lib/auth-client";

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) {
    return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  } else if (bytes >= 1_048_576) {
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  } else if (bytes >= 1_024) {
    return `${(bytes / 1_024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

interface TunnelEvent {
  timestamp: number;
  tunnel_id: string;
  organization_id: string;
  host: string;
  method: string;
  path: string;
  status_code: number;
  request_duration_ms: number;
  bytes_in: number;
  bytes_out: number;
  client_ip: string;
  user_agent: string;
}

interface TunnelRequestsProps {
  tunnelId: string;
}

type TimeRange = "live" | "1h" | "24h" | "7d" | "30d";

const TIME_RANGES = [
  { value: "live" as TimeRange, label: "Live", icon: Radio },
  { value: "1h" as TimeRange, label: "1h" },
  { value: "24h" as TimeRange, label: "24h" },
  { value: "7d" as TimeRange, label: "7d" },
  { value: "30d" as TimeRange, label: "30d" },
];

export function TunnelRequests({ tunnelId }: TunnelRequestsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<TunnelEvent[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("live");
  const [isLoading, setIsLoading] = useState(false);
  const { orgSlug } = useParams({ from: "/$orgSlug/tunnels/$tunnelId" });
  const { data: organizations = [] } = authClient.useListOrganizations();
  const activeOrgId = organizations?.find((org) => org.slug === orgSlug)?.id;
  const wsRef = useRef<WebSocket | null>(null);

  const activeIndex = TIME_RANGES.findIndex((r) => r.value === timeRange);

  const fetchHistoricalRequests = async (range: TimeRange) => {
    if (!orgSlug || range === "live") return;

    setIsLoading(true);
    try {
      const response = await appClient.requests.list(orgSlug, {
        tunnelId,
        range,
        limit: 100,
        search: searchTerm,
      });
      if ("error" in response) throw new Error(response.error);
      setRequests(response.requests || []);
    } catch (error) {
      console.error("Failed to fetch historical requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeRange === "live") {
      setRequests([]);
    } else {
      const timer = setTimeout(() => {
        void fetchHistoricalRequests(timeRange);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [timeRange, activeOrgId, tunnelId, searchTerm, orgSlug]);

  useEffect(() => {
    if (!activeOrgId || timeRange !== "live") {
      return;
    }

    const wsUrl = import.meta.env.VITE_TUNNEL_URL;
    const ws = new WebSocket(`${wsUrl}/dashboard/events?orgId=${activeOrgId}`);

    ws.onopen = () => {
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "history") {
          const tunnelRequests = message.data.filter(
            (r: any) => r.tunnel_id === tunnelId,
          );
          setRequests(tunnelRequests);
        } else if (message.type === "log") {
          if (message.data.tunnel_id === tunnelId) {
            setRequests((prev) => [message.data, ...prev].slice(0, 100));
          }
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    return () => {
      ws.close();
    };
  }, [activeOrgId, timeRange, tunnelId]);

  const filteredRequests =
    timeRange === "live"
      ? requests.filter(
          (req) =>
            req.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.method?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : requests;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <div className="relative grid grid-cols-5 items-center bg-white/5 border border-white/10 rounded-xl p-1">
          <div
            className="absolute top-1 bottom-1 left-1 bg-accent rounded-lg transition-all duration-300 ease-out shadow-sm"
            style={{
              width: `calc((100% - 0.5rem) / ${TIME_RANGES.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />

          {TIME_RANGES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                timeRange === value
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {Icon && (
                <Icon
                  size={14}
                  className={timeRange === value ? "animate-pulse" : ""}
                />
              )}
              {label}
            </button>
          ))}
        </div>

        {/* <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-colors text-sm">
          <Filter size={16} />
          Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-colors text-sm">
          <Download size={16} />
          Export
        </button> */}
      </div>

      <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden flex flex-col max-h-150">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-medium sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3 bg-white/5">Status</th>
                <th className="px-6 py-3 bg-white/5">Method</th>
                <th className="px-6 py-3 bg-white/5">Path</th>
                <th className="px-6 py-3 bg-white/5">Time</th>
                <th className="px-6 py-3 bg-white/5">Duration</th>
                <th className="px-6 py-3 bg-white/5">Size</th>
                <th className="px-6 py-3 bg-white/5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {timeRange === "live"
                      ? "Waiting for requests..."
                      : "No requests found"}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, i) => (
                  <tr
                    key={`${req.tunnel_id}-${req.timestamp}-${i}`}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          req.status_code >= 500
                            ? "bg-red-500/10 text-red-500"
                            : req.status_code >= 400
                              ? "bg-orange-500/10 text-orange-500"
                              : req.status_code >= 300
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {req.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-white">
                      {req.method}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-300 truncate max-w-50"
                      title={req.path}
                    >
                      {req.path}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {req.request_duration_ms}ms
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatBytes(req.bytes_in + req.bytes_out)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
