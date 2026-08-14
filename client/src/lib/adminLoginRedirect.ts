export function getSafeAdminReturnPath(search: string): string {
  const requestedPath = new URLSearchParams(search).get("next");

  return requestedPath?.startsWith("/admin/") ? requestedPath : "/admin";
}
