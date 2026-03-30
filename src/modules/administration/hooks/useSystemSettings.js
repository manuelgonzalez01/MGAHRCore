import { useEffect, useState } from "react";
import administrationService from "../services/administration.service";

export default function useSystemSettings() {
  const [settings, setSettings] = useState(null);
  const [auditFeed, setAuditFeed] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const [nextSettings, nextAuditFeed, nextHealthChecks] = await Promise.all([
        administrationService.getSettings(),
        administrationService.getAuditFeed(),
        administrationService.getHealthChecks(),
      ]);

      if (!ignore) {
        setSettings(nextSettings);
        setAuditFeed(nextAuditFeed);
        setHealthChecks(nextHealthChecks);
        setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [version]);

  async function saveSettings(payload) {
    const next = await administrationService.saveSettings(payload);
    setSettings(next);
    setVersion((current) => current + 1);
    return next;
  }

  return { settings, auditFeed, healthChecks, loading, saveSettings, refresh: () => setVersion((current) => current + 1) };
}
