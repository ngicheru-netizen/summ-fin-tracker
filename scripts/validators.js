export function isValidDescription(text) {
  //reject duplicate words
  if (text.trim() === "") return false;

  const spaces = /^\S(?:.*\S)?$/;
  if (!spaces.test(text)) return false;

  const duplicate = /\b(\w+)\s+\1\b/i;
  if (duplicate.test(text)) return false;

  return true;
}
export function isValidAmount(value) {
  //whole number, no leading zeros, optional decimal.
  const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  return pattern.test(value);
}
export function isValidDate(value) {
  //more precise checks for date,month, year - no bogus numbers pass for dates.
  const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  return pattern.test(value);
}
export function isValidCategory(value) {
  //allows letters, as well as hyphened or spaced out words i.e. space cakes, food-centre
  const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  return pattern.test(value);
}
