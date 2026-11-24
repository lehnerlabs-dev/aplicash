"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Status inválido");
  }
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
}
