import { Activity, Clock, Zap } from "lucide-react";

interface TunnelTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  protocol?: string;
}

export function TunnelTabs({
  activeTab,
  setActiveTab,
  protocol,
}: TunnelTabsProps) {
  const isProtocolTunnel = protocol === "tcp" || protocol === "udp";

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    {
      id: "requests",
      label: isProtocolTunnel ? "Events" : "Requests",
      icon: isProtocolTunnel ? Zap : Clock,
    },
    // { id: "security", label: "Security", icon: Shield },
    // { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-white/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? "border-accent text-accent"
              : "border-transparent text-gray-400 hover:text-white hover:border-white/10"
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
