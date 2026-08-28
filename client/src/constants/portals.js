/**
 * Government portals a citizen ends up dealing with on the way to a document.
 *
 * These are NOMINATIVE references — we name the portals we help people
 * navigate. They are not partners, sponsors or endorsers, and Citizen Assist
 * holds no affiliation with any of them. The strip that renders these carries
 * that statement in visible text; do not remove it, and do not add any badge,
 * tick or "verified by" treatment to these marks.
 *
 * Drop the artwork in `client/public/logos/` using the filenames below. Until
 * a file exists the strip falls back to the portal's name as text, so the
 * layout never breaks and the meaning never depends on the image loading.
 */
export const PORTALS = [
  { id: 'digilocker', name: 'DigiLocker', logo: '/logos/digilocker.png' },
  { id: 'uidai', name: 'Aadhaar / UIDAI', logo: '/logos/uidai.png' },
  { id: 'nsdl', name: 'NSDL', logo: '/logos/nsdl.png' },
  { id: 'e-district', name: 'e-District', logo: '/logos/e-district.png' },
  { id: 'india-gov', name: 'India.gov.in', logo: '/logos/india-gov.png' },
];
