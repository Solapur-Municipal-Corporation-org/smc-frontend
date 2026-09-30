const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:7001";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

async function uploadRequest(path, file) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Phase 1 -- first "Submit" click: validate only, no persistence, no OTP yet.
  precheck: (form) => request("/api/birth-applications/precheck", { method: "POST", body: JSON.stringify(form) }),

  // Create the temp application and return the required documents.
  createTemp: (form) => request("/api/birth-applications/temp", { method: "POST", body: JSON.stringify(form) }),

  uploadDocument: (tempApplicationNumber, documentKey, file) =>
    uploadRequest(`/api/birth-applications/temp/${tempApplicationNumber}/documents/${documentKey}`, file),

  // Phase 4 -- "Upload & Submit" click: validate uploads, move temp -> permanent, get real application number.
  finalize: (tempApplicationNumber) =>
    request(`/api/birth-applications/temp/${tempApplicationNumber}/finalize`, { method: "POST" }),

  getStatus: (applicationNumber) => request(`/api/birth-applications/${applicationNumber}/status`),
  initiatePayment: (applicationNumber) => request("/api/payments/initiate", { method: "POST", body: JSON.stringify({ applicationNumber }) }),
  confirmPayment: (transactionId) => request("/api/payments/confirm", { method: "POST", body: JSON.stringify({ transactionId }) }),
  certificateDownloadUrl: (applicationNumber) => `${API_BASE}/api/birth-applications/${encodeURIComponent(applicationNumber)}/certificate`,
  death: {
    precheck: (form) => request("/api/death-applications/precheck", { method: "POST", body: JSON.stringify(form) }),
    createTemp: (form) => request("/api/death-applications/temp", { method: "POST", body: JSON.stringify(form) }),
    verifyOtpAndCreateTempRecord: (tempApplicationNumber, form, otpCode) => request(`/api/death-applications/temp/${tempApplicationNumber}/verify-otp`, { method: "POST", body: JSON.stringify({ form, otpCode }) }),
    uploadDocument: (tempApplicationNumber, documentKey, file) => uploadRequest(`/api/death-applications/temp/${tempApplicationNumber}/documents/${documentKey}`, file),
    finalize: (tempApplicationNumber) => request(`/api/death-applications/temp/${tempApplicationNumber}/finalize`, { method: "POST" }),
    getStatus: (applicationNumber) => request(`/api/death-applications/${applicationNumber}/status`),
  },
};
