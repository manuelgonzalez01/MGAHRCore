export default function RequisitionFormSection({
  eyebrow,
  title,
  description,
  children,
  aside,
}) {
  return (
    <section className="requisition-form-section">
      <div className="requisition-form-section__head">
        <div>
          <span className="requisition-form-section__eyebrow">{eyebrow}</span>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {aside ? <div className="requisition-form-section__aside">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}
