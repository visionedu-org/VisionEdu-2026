"use client";

import { Label } from "@/components/ui/label";
import {
  ACTIVITY_CITIES,
  DEFAULT_ACTIVITY_CITY,
} from "@/lib/constants/activity-cities";

type ActivityCitySelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
};

export function ActivityCitySelect({
  id = "city",
  value,
  onChange,
  onBlur,
  error,
}: ActivityCitySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Cidade de atuação</Label>
      <select
        id={id}
        className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
        value={value || DEFAULT_ACTIVITY_CITY}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
      >
        {ACTIVITY_CITIES.map((city) => (
          <option key={city.value} value={city.value}>
            {city.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
