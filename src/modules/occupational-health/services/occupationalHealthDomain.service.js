import administrationService from "../../administration/services/administration.service";
import employeesService from "../../employees/services/employees.service";
import { buildFilterOptions, createHealthId, pickByIndex, sumBy } from "../utils/health.helpers";

const STORAGE_KEYS = {
  injuries: "mgahrcore.occupationalHealth.injuries",
  visits: "mgahrcore.occupationalHealth.visits",
  labs: "mgahrcore.occupationalHealth.labs",
  medicines: "mgahrcore.occupationalHealth.medicines",
  conditions: "mgahrcore.occupationalHealth.conditions",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection(key) {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection(key, items) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(items));
  }
}

function getLanguage() {
  if (!canUseStorage()) return "es";
  return window.localStorage.getItem("mgahrcore.language") === "en" ? "en" : "es";
}

function t(es, en) {
  return getLanguage() === "en" ? en : es;
}

function getActor() {
  if (!canUseStorage()) return "MGAHRCore Super Admin";
  try {
    const raw = window.localStorage.getItem("mgahrcore.auth.session");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed?.user?.displayName || parsed?.user?.name || "MGAHRCore Super Admin";
  } catch {
    return "MGAHRCore Super Admin";
  }
}

function buildEmployeeContext(employee, organizations) {
  const position = organizations.positions.find((item) => item.id === employee.positionId);
  const department = organizations.departments.find((item) => item.id === position?.departmentId || item.name === employee.department);
  const location = organizations.locations.find((item) => item.id === employee.locationId || item.name === employee.location || item.id === position?.locationId);
  const company = organizations.companies.find((item) => item.id === employee.companyId || item.name === employee.company);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: company?.id || employee.companyId || "",
    companyName: company?.name || employee.company || "",
    departmentId: department?.id || "",
    departmentName: department?.name || employee.department || "",
    locationId: location?.id || "",
    locationName: location?.name || employee.location || "",
    positionName: employee.position || position?.name || "",
    status: employee.status || "active",
  };
}

function createSeedInjuries(employees, organizations) {
  const selected = pickByIndex(employees.filter((item) => item.status === "active"), 4, 0).slice(0, 6);
  const severities = ["low", "moderate", "high"];
  const statuses = ["open", "monitoring", "closed"];
  const causes = [
    t("Manipulacion manual", "Manual handling"),
    t("Desplazamiento interno", "Internal movement"),
    t("Ergonomia", "Ergonomics"),
  ];

  return selected.map((employee, index) => ({
    id: createHealthId("INJ"),
    ...buildEmployeeContext(employee, organizations),
    incidentType: index % 2 === 0 ? t("Incidente ergonomico", "Ergonomic incident") : t("Accidente menor", "Minor accident"),
    severity: severities[index % severities.length],
    status: statuses[index % statuses.length],
    occurredAt: `2026-03-${String(8 + index).padStart(2, "0")}`,
    location: buildEmployeeContext(employee, organizations).locationName,
    cause: causes[index % causes.length],
    correctiveAction: t("Seguimiento con lider y adecuacion del puesto.", "Follow-up with manager and workplace adjustment."),
    lostDays: index % 3 === 0 ? 2 : 0,
    timeline: [
      { id: createHealthId("TL"), date: `2026-03-${String(8 + index).padStart(2, "0")}`, title: t("Registro inicial", "Initial registration"), detail: t("Caso abierto en Salud Ocupacional.", "Case opened in Occupational Health.") },
      { id: createHealthId("TL"), date: `2026-03-${String(10 + index).padStart(2, "0")}`, title: t("Accion correctiva", "Corrective action"), detail: t("Se registro seguimiento con el area.", "Area follow-up recorded.") },
    ],
  }));
}

