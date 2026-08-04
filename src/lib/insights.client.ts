import type { GuestBirthContext } from "@/lib/guest-birth";
import type { ValidBirthInput } from "@/lib/insights.schemas";

export function guestContextToBirth(context: GuestBirthContext): ValidBirthInput {
  const birth = context.birthProfile;
  return {
    birthDate: birth.birth_date,
    birthTime: (birth.birth_time ?? "12:00").slice(0, 5),
    birthTimeKnown: birth.birth_time_known,
    latitude: birth.latitude,
    longitude: birth.longitude,
    timezone: birth.timezone,
  };
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function buddhistDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
