/** Cidades disponíveis para cadastro (cidade de atuação). */
export const ACTIVITY_CITIES = [
  { value: "Vila Nova do Piauí", label: "Vila Nova do Piauí" },
] as const;

export type ActivityCity = (typeof ACTIVITY_CITIES)[number]["value"];

export const DEFAULT_ACTIVITY_CITY: ActivityCity = "Vila Nova do Piauí";
