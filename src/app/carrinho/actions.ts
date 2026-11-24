"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { REF_COOKIE } from "@/lib/ref";
import { calcCommissionCents } from "@/lib/commission";

type CartLine = { productId: string; quantity: number };
type CustomerInfo = { name: string; phone: string; address: string };

export async function placeOrder(cart: CartLine[], customer: CustomerInfo) {
  const name = customer.name.trim();
  const phone = customer.phone.trim();
  const address = customer.address.trim();

  if (!name || !phone || !address) {
    throw new Error("Preencha nome, telefone e endereço");
  }
  if (cart.length === 0) {
    throw new Error("Carrinho vazio");
  }

  const productIds = cart.map((l) => l.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const lines = cart
    .map((l) => {
      const product = productById.get(l.productId);
      if (!product || l.quantity <= 0) return null;
      return {
        productId: product.id,
        quantity: l.quantity,
        priceCents: product.priceCents,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  if (lines.length === 0) {
    throw new Error("Nenhum item válido no carrinho");
  }

  const totalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);

  const jar = await cookies();
  const refCode = jar.get(REF_COOKIE)?.value;
  const driver = refCode
    ? await prisma.driver.findUnique({ where: { refCode } })
    : null;
  const attributedDriver = driver && driver.active ? driver : null;

  const commissionCents = attributedDriver ? calcCommissionCents(totalCents) : 0;

  const order = await prisma.order.create({
    data: {
      driverId: attributedDriver?.id,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      totalCents,
      commissionCents,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          priceCents: l.priceCents,
        })),
      },
    },
  });

  return { orderId: order.id };
}
