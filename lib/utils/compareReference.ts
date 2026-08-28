/**
 * Orders references the way the shop numbers them: J1, J2, … J9, J10, J11.
 *
 * A plain text sort cannot do this. The codes are unpadded — the same fact
 * `generateAccountReference` has to work around at the other end, where it
 * cannot just ask the database for the top row — so as text `J10` lands
 * between `J1` and `J2`, and the shelf scrambles the day a tenth listing is
 * added. The digits have to be compared as a number.
 *
 * It cannot assume the `J#` series, though. `account_reference` is free text
 * (`REFERENCE_PATTERN` allows letters, numbers and hyphens) and the admin can
 * overwrite the suggestion with anything. So this compares each code as an
 * alternating run of letters and digits: the series comes out in order without
 * the series being made into a rule, and a hand-written code that is nothing
 * like `J#` still sorts somewhere predictable instead of being dropped.
 *
 * Digits are compared by length after leading zeros are stripped, rather than
 * by `parseInt`, so `J007` and `J7` land together and a run of digits longer
 * than a safe integer cannot round two distinct codes into a tie.
 */

/** Each match is a run of digits or a run of everything else. */
const RUNS = /\d+|\D+/g;

export function compareReference(a: string, b: string): number {
  const left = a.trim().toLowerCase().match(RUNS) ?? [];
  const right = b.trim().toLowerCase().match(RUNS) ?? [];

  for (let i = 0; i < Math.min(left.length, right.length); i += 1) {
    const x = left[i];
    const y = right[i];

    if (/^\d/.test(x) && /^\d/.test(y)) {
      const nx = x.replace(/^0+/, "");
      const ny = y.replace(/^0+/, "");
      if (nx.length !== ny.length) return nx.length - ny.length;
      if (nx !== ny) return nx < ny ? -1 : 1;
      continue;
    }

    if (x !== y) return x < y ? -1 : 1;
  }

  // Everything compared equal, so the shorter code is the earlier one: `J1`
  // before `J1-alt`.
  return left.length - right.length;
}
