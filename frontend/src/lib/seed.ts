import type { Database, Vehicle, Driver, Trip, Expense, Alert } from "./types";

// Deterministic demo dataset so the app feels alive on first load.
// Everything is persisted to localStorage after the first seed, so the user's
// own additions/edits survive reloads.

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 3600000).toISOString();

const DRIVERS: Driver[] = [
  ["Amir Rezaei", "+49 151 2345 6701", "Truck", "12-A-345", "On Trip", 4.8, 156],
  ["Sara Ahmadi", "+49 151 2345 6702", "Van", "22-B-456", "Active", 4.6, 89],
  ["Mohammad Karimi", "+49 151 2345 6703", "Sedan", "33-C-567", "Active", 4.9, 234],
  ["Reza Mohammadi", "+49 151 2345 6704", "Truck", "44-D-678", "Inactive", 4.2, 198],
  ["Fatemeh Hosseini", "+49 151 2345 6705", "Van", "55-E-789", "Active", 4.7, 145],
  ["Hossein Alavi", "+49 151 2345 6706", "Pickup", "66-F-890", "On Trip", 4.4, 67],
  ["Maryam Jafari", "+49 151 2345 6707", "Truck", "77-G-901", "Active", 4.9, 267],
  ["Ali Naderi", "+49 151 2345 6708", "Van", "88-H-012", "Active", 4.5, 178],
  ["Zahra Kazemi", "+49 151 2345 6709", "Sedan", "99-I-123", "Inactive", 4.3, 123],
  ["Alireza Sadeghi", "+49 151 2345 6710", "Truck", "10-J-234", "On Trip", 4.8, 312],
].map((d, i) => ({
  id: `drv-${i + 1}`,
  full_name: d[0] as string,
  mobile: d[1] as string,
  email: `${(d[0] as string).toLowerCase().replace(/\s+/g, ".")}@pathnio.demo`,
  license_no: `DL-${100000 + i * 137}`,
  vehicle_type: d[2] as Driver["vehicle_type"],
  plate_number: d[3] as string,
  status: d[4] as Driver["status"],
  rating: d[5] as number,
  total_trips: d[6] as number,
  joined_at: daysAgo(30 + i * 24),
  createdAt: daysAgo(30 + i * 24),
}));

const VEHICLES: Vehicle[] = [
  ["12-A-345", "Truck", "Volvo FH16", "Active", "10 t", 85, 45230, "8.2 L/100km", 156, 52.52, 13.405, 62],
  ["22-B-456", "Van", "Mercedes Sprinter", "Active", "2 t", 45, 32150, "6.8 L/100km", 89, 52.5, 13.42, 0],
  ["33-C-567", "Sedan", "Toyota Camry", "Active", "5 t", 92, 67890, "7.1 L/100km", 234, 52.54, 13.39, 48],
  ["44-D-678", "Truck", "Scania R500", "Maintenance", "12 t", 12, 78450, "9.5 L/100km", 198, 52.51, 13.41, 0],
  ["55-E-789", "Van", "Ford Transit", "Active", "3 t", 78, 41200, "6.2 L/100km", 145, 52.53, 13.38, 55],
  ["66-F-890", "Pickup", "Ford Ranger", "Inactive", "1.5 t", 23, 28900, "7.8 L/100km", 67, 52.49, 13.43, 0],
  ["77-G-901", "Truck", "MAN TGX", "Active", "15 t", 95, 89120, "10.2 L/100km", 267, 52.55, 13.37, 71],
  ["88-H-012", "Van", "VW Crafter", "Active", "2.5 t", 67, 52340, "5.9 L/100km", 178, 52.48, 13.44, 40],
  ["99-I-123", "Sedan", "Honda Accord", "Maintenance", "5 t", 8, 38760, "7.3 L/100km", 123, 52.56, 13.36, 0],
  ["10-J-234", "Truck", "DAF XF", "Active", "20 t", 88, 95670, "11.5 L/100km", 312, 52.47, 13.45, 67],
  ["11-K-345", "Van", "Renault Master", "Active", "3 t", 54, 21430, "6.5 L/100km", 42, 52.57, 13.35, 33],
  ["12-L-456", "Pickup", "Toyota Hilux", "Active", "1.5 t", 71, 15600, "7.0 L/100km", 58, 52.46, 13.46, 29],
].map((v, i) => ({
  id: `veh-${i + 1}`,
  plate_number: v[0] as string,
  vehicle_type: v[1] as Vehicle["vehicle_type"],
  model: v[2] as string,
  driver: DRIVERS[i % DRIVERS.length].full_name,
  driverId: DRIVERS[i % DRIVERS.length].id,
  company: "Pathnio Logistics",
  status: v[3] as Vehicle["status"],
  capacity: v[4] as string,
  color: ["White", "Blue", "Black", "Red", "Green", "Gray", "Yellow", "Silver"][i % 8],
  fuel_level: v[5] as number,
  odometer: v[6] as number,
  efficiency: v[7] as string,
  total_trips: v[8] as number,
  last_maintenance: daysAgo(7 + i * 5),
  lat: v[9] as number,
  lng: v[10] as number,
  speed: v[11] as number,
  createdAt: daysAgo(60 + i * 10),
}));

