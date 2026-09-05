export function getSafeAdminReturnPath(search: string): string {
  const requestedPath = new URLSearchParams(search).get("next");

  return requestedPath?.startsWith("/admin/") ? requestedPath : "/admin";
}

export function getAdminLoginUrl(returnPath: string): string {
  const safePath = returnPath.startsWith("/admin/") ? returnPath : "/admin";
  return `/admin/login?next=${encodeURIComponent(safePath)}`;
}
