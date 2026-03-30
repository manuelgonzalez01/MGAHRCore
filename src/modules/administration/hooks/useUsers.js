import { useEffect, useMemo, useState } from "react";
import administrationService from "../services/administration.service";

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: "",
    company: "all",
    status: "all",
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const data = await administrationService.getUsers();
      if (!ignore) {
        setUsers(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [version]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = filters.query.toLowerCase();
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roleName.toLowerCase().includes(query);
      const matchesCompany = filters.company === "all" || user.companyId === filters.company;
      const matchesStatus = filters.status === "all" || user.status === filters.status;
      return matchesQuery && matchesCompany && matchesStatus;
    });
  }, [filters, users]);

  return {
    users,
    filteredUsers,
    loading,
    filters,
    updateFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    saveUser: async (payload) => {
      const result = await administrationService.saveUser(payload);
      setVersion((current) => current + 1);
      return result;
    },
    deleteUser: async (userId) => {
      const result = await administrationService.deleteUser(userId);
      setVersion((current) => current + 1);
      return result;
    },
  };
}
