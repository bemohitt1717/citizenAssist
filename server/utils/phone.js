export function normalizePhone(phone) {
  if (!phone) {
    return null;
  }

  const digits = String(phone).replace(/\D/g, '');

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  return null;
}