import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { REF_COOKIE } from "@/lib/ref";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const driver = await prisma.driver.findUnique({ where: { refCode: code } });

  const res = NextResponse.redirect(new URL("/", _req.url));

  if (driver && driver.active) {
    await prisma.visit.create({ data: { driverId: driver.id } });
    res.cookies.set(REF_COOKIE, driver.refCode, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return res;
}
