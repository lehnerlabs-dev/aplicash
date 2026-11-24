"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parsePriceToCents(value: string): number {
  // Accepts "29,90" or "29.90"
  const normalized = value.replace(",", ".").trim();
  const reais = Number(normalized);
  if (!Number.isFinite(reais) || reais < 0) {
    throw new Error("Preço inválido");
  }
  return Math.round(reais * 100);
}

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const priceCents = parsePriceToCents(String(formData.get("price") ?? "0"));

  if (!name) throw new Error("Nome é obrigatório");

  await prisma.product.create({
    data: {
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      priceCents,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(productId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const priceCents = parsePriceToCents(String(formData.get("price") ?? "0"));
  const active = formData.get("active") === "on";

  if (!name) throw new Error("Nome é obrigatório");

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      priceCents,
      active,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(productId: string) {
  const usedInOrders = await prisma.orderItem.count({
    where: { productId },
  });

  if (usedInOrders > 0) {
    // Preserve order history: deactivate instead of deleting.
    await prisma.product.update({
      where: { id: productId },
      data: { active: false },
    });
  } else {
    await prisma.product.delete({ where: { id: productId } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}
