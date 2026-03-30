import "../../shared/hrSuite.css";
import TeamCoveragePanel from "../components/TeamCoveragePanel";
import VacationCalendarBoard from "../components/VacationCalendarBoard";
import VacationsHeader from "../components/VacationsHeader";
import useVacationCalendar from "../hooks/useVacationCalendar";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationCalendarPage() {
  const { copy } = useVacationLocale();
  const { loading, calendar, conflicts } = useVacationCalendar();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingCalendar}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.calendarEyebrow} title={copy.calendarTitle} description={copy.calendarDescription} />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationCalendarBoard events={calendar} />
        </div>
        <div className="suite-rail">
          <TeamCoveragePanel conflicts={conflicts} />
        </div>
      </section>
    </main>
  );
}
