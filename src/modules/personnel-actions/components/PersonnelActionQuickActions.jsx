export default function PersonnelActionQuickActions({ item, onTransition, t }) {
  if (!item) {
    return null;
  }

  return (
    <section className="suite-card">
      <h2>{t("Acciones de workflow", "Workflow actions")}</h2>
      <div className="personnel-action-buttons">
        {item.allowedActions.map((action) => (
          <button key={action} className="suite-button-secondary" type="button" onClick={() => onTransition(action)}>
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
