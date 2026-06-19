export function compileRegex(input, flags = "i") {
  //if there's an input, build regex, otherwise return null
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

export function highlight(text, re) {
  if (!re) return text;
  return String(text).replace(re, (m) => `<mark>${m}</mark>`);
}
