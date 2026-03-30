import { create } from "zustand";

const SESSION_KEY = "mgahrcore.auth.session";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredSession() {
  if (!canUseStorage()) {
    return {
      user: null,
      token: "",
      isAuthenticated: false,
      activeCompanyId: "",
    };
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const user = parsed?.user || null;
    return {
      user,
      token: parsed?.token || "",
      isAuthenticated: Boolean(user),
      activeCompanyId: user?.activeCompanyId || "",
    };
  } catch {
    return {
      user: null,
      token: "",
      isAuthenticated: false,
      activeCompanyId: "",
    };
  }
}

function persistSession(payload) {
  if (!canUseStorage()) {
    return;
  }

  if (!payload?.user) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

const initialState = readStoredSession();

const useAuthStore = create((set) => ({
  ...initialState,
  login: ({ user, token = "" }) => {
    const nextState = {
      user,
      token,
      isAuthenticated: true,
      activeCompanyId: user?.activeCompanyId || "",
    };
    persistSession(nextState);
    set(nextState);
  },
  hydrate: ({ user, token = "" }) => {
    const nextState = {
      user,
      token,
      isAuthenticated: Boolean(user),
      activeCompanyId: user?.activeCompanyId || "",
    };
    persistSession(nextState);
    set(nextState);
  },
  setActiveCompany: (companyId) =>
    set((state) => {
      const nextState = {
        activeCompanyId: companyId,
        user: state.user ? { ...state.user, activeCompanyId: companyId } : null,
      };
      persistSession({
        user: nextState.user,
        token: state.token,
      });
      return nextState;
    }),
  logout: () => {
    persistSession(null);
    set({
      user: null,
      token: "",
      isAuthenticated: false,
      activeCompanyId: "",
    });
  },
}));

export default useAuthStore;
