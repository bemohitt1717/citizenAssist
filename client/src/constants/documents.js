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
    what: 'Your 12-digit Aadhaar number.',
    capture: 'Upload both sides. You can use one file or two.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  ration: {
    id: 'ration',
    name: 'Ration card or family register extract',
    schematic: 'booklet',
    what: 'Shows who is in your family.',
    capture: 'Show all family names and the card number clearly.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  salarySlip: {
    id: 'salarySlip',
    name: 'Salary slip or employer letter',
    schematic: 'slip',
    what: 'Shows how much you earn.',
    capture: 'Upload payslips for the last 3 months. If you work for yourself, add a signed income note instead.',
    formats: PDF_IMG,
    maxSizeMb: 4,
  },
  landRecord: {
    id: 'landRecord',
    name: 'Land or property record',
    schematic: 'certificate',
    what: 'Needed only if your family owns land or property.',
    capture: 'Add a recent copy if this applies to you.',
    formats: ['PDF'],
    maxSizeMb: 4,
    optional: true,
  },
  declaration: {
    id: 'declaration',
    name: 'Self-declaration of income',
    schematic: 'declaration',
    what: 'A signed note of your family’s income.',
    capture: 'Sign and date it. Your agent will tell you what to write.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  casteProof: {
    id: 'casteProof',
    name: 'Family caste record',
    schematic: 'certificate',
    what: 'A parent or grandparent’s caste certificate, or a school record with your caste.',
    capture: 'Show the full page, seal and issuing office.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  residenceProof: {
    id: 'residenceProof',
    name: 'Proof of residence',
    schematic: 'booklet',
    what: 'A recent bill, rent agreement or voter ID with your address.',
    capture: 'Use a document from the last 3 months. Show the full address.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  schoolRecord: {
    id: 'schoolRecord',
    name: 'School leaving certificate',
    schematic: 'certificate',
    what: 'Shows how long you have lived in the state.',
    capture: 'Upload your school leaving certificate, not a marksheet.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  hospitalRecord: {
    id: 'hospitalRecord',
    name: 'Hospital record of birth',
    schematic: 'slip',
    what: 'A hospital record of the birth.',
    capture: 'It must show the date, time and place of birth.',
    formats: PDF_IMG,
    maxSizeMb: 4,
  },
  parentId: {
    id: 'parentId',
    name: 'Both parents’ identity proof',
    schematic: 'idCard',
    what: 'Aadhaar cards for both parents.',
    capture: 'Add one file for each parent. Names must match the hospital record.',
    formats: PDF_IMG,
    maxSizeMb: 2,
  },
  photo: {
    id: 'photo',
    name: 'Passport-size photograph',
    schematic: 'photo',
    what: 'A recent colour photo on a plain background.',
    capture: 'Face the camera without a cap or dark glasses. Use a photo from the last 6 months.',
    formats: ['JPG', 'PNG'],
    maxSizeMb: 1,
  },
  existingPan: {
    id: 'existingPan',
    name: 'Existing PAN card',
    schematic: 'idCard',
    what: 'Only needed to correct a PAN. Skip it for a new PAN.',
    capture: 'Upload the front with the PAN number clear.',
    formats: PDF_IMG,
    maxSizeMb: 2,
    optional: true,
  },
};

/** Upload rules shown wherever a citizen is about to attach a file. */
export const UPLOAD_RULES = {
  guidance: 'Photos are fine. Keep the whole document in frame and make sure the text is clear.',
};
