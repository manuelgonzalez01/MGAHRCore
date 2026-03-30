import HealthStatusBadge from "./HealthStatusBadge";
import HealthTimeline from "./HealthTimeline";

export default function HealthCaseCard({ item }) {
  return (
    <article className="health-case-card">
      <div className="suite-head">
        <div>
          <h3>{item.employeeName}</h3>
          <p className="suite-muted">{item.title}</p>
        </div>
        <HealthStatusBadge status={item.status} />
      </div>
      <p className="suite-muted">{item.owner}</p>
      <p>{item.nextStep}</p>
      <HealthTimeline items={item.timeline || []} />
    </article>
  );
}
