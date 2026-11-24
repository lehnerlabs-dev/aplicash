"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";

// Alphabet avoids visually ambiguous characters (0/O, 1/I/L) since this
// code may be read out loud or typed manually as a fallback to scanning.
const generateCode = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 6);

export async function createDriver(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) {
    throw new Error("Nome é obrigatório");
  }

  let refCode = generateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.driver.findUnique({ where: { refCode } });
    if (!existing) break;
    refCode = generateCode();
  }

  await prisma.driver.create({
    data: { name, phone: phone || null, refCode },
  });

  revalidatePath("/admin/drivers");
}

export async function toggleDriverActive(driverId: string, active: boolean) {
  await prisma.driver.update({ where: { id: driverId }, data: { active } });
  revalidatePath("/admin/drivers");
}
