import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, driver: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-lg mx-auto px-5 py-8 flex-1 w-full">
      <h1 className="text-xl font-semibold text-zinc-900 mb-1">
        Pedido recebido!
      </h1>
      <p className="text-sm text-zinc-500 mb-6">
        Pedido #{order.id.slice(-6).toUpperCase()}
        {order.driver ? ` · via ${order.driver.name}` : ""}
      </p>

      <ul className="flex flex-col gap-2 mb-4">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between"
          >
            <span className="text-sm text-zinc-900">
              {item.quantity}x {item.product.name}
            </span>
            <span className="text-sm font-medium text-zinc-900">
              {formatCents(item.priceCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-base font-semibold text-zinc-900 mb-6">
        <span>Total</span>
        <span>{formatCents(order.totalCents)}</span>
      </div>

      <p className="text-sm text-zinc-500 mb-6">
        Combine o pagamento (Pix ou dinheiro) e a entrega diretamente com o
        motorista ou aguarde o contato para a entrega.
      </p>

      <Link
        href="/"
        className="inline-block rounded-lg bg-zinc-900 text-white text-sm font-medium px-4 py-2"
      >
        Voltar à loja
      </Link>
    </div>
  );
}
