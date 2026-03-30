import { create } from "zustand";

const usePermissionsStore = create((set, get) => ({
  permissions: {},
  setModulePermissions: (moduleKey, actions = []) =>
    set((state) => ({
      permissions: {
        ...state.permissions,
        [moduleKey]: actions,
      },
    })),
  resetPermissions: () => set({ permissions: {} }),
  can: (moduleKey, actionKey) =>
    Boolean((get().permissions[moduleKey] || []).includes(actionKey)),
}));

export default usePermissionsStore;
