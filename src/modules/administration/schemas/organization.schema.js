export const organizationSchema = {
  name: "",
  code: "",
  companyId: "",
  status: "active",
};

export const positionSchema = {
  name: "",
  internalCode: "",
  departmentId: "",
  levelId: "",
  reportsToPositionId: "",
  positionType: "operativa",
  jobFamily: "",
  locationId: "",
  businessRole: "",
  description: "",
  impact: "medio",
  hiringType: "",
  status: "active",
  criticalPosition: false,
  useInRecruitment: true,
  useInEmployees: true,
};

export const levelSchema = {
  name: "",
  internalCode: "",
  hierarchyOrder: "",
  parentLevelId: "",
  levelType: "profesional",
  seniority: "Mid",
  organizationalFamily: "",
  salaryMin: "",
  salaryMax: "",
  currency: "BOB",
  payFrequency: "monthly",
  approvalLevelRequired: "2",
  canApproveRequests: false,
  systemAccessLevel: "medio",
  organizationalImpact: "medio",
  status: "active",
  criticalLevel: false,
};

export const departmentSchema = {
  name: "",
  internalCode: "",
  companyId: "",
  parentDepartmentId: "",
  departmentHead: "",
  departmentType: "soporte",
  levelId: "",
  locationId: "",
  costCenter: "",
  budget: "",
  estimatedTeamSize: "",
  description: "",
  status: "active",
  criticalDepartment: false,
  visibleInRecruitment: true,
  visibleInEmployees: true,
};

export const locationSchema = {
  name: "",
  companyId: "",
  locationType: "office",
  status: "active",
  countryCode: "",
  country: "",
  regionState: "",
  city: "",
  fullAddress: "",
  postalCode: "",
  timezone: "",
  currency: "BOB",
  primaryLanguage: "es",
  dateFormat: "DD/MM/YYYY",
  workWeek: "monday-friday",
  predominantContractType: "",
  laborRegulation: "",
  standardWorkingHours: "40",
  holidays: "",
  isPrimaryLocation: false,
  allowsRemoteWork: false,
  affectsPayroll: true,
};

export const entitySchema = {
  name: "",
  internalCode: "",
  description: "",
  relatedModule: "Employees",
  catalogType: "simple",
  userEditable: true,
  requiresApproval: false,
  status: "active",
  criticalCatalog: false,
  values: [],
};

export const companySchema = {
  legalName: "",
  tradeName: "",
  taxId: "",
  countryCode: "",
  country: "",
  industry: "",
  status: "active",
  corporateEmail: "",
  mainPhone: "",
  website: "",
  taxAddress: "",
  cityProvince: "",
  estimatedEmployees: "",
  defaultLanguage: "es",
  baseCurrency: "BOB",
  operationsStartDate: "",
  structureType: "principal",
};

export function validateCompanyForm(form) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.legalName?.trim()) {
    errors.legalName = "Ingresa el nombre legal de la compania.";
  }

  if (!form.taxId?.trim()) {
    errors.taxId = "Ingresa la identificacion fiscal de la compania.";
  }

  if (!form.countryCode?.trim()) {
    errors.countryCode = "Selecciona el pais de registro.";
  }

  if (!form.corporateEmail?.trim()) {
    errors.corporateEmail = "Ingresa un correo corporativo.";
  } else if (!emailPattern.test(form.corporateEmail.trim())) {
    errors.corporateEmail = "Ingresa un correo corporativo valido.";
  }

  if (!form.defaultLanguage?.trim()) {
    errors.defaultLanguage = "Selecciona el idioma predeterminado.";
  }

  if (form.estimatedEmployees !== "" && Number(form.estimatedEmployees) < 0) {
    errors.estimatedEmployees = "La cantidad estimada de empleados no puede ser negativa.";
  }

  return errors;
}

export function validatePositionForm(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Ingresa el nombre del puesto.";
  }

  if (!form.internalCode?.trim()) {
    errors.internalCode = "Define un codigo interno para reporting e integraciones.";
  }

  if (!form.departmentId?.trim()) {
    errors.departmentId = "Selecciona el departamento al que pertenece la posicion.";
  }

  if (!form.levelId?.trim()) {
    errors.levelId = "Selecciona el nivel organizacional.";
  }

  if (!form.locationId?.trim()) {
    errors.locationId = "Selecciona la ubicacion organizacional.";
  }

  if (!form.jobFamily?.trim()) {
    errors.jobFamily = "Define la familia de puesto.";
  }

  if (!form.businessRole?.trim()) {
    errors.businessRole = "Describe el rol del puesto dentro de la empresa.";
  }

  return errors;
}

