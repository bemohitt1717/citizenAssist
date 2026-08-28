/**
 * Document specifications.
 *
 * WHY THESE ARE SCHEMATICS AND NOT PHOTOGRAPHS
 * --------------------------------------------
 * `schematic` names an abstract layout diagram drawn in DocumentSchematic —
 * boxes and rules showing where the fields sit. It is deliberately not a
 * picture of a real document, for three reasons:
 *
 *  1. Privacy. Real scanned certificates carry a real person's name, parents'
 *     names, address, date of birth and registration numbers. Republishing one
 *     is a data breach regardless of where the file came from.
 *  2. Licensing. Stock renderings of Aadhaar and PAN cards are watermarked
 *     commercial assets, and government artwork is not ours to redistribute.
 *  3. Honesty. Citizen Assist does not issue these documents. Showing
 *     convincing reproductions of them on our own pages invites exactly the
 *     confusion the product is built to avoid.
 *
 * A schematic is also the clearer teaching tool: it shows a citizen which
 * corner to look at without burying that in someone else's ink.
 *
 * `formats` and `maxSizeMb` are the real upload constraints and should stay in
 * step with whatever the backend enforces once it exists.
 */

const PDF_IMG = ['PDF', 'JPG', 'PNG'];

export const DOCUMENTS = {
  aadhaar: {
    id: 'aadhaar',
    name: 'Aadhaar card',
    schematic: 'idCard',
    what: 'Your 12-digit identity number, issued by UIDAI.',
    capture: 'Both sides, in one file or two. The address side is the one offices actually read.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  ration: {
    id: 'ration',
    name: 'Ration card or family register extract',
    schematic: 'booklet',
    what: 'Establishes who counts as one household.',
    capture: 'The page listing every family member, with the card number readable.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  salarySlip: {
    id: 'salarySlip',
    name: 'Salary slip or employer letter',
    schematic: 'slip',
    what: 'Evidence of what you earn, from whoever pays you.',
    capture: 'Three consecutive months. Self-employed applicants send a declaration instead.',
    formats: PDF_IMG,
    maxSizeMb: 4,
  },
  landRecord: {
    id: 'landRecord',
    name: 'Land or property record',
    schematic: 'certificate',
    what: 'Only asked for if the household owns agricultural land or property.',
    capture: 'The current extract, not an old copy. Skip this if it does not apply to you.',
    formats: ['PDF'],
    maxSizeMb: 4,
    optional: true,
  },
  declaration: {
    id: 'declaration',
    name: 'Self-declaration of income',
    schematic: 'declaration',
    what: 'A signed statement of household income, on plain paper.',
    capture: 'Signed and dated. Your agent sends the wording to copy.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  casteProof: {
    id: 'casteProof',
    name: 'Family caste record',
    schematic: 'certificate',
    what: 'An existing certificate held by a parent or grandparent, or a school record naming the category.',
    capture: 'The whole page, with the seal and issuing office visible.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  residenceProof: {
    id: 'residenceProof',
    name: 'Proof of residence',
    schematic: 'booklet',
    what: 'An electricity bill, rent agreement or voter record in your name.',
    capture: 'Dated within the last three months, address fully visible.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  schoolRecord: {
    id: 'schoolRecord',
    name: 'School leaving certificate',
    schematic: 'certificate',
    what: 'Used to confirm how long you have lived in the state.',
    capture: 'The certificate itself, not the marksheet.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  hospitalRecord: {
    id: 'hospitalRecord',
    name: 'Hospital record of birth',
    schematic: 'slip',
    what: 'The discharge summary or birth report from where the birth took place.',
    capture: 'Must show the date, time and place of birth.',
    formats: PDF_IMG,
    maxSizeMb: 4,
  },
  parentId: {
    id: 'parentId',
    name: 'Both parents’ identity proof',
    schematic: 'idCard',
    what: 'Aadhaar for the mother and the father.',
    capture: 'One file each. Names must match how they appear on the hospital record.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  photo: {
    id: 'photo',
    name: 'Passport-size photograph',
    schematic: 'photo',
    what: 'A recent colour photograph on a plain background.',
    capture: 'Face straight on, no cap, no dark glasses. Taken within the last six months.',
    formats: ['JPG', 'PNG'],
    maxSizeMb: 1,
  },
  existingPan: {
    id: 'existingPan',
    name: 'Existing PAN card',
    schematic: 'idCard',
    what: 'Only for a correction. Skip it if this is a first application.',
    capture: 'The front, with the number readable.',
    formats: PDF_IMG,
    maxSizeMb: 2,
    optional: true,
  },
};

/** Upload rules shown wherever a citizen is about to attach a file. */
export const UPLOAD_RULES = {
  minDpi: 200,
  guidance: 'Photographs of a document are fine, as long as all four corners are in frame.',
};