function createSeedVisits(employees, organizations) {
  const selected = pickByIndex(employees.filter((item) => item.status === "active"), 2, 0).slice(0, 10);
  return selected.map((employee, index) => ({
    id: createHealthId("VIS"),
    ...buildEmployeeContext(employee, organizations),
    visitType: index % 2 === 0 ? t("Control periodico", "Periodic exam") : t("Consulta ocupacional", "Occupational consultation"),
    occurredAt: `2026-03-${String(4 + index).padStart(2, "0")}`,
    result: index % 3 === 0 ? "restricted" : "fit",
    restrictions: index % 3 === 0 ? t("Evitar carga superior a 10kg por 14 dias.", "Avoid lifting over 10kg for 14 days.") : "",
    followUpDate: index % 3 === 0 ? `2026-04-${String(5 + index).padStart(2, "0")}` : "",
    physician: "Dr. Occupational Care",
    caseStatus: index % 3 === 0 ? "follow_up" : "completed",
  }));
}

function createSeedLabs(employees, organizations) {
  const selected = pickByIndex(employees.filter((item) => item.status === "active"), 3, 1).slice(0, 8);
  const testTypes = [
    t("Perfil ocupacional", "Occupational panel"),
    t("Control respiratorio", "Respiratory screening"),
    t("Control anual", "Annual screening"),
  ];

  return selected.map((employee, index) => ({
    id: createHealthId("LAB"),
    ...buildEmployeeContext(employee, organizations),
    testType: testTypes[index % testTypes.length],
    scheduledAt: `2026-03-${String(12 + index).padStart(2, "0")}`,
    result: index % 3 === 0 ? t("Pendiente", "Pending") : t("Sin hallazgos criticos", "No critical findings"),
    status: index % 3 === 0 ? "scheduled" : "completed",
    laboratory: "MGA Clinical Labs",
  }));
}

function createSeedMedicines(employees, organizations) {
  const selected = pickByIndex(employees.filter((item) => item.status === "active"), 3, 0).slice(0, 8);
  return selected.map((employee, index) => ({
    id: createHealthId("MED"),
    ...buildEmployeeContext(employee, organizations),
    medicine: index % 2 === 0 ? t("Kit ergonomico", "Ergonomic kit") : t("Analgesico controlado", "Controlled analgesic"),
    deliveredAt: `2026-03-${String(6 + index).padStart(2, "0")}`,
    quantity: index % 2 === 0 ? 1 : 10,
    status: index % 2 === 0 ? "active" : "monitoring",
    notes: t("Seguimiento registrado por enfermeria ocupacional.", "Follow-up logged by occupational nursing."),
  }));
}

function createSeedConditions(employees, organizations) {
  const selected = pickByIndex(employees.filter((item) => item.status === "active"), 5, 1).slice(0, 4);
  return selected.map((employee, index) => ({
    id: createHealthId("COND"),
    ...buildEmployeeContext(employee, organizations),
    conditionType: index % 2 === 0 ? t("Embarazo", "Pregnancy") : t("Restriccion medica", "Medical restriction"),
    status: index % 2 === 0 ? "monitoring" : "active",
    restriction: index % 2 === 0 ? t("Ajuste de jornada y control prenatal.", "Adjusted schedule and prenatal follow-up.") : t("Trabajo remoto parcial por 21 dias.", "Partial remote work for 21 days."),
    owner: "Occupational Health",
    followUpDate: `2026-04-${String(3 + index).padStart(2, "0")}`,
  }));
}

function sanitizeByEmployees(items, employees) {
  const employeeIds = new Set(employees.map((item) => item.id));
  return items.filter((item) => employeeIds.has(item.employeeId));
}

