const keyFor = (applicationNumber) => `smc_demand_payment_token:${applicationNumber}`
const temporaryApplicationStorageKey = "smc_demand_temporary_application"
const temporaryApplicationLifetimeMs = 24 * 60 * 60 * 1000

export function getApplicantPaymentToken(applicationNumber, suppliedToken = "") {
  if (suppliedToken) return suppliedToken
  if (typeof window === "undefined" || !applicationNumber) return ""
  try { return window.localStorage.getItem(keyFor(applicationNumber)) || "" }
  catch { return "" }
}

// Call only after the existing API has verified access to this application.
export function rememberApplicantPaymentToken(applicationNumber, token) {
  if (typeof window === "undefined" || !applicationNumber || !token) return
  try { window.localStorage.setItem(keyFor(applicationNumber), token) }
  catch { /* The current secure URL still works if browser storage is unavailable. */ }
}

export function getTemporaryApplicantAccessToken(applicationNumber) {
  if (typeof window === "undefined" || !applicationNumber) return ""
  try {
    const item = JSON.parse(window.localStorage.getItem(temporaryApplicationStorageKey) || "null")
    if (!item || item.applicationNumber !== applicationNumber || !item.accessToken || !Number.isFinite(item.submittedAt)) return ""
    if (item.submittedAt + temporaryApplicationLifetimeMs <= Date.now()) return ""
    return item.accessToken
  } catch {
    return ""
  }
}
