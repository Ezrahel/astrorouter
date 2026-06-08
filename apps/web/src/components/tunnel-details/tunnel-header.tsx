import { Link } from "@tanstack/react-router";
import { ArrowLeft, Globe, Copy, ExternalLink, Power } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "../confirm-modal";
import { useAppStore } from "@/lib/store";

interface TunnelHeaderProps {
  tunnel: {
    id: string;
    name?: string | null;
    isOnline: boolean;
    url: string;
  };
  onStop: () => void;
  isStopping: boolean;
}

export function TunnelHeader({
  tunnel,
  onStop,
  isStopping,
}: TunnelHeaderProps) {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive: boolean;
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: false,
    confirmText: "",
  });

  const { selectedOrganization } = useAppStore();

  return (
    <>
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <Link
          to="/$orgSlug/tunnels"
          params={{ orgSlug: selectedOrganization?.slug! }}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight truncate">
              {tunnel.name || tunnel.id}
            </h2>
            <span
              className={`px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 shrink-0 ${
                tunnel.isOnline
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${tunnel.isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              {tunnel.isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Globe size={14} className="shrink-0" />
            <span className="font-mono truncate">{tunnel.url}</span>
            <button
              className="hover:text-white transition-colors shrink-0"
              onClick={() => navigator.clipboard.writeText(tunnel.url)}
            >
              <Copy size={12} />
            </button>
            <a
              href={tunnel.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors shrink-0"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setConfirmState({
                isOpen: true,
                title: "Stop Tunnel",
                message: "Are you sure you want to stop this tunnel?",
                onConfirm: onStop,
                isDestructive: true,
                confirmText: "Stop",
              });
            }}
            disabled={isStopping || !tunnel.isOnline}
          >
            <Power size={16} />
            {isStopping ? "Stopping..." : "Stop"}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        isDestructive={confirmState.isDestructive}
        confirmText={confirmState.confirmText}
      />
    </>
  );
}
