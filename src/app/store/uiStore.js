import { create } from "zustand";

const useUiStore = create((set) => ({
  sidebarOpen: true,
  locale: "es",
  theme: "corporate",
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
}));

export default useUiStore;
