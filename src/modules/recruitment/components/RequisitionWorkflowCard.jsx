export default function RequisitionWorkflowCard({ title, steps = [] }) {
  return (
    <section className="requisition-card">
      <div className="requisition-card__header">
        <h3>{title}</h3>
      </div>
      <div className="requisition-workflow">
        {steps.map((step) => (
          <article key={step.id} className={`requisition-workflow__step state-${step.state}`}>
            <span className="requisition-workflow__dot" />
            <div>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
