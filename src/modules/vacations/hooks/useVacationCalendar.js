import { useEffect, useState } from "react";
import vacationCalendarService from "../services/vacationCalendar.service";

export default function useVacationCalendar() {
  const [workspace, setWorkspace] = useState({ calendar: [], conflicts: [], plans: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    vacationCalendarService.getVacationCalendarWorkspace().then((data) => {
      if (!ignore) {
        setWorkspace(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  return {
    ...workspace,
    loading,
  };
}
