import SkillLevelBadge from "./SkillLevelBadge";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function SkillGapTable({ items = [] }) {
  const { t } = useDevelopmentLocale();

  return (
    <div className="development-table-shell">
      <table className="development-table">
        <thead>
          <tr>
            <th>{t("Empleado", "Employee")}</th>
            <th>{t("Departamento", "Department")}</th>
            <th>{t("Habilidad requerida", "Required skill")}</th>
            <th>{t("Brecha", "Gap level")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.employeeId}-${item.skillName}`}>
              <td>{item.employeeName}</td>
              <td>{item.departmentName}</td>
              <td>{item.skillName}</td>
              <td><SkillLevelBadge level={item.level} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
