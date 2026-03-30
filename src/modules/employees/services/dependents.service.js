import employeesService from "./employees.service";

export async function addEmployeeDependent(employee, dependent) {
  return employeesService.saveEmployee({
    ...employee,
    dependents: [{ id: `DEP-${Date.now()}`, ...dependent }, ...(employee.dependents || [])],
  });
}

export default { addEmployeeDependent };
