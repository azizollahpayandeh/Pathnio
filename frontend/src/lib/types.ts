// Shared domain types for Pathnio fleet management.

export type ID = string;

export type VehicleStatus = "Active" | "Inactive" | "Maintenance";
export type VehicleType = "Truck" | "Van" | "Sedan" | "Pickup";

export interface Vehicle {
  id: ID;
  plate_number: string;
  vehicle_type: VehicleType;
  model: string;
  driver: string; // driver full name (denormalized for display)
  driverId?: ID;
  assignedDriverId?: ID | null; // active DriverVehicleAssignment driver (Phase 4)
  company: string;
  status: VehicleStatus;
  capacity: string;
  color: string;
  fuel_level: number; // 0..100
  odometer: number; // km
  efficiency: string; // e.g. "8.2 L/100km"
  last_maintenance: string; // ISO date
  total_trips: number;
  lat: number;
  lng: number;
  speed: number; // km/h (for live map)
  createdAt: string;
}

export type DriverStatus = "Active" | "Inactive" | "On Trip";

export interface Driver {
  id: ID;
  full_name: string;
  mobile: string;
  email: string;
  license_no: string;
  vehicle_type: VehicleType | "";
  plate_number: string;
  status: DriverStatus;
  rating: number; // 0..5
  total_trips: number;
  activated?: boolean; // has claimed a mobile login via invitation (Phase 3)
  joined_at: string; // ISO date
  avatar?: string;
  createdAt: string;
}

export type TripStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Trip {
  id: ID;
  origin: string;
  destination: string;
  driver: string; // display
  driver_ref?: ID | null; // real Driver FK id
  vehicle_ref?: ID | null; // real Vehicle FK id
  driverId?: ID;
  plate_number: string;
  vehicleId?: ID;
  distance: number; // km
  status: TripStatus;
  cargo: string;
  revenue: number; // currency units
  notes?: string;
  start_time: string; // ISO datetime
  end_time?: string; // ISO datetime
  createdAt: string;
}

// Backend-driven categories (Fuel/Maintenance/Tolls/Parking/Insurance/Salary/
// Repair/Other, extensible) — kept as string to avoid frontend/backend drift.
export type ExpenseCategory = string;
export type ExpenseStatus = "Paid" | "Pending";

export interface Expense {
  id: ID;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO date
  plate_number: string;
  vehicleId?: ID;
  driver: string;
  status: ExpenseStatus;
  description: string;
  createdAt: string;
}

export type AlertPriority = "low" | "medium" | "high" | "critical";

export interface Alert {
  id: ID;
  alert_type: string;
  title: string;
  message: string;
  priority: AlertPriority;
  read: boolean;
  timestamp: string; // ISO datetime
}

export type TicketStatus = "open" | "answered" | "closed";

export interface Ticket {
  id: ID;
  subject: string;
  message: string;
  reply?: string;
  status: TicketStatus;
  created_at: string;
  answered_at?: string;
}

export interface User {
  id: ID;
  company_name: string;
  manager_full_name: string;
  email: string;
  phone: string;
  address: string;
  password: string; // demo-only; stored locally in the browser
  role: "Manager" | "Admin";
  is_staff: boolean;
  is_manager: boolean;
  profile_photo?: string;
  date_joined: string;
}

export interface Settings {
  theme: "light" | "dark";
  language: "en" | "fa";
  primary_color: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface Database {
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  expenses: Expense[];
  alerts: Alert[];
  tickets: Ticket[];
  settings: Settings;
}