export function validateLevelForm(form, existingLevels = []) {
  const errors = {};
  const normalizedName = form.name?.trim().toLowerCase();
  const normalizedCode = form.internalCode?.trim().toLowerCase();
  const hierarchyOrder = Number(form.hierarchyOrder);
  const salaryMin = Number(form.salaryMin);
  const salaryMax = Number(form.salaryMax);

  if (!form.name?.trim()) {
    errors.name = "Ingresa el nombre del nivel.";
  }

  if (existingLevels.some((item) => item.id !== form.id && item.name?.trim().toLowerCase() === normalizedName)) {
    errors.name = "Ya existe un nivel con ese nombre.";
  }

  if (form.internalCode?.trim() && existingLevels.some((item) => item.id !== form.id && (item.internalCode || item.code || "").trim().toLowerCase() === normalizedCode)) {
    errors.internalCode = "Ese codigo interno ya esta en uso.";
  }

  if (!Number.isFinite(hierarchyOrder) || hierarchyOrder <= 0) {
    errors.hierarchyOrder = "Define un orden jerarquico valido.";
  } else if (existingLevels.some((item) => item.id !== form.id && Number(item.hierarchyOrder) === hierarchyOrder)) {
    errors.hierarchyOrder = "El orden jerarquico debe ser unico.";
  }

  if (form.parentLevelId && form.parentLevelId === form.id) {
    errors.parentLevelId = "Un nivel no puede ser padre de si mismo.";
  }

  if (!Number.isFinite(salaryMin) || salaryMin < 0) {
    errors.salaryMin = "Ingresa un salario minimo valido.";
  }

  if (!Number.isFinite(salaryMax) || salaryMax <= 0) {
    errors.salaryMax = "Ingresa un salario maximo valido.";
  }

  if (Number.isFinite(salaryMin) && Number.isFinite(salaryMax) && salaryMin >= salaryMax) {
    errors.salaryMax = "El salario maximo debe ser mayor al minimo.";
  }

  if (!form.levelType?.trim()) {
    errors.levelType = "Selecciona el tipo de nivel.";
  }

  if (!form.seniority?.trim()) {
    errors.seniority = "Selecciona el seniority.";
  }

  return errors;
}

export function validateDepartmentForm(form, existingDepartments = []) {
  const errors = {};
  const normalizedName = form.name?.trim().toLowerCase();
  const normalizedCode = form.internalCode?.trim().toLowerCase();

  if (!form.name?.trim()) {
    errors.name = "Ingresa el nombre del departamento.";
  }

  if (existingDepartments.some((item) => item.id !== form.id && item.name?.trim().toLowerCase() === normalizedName)) {
    errors.name = "Ya existe un departamento con ese nombre.";
  }

  if (form.internalCode?.trim() && existingDepartments.some((item) => item.id !== form.id && (item.internalCode || item.code || "").trim().toLowerCase() === normalizedCode)) {
    errors.internalCode = "Ese codigo interno ya esta en uso.";
  }

  if (!form.companyId?.trim()) {
    errors.companyId = "Selecciona la empresa a la que pertenece el departamento.";
  }

  if (form.parentDepartmentId && form.parentDepartmentId === form.id) {
    errors.parentDepartmentId = "Un departamento no puede ser padre de si mismo.";
  }

  return errors;
}

export function validateLocationForm(form, existingLocations = []) {
  const errors = {};
  const normalizedName = form.name?.trim().toLowerCase();

  if (!form.name?.trim()) {
    errors.name = "Ingresa el nombre de la localizacion.";
  }

  if (existingLocations.some((item) => item.id !== form.id && item.name?.trim().toLowerCase() === normalizedName)) {
    errors.name = "Ya existe una localizacion con ese nombre.";
  }

  if (!form.companyId?.trim()) {
    errors.companyId = "Selecciona la empresa de la localizacion.";
  }

  if (!form.countryCode?.trim()) {
    errors.countryCode = "Selecciona el pais.";
  }

  if (!form.timezone?.trim()) {
    errors.timezone = "Selecciona una zona horaria.";
  }

  if (!form.city?.trim()) {
    errors.city = "Ingresa la ciudad.";
  }

  return errors;
}

export function validateEntityForm(form, existingEntities = []) {
  const errors = {};
  const normalizedName = form.name?.trim().toLowerCase();
  const normalizedCode = form.internalCode?.trim().toLowerCase();

  if (!form.name?.trim()) {
    errors.name = "Ingresa el nombre del catalogo.";
  }

  if (existingEntities.some((item) => item.id !== form.id && item.name?.trim().toLowerCase() === normalizedName)) {
    errors.name = "Ya existe un catalogo con ese nombre.";
  }

  if (form.internalCode?.trim() && existingEntities.some((item) => item.id !== form.id && (item.internalCode || item.code || "").trim().toLowerCase() === normalizedCode)) {
    errors.internalCode = "Ese codigo interno ya esta en uso.";
  }

  if (!form.relatedModule?.trim()) {
    errors.relatedModule = "Selecciona el modulo relacionado.";
  }

  return errors;
}

export function validateCatalogValue(formValue, entity) {
  const errors = {};
  const normalizedLabel = formValue.label?.trim().toLowerCase();
  const normalizedValue = formValue.value?.trim().toLowerCase();

  if (!formValue.label?.trim()) {
    errors.label = "Ingresa el valor del catalogo.";
  }

  if ((entity?.values || []).some((item) => item.id !== formValue.id && item.label?.trim().toLowerCase() === normalizedLabel)) {
    errors.label = "Ese valor ya existe dentro del catalogo.";
  }

  if (formValue.value?.trim() && (entity?.values || []).some((item) => item.id !== formValue.id && item.value?.trim().toLowerCase() === normalizedValue)) {
    errors.value = "Ese valor interno ya existe dentro del catalogo.";
  }

  return errors;
}
