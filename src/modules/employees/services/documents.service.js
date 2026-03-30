import employeesService from "./employees.service";

export async function addEmployeeDocument(employee, document) {
  const normalizedDocument = {
    ...document,
    fileName: document.fileName || document.name,
    fileType: document.fileType || "",
    fileSize: Number(document.fileSize) || 0,
  };

  return employeesService.saveEmployee({
    ...employee,
    documents: [
      {
        id: `DOC-${Date.now()}`,
        ...normalizedDocument,
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...(employee.documents || []),
    ],
  });
}

export default { addEmployeeDocument };
