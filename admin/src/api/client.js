// NEXT_PUBLIC_API_BASE is the Next.js equivalent of VITE_API_BASE.  The default
// remains unchanged so every existing API endpoint and payload is preserved.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:7001";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bdms_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) {
    // A restarted API or a 30-minute JWT expiry must return the clerk to the shared login screen.
    localStorage.removeItem("bdms_token");
    localStorage.removeItem("bdms_user");
    window.location.reload();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

async function upload(path, formData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

async function download(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Unable to open the uploaded document.");
  return res.blob();
}

export const api = {
  // Maps legacy LoginPageNew.aspx login
  login: (userName, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ userName, password }) }),

  listApplications: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    ).toString();
    return request(`/api/birth-applications${qs ? `?${qs}` : ""}`);
  },
  listDeathApplications: () => request("/api/death-applications"),
  openDeathForReview: (applicationNumber) => request(`/api/death-applications/${applicationNumber}/open-for-review`, { method: "POST" }),
  releaseDeathLock: (applicationNumber) => request(`/api/death-applications/${applicationNumber}/release-lock`, { method: "POST" }),
  verifyDeath: (applicationNumber, body) => request(`/api/death-applications/${applicationNumber}/verify`, { method: "POST", body: JSON.stringify(body) }),
  // Maps legacy Page_Load(?Id=&caseId=) + GetEditRecord() + updateRecordLock()
  openForReview: (applicationNumber) =>
    request(`/api/birth-applications/${applicationNumber}/open-for-review`, { method: "POST" }),
  releaseLock: (applicationNumber) =>
    request(`/api/birth-applications/${applicationNumber}/release-lock`, { method: "POST" }),
  uploadIssuedCertificate: (applicationNumber, file) => {
    const formData = new FormData();
    formData.append("certificate", file);
    return upload(`/api/birth-applications/${applicationNumber}/issued-certificate`, formData);
  },
  downloadDocument: (url) => download(url),
  // Maps legacy BDMS_Page.aspx btnInsert_Click (the real "CRS -Mainet" verification submit)
  verify: (applicationNumber, body) =>
    request(`/api/birth-applications/${applicationNumber}/verify`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const auth = {
  saveSession: ({ token, userName, role, dept, expiresAt }) => {
    localStorage.setItem("bdms_token", token);
    localStorage.setItem("bdms_user", JSON.stringify({ userName, role, dept, expiresAt }));
  },
  getSession: () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("bdms_user");
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      auth.clearSession();
      return null;
    }
    if (session.role !== "Operator") {
      auth.clearSession();
      return null;
    }
    return session;
  },
  clearSession: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("bdms_token");
    localStorage.removeItem("bdms_user");
  },
};
