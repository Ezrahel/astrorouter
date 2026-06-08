import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface AppState {
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedOrganization: null,
      setSelectedOrganization: (org) => set({ selectedOrganization: org }),
    }),
    {
      name: "app-storage",
    },
  ),
);
