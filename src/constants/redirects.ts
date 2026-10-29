/**
 * The current site's addresses and where they live now (plan §5.3, D21):
 * moved for good (301), so search engines carry their standing over. Served
 * by next.config.ts; each is checked by a browser journey. A service's own
 * earlier slugs move on from inside the app (§8).
 */
export const OLD_SITE_REDIRECTS: readonly { source: string; destination: string }[] = [
  { source: "/about_us", destination: "/about" },
  { source: "/contact-us", destination: "/contact" },
  {
    source: "/service-detail/staffing-solution-of-hospital-and-clinics",
    destination: "/services/hospital-and-clinic-staffing",
  },
  { source: "/service-detail/school-nurse-staffing", destination: "/services/school-nurse-staffing" },
  { source: "/service-detail/home-care-nursing-services", destination: "/services/home-nursing-care" },
  { source: "/service-detail/chronic-patient-care", destination: "/services/chronic-condition-care" },
  { source: "/service-detail/child-care", destination: "/services/child-care" },
  { source: "/service-detail/maternity-and-newborn-care", destination: "/services/maternity-and-newborn-care" },
  { source: "/service-detail/palliative-care", destination: "/services/palliative-care" },
  { source: "/service-detail/elderly-care", destination: "/services/elderly-care" },
  // Any other old service address: the services, rather than a dead end.
  { source: "/service-detail/:slug*", destination: "/services" },
  { source: "/profile.pdf", destination: "/brochure" },
];
