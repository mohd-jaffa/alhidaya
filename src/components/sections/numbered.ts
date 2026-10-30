/** A card's place in its row, as the reference numbers them (D97): 01, 02, 03. */
export const ordinal = (at: number) => String(at + 1).padStart(2, "0");
