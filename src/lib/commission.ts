// Flat commission rate paid to the referring driver on an order's total.
// A simple constant is enough for the beta; revisit if drivers need
// per-category or per-driver rates later.
export const COMMISSION_RATE = 0.1;

export function calcCommissionCents(totalCents: number): number {
  return Math.round(totalCents * COMMISSION_RATE);
}
