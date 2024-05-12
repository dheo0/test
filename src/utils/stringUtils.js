export function  parseDate(src) {
  return new Date(
    Number(src.slice(0, 4) || 0),
    Number(src.slice(4, 6) || 1) - 1,
    Number(src.slice(6, 8) || 0),
    Number(src.slice(8, 10) || 0),
    Number(src.slice(10, 12) || 0),
    Number(src.slice(12, 14) || 0),
  );
}
