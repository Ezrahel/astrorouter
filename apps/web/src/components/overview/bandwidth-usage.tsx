import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useParams } from "@tanstack/react-router";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function BandwidthUsage() {
  const { orgSlug } = useParams({ from: "/$orgSlug" });

  const { data, isLoading } = useQuery({
    queryKey: ["bandwidth", orgSlug],
    queryFn: async () => {
      if (!orgSlug) return null;
      return await appClient.stats.bandwidth(orgSlug);
    },
    enabled: !!orgSlug,
  });

  if (isLoading || !data) {
    return <div className="animate-pulse h-24 bg-white/5 rounded-2xl" />;
  }

  if ("error" in data) {
    return null;
  }

  const { usage, limit, percentage } = data;

  return (
    <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Bandwidth Usage</h3>
        <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-full text-gray-300">
          {formatBytes(usage)} / {formatBytes(limit)}
        </span>
      </div>

      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
            percentage > 90
              ? "bg-red-500"
              : percentage > 75
                ? "bg-yellow-500"
                : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{percentage.toFixed(1)}% used</span>
        <span>Resets next month</span>
      </div>
    </div>
  );
}
