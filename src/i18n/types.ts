// Dictionary shape is inferred from the English source of truth.
// Importing JSON as a *type* is safe in both Server and Client Components.
import type en from "../dictionaries/en.json";

export type Dictionary = typeof en;
