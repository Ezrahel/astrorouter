import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Network,
  Settings,
  History,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Link2,
  CreditCard,
  Users,
  Key,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { authClient, usePermission } from "@/lib/auth-client";
import { appClient } from "@/lib/app-client";
import { NavItem } from "./sidebar/nav-item";
import { OrganizationDropdown } from "./sidebar/organization-dropdown";
import { PlanUsage } from "./sidebar/plan-usage";
import { UserSection } from "./sidebar/user-section";
import { useQuery } from "@tanstack/react-query";
import { getPlanLimits } from "@/lib/subscription-plans";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { setSelectedOrganization } = useAppStore();
  const { data: organizations = [] } = authClient.useListOrganizations();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [activeTunnelsCount, setActiveTunnelsCount] = useState<number>(0);
  const { orgSlug } = useParams({ from: "/$orgSlug" });

  const selectedOrg =
    organizations?.find((org) => org.slug === orgSlug) || organizations?.[0];

  const { data: session } = authClient.useSession();
  const user = session?.user;

  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription", orgSlug],
    queryFn: async () => {
      if (!orgSlug) return null;
      const response = await appClient.subscriptions.get(orgSlug);
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    enabled: !!orgSlug,
  });

  const subscription = subscriptionData?.subscription;
  const currentPlan = subscription?.plan || "free";
  const planLimits = getPlanLimits(currentPlan as any);
  const tunnelLimit = planLimits.maxTunnels;

  useEffect(() => {
    const fetchStats = async () => {
      if (orgSlug) {
        const response = await appClient.stats.overview(orgSlug);
        if (response && "activeTunnels" in response) {
          setActiveTunnelsCount(response.activeTunnels || 0);
        }
      }
    };
    fetchStats();
  }, [orgSlug]);

  const { data: canManageBilling } = usePermission({
    billing: ["manage"],
  });

  const NAV_ICON_SIZE = 14;

  const navItems = [
    {
      to: "/$orgSlug",
      label: "Overview",
      icon: <LayoutDashboard size={NAV_ICON_SIZE} />,
      activeOptions: { exact: true },
    },
    {
      to: "/$orgSlug/tunnels",
      label: "Active Tunnels",
      icon: <Network size={NAV_ICON_SIZE} />,
    },
    {
      to: "/$orgSlug/requests",
      label: "Requests",
      icon: <History size={NAV_ICON_SIZE} />,
    },
    {
      to: "/$orgSlug/subdomains",
      label: "Subdomains",
      icon: <Globe size={NAV_ICON_SIZE} />,
    },
    {
      to: "/$orgSlug/domains",
      label: "Domains",
      icon: <Link2 size={NAV_ICON_SIZE} />,
    },
    canManageBilling && {
      to: "/$orgSlug/billing",
      label: "Billing",
      icon: <CreditCard size={NAV_ICON_SIZE} />,
    },
    {
      to: "/$orgSlug/members",
      label: "Members",
      icon: <Users size={NAV_ICON_SIZE} />,
    },
    {
      to: "/$orgSlug/tokens",
      label: "API Tokens",
      icon: <Key size={NAV_ICON_SIZE} />,
    },
    {
      to: "/$orgSlug/settings",
      label: "Settings",
      icon: <Settings size={NAV_ICON_SIZE} />,
    },
  ].filter((item) => item !== false && item !== undefined) as any[];

  return (
    <div
      className={`${isCollapsed ? "w-15" : "w-56"} h-full flex flex-col motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in-out motion-reduce:transition-none bg-[#070707] overflow-hidden`}
    >
      <div
        className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2">
            <img src="/logo.png" alt="AstroRoute Logo" className="w-8" />
            <p className="font-bold text-white text-lg tracking-tight">
              AstroRoute
            </p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      <OrganizationDropdown
        organizations={organizations!}
        setSelectedOrganization={setSelectedOrganization}
        isOrgDropdownOpen={isOrgDropdownOpen}
        setIsOrgDropdownOpen={setIsOrgDropdownOpen}
        isCollapsed={isCollapsed}
      />

      <div className="flex-1 px-2 py-4 space-y-0.5 overflow-x-hidden overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            activeOptions={item.activeOptions}
            isCollapsed={isCollapsed}
            params={{ orgSlug: selectedOrg?.slug ?? orgSlug ?? "" }}
          />
        ))}
      </div>

      {!isCollapsed && (
        <div className="px-3 pt-3 border-t border-white/5 bg-black/20">
          <PlanUsage
            activeTunnelsCount={activeTunnelsCount}
            limit={tunnelLimit}
            currentPlan={currentPlan}
          />
        </div>
      )}

      <UserSection user={user} isCollapsed={isCollapsed} />
    </div>
  );
}
