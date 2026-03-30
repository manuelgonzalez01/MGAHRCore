import { lazy } from "react";

const DashboardPage = lazy(() => import("../../modules/dashboard/pages/DashboardPage"));
const RecruitmentHomePage = lazy(() => import("../../modules/recruitment/pages/RecruitmentHomePage"));
const JobRequestsPage = lazy(() => import("../../modules/recruitment/pages/JobRequestsPage"));
const CandidatesPage = lazy(() => import("../../modules/recruitment/pages/CandidatesPage"));
const InterviewsPage = lazy(() => import("../../modules/recruitment/pages/InterviewsPage"));
const RecruitmentEvaluationsPage = lazy(() => import("../../modules/recruitment/pages/EvaluationsPage"));
const EmployeesPage = lazy(() => import("../../modules/employees/pages/EmployeesPage"));
const EmployeeProfilePage = lazy(() => import("../../modules/employees/pages/EmployeeProfilePage"));
const EmployeeDocumentsPage = lazy(() => import("../../modules/employees/pages/EmployeeDocumentsPage"));
const DependentsPage = lazy(() => import("../../modules/employees/pages/DependentsPage"));
const AssignmentsPage = lazy(() => import("../../modules/employees/pages/AssignmentsPage"));
const StudiesPage = lazy(() => import("../../modules/employees/pages/StudiesPage"));
const ExperiencePage = lazy(() => import("../../modules/employees/pages/ExperiencePage"));
const PermissionsPage = lazy(() => import("../../modules/employees/pages/PermissionsPage"));
const LeavesPage = lazy(() => import("../../modules/employees/pages/LeavesPage"));
const SalaryAnalysisPage = lazy(() => import("../../modules/employees/pages/SalaryAnalysisPage"));
const ReportsHomePage = lazy(() => import("../../modules/reports/pages/ReportsHomePage"));
const HeadcountReportPage = lazy(() => import("../../modules/reports/pages/HeadcountReportPage"));
const RotationReportPage = lazy(() => import("../../modules/reports/pages/RotationReportPage"));
const SalaryReportsPage = lazy(() => import("../../modules/reports/pages/SalaryReportsPage"));
const TrainingReportsPage = lazy(() => import("../../modules/reports/pages/TrainingReportsPage"));
const LegalReportsPage = lazy(() => import("../../modules/reports/pages/LegalReportsPage"));
const VacationReportsWorkspacePage = lazy(() => import("../../modules/reports/pages/VacationReportsPage"));
const RecruitmentReportsPage = lazy(() => import("../../modules/reports/pages/RecruitmentReportsPage"));
const WorkforceRiskReportPage = lazy(() => import("../../modules/reports/pages/WorkforceRiskReportPage"));
const SelfServiceReportsPage = lazy(() => import("../../modules/reports/pages/SelfServiceReportsPage"));
const InsuranceReportsPage = lazy(() => import("../../modules/reports/pages/InsuranceReportsPage"));
const OccupationalHealthReportsPage = lazy(() => import("../../modules/reports/pages/OccupationalHealthReportsPage"));
const VacationsDashboardPage = lazy(() => import("../../modules/vacations/pages/VacationsDashboardPage"));
const VacationPoliciesPage = lazy(() => import("../../modules/vacations/pages/VacationPoliciesPage"));
const VacationBalancesPage = lazy(() => import("../../modules/vacations/pages/VacationBalancesPage"));
const VacationRequestsPage = lazy(() => import("../../modules/vacations/pages/VacationRequestsPage"));
const VacationRequestDetailsPage = lazy(() => import("../../modules/vacations/pages/VacationRequestDetailsPage"));
const VacationApprovalsPage = lazy(() => import("../../modules/vacations/pages/VacationApprovalsPage"));
const VacationPlanningPage = lazy(() => import("../../modules/vacations/pages/VacationPlanningPage"));
const VacationCalendarPage = lazy(() => import("../../modules/vacations/pages/VacationCalendarPage"));
const VacationConflictsPage = lazy(() => import("../../modules/vacations/pages/VacationConflictsPage"));
const VacationHistoryPage = lazy(() => import("../../modules/vacations/pages/VacationHistoryPage"));
const VacationReportsPage = lazy(() => import("../../modules/vacations/pages/VacationReportsPage"));
const DevelopmentHomePage = lazy(() => import("../../modules/development/pages/DevelopmentHomePage"));
const SkillsPage = lazy(() => import("../../modules/development/pages/SkillsPage"));
const DevelopmentEvaluationsPage = lazy(() => import("../../modules/development/pages/EvaluationsPage"));
const DevelopmentPlanPage = lazy(() => import("../../modules/development/pages/DevelopmentPlanPage"));
const DevelopmentTrainingPage = lazy(() => import("../../modules/development/pages/TrainingProgramsPage"));
const TalentReadinessPage = lazy(() => import("../../modules/development/pages/TalentReadinessPage"));
const DevelopmentDossierPage = lazy(() => import("../../modules/development/pages/DevelopmentDossierPage"));
const InsuranceHomePage = lazy(() => import("../../modules/Insurance/pages/InsuranceHomePage"));
const InsurancePlansPage = lazy(() => import("../../modules/Insurance/pages/InsurancePlansPage"));
const InsuranceInclusionPage = lazy(() => import("../../modules/Insurance/pages/InsuranceInclusionPage"));
const InsuranceExclusionPage = lazy(() => import("../../modules/Insurance/pages/InsuranceExclusionPage"));
const InsurancePlansDetailPage = lazy(() => import("../../modules/Insurance/pages/InsurancePlansDetailPage"));
const InsuranceWorkspaceReportsPage = lazy(() => import("../../modules/Insurance/pages/InsuranceReportsPage"));
const PersonnelActionsPage = lazy(() => import("../../modules/personnel-actions/pages/PersonnelActionsPage"));
const PersonnelActionsListPage = lazy(() => import("../../modules/personnel-actions/pages/PersonnelActionsListPage"));
const PersonnelActionDetailsPage = lazy(() => import("../../modules/personnel-actions/pages/PersonnelActionDetailsPage"));
const PromotionsPage = lazy(() => import("../../modules/personnel-actions/pages/PromotionsPage"));
const TransfersPage = lazy(() => import("../../modules/personnel-actions/pages/TransfersPage"));
const SalaryIncreasesPage = lazy(() => import("../../modules/personnel-actions/pages/SalaryIncreasesPage"));
const TerminationsPage = lazy(() => import("../../modules/personnel-actions/pages/TerminationsPage"));
const ExitLettersPage = lazy(() => import("../../modules/personnel-actions/pages/ExitLettersPage"));
const OccupationalHealthPage = lazy(() => import("../../modules/occupational-health/pages/OccupationalHealthPage"));
const InjuriesPage = lazy(() => import("../../modules/occupational-health/pages/InjuriesPage"));
const MedicalVisitsPage = lazy(() => import("../../modules/occupational-health/pages/MedicalVisitsPage"));
const LaboratoryTestsPage = lazy(() => import("../../modules/occupational-health/pages/LaboratoryTestsPage"));
const MedicinesControlPage = lazy(() => import("../../modules/occupational-health/pages/MedicinesControlPage"));
const PregnantEmployeesPage = lazy(() => import("../../modules/occupational-health/pages/PregnantEmployeesPage"));
const HealthReportsPage = lazy(() => import("../../modules/occupational-health/pages/HealthReportsPage"));
const AdministrationPage = lazy(() => import("../../modules/administration/pages/AdministrationPage"));
const UsersPage = lazy(() => import("../../modules/administration/pages/UsersPage"));
const RolesPermissionsPage = lazy(() => import("../../modules/administration/pages/RolesPermissionsPage"));
const AuthorizationFlowsPage = lazy(() => import("../../modules/administration/pages/AuthorizationFlowsPage"));
const CompaniesPage = lazy(() => import("../../modules/administration/pages/CompaniesPage"));
const PositionsPage = lazy(() => import("../../modules/administration/pages/PositionsPage"));
const LevelsPage = lazy(() => import("../../modules/administration/pages/LevelsPage"));
const DepartmentsPage = lazy(() => import("../../modules/administration/pages/DepartmentsPage"));
const LocationsPage = lazy(() => import("../../modules/administration/pages/LocationsPage"));
const EntitiesPage = lazy(() => import("../../modules/administration/pages/EntitiesPage"));
const SettingsPage = lazy(() => import("../../modules/administration/pages/SettingsPage"));
const SelfServicePage = lazy(() => import("../../modules/self-service/pages/SelfServicePage"));
const SelfServiceRequestsPage = lazy(() => import("../../modules/self-service/pages/RequestsPage"));
const SelfServiceVacationRequestsPage = lazy(() => import("../../modules/self-service/pages/VacationRequestsPage"));
const SelfServicePermissionRequestsPage = lazy(() => import("../../modules/self-service/pages/PermissionsRequestsPage"));
const SelfServiceApprovalsPage = lazy(() => import("../../modules/self-service/pages/ApprovalsPage"));