const ROUTES: [string, string, number][] = [
  ["Berlin", "Hamburg", 289],
  ["Munich", "Frankfurt", 392],
  ["Cologne", "Stuttgart", 366],
  ["Berlin", "Leipzig", 190],
  ["Hamburg", "Bremen", 126],
  ["Frankfurt", "Nuremberg", 226],
  ["Dresden", "Berlin", 194],
  ["Stuttgart", "Munich", 233],
  ["Dortmund", "Cologne", 95],
  ["Hannover", "Berlin", 288],
  ["Munich", "Salzburg", 145],
  ["Berlin", "Rostock", 233],
];

const TRIP_STATUSES: Trip["status"][] = [
  "ACTIVE", "COMPLETED", "COMPLETED", "PLANNED", "ACTIVE",
  "COMPLETED", "CANCELLED", "COMPLETED", "PLANNED", "ACTIVE",
  "COMPLETED", "COMPLETED",
];

const TRIPS: Trip[] = ROUTES.map((r, i) => {
  const status = TRIP_STATUSES[i % TRIP_STATUSES.length];
  const start = hoursAgo(48 - i * 3);
  return {
    id: `trip-${i + 1}`,
    origin: r[0],
    destination: r[1],
    driver: DRIVERS[i % DRIVERS.length].full_name,
    driverId: DRIVERS[i % DRIVERS.length].id,
    plate_number: VEHICLES[i % VEHICLES.length].plate_number,
    vehicleId: VEHICLES[i % VEHICLES.length].id,
    distance: r[2],
    status,
    cargo: ["Electronics", "Furniture", "Food", "Machinery", "Textiles", "Auto parts"][i % 6],
    revenue: Math.round(r[2] * (3.2 + (i % 4) * 0.4)),
    start_time: start,
    end_time: status === "COMPLETED" ? hoursAgo(48 - i * 3 - 6) : undefined,
    createdAt: start,
  };
});

const EXP_CATS: Expense["category"][] = [
  "Fuel", "Maintenance", "Tolls", "Insurance", "Fuel", "Salary",
  "Fuel", "Maintenance", "Tolls", "Other", "Fuel", "Insurance",
  "Salary", "Fuel",
];

const EXPENSES: Expense[] = EXP_CATS.map((c, i) => {
  const amounts: Record<Expense["category"], number> = {
    Fuel: 120 + (i % 5) * 40,
    Maintenance: 450 + (i % 3) * 300,
    Tolls: 35 + (i % 4) * 10,
    Insurance: 890,
    Salary: 2400,
    Other: 180,
  };
  const veh = VEHICLES[i % VEHICLES.length];
  return {
    id: `exp-${i + 1}`,
    title: `${c} — ${veh.plate_number}`,
    category: c,
    amount: amounts[c],
    date: daysAgo(i * 2),
    plate_number: veh.plate_number,
    vehicleId: veh.id,
    driver: veh.driver,
    status: i % 3 === 0 ? "Pending" : "Paid",
    description: `${c} expense recorded for ${veh.model}.`,
    createdAt: daysAgo(i * 2),
  };
});

const ALERTS: Alert[] = [
  ["maintenance", "Maintenance due", "Vehicle 44-D-678 (Scania R500) is due for scheduled service.", "high"],
  ["fuel", "Low fuel warning", "Vehicle 99-I-123 fuel level dropped below 10%.", "critical"],
  ["trip", "Trip completed", "Amir Rezaei completed the Berlin → Hamburg route.", "low"],
  ["login", "New sign-in", "A new sign-in to your account was detected.", "medium"],
  ["driver", "Driver rating up", "Maryam Jafari's rating increased to 4.9.", "low"],
  ["expense", "Expense pending", "An insurance expense of €890 is awaiting approval.", "medium"],
].map((a, i) => ({
  id: `alr-${i + 1}`,
  alert_type: a[0] as string,
  title: a[1] as string,
  message: a[2] as string,
  priority: a[3] as Alert["priority"],
  read: i > 2,
  timestamp: hoursAgo(i * 5 + 1),
}));

export function createSeedDatabase(): Database {
  return {
    users: [
      {
        id: "user-demo",
        company_name: "Pathnio Logistics",
        manager_full_name: "Aziz Payandeh",
        email: "demo@pathnio.com",
        phone: "+49 151 0000 0000",
        address: "Alexanderplatz 1, 10178 Berlin, Germany",
        password: "demo1234",
        role: "Admin",
        is_staff: true,
        is_manager: true,
        date_joined: daysAgo(240),
      },
    ],
    vehicles: VEHICLES,
    drivers: DRIVERS,
    trips: TRIPS,
    expenses: EXPENSES,
    alerts: ALERTS,
    tickets: [
      {
        id: "tic-1",
        subject: "How do I export reports?",
        message: "I'd like to export monthly reports as PDF. Is that possible?",
        reply: "Yes! Head to Reports and use the Export button in the top-right.",
        status: "answered",
        created_at: daysAgo(4),
        answered_at: daysAgo(3),
      },
    ],
    settings: {
      theme: "light",
      language: "en",
      primary_color: "#7c3aed",
      email_notifications: true,
      push_notifications: true,
    },
  };
}