function buildCases(domain) {
  const injuryCases = domain.injuries.filter((item) => item.status !== "closed").map((item) => ({
    id: item.id,
    employeeId: item.employeeId,
    employeeName: item.employeeName,
    type: "injury",
    title: item.incidentType,
    status: item.status,
    owner: "Occupational Health",
    nextStep: item.correctiveAction,
    timeline: item.timeline,
  }));

  const visitCases = domain.visits.filter((item) => item.caseStatus === "follow_up").map((item) => ({
    id: item.id,
    employeeId: item.employeeId,
    employeeName: item.employeeName,
    type: "medical_visit",
    title: item.visitType,
    status: item.caseStatus,
    owner: item.physician,
    nextStep: item.restrictions || t("Control cerrado", "Closed control"),
    timeline: [
      { id: createHealthId("TL"), date: item.occurredAt, title: t("Consulta", "Visit"), detail: item.result },
      { id: createHealthId("TL"), date: item.followUpDate, title: t("Seguimiento", "Follow-up"), detail: item.restrictions || t("Sin restricciones", "No restrictions") },
    ],
  }));

  const conditionCases = domain.conditions.map((item) => ({
    id: item.id,
    employeeId: item.employeeId,
    employeeName: item.employeeName,
    type: "condition",
    title: item.conditionType,
    status: item.status,
    owner: item.owner,
    nextStep: item.restriction,
    timeline: [
      { id: createHealthId("TL"), date: item.followUpDate, title: t("Control programado", "Scheduled follow-up"), detail: item.restriction },
    ],
  }));

  return [...injuryCases, ...visitCases, ...conditionCases];
}

function findEmployee(employeeId, employees) {
  return employees.find((item) => item.id === employeeId);
}

function assertHealthRecord(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function getOccupationalHealthDomain(filters = {}) {
  const [employees, organizations] = await Promise.all([
    employeesService.getEmployees(),
    administrationService.getOrganizations(),
  ]);

  const seedRequired = !readCollection(STORAGE_KEYS.injuries).length
    && !readCollection(STORAGE_KEYS.visits).length
    && !readCollection(STORAGE_KEYS.labs).length
    && !readCollection(STORAGE_KEYS.medicines).length
    && !readCollection(STORAGE_KEYS.conditions).length;

  if (seedRequired) {
    writeCollection(STORAGE_KEYS.injuries, createSeedInjuries(employees, organizations));
    writeCollection(STORAGE_KEYS.visits, createSeedVisits(employees, organizations));
    writeCollection(STORAGE_KEYS.labs, createSeedLabs(employees, organizations));
    writeCollection(STORAGE_KEYS.medicines, createSeedMedicines(employees, organizations));
    writeCollection(STORAGE_KEYS.conditions, createSeedConditions(employees, organizations));
  }

  const injuries = sanitizeByEmployees(readCollection(STORAGE_KEYS.injuries), employees);
  const visits = sanitizeByEmployees(readCollection(STORAGE_KEYS.visits), employees);
  const labs = sanitizeByEmployees(readCollection(STORAGE_KEYS.labs), employees);
  const medicines = sanitizeByEmployees(readCollection(STORAGE_KEYS.medicines), employees);
  const conditions = sanitizeByEmployees(readCollection(STORAGE_KEYS.conditions), employees);
  const cases = buildCases({ injuries, visits, conditions });

  const filtered = {
    injuries: injuries.filter((item) =>
      (!filters.employeeId || item.employeeId === filters.employeeId)
      && (!filters.status || item.status === filters.status)
      && (!filters.departmentId || item.departmentId === filters.departmentId)
      && (!filters.companyId || item.companyId === filters.companyId)),
    visits: visits.filter((item) =>
      (!filters.employeeId || item.employeeId === filters.employeeId)
      && (!filters.status || item.caseStatus === filters.status || item.result === filters.status)
      && (!filters.departmentId || item.departmentId === filters.departmentId)
      && (!filters.companyId || item.companyId === filters.companyId)),
    labs: labs.filter((item) =>
      (!filters.employeeId || item.employeeId === filters.employeeId)
      && (!filters.status || item.status === filters.status)
      && (!filters.departmentId || item.departmentId === filters.departmentId)
      && (!filters.companyId || item.companyId === filters.companyId)),
    medicines: medicines.filter((item) =>
      (!filters.employeeId || item.employeeId === filters.employeeId)
      && (!filters.status || item.status === filters.status)
      && (!filters.departmentId || item.departmentId === filters.departmentId)
      && (!filters.companyId || item.companyId === filters.companyId)),
    conditions: conditions.filter((item) =>
      (!filters.employeeId || item.employeeId === filters.employeeId)
      && (!filters.status || item.status === filters.status)
      && (!filters.departmentId || item.departmentId === filters.departmentId)
      && (!filters.companyId || item.companyId === filters.companyId)),
  };

  const options = {
    employees: [{ value: "", label: t("Todos", "All") }, ...buildFilterOptions(employees)],
    companies: [{ value: "", label: t("Todos", "All") }, ...buildFilterOptions(organizations.companies)],
    departments: [{ value: "", label: t("Todos", "All") }, ...buildFilterOptions(organizations.departments)],
    statuses: [
      { value: "", label: t("Todos", "All") },
      { value: "open", label: t("Abierto", "Open") },
      { value: "monitoring", label: t("Seguimiento", "Monitoring") },
      { value: "closed", label: t("Cerrado", "Closed") },
      { value: "scheduled", label: t("Programado", "Scheduled") },
      { value: "completed", label: t("Completado", "Completed") },
      { value: "active", label: t("Activo", "Active") },
      { value: "follow_up", label: t("Seguimiento", "Follow-up") },
    ],
  };

  return {
    employees,
    organizations,
    injuries,
    visits,
    labs,
    medicines,
    conditions,
    cases,
    filtered,
    options,
    stats: {
      incidents: injuries.length,
      openCases: cases.filter((item) => !["closed", "completed"].includes(item.status)).length,
      pendingLabs: labs.filter((item) => item.status === "scheduled").length,
      activeRestrictions: conditions.filter((item) => ["monitoring", "active"].includes(item.status)).length,
      monitoredEmployees: new Set([...injuries, ...visits, ...labs, ...medicines, ...conditions].map((item) => item.employeeId)).size,
      lostDays: sumBy(injuries, (item) => item.lostDays),
    },
    reporting: {
      incidentTrend: injuries.map((item) => ({ label: item.occurredAt, value: 1, severity: item.severity })),
      compliance: {
        visitsCompleted: visits.filter((item) => item.result === "fit" || item.caseStatus === "completed").length,
        visitsPending: visits.filter((item) => item.caseStatus === "follow_up").length,
        labsCompleted: labs.filter((item) => item.status === "completed").length,
        labsPending: labs.filter((item) => item.status === "scheduled").length,
      },
    },
  };
}

function saveCollectionRecord(key, record) {
  const current = readCollection(key);
  const index = current.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    current[index] = record;
  } else {
    current.unshift(record);
  }
  writeCollection(key, current);
  return record;
}

