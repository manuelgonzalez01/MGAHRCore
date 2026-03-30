import useReportsLocale from "../hooks/useReportsLocale";

export default function TrainingCompliancePanel({ records = [] }) {
  const { t } = useReportsLocale();

  return (
    <div className="reports-list">
      {records.map((item) => (
        <article key={item.employeeId}>
          <strong>{item.employeeName}</strong>
          <p className="reports-muted">{item.departmentName} | {item.positionName}</p>
          <p className="reports-muted">{t("Avance", "Completion")} {item.completion}% | {t("Gap", "Gap")} {item.readinessGap}% | {t("Activos", "Assets")} {item.learningAssets}</p>
        </article>
      ))}
    </div>
  );
}
