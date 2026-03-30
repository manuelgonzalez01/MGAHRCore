import employeesService from "./employees.service";

export async function addEmployeeAssignment(employee, assignment) {
  return employeesService.saveEmployee({
    ...employee,
    assignments: [{ id: `ASG-${Date.now()}`, ...assignment }, ...(employee.assignments || [])],
  });
}

export default { addEmployeeAssignment };
