export function getAdminSessionAuthorizationHeader(
  storage: Pick<Storage, "getItem"> | null | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
): Record<string, string> {
  const token = storage?.getItem("admin_session")?.trim();

  return token ? { Authorization: `Bearer ${token}` } : {};
}