export async function saveInjuryRecord(input) {
  const { employees, organizations } = await getOccupationalHealthDomain();
  const employee = findEmployee(input.employeeId, employees);
  assertHealthRecord(employee, t("Debes seleccionar un colaborador valido.", "A valid employee is required."));
  assertHealthRecord(input.incidentType, t("Debes indicar el tipo de incidente.", "Incident type is required."));
  assertHealthRecord(input.occurredAt, t("Debes indicar la fecha del incidente.", "Incident date is required."));

  const payload = {
    id: input.id || createHealthId("INJ"),
    ...buildEmployeeContext(employee, organizations),
    incidentType: input.incidentType,
    severity: input.severity || "low",
    status: input.status || "open",
    occurredAt: input.occurredAt,
    location: input.location || buildEmployeeContext(employee, organizations).locationName,
    cause: input.cause || "",
    correctiveAction: input.correctiveAction || "",
    lostDays: Number(input.lostDays) || 0,
    timeline: Array.isArray(input.timeline) && input.timeline.length ? input.timeline : [
      {
        id: createHealthId("TL"),
        date: input.occurredAt,
        title: t("Registro", "Registration"),
        detail: input.cause || t("Caso registrado en Salud Ocupacional.", "Case registered in Occupational Health."),
      },
    ],
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
  };

  return saveCollectionRecord(STORAGE_KEYS.injuries, payload);
}

