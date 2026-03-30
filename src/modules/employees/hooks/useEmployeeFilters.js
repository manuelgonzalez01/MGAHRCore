import { useMemo, useState } from "react";
import { employeeFilterSchema } from "../schemas/employee.schema";

export default function useEmployeeFilters(employees = []) {
  const [filters, setFilters] = useState(employeeFilterSchema);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const query = filters.query.toLowerCase();
      const matchesQuery =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query);

      const matchesDepartment = filters.department === "all" || employee.department === filters.department;
      const matchesStatus = filters.status === "all" || employee.status === filters.status;
      const matchesLocation = filters.location === "all" || employee.location === filters.location;
      const matchesCompany = filters.company === "all" || employee.company === filters.company;

      return matchesQuery && matchesDepartment && matchesStatus && matchesLocation && matchesCompany;
    });
  }, [employees, filters]);

  return {
    filters,
    filteredEmployees,
    updateFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
  };
}
