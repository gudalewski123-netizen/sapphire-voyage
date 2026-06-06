import type { BookingPayload } from "./api";

// Build a "YYYYMMDDTHHMMSS" local-time stamp (no timezone suffix → treated as
// floating local time by calendar apps, which is what we want for AST).
function stamp(date: string, time: string): string {
  const [y, m, d] = date.split("-");
  const [hh, mm] = time.split(":");
  return `${y}${m}${d}T${hh}${mm}00`;
}

function addHour(time: string): string {
  const [hh, mm] = time.split(":").map(Number);
  const end = (hh + 1) % 24;
  return `${String(end).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function summary(b: BookingPayload): string {
  return `Sapphire Voyage — ${b.pickup} → ${b.dropoff}`;
}

function description(b: BookingPayload): string {
  const lines = [
    `Service: ${b.serviceType}`,
    `Trip: ${b.tripType}`,
    `Pickup: ${b.pickup}`,
    `Drop-off: ${b.dropoff}`,
    `Passengers: ${b.passengers}`,
  ];
  if (b.notes) lines.push(`Notes: ${b.notes}`);
  return lines.join("\\n");
}

// Downloadable .ics — works in Apple Calendar, Google, Outlook.
export function buildIcs(b: BookingPayload): string {
  const dtStart = stamp(b.date, b.time);
  const dtEnd = stamp(b.date, addHour(b.time));
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sapphire Voyage//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b.date}-${b.time}-${b.email}@sapphirevoyage`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary(b)}`,
    `DESCRIPTION:${description(b)}`,
    `LOCATION:${b.pickup}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(b: BookingPayload): void {
  const blob = new Blob([buildIcs(b)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sapphire-voyage-${b.date}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// "Add to Google Calendar" URL — opens a prefilled event the user can save.
export function googleCalendarUrl(b: BookingPayload): string {
  const dates = `${stamp(b.date, b.time)}/${stamp(b.date, addHour(b.time))}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary(b),
    dates,
    details: description(b).replace(/\\n/g, "\n"),
    location: b.pickup,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
