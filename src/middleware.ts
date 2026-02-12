import { NextRequest, NextResponse } from "next/server";

const STAGING_USERNAME = process.env.STAGING_USERNAME;
const STAGING_PASSWORD = process.env.STAGING_PASSWORD;

export function middleware(request: NextRequest) {
  if (!STAGING_USERNAME || !STAGING_PASSWORD) return NextResponse.next();

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const colonIndex = decoded.indexOf(":");
      if (colonIndex !== -1) {
        const user = decoded.slice(0, colonIndex);
        const pass = decoded.slice(colonIndex + 1);
        if (
          user === STAGING_USERNAME.trim() &&
          pass === STAGING_PASSWORD.trim()
        ) {
          return NextResponse.next();
        }
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ClawCoach Staging"',
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
