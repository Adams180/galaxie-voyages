// Galaxie Voyages — network data.
// Routes are real corridors operated as round trips (aller-retour).
// Durations are approximate; confirm official timetables before print.

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
  amenities: "ac"[];
};

export const fleet: Coach[] = [
  { key: "vip", seats: 30, img: "/vehicles/coaster-vip-side.jpg", amenities: ["ac"] },
  { key: "classic", seats: 14, img: "/vehicles/hiace-vip-side.jpg", amenities: [] },
];

/** Service lines — keys map into dictionary.services.items */
export const services = ["vip", "standard", "organized", "charter"] as const;
export type Service = (typeof services)[number];

/** Full set for the dedicated /gallery page: 23 field photos + fleet highlights. */
export const galleryPageImages = [
  ...Array.from({ length: 57 }, (_, i) => `/gallery/g${String(i + 1).padStart(2, "0")}.jpg`),
  "/vehicles/fleet-lineup-day.jpg",
  "/vehicles/fleet-lineup-night.jpg",
  "/vehicles/vip-station.jpg",
  "/vehicles/coaster-vip-side.jpg",
  "/vehicles/vip-interior.jpg",
  "/vehicles/waiting-hall.jpg",
];

/** Curated vehicle photos for the home-page gallery teaser */
export const galleryImages = [
  "/vehicles/fleet-lineup-day.jpg",
  "/vehicles/fleet-lineup-night.jpg",
  "/vehicles/vip-station.jpg",
  "/vehicles/waiting-hall.jpg",
  "/vehicles/coaster-vip-side.jpg",
  "/vehicles/vip-interior.jpg",
  "/vehicles/coaster-boarding.jpg",
  "/vehicles/hiace-vip-side.jpg",
  "/vehicles/coaster-rear.jpg",
  "/vehicles/staff-coaster.jpg",
  "/vehicles/coaster-front.jpg",
  "/vehicles/routes-flyer.jpg",
];

export type AgencyPhone = { number: string; toCity?: string };
export type Agency = { city: string; area: string; phones: AgencyPhone[] };

const agencies: Agency[] = [
  {
    city: "Yaoundé",
    area: "Quartier Mvan · BP 7094",
    phones: [
      { number: "+237 697 16 22 32", toCity: "Ebolowa" },
      { number: "+237 676 63 96 97", toCity: "Mbalmayo" },
      { number: "+237 698 93 24 24", toCity: "Sangmélima" },
    ],
  },
  {
    city: "Ebolowa",
    area: "Ebolowa ville",
    phones: [{ number: "+237 679 50 79 01" }, { number: "+237 659 20 16 20" }],
  },
  {
    city: "Mbalmayo",
    area: "Mbalmayo ville",
    phones: [{ number: "+237 696 64 26 98" }],
  },
  {
    city: "Sangmélima",
    area: "Sangmélima ville",
    phones: [{ number: "+237 678 18 15 24" }],
  },
];

export const contact = {
  email: "ghfsarl@yahoo.com",
  phone: "+237 698 93 24 24",
  whatsapp: "+237 698 93 24 24",
  addressLine: "Quartier Mvan",
  city: "Yaoundé, Cameroun",
  poBox: "BP 7094, Yaoundé",
  agencies,
};


export const company = {
  founded: 2016,
  parent: "GHF SARL",
  stats: {
    routes: routes.length,
    cities: cities.length,
    passengersPerYear: "150 000+",
    onTime: "96%",
  },
};

