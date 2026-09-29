import Cookies from "js-cookie";

export function getToken(): string | undefined {
  return Cookies.get("smc_token");
}

export function clearToken(): void {
  Cookies.remove("smc_token");
}
