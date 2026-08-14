import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const PUBLIC_PATHS = ["/auth/login", "/auth/activar-cuenta"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublicPath && user) {
    return Response.redirect(new URL("/", request.url));
  }

  if (!isPublicPath && !user) {
    return Response.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
