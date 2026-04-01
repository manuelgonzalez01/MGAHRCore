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
      bootstrapped: false,
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
      bootstrapped: Boolean(user),
    };
  } catch {
    return {
      user: null,
      token: "",
      isAuthenticated: false,
      activeCompanyId: "",
      bootstrapped: false,
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
      bootstrapped: true,
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
      bootstrapped: true,
    };
    persistSession(nextState);
    set(nextState);
  },
  markBootstrapped: () =>
    set((state) => ({
      bootstrapped: true,
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      activeCompanyId: state.activeCompanyId,
    })),
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
      bootstrapped: true,
    });
  },
}));

export default useAuthStore;
