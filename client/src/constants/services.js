/**
 * The six services Citizen Assist launches with.
 *
 * `charge` and `timeline` are indicative ranges authored for this build, not
 * live figures — the landing page states that plainly beside the grid, and the
 * agent confirms the exact amount before a citizen commits. Do not present
 * them as quoted prices.
 *
 * `tone` selects the card's surface on the landing grid. The accented cards
 * land on positions 1, 3 and 5 of a three-across layout, so no row reads as a
 * matching set while the structure stays a plain grid.
 *
 * `documents` are keys into constants/documents.js. `issuedBy` names the office
 * that actually issues the certificate — required on every detail page,
 * because that office is never us.
 */
export const SERVICES = [
  {
    id: 'income-certificate',
    tone: 'primary',
    name: 'Income Certificate',
    icon: 'income',
    summary: 'Proof of your family’s yearly income. Often needed for scholarships, fee help and government schemes.',
    usedFor: ['Fee help', 'Scholarships', 'EWS benefits', 'Government schemes'],
    issuedBy: 'Tahsildar or your district Revenue Office',
    validity: 'Usually one financial year',
    documents: ['aadhaar', 'ration', 'salarySlip', 'landRecord', 'declaration'],
    documentCount: 5,
    charge: '₹500 – ₹800',
    timeline: '7 – 10 days',
  },
  {
    id: 'caste-certificate',
    tone: 'paper',
    name: 'Caste Certificate',
    icon: 'caste',
    summary: 'Proof of your SC, ST or OBC group. Used for reserved seats, government jobs and some benefits.',
    usedFor: ['Reserved seats', 'Government jobs', 'Fee help', 'Age limit benefits'],
    issuedBy: 'Sub-Divisional Officer or Tahsildar, your district',
    validity: 'Permanent for SC and ST; OBC is usually revalidated yearly',
    documents: ['aadhaar', 'ration', 'casteProof', 'residenceProof', 'declaration', 'photo'],
    documentCount: 6,
    charge: '₹600 – ₹1,000',
    timeline: '10 – 15 days',
  },
  {
    id: 'domicile-certificate',
    tone: 'warm',
    name: 'Domicile Certificate',
    icon: 'domicile',
    summary: 'Proof that you live in this state. Often needed for state colleges, jobs and local schemes.',
    usedFor: ['College admission', 'State jobs', 'Local schemes'],
    issuedBy: 'Tahsildar or District Magistrate’s office',
    validity: 'Generally permanent unless you change state',
    documents: ['aadhaar', 'residenceProof', 'schoolRecord', 'declaration'],
    documentCount: 4,
    charge: '₹500 – ₹900',
    timeline: '7 – 12 days',
  },
  {
    id: 'birth-certificate',
    tone: 'paper',
    name: 'Birth Certificate',
    icon: 'birth',
    summary: 'Proof of your date and place of birth. Often needed for school, passports and other records.',
    usedFor: ['School', 'Passport', 'Aadhaar', 'Age proof'],
    issuedBy: 'Municipal office or Gram Panchayat where the birth was registered',
    validity: 'Permanent',
    documents: ['hospitalRecord', 'parentId', 'residenceProof'],
    documentCount: 3,
    charge: '₹300 – ₹600',
    timeline: '5 – 7 days',
  },
  {
    id: 'pan-services',
    tone: 'cool',
    name: 'PAN Services',
    icon: 'pan',
    summary: 'Apply for a PAN card or correct an existing one. Often needed for taxes, bank accounts and some payments.',
    usedFor: ['Filing tax returns', 'Opening a bank account', 'Large transactions'],
    issuedBy: 'Income Tax Department, through NSDL or UTIITSL',
    validity: 'Permanent',
    documents: ['aadhaar', 'photo', 'existingPan'],
    documentCount: 2,
    charge: '₹400 – ₹800',
    timeline: '10 – 20 days',
  },
  {
    id: 'aadhaar-services',
    tone: 'paper',
    name: 'Aadhaar Services',
    icon: 'aadhaar',
    summary: 'Update your address, mobile number, name or birth date, or get help applying for Aadhaar.',
    usedFor: ['Address update', 'Mobile update', 'Name or birth date update'],
    issuedBy: 'UIDAI enrolment centre',
    validity: 'Permanent, updated as needed',
    documents: ['aadhaar', 'residenceProof'],
    documentCount: 2,
    charge: '₹200 – ₹500',
    timeline: '3 – 5 days',
  },
];

/** @param {string} id */
export const getServiceById = (id) => SERVICES.find((service) => service.id === id);
