import { z } from "zod";

import { normaliseInstallmentPercents } from "@/lib/utils/installment";
import { ACCOUNT_STATUSES } from "@/types/account";

/**
 * Validation for the listing form.
 *
 * This is the real gate on the status vocabulary. The database column is `text`
 * with a CHECK constraint rather than a Postgres enum, so a typo would only be
 * caught as an opaque constraint violation at insert time. Catching it here
 * turns it into a field-level message.
 *
 * Empty optional fields arrive from the form as `""`. They are normalised to
 * `null` rather than stored as empty strings, so "not recorded" has exactly one
 * representation in the database.
 */

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

/** `""` and `undefined` both mean "not provided" for a nullable text field. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null);

/** Number inputs give `""` when cleared; treat that as absent, not as 0. */
const optionalCount = (label: string, max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => (value === "" || value === null ? null : Number(value)))
    .nullable()
    .default(null)
    .refine((value) => value === null || Number.isFinite(value), {
      message: `${label} must be a number.`,
    })
    .refine((value) => value === null || Number.isInteger(value), {
      message: `${label} must be a whole number.`,
    })
    .refine((value) => value === null || value >= 0, {
      message: `${label} cannot be negative.`,
    })
    .refine((value) => value === null || value <= max, {
      message: `${label} looks too high. Maximum is ${max.toLocaleString()}.`,
    });

export const accountSchema = z.object({
  account_reference: z
    .string()
    .trim()
    .min(2, "Reference must be at least 2 characters.")
    .max(32, "Reference must be 32 characters or fewer.")
    .regex(
      REFERENCE_PATTERN,
      "Use letters, numbers and hyphens only, starting with a letter or number.",
    ),

  // Whole pesos. Centavos are never quoted in this market, and an integer
  // sorts and compares exactly where a float would drift.
  price: z
    .union([z.string(), z.number()])
    .transform((value) => (value === "" ? Number.NaN : Number(value)))
    .refine((value) => Number.isFinite(value), { message: "Enter a price." })
    .refine((value) => Number.isInteger(value), {
      message: "Price must be a whole number of pesos.",
    })
    .refine((value) => value >= 0, { message: "Price cannot be negative." })
    .refine((value) => value <= 10_000_000, {
      message: "Price looks too high. Double-check the amount.",
    }),

  rank_id: z.string().uuid("Choose a rank."),
  collection_level_id: z.string().uuid("Choose a collection level."),

  server: optionalText(60),
  hero_count: optionalCount("Hero count", 500),
  skin_count: optionalCount("Skin count", 5000),

  status: z.enum(ACCOUNT_STATUSES, {
    message: "Choose a status.",
  }),

  is_featured: z.boolean().default(false),

  // The offer, not the arithmetic. Only the flag and the percentages are
  // stored; the peso figures are derived from the price at render time so the
  // two can never drift apart (see `lib/utils/installment.ts`).
  installment_available: z.boolean().default(false),

  // Anything outside 50/70/80 is dropped rather than rejected — duplicates and
  // stray values are a bug in whatever produced the array, not a decision the
  // admin made, and there is no field-level message that would help. What the
  // admin *did* decide, "open for installment", is checked below: dropping
  // every value leaves an empty array, and an empty array on an open listing
  // is an error they can see and fix.
  installment_percents: z
    .array(z.union([z.string(), z.number()]))
    .default([])
    .transform(normaliseInstallmentPercents),
})
  .superRefine((values, ctx) => {
    if (values.installment_available && values.installment_percents.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["installment_percents"],
        message: "Choose at least one downpayment.",
      });
    }
  })
  // Closing a listing to installment clears the percentages rather than
  // leaving them in the row. The database enforces the same pair, but doing it
  // here means the admin does not have to untick three boxes to untick one,
  // and a value cannot lie dormant waiting to reappear when the flag is
  // flipped back on.
  .transform((values) => ({
    ...values,
    installment_percents: values.installment_available
      ? values.installment_percents
      : [],
  }));

/** What the form collects, before parsing (all strings from inputs). */
export type AccountFormInput = z.input<typeof accountSchema>;

/** What Supabase receives, after parsing and normalisation. */
export type AccountFormValues = z.output<typeof accountSchema>;

/**
 * Field-level errors keyed by field name, ready to hand to the form.
 * Zod's `flatten()` gives arrays; the form only ever shows the first message.
 */
export type AccountFieldErrors = Partial<
  Record<keyof AccountFormValues, string>
>;

export function toFieldErrors(error: z.ZodError): AccountFieldErrors {
  const result: AccountFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key as keyof AccountFormValues] = issue.message;
    }
  }
  return result;
}
