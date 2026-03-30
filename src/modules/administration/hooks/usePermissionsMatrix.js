import { useEffect, useState } from "react";
import administrationService from "../services/administration.service";

export default function usePermissionsMatrix() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    administrationService.getRoles().then((data) => {
      if (!ignore) {
        setRoles(data);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [version]);

  return {
    roles,
    loading,
    saveRole: async (payload) => {
      const result = await administrationService.saveRole(payload);
      setVersion((current) => current + 1);
      return result;
    },
    togglePermission: async (roleId, moduleKey, actionKey, enabled) => {
      const result = await administrationService.updateRolePermission(roleId, moduleKey, actionKey, enabled);
      setVersion((current) => current + 1);
      return result;
    },
    deleteRole: async (roleId) => {
      const result = await administrationService.deleteRole(roleId);
      setVersion((current) => current + 1);
      return result;
    },
  };
}
