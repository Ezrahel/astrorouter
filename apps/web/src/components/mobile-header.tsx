import { useParams } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export function MobileHeader() {
  const { orgSlug } = useParams({ from: "/$orgSlug" });
  const { data: organizations = [] } = authClient.useListOrganizations();

  const selectedOrg =
    organizations?.find((org) => org.slug === orgSlug) || organizations?.[0];

  return (
    <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#070707] border-b border-white/5">
      <img src="/logo.png" alt="AstroRoute Logo" className="w-8" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm tracking-tight truncate">
          {selectedOrg?.name || "AstroRoute"}
        </p>
      </div>
    </header>
  );
}
