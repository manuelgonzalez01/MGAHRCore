export default function RequisitionValidationAlert({ title, errors = [] }) {
  if (!errors.length) {
    return null;
  }

  return (
    <section className="requisition-alert">
      <strong>{title}</strong>
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </section>
  );
}
