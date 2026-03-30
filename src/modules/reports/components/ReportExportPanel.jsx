import useReportsLocale from "../hooks/useReportsLocale";

export default function ReportExportPanel({ exportState, onExport }) {
  const { t } = useReportsLocale();

  return (
    <section className="reports-export">
      <div className="reports-export__head">
        <div>
          <h3>{t("Exportacion y salida", "Export and output")}</h3>
          <p className="reports-muted">{t("Prepara la salida ejecutiva del reporte en los formatos disponibles.", "Prepare the executive report output in the available formats.")}</p>
        </div>
        <div className="reports-export__actions">
          <button type="button" className="reports-button" onClick={() => onExport("xlsx")}>{t("Exportar XLSX", "Export XLSX")}</button>
          <button type="button" className="reports-button--secondary" onClick={() => onExport("pdf")}>{t("Exportar PDF", "Export PDF")}</button>
        </div>
      </div>
      {exportState ? <p className="reports-muted">{exportState.message} {t("Archivo", "File")}: {exportState.fileName}</p> : null}
    </section>
  );
}
