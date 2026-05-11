async function req(method: string, path: string, body?: unknown, redirectOn401 = false) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && redirectOn401) {
    window.location.href = import.meta.env.BASE_URL + "login";
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  register: (body: { email: string; password: string; businessName: string }) =>
    req("POST", "/auth/register", body),
  login: (body: { email: string; password: string }) =>
    req("POST", "/auth/login", body),
  logout: () => req("POST", "/auth/logout"),
  me: () => req("GET", "/auth/me"),                              // no redirect — used for session check
  getRequests: () => req("GET", "/portal/requests", undefined, true),   // redirect on 401
  createRequest: (body: Record<string, unknown>) =>
    req("POST", "/portal/requests", body, true),                // redirect on 401
};
