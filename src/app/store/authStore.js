import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: "",
  isAuthenticated: false,
  activeCompanyId: "",
  login: ({ user, token = "" }) =>
    set({
      user,
      token,
      isAuthenticated: true,
      activeCompanyId: user?.activeCompanyId || "",
    }),
  hydrate: ({ user, token = "" }) =>
    set({
      user,
      token,
      isAuthenticated: Boolean(user),
      activeCompanyId: user?.activeCompanyId || "",
    }),
  setActiveCompany: (companyId) =>
    set((state) => ({
      activeCompanyId: companyId,
      user: state.user ? { ...state.user, activeCompanyId: companyId } : null,
    })),
  logout: () =>
    set({
      user: null,
      token: "",
      isAuthenticated: false,
      activeCompanyId: "",
    }),
}));

export default useAuthStore;
