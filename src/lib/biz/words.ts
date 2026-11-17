const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ones[h]} hundred`);
  if (r) {
    const t = r < 20 ? ones[r] : `${tens[Math.floor(r / 10)]}${r % 10 ? `-${ones[r % 10]}` : ""}`;
    parts.push(h ? `and ${t}` : t);
  }
  return parts.join(" ");
}

/** 12500.5 → "Twelve thousand five hundred shillings and fifty cents only". */
export function amountInWords(amount: number): string {
  const whole = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - whole) * 100);
  if (whole === 0 && cents === 0) return "Zero shillings only";
  const scales: [number, string][] = [
    [1e9, "billion"],
    [1e6, "million"],
    [1e3, "thousand"],
  ];
  let rest = whole;
  const parts: string[] = [];
  for (const [size, name] of scales) {
    if (rest >= size) {
      parts.push(`${under1000(Math.floor(rest / size))} ${name}`);
      rest %= size;
    }
  }
  if (rest) parts.push(under1000(rest));
  let text = parts.join(" ");
  text = text ? `${text} shilling${whole === 1 ? "" : "s"}` : "";
  if (cents) text += `${text ? " and " : ""}${under1000(cents)} cent${cents === 1 ? "" : "s"}`;
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} only`;
}
