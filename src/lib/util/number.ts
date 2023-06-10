export function padNumber(num: number, length = 2) {
  return `${'0'.repeat(length)}${num}`.slice(-length);
}

export function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length == 1 ? `0${hex}` : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function darkify(
  r: number,
  g: number,
  b: number,
  amount: number,
  res: 'hex' | 'rgb' = 'hex'
) {
  const rgb = [r - amount, g - amount, b - amount].map(x => Math.max(0, x));
  return res == 'hex' ? rgbToHex(...(rgb as [number, number, number])) : rgb;
}
