// Galaxie Voyages — network data.
// Routes are REAL corridors (confirmed against TMS-X fleet pools: MAIN,
// EBWA_SANG, YDE_SANG). All routes are operated as round trips (aller-retour).
// ⚠️ Fares and durations below are APPROXIMATE PLACEHOLDERS — confirm and
// replace with official values before production.

export type Route = {
  /** short corridor code, mirrors TMS-X fleet pools where applicable */
  code: string;
  a: string;
  b: string;
  /** approximate travel time, hours */
  hours: number;
  /** daily departure times (24h), applies both directions */
  departures: string[];
  popular?: boolean;
};

export const routes: Route[] = [
  { code: "YDE-MBA", a: "Yaoundé", b: "Mbalmayo", hours: 1, departures: ["06:30", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"], popular: true },
  { code: "YDE-EBWA", a: "Yaoundé", b: "Ebolowa", hours: 2.5, departures: ["06:00", "09:00", "12:00", "15:00", "17:30"], popular: true },
  { code: "YDE-SANG", a: "Yaoundé", b: "Sangmélima", hours: 3, departures: ["06:00", "10:00", "14:00", "17:00"], popular: true },
  { code: "EBWA-SANG", a: "Ebolowa", b: "Sangmélima", hours: 1.5, departures: ["07:30", "11:00", "15:30"] },
];

export const cities = Array.from(
  new Set(routes.flatMap((r) => [r.a, r.b])),
).sort();

export type Coach = {
  /** translation key into dictionary.fleet.classes */
  key: "vip" | "classic";
  seats: number;
  img: string;
  amenities: ("ac" | "wifi" | "usb" | "reclining" | "tv" | "snack")[];
};

export const fleet: Coach[] = [
  { key: "vip", seats: 30, img: "/vehicles/coaster-vip-side.jpg", amenities: ["ac", "wifi", "usb", "reclining", "tv", "snack"] },
  { key: "classic", seats: 14, img: "/vehicles/hiace-vip-side.jpg", amenities: ["ac", "usb", "reclining"] },
];

/** Service lines — keys map into dictionary.services.items */
export const services = ["vip", "standard", "organized", "charter"] as const;
export type Service = (typeof services)[number];

/** Curated vehicle photos for the gallery */
export const galleryImages = [
  "/vehicles/coaster-vip-side.jpg",
  "/vehicles/coaster-front.jpg",
  "/vehicles/hiace-vip-side.jpg",
  "/vehicles/hiace-front.jpg",
  "/vehicles/coaster-boarding.jpg",
  "/vehicles/staff-coaster.jpg",
  "/vehicles/hiace-agency.jpg",
  "/vehicles/routes-flyer.jpg",
];

export const contact = {
  email: "ghfsarl@yahoo.com",
  // ⚠️ phone numbers are PLACEHOLDERS — replace with real values
  phone: "+237 6 00 00 00 00",
  whatsapp: "+237 6 00 00 00 00",
  addressLine: "Quartier Mvan",
  city: "Yaoundé, Cameroun",
  agencies: [
    { city: "Yaoundé", area: "Quartier Mvan (siège)", phone: "+237 6 00 00 00 01" },
    { city: "Mbalmayo", area: "Centre-ville", phone: "+237 6 00 00 00 02" },
    { city: "Ebolowa", area: "Gare routière", phone: "+237 6 00 00 00 03" },
    { city: "Sangmélima", area: "Centre-ville", phone: "+237 6 00 00 00 04" },
  ],
};

export const company = {
  founded: 2015,
  parent: "GHF SARL",
  stats: {
    routes: routes.length,
    cities: cities.length,
    passengersPerYear: "150 000+",
    onTime: "96%",
  },
};

