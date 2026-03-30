export default function EmployeeFeedbackBanner({ tone = "success", children }) {
  return <div className={`employees-feedback employees-feedback--${tone}`}>{children}</div>;
}
