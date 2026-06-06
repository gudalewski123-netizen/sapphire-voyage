// Thin fetch wrapper. All requests send cookies so the customer session works.
export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function apiSend<T = any>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toError(res);
  return res.json().catch(() => ({}) as T);
}

async function toError(res: Response): Promise<Error> {
  let msg = `Request failed (${res.status})`;
  try {
    const data = await res.json();
    if (data?.error) msg = data.error;
  } catch {
    /* ignore */
  }
  const err = new Error(msg) as Error & { status?: number };
  err.status = res.status;
  return err;
}

export interface Slot {
  time: string;
  available: boolean;
}

export interface BookingPayload {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  tripType: string;
  pickup: string;
  dropoff: string;
  passengers: number;
  date: string;
  time: string;
  returnDate?: string | null;
  returnTime?: string | null;
  notes?: string | null;
}

export interface Booking extends BookingPayload {
  id: number;
  status: string;
  priceQuote: string | null;
  adminNotes: string | null;
  createdAt: string;
}