export const appRouteSections = [
  {
    key: "dashboard",
    labelKey: "menu.dashboard",
    icon: "LayoutDashboard",
    path: "/dashboard",
    routes: [{ path: "dashboard", component: DashboardPage }],
  },
  {
    key: "recruitment",
    labelKey: "menu.recruitment",
    path: "/recruitment",
    routes: [
      { path: "recruitment", component: RecruitmentHomePage },
      { path: "recruitment/job-requests", component: JobRequestsPage },
      { path: "recruitment/candidates", component: CandidatesPage },
      { path: "recruitment/interviews", component: InterviewsPage },
      { path: "recruitment/evaluations", component: RecruitmentEvaluationsPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.recruitmentHome", path: "/recruitment" },
      { key: "job-requests", labelKey: "menu.recruitmentJobRequests", path: "/recruitment/job-requests" },
      { key: "candidates", labelKey: "menu.recruitmentCandidates", path: "/recruitment/candidates" },
      { key: "interviews", labelKey: "menu.recruitmentInterviews", path: "/recruitment/interviews" },
      { key: "evaluations", labelKey: "menu.recruitmentEvaluations", path: "/recruitment/evaluations" },
    ],
  },
  {
    key: "employees",
    labelKey: "menu.employees",
    path: "/employees",
    routes: [
      { path: "employees", component: EmployeesPage },
      { path: "employees/profile", component: EmployeeProfilePage },
      { path: "employees/documents", component: EmployeeDocumentsPage },
      { path: "employees/dependents", component: DependentsPage },
      { path: "employees/assignments", component: AssignmentsPage },
      { path: "employees/studies", component: StudiesPage },
      { path: "employees/experience", component: ExperiencePage },
      { path: "employees/permissions", component: PermissionsPage },
      { path: "employees/leaves", component: LeavesPage },
      { path: "employees/salary-analysis", component: SalaryAnalysisPage },
    ],
    menuChildren: [
      { key: "list", labelKey: "menu.employeesList", path: "/employees" },
      { key: "profile", labelKey: "menu.employeesProfile", path: "/employees/profile" },
      { key: "documents", labelKey: "menu.employeesDocuments", path: "/employees/documents" },
      { key: "dependents", labelKey: "menu.employeesDependents", path: "/employees/dependents" },
      { key: "assignments", labelKey: "menu.employeesAssignments", path: "/employees/assignments" },
      { key: "studies", labelKey: "menu.employeesStudies", path: "/employees/studies" },
      { key: "experience", labelKey: "menu.employeesExperience", path: "/employees/experience" },
      { key: "permissions", labelKey: "menu.employeesPermissions", path: "/employees/permissions" },
      { key: "leaves", labelKey: "menu.employeesLeaves", path: "/employees/leaves" },
      { key: "salary-analysis", labelKey: "menu.employeesSalaryAnalysis", path: "/employees/salary-analysis" },
    ],
  },
  {
    key: "reports",
    labelKey: "menu.reports",
    path: "/reports",
    routes: [
      { path: "reports", component: ReportsHomePage },
      { path: "reports/headcount", component: HeadcountReportPage },
      { path: "reports/rotation", component: RotationReportPage },
      { path: "reports/salary", component: SalaryReportsPage },
      { path: "reports/training", component: TrainingReportsPage },
      { path: "reports/legal", component: LegalReportsPage },
      { path: "reports/vacations", component: VacationReportsWorkspacePage },
      { path: "reports/recruitment", component: RecruitmentReportsPage },
      { path: "reports/workforce-risk", component: WorkforceRiskReportPage },
      { path: "reports/self-service", component: SelfServiceReportsPage },
      { path: "reports/insurance", component: InsuranceReportsPage },
      { path: "reports/occupational-health", component: OccupationalHealthReportsPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.reportsHome", path: "/reports" },
      { key: "headcount", labelKey: "menu.reportsHeadcount", path: "/reports/headcount" },
      { key: "rotation", labelKey: "menu.reportsRotation", path: "/reports/rotation" },
      { key: "salary", labelKey: "menu.reportsSalary", path: "/reports/salary" },
      { key: "training", labelKey: "menu.reportsTraining", path: "/reports/training" },
      { key: "legal", labelKey: "menu.reportsLegal", path: "/reports/legal" },
      { key: "vacations", labelKey: "menu.reportsVacations", path: "/reports/vacations" },
      { key: "recruitment", labelKey: "menu.reportsRecruitment", path: "/reports/recruitment" },
      { key: "workforce-risk", labelKey: "menu.reportsWorkforceRisk", path: "/reports/workforce-risk" },
      { key: "self-service", labelKey: "menu.reportsSelfService", path: "/reports/self-service" },
      { key: "insurance", labelKey: "menu.reportsInsurance", path: "/reports/insurance" },
      { key: "occupational-health", labelKey: "menu.reportsOccupationalHealth", path: "/reports/occupational-health" },
    ],
  },
  {
    key: "vacations",
    labelKey: "menu.vacations",
    path: "/vacations",
    routes: [
      { path: "vacations", component: VacationsDashboardPage },
      { path: "vacations/policies", component: VacationPoliciesPage },
      { path: "vacations/balances", component: VacationBalancesPage },
      { path: "vacations/requests", component: VacationRequestsPage },
      { path: "vacations/requests/:id", component: VacationRequestDetailsPage },
      { path: "vacations/approvals", component: VacationApprovalsPage },
      { path: "vacations/planning", component: VacationPlanningPage },
      { path: "vacations/calendar", component: VacationCalendarPage },
      { path: "vacations/conflicts", component: VacationConflictsPage },
      { path: "vacations/history", component: VacationHistoryPage },
      { path: "vacations/reports", component: VacationReportsPage },
    ],
    menuChildren: [
      { key: "dashboard", labelKey: "menu.vacationsDashboard", path: "/vacations" },
      { key: "policies", labelKey: "menu.vacationsPolicies", path: "/vacations/policies" },
      { key: "balances", labelKey: "menu.vacationsBalances", path: "/vacations/balances" },
      { key: "requests", labelKey: "menu.vacationsRequests", path: "/vacations/requests" },
      { key: "approvals", labelKey: "menu.vacationsApprovals", path: "/vacations/approvals" },
      { key: "planning", labelKey: "menu.vacationsPlanning", path: "/vacations/planning" },
      { key: "calendar", labelKey: "menu.vacationsCalendar", path: "/vacations/calendar" },
      { key: "conflicts", labelKey: "menu.vacationsConflicts", path: "/vacations/conflicts" },
      { key: "history", labelKey: "menu.vacationsHistory", path: "/vacations/history" },
      { key: "reports", labelKey: "menu.vacationsReports", path: "/vacations/reports" },
    ],
  },
  {
    key: "development",
    labelKey: "menu.development",
    path: "/development",
    routes: [
      { path: "development", component: DevelopmentHomePage },
      { path: "development/skills", component: SkillsPage },
      { path: "development/evaluations", component: DevelopmentEvaluationsPage },
      { path: "development/plan", component: DevelopmentPlanPage },
      { path: "development/training", component: DevelopmentTrainingPage },
      { path: "development/readiness", component: TalentReadinessPage },
      { path: "development/dossier", component: DevelopmentDossierPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.developmentHome", path: "/development" },
      { key: "skills", labelKey: "menu.developmentSkills", path: "/development/skills" },
      { key: "evaluations", labelKey: "menu.developmentEvaluations", path: "/development/evaluations" },
      { key: "plan", labelKey: "menu.developmentPlan", path: "/development/plan" },
      { key: "training", labelKey: "menu.developmentTraining", path: "/development/training" },
      { key: "readiness", labelKey: "menu.developmentReadiness", path: "/development/readiness" },
      { key: "dossier", labelKey: "menu.developmentDossier", path: "/development/dossier" },
    ],
  },
  {
    key: "insurance",
    labelKey: "menu.insurance",
    path: "/insurance",
    routes: [
      { path: "insurance", component: InsuranceHomePage },
      { path: "insurance/plans", component: InsurancePlansPage },
      { path: "insurance/inclusion", component: InsuranceInclusionPage },
      { path: "insurance/exclusion", component: InsuranceExclusionPage },
      { path: "insurance/plans/:planId", component: InsurancePlansDetailPage },
      { path: "insurance/reports", component: InsuranceWorkspaceReportsPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.insuranceHome", path: "/insurance" },
      { key: "plans", labelKey: "menu.insurancePlans", path: "/insurance/plans" },
      { key: "inclusion", labelKey: "menu.insuranceInclusion", path: "/insurance/inclusion" },
      { key: "exclusion", labelKey: "menu.insuranceExclusion", path: "/insurance/exclusion" },
      { key: "reports", labelKey: "menu.insuranceReports", path: "/insurance/reports" },
    ],
  },
  {
    key: "personnel-actions",
    labelKey: "menu.personnelActions",
    path: "/personnel-actions",
    routes: [
      { path: "personnel-actions", component: PersonnelActionsPage },
      { path: "personnel-actions/list", component: PersonnelActionsListPage },
      { path: "personnel-actions/:id", component: PersonnelActionDetailsPage },
      { path: "personnel-actions/promotions", component: PromotionsPage },
      { path: "personnel-actions/transfers", component: TransfersPage },
      { path: "personnel-actions/salary-increases", component: SalaryIncreasesPage },
      { path: "personnel-actions/terminations", component: TerminationsPage },
      { path: "personnel-actions/exit-letters", component: ExitLettersPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.personnelActionsHome", path: "/personnel-actions" },
      { key: "list", labelKey: "menu.personnelActionsList", path: "/personnel-actions/list" },
      { key: "promotions", labelKey: "menu.personnelPromotions", path: "/personnel-actions/promotions" },
      { key: "transfers", labelKey: "menu.personnelTransfers", path: "/personnel-actions/transfers" },
      { key: "salary-increases", labelKey: "menu.personnelSalaryIncreases", path: "/personnel-actions/salary-increases" },
      { key: "terminations", labelKey: "menu.personnelTerminations", path: "/personnel-actions/terminations" },
      { key: "exit-letters", labelKey: "menu.personnelExitLetters", path: "/personnel-actions/exit-letters" },
    ],
  },
  {
    key: "occupational-health",
    labelKey: "menu.occupationalHealth",
    path: "/occupational-health",
    routes: [
      { path: "occupational-health", component: OccupationalHealthPage },
      { path: "occupational-health/injuries", component: InjuriesPage },
      { path: "occupational-health/medical-visits", component: MedicalVisitsPage },
      { path: "occupational-health/laboratory-tests", component: LaboratoryTestsPage },
      { path: "occupational-health/medicines", component: MedicinesControlPage },
      { path: "occupational-health/pregnant-employees", component: PregnantEmployeesPage },
      { path: "occupational-health/reports", component: HealthReportsPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.occupationalHealthHome", path: "/occupational-health" },
      { key: "injuries", labelKey: "menu.occupationalHealthInjuries", path: "/occupational-health/injuries" },
      { key: "medical-visits", labelKey: "menu.occupationalHealthMedicalVisits", path: "/occupational-health/medical-visits" },
      { key: "laboratory-tests", labelKey: "menu.occupationalHealthLabTests", path: "/occupational-health/laboratory-tests" },
      { key: "medicines", labelKey: "menu.occupationalHealthMedicines", path: "/occupational-health/medicines" },
      { key: "pregnant", labelKey: "menu.occupationalHealthPregnant", path: "/occupational-health/pregnant-employees" },
      { key: "reports", labelKey: "menu.occupationalHealthReports", path: "/occupational-health/reports" },
    ],
  },
  {
    key: "administration",
    labelKey: "menu.administration",
    path: "/administration",
    routes: [
      { path: "administration", component: AdministrationPage },
      { path: "administration/users", component: UsersPage },
      { path: "administration/roles", component: RolesPermissionsPage },
      { path: "administration/authorization-flows", component: AuthorizationFlowsPage },
      { path: "administration/companies", component: CompaniesPage },
      { path: "administration/positions", component: PositionsPage },
      { path: "administration/levels", component: LevelsPage },
      { path: "administration/departments", component: DepartmentsPage },
      { path: "administration/locations", component: LocationsPage },
      { path: "administration/entities", component: EntitiesPage },
      { path: "administration/settings", component: SettingsPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.administrationHome", path: "/administration" },
      { key: "users", labelKey: "menu.administrationUsers", path: "/administration/users" },
      { key: "roles", labelKey: "menu.administrationRoles", path: "/administration/roles" },
      { key: "authorization-flows", labelKey: "menu.administrationAuthorizationFlows", path: "/administration/authorization-flows" },
      { key: "companies", labelKey: "menu.administrationCompanies", path: "/administration/companies" },
      { key: "positions", labelKey: "menu.administrationPositions", path: "/administration/positions" },
      { key: "levels", labelKey: "menu.administrationLevels", path: "/administration/levels" },
      { key: "departments", labelKey: "menu.administrationDepartments", path: "/administration/departments" },
      { key: "locations", labelKey: "menu.administrationLocations", path: "/administration/locations" },
      { key: "entities", labelKey: "menu.administrationEntities", path: "/administration/entities" },
      { key: "settings", labelKey: "menu.administrationSettings", path: "/administration/settings" },
    ],
  },
  {
    key: "self-service",
    labelKey: "menu.selfService",
    path: "/self-service",
    routes: [
      { path: "self-service", component: SelfServicePage },
      { path: "self-service/requests", component: SelfServiceRequestsPage },
      { path: "self-service/vacation-requests", component: SelfServiceVacationRequestsPage },
      { path: "self-service/permission-requests", component: SelfServicePermissionRequestsPage },
      { path: "self-service/approvals", component: SelfServiceApprovalsPage },
    ],
    menuChildren: [
      { key: "home", labelKey: "menu.selfService", path: "/self-service" },
      { key: "requests", labelKey: "menu.selfServiceRequests", path: "/self-service/requests" },
      { key: "permission-requests", labelKey: "menu.selfServicePermissionRequests", path: "/self-service/permission-requests" },
      { key: "vacation-requests", labelKey: "menu.selfServiceVacationRequests", path: "/self-service/vacation-requests" },
      { key: "approvals", labelKey: "menu.selfServiceApprovals", path: "/self-service/approvals" },
    ],
  },
];

export const appRoutes = appRouteSections.flatMap((section) => section.routes);

export const menuConfig = appRouteSections.map((section) => ({
  key: section.key,
  labelKey: section.labelKey,
  icon: section.icon,
  path: section.path,
  children: section.menuChildren || undefined,
}));
