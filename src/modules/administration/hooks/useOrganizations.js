import { useEffect, useState } from "react";
import administrationService from "../services/administration.service";

export default function useOrganizations() {
  const [organizations, setOrganizations] = useState({
    companies: [],
    positions: [],
    levels: [],
    departments: [],
    locations: [],
    entities: [],
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    administrationService.getOrganizations().then(setOrganizations);
  }, [version]);

  return {
    ...organizations,
    saveItem: async (type, payload) => {
      const result = await administrationService.saveOrganizationItem(type, payload);
      setVersion((current) => current + 1);
      return result;
    },
    deleteItem: async (type, itemId) => {
      const result = await administrationService.deleteOrganizationItem(type, itemId);
      setVersion((current) => current + 1);
      return result;
    },
  };
}
