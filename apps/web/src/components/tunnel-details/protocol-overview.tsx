import {
  Activity,
  Zap,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

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

function formatDuration(ms: number): string {
  if (ms >= 60000) {
    return `${(ms / 60000).toFixed(1)}m`;
  } else if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${Math.round(ms)}ms`;
}

interface ProtocolStats {
  totalConnections: number;
  uniqueConnections: number;
  uniqueClients: number;
  totalBytesIn: number;
  totalBytesOut: number;
  totalPackets: number;
  totalCloses: number;
  avgDurationMs: number;
}

interface ChartDataPoint {
  time: string;
  connections: number;
  packets: number;
  bytesIn: number;
  bytesOut: number;
}

interface RecentEvent {
  timestamp: string;
  event_type: string;
  connection_id: string;
  client_ip: string;
  client_port: number;
  bytes_in: number;
  bytes_out: number;
  duration_ms: number;
}

interface ProtocolOverviewProps {
  protocol: "tcp" | "udp";
  stats: ProtocolStats | null;
  chartData: ChartDataPoint[];
  recentEvents: RecentEvent[];
  timeRange: string;
  setTimeRange: (range: string) => void;
  isLoading: boolean;
}

export function ProtocolOverview({
  protocol,
  stats,
  chartData,
  recentEvents,
  timeRange,
  setTimeRange,
  isLoading,
}: ProtocolOverviewProps) {
  const isTcp = protocol === "tcp";

  const statCards = isTcp
    ? [
        {
          label: "Total Connections",
          value: stats?.totalConnections.toLocaleString() || "0",
          icon: Zap,
        },
        {
          label: "Unique Clients",
          value: stats?.uniqueClients.toLocaleString() || "0",
          icon: Users,
        },
        {
          label: "Data In",
          value: formatBytes(stats?.totalBytesIn || 0),
          icon: ArrowDownToLine,
        },
        {
          label: "Data Out",
          value: formatBytes(stats?.totalBytesOut || 0),
          icon: ArrowUpFromLine,
        },
        {
          label: "Avg Duration",
          value: formatDuration(stats?.avgDurationMs || 0),
          icon: Clock,
        },
        {
          label: "Data Packets",
          value: stats?.totalPackets.toLocaleString() || "0",
          icon: Activity,
        },
      ]
    : [
        {
          label: "Unique Clients",
          value: stats?.uniqueClients.toLocaleString() || "0",
          icon: Users,
        },
        {
          label: "Total Packets",
          value: stats?.totalPackets.toLocaleString() || "0",
          icon: Zap,
        },
        {
          label: "Data In",
          value: formatBytes(stats?.totalBytesIn || 0),
          icon: ArrowDownToLine,
        },
        {
          label: "Data Out",
          value: formatBytes(stats?.totalBytesOut || 0),
          icon: ArrowUpFromLine,
        },
      ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isTcp ? "3" : "4"} gap-4`}
      >
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white/2 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
              <stat.icon size={14} className="opacity-70" />
              {stat.label}
            </div>
            <div className="text-2xl font-semibold text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Chart */}
      <div className="bg-white/2 border border-white/5 rounded-2xl p-6 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center transition-all duration-200">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white">
              {isTcp ? "Connections & Data" : "Packets & Data"}
            </h3>
            <p className="text-sm text-gray-500">
              {isTcp ? "TCP connections over time" : "UDP packets over time"}
            </p>
          </div>
          <div className="flex bg-white/5 rounded-lg p-1">
            {["1h", "24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === range
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-75 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="colorConnections"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (timeRange === "1h") {
                      return date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                    } else if (timeRange === "24h") {
                      return date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        hour12: true,
                      });
                    } else {
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }
                  }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#9ca3af", marginBottom: "0.25rem" }}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                  }}
                />
                {isTcp && (
                  <Area
                    type="monotone"
                    dataKey="connections"
                    name="Connections"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConnections)"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="packets"
                  name={isTcp ? "Data Packets" : "Packets"}
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPackets)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
              <Activity size={32} className="mb-2 opacity-50" />
              <p>No traffic data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bandwidth Chart */}
      <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white">Bandwidth</h3>
          <p className="text-sm text-gray-500">Data transferred over time</p>
        </div>
        <div className="h-60 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (timeRange === "1h") {
                      return date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                    } else if (timeRange === "24h") {
                      return date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        hour12: true,
                      });
                    } else {
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }
                  }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatBytes(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#9ca3af" }}
                  formatter={(value) => formatBytes(value as number)}
                />
                <Bar
                  dataKey="bytesIn"
                  name="Data In"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="bytesOut"
                  name="Data Out"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
              <Activity size={32} className="mb-2 opacity-50" />
              <p>No bandwidth data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
          <p className="text-sm text-gray-500">
            {isTcp
              ? "Recent TCP connections and data transfers"
              : "Recent UDP packets"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-white/5">
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">Client</th>
                {isTcp && <th className="pb-3 font-medium">Connection</th>}
                <th className="pb-3 font-medium text-right">In</th>
                <th className="pb-3 font-medium text-right">Out</th>
                {isTcp && (
                  <th className="pb-3 font-medium text-right">Duration</th>
                )}
              </tr>
            </thead>
            <tbody>
              {recentEvents.length > 0 ? (
                recentEvents.slice(0, 20).map((event, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="py-3 text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.event_type === "connection"
                            ? "bg-blue-500/20 text-blue-400"
                            : event.event_type === "close"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {event.event_type}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300 font-mono text-xs">
                      {event.client_ip}:{event.client_port}
                    </td>
                    {isTcp && (
                      <td className="py-3 text-gray-500 font-mono text-xs">
                        {event.connection_id?.slice(0, 12) || "-"}
                      </td>
                    )}
                    <td className="py-3 text-right text-gray-300">
                      {event.bytes_in > 0 ? formatBytes(event.bytes_in) : "-"}
                    </td>
                    <td className="py-3 text-right text-gray-300">
                      {event.bytes_out > 0 ? formatBytes(event.bytes_out) : "-"}
                    </td>
                    {isTcp && (
                      <td className="py-3 text-right text-gray-300">
                        {event.duration_ms > 0
                          ? formatDuration(event.duration_ms)
                          : "-"}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isTcp ? 7 : 5}
                    className="py-8 text-center text-gray-500"
                  >
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