export async function saveMedicalVisitRecord(input) {
  const { employees, organizations } = await getOccupationalHealthDomain();
  const employee = findEmployee(input.employeeId, employees);
  assertHealthRecord(employee, t("Debes seleccionar un colaborador valido.", "A valid employee is required."));
  assertHealthRecord(input.visitType, t("Debes indicar el tipo de visita.", "Visit type is required."));
  assertHealthRecord(input.occurredAt, t("Debes indicar la fecha de la visita.", "Visit date is required."));

  const payload = {
    id: input.id || createHealthId("VIS"),
    ...buildEmployeeContext(employee, organizations),
    visitType: input.visitType,
    occurredAt: input.occurredAt,
    result: input.result || "fit",
    restrictions: input.restrictions || "",
    followUpDate: input.followUpDate || "",
    physician: input.physician || "Dr. Occupational Care",
    caseStatus: input.caseStatus || "completed",
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
  };

  return saveCollectionRecord(STORAGE_KEYS.visits, payload);
}

export async function saveLaboratoryTestRecord(input) {
  const { employees, organizations } = await getOccupationalHealthDomain();
  const employee = findEmployee(input.employeeId, employees);
  assertHealthRecord(employee, t("Debes seleccionar un colaborador valido.", "A valid employee is required."));
  assertHealthRecord(input.testType, t("Debes indicar el tipo de laboratorio.", "Test type is required."));
  assertHealthRecord(input.scheduledAt, t("Debes indicar la fecha del laboratorio.", "Test date is required."));

  const payload = {
    id: input.id || createHealthId("LAB"),
    ...buildEmployeeContext(employee, organizations),
    testType: input.testType,
    scheduledAt: input.scheduledAt,
    result: input.result || t("Pendiente", "Pending"),
    status: input.status || "scheduled",
    laboratory: input.laboratory || "MGA Clinical Labs",
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
  };

  return saveCollectionRecord(STORAGE_KEYS.labs, payload);
}

export async function saveMedicineRecord(input) {
  const { employees, organizations } = await getOccupationalHealthDomain();
  const employee = findEmployee(input.employeeId, employees);
  assertHealthRecord(employee, t("Debes seleccionar un colaborador valido.", "A valid employee is required."));
  assertHealthRecord(input.medicine, t("Debes indicar el medicamento o entrega.", "Medicine is required."));
  assertHealthRecord(input.deliveredAt, t("Debes indicar la fecha de entrega.", "Delivery date is required."));

  const payload = {
    id: input.id || createHealthId("MED"),
    ...buildEmployeeContext(employee, organizations),
    medicine: input.medicine,
    deliveredAt: input.deliveredAt,
    quantity: Number(input.quantity) || 1,
    status: input.status || "active",
    notes: input.notes || "",
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
  };

  return saveCollectionRecord(STORAGE_KEYS.medicines, payload);
}

export async function saveConditionRecord(input) {
  const { employees, organizations } = await getOccupationalHealthDomain();
  const employee = findEmployee(input.employeeId, employees);
  assertHealthRecord(employee, t("Debes seleccionar un colaborador valido.", "A valid employee is required."));
  assertHealthRecord(input.conditionType, t("Debes indicar la condicion.", "Condition type is required."));

  const payload = {
    id: input.id || createHealthId("COND"),
    ...buildEmployeeContext(employee, organizations),
    conditionType: input.conditionType,
    status: input.status || "monitoring",
    restriction: input.restriction || "",
    owner: input.owner || "Occupational Health",
    followUpDate: input.followUpDate || "",
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
  };

  return saveCollectionRecord(STORAGE_KEYS.conditions, payload);
}

export async function exportOccupationalHealthSection(section = "dashboard") {
  const domain = await getOccupationalHealthDomain();
  const payload = {
    section,
    generatedAt: new Date().toISOString(),
    injuries: domain.injuries,
    visits: domain.visits,
    labs: domain.labs,
    medicines: domain.medicines,
    conditions: domain.conditions,
    cases: domain.cases,
    stats: domain.stats,
  };

  return {
    ok: true,
    fileName: `occupational-health-${section}-${new Date().toISOString().slice(0, 10)}.json`,
    content: JSON.stringify(payload, null, 2),
  };
}
