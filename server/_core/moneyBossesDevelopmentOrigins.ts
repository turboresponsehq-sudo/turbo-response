export function moneyBossesDevelopmentOrigins(environment: string | undefined, port: string | undefined, origin: string | undefined): string[] {
  if (environment === "production") return [];
  const value = Number(port);
  if (!Number.isInteger(value) || value < 1024 || value > 65535) return [];
  const origins = [`http://localhost:${value}`, `http://127.0.0.1:${value}`];
  if (origin) {
    try {
      const url = new URL(origin);
      if (url.protocol === "https:" && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash) origins.push(url.origin);
    } catch { /* Invalid development configuration never broadens access. */ }
  }
  return origins;
}
