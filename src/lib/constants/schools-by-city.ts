import type { ActivityCity } from "@/lib/constants/activity-cities";
import {
  APRIGIO_SCHOOL_ID,
  JOSE_ALVES_SCHOOL_ID,
  pilotSchools,
  SERAFIM_SCHOOL_ID,
} from "@/mocks/data/ceti-seed";
import type { School } from "@/types/domain";

/** Escolas disponíveis por cidade de cadastro. */
export const SCHOOL_IDS_BY_ACTIVITY_CITY: Record<
  ActivityCity,
  readonly string[]
> = {
  "São Julião": [APRIGIO_SCHOOL_ID],
  "Campo Grande do Piauí": [SERAFIM_SCHOOL_ID],
  "Monsenhor Hipólito": [JOSE_ALVES_SCHOOL_ID],
};

export function getSchoolsForActivityCity(city: ActivityCity): School[] {
  const allowed = new Set(SCHOOL_IDS_BY_ACTIVITY_CITY[city]);
  return pilotSchools.filter((school) => allowed.has(school.id));
}

export function getDefaultSchoolIdForCity(city: ActivityCity): string {
  return SCHOOL_IDS_BY_ACTIVITY_CITY[city][0]!;
}

export function isSchoolInActivityCity(
  schoolId: string,
  city: ActivityCity
): boolean {
  return SCHOOL_IDS_BY_ACTIVITY_CITY[city].includes(schoolId);
}
