import { currentSite } from "./photos";

const LOGOS = "https://alhidaya.qa/application/public/images/clients/";

/**
 * The client logos on the client's current site (alhidaya.qa, D118), in its
 * order: each file in `src/db/seed/clients/`, the organisation's name (its
 * logo's alt text too), and where it came from. Seeded as drafts, like all
 * the seed; each is shown only once the client confirms it may be (D7).
 */
export const SEED_CLIENTS = [
  { file: "the-view-hospital.jpg", name: "The View Hospital", source: currentSite(`${LOGOS}1.jpg`) },
  { file: "snow-white-nursery.jpg", name: "Snow White Nursery", source: currentSite(`${LOGOS}2.jpg`) },
  { file: "royal-dental-centre.jpg", name: "Royal Dental Centre", source: currentSite(`${LOGOS}3.jpg`) },
  {
    file: "pioneers-international-kindergarten.jpg",
    name: "Pioneers International Kindergarten",
    source: currentSite(`${LOGOS}4.jpg`),
  },
  { file: "manzil-nursery.jpg", name: "Manzil Nursery", source: currentSite(`${LOGOS}5.jpg`) },
  { file: "hamad-medical-corporation.jpg", name: "Hamad Medical Corporation", source: currentSite(`${LOGOS}7.jpg`) },
  {
    file: "military-medical-city-hospital.jpg",
    name: "Military Medical City Hospital",
    source: currentSite(`${LOGOS}8.jpg`),
  },
  { file: "estithmar-holding.jpg", name: "Estithmar Holding", source: currentSite(`${LOGOS}9.jpg`) },
  { file: "dreamers-nursery.jpg", name: "Dreamers Nursery", source: currentSite(`${LOGOS}10.jpg`) },
  { file: "al-tahrir-medical-center.jpg", name: "Al Tahrir Medical Center", source: currentSite(`${LOGOS}11.jpg`) },
  { file: "nabedh-medical-center.jpg", name: "Nabedh Medical Center", source: currentSite(`${LOGOS}12.jpg`) },
] as const;
