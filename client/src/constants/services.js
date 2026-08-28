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
    summary:
      'Official proof of your household’s yearly income. Colleges ask for it before granting a fee concession, and most income-linked schemes will not move without it.',
    usedFor: ['Fee concessions', 'Scholarships', 'EWS applications', 'Welfare schemes'],
    issuedBy: 'Tahsildar or Revenue Department, your district',
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
    summary:
      'Recognised proof of your SC, ST or OBC category, used for reserved seats in education and in government recruitment.',
    usedFor: ['Reserved seats', 'Government recruitment', 'Fee relaxation', 'Age relaxation'],
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
    summary:
      'Proof that you have lived in the state long enough to count as a resident. Asked for at admission time and on state job applications.',
    usedFor: ['State quota admission', 'State job applications', 'Local welfare schemes'],
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
    summary:
      'The first legal record a person has. School admission, a passport and nearly every document that follows will ask to see it.',
    usedFor: ['School admission', 'Passport', 'Aadhaar enrolment', 'Age proof'],
    issuedBy: 'Municipal Corporation or Gram Panchayat where the birth was registered',
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
    summary:
      'A fresh PAN card, or a correction to the one you already hold. Needed to file returns and to open most bank accounts.',
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
    summary:
      'Correct the address, mobile number, name or date of birth on an existing Aadhaar, or get walked through a fresh enrolment.',
    usedFor: ['Address change', 'Mobile update', 'Name or date-of-birth correction'],
    issuedBy: 'UIDAI, through an authorised enrolment centre',
    validity: 'Permanent, updated as needed',
    documents: ['aadhaar', 'residenceProof'],
    documentCount: 2,
    charge: '₹200 – ₹500',
    timeline: '3 – 5 days',
  },
];

/** @param {string} id */
export const getServiceById = (id) => SERVICES.find((service) => service.id === id);
