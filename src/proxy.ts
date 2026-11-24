import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REALM = "Aplicash Admin";

function unauthorized() {
  return new NextResponse("Autenticação necessária", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}"` },
  });
}

export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  // Fail closed: if no password is configured, admin stays locked rather
  // than silently open.
  if (!user || !pass) return unauthorized();

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const sep = decoded.indexOf(":");
  const providedUser = sep === -1 ? decoded : decoded.slice(0, sep);
  const providedPass = sep === -1 ? "" : decoded.slice(sep + 1);

  if (providedUser !== user || providedPass !== pass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
