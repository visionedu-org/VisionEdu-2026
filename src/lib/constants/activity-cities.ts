/** Cidades disponíveis para cadastro (cidade de atuação). */
export const ACTIVITY_CITIES = [
  { value: "São Julião", label: "São Julião" },
  { value: "Campo Grande do Piauí", label: "Campo Grande do Piauí" },
  { value: "Monsenhor Hipólito", label: "Monsenhor Hipólito" },
  { value: "Vila Nova do Piauí", label: "Vila Nova do Piauí" },
] as const;

export type ActivityCity = (typeof ACTIVITY_CITIES)[number]["value"];

export const DEFAULT_ACTIVITY_CITY: ActivityCity = "São Julião";
