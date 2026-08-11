import type { Database } from "./types";

// The Pathnio app is fully backed by the real API. This local store now holds
// ONLY client UI preferences (theme/language) — NO operational fake data.
// All fleet data (drivers, vehicles, trips, expenses, alerts) comes from the
// backend. Kept so components that read UI prefs keep working.
export function createSeedDatabase(): Database {
  return {
    users: [],
    vehicles: [],
    drivers: [],
    trips: [],
    expenses: [],
    alerts: [],
    tickets: [],
    settings: {
      theme: "light",
      language: "en",
      primary_color: "#7c3aed",
      email_notifications: true,
      push_notifications: true,
    },
  };
}
