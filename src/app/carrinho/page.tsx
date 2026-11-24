"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatCents } from "@/lib/money";
import { placeOrder } from "./actions";

export default function CartPage() {
  const router = useRouter();
  const { items, totalCents, setQuantity, removeItem, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await placeOrder(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        { name, phone, address },
      );
      clear();
      router.push(`/pedido/${result.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar pedido");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 flex-1 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-zinc-900">Seu carrinho</h1>
        <Link href="/" className="text-sm text-zinc-500">
          Voltar à loja
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2 mb-6">
            {items.map((item) => (
              <li
                key={item.productId}
                className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatCents(item.priceCents)} cada
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(item.productId, item.quantity - 1)
                    }
                    className="w-7 h-7 rounded-full border border-zinc-300 text-zinc-700"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(item.productId, item.quantity + 1)
                    }
                    className="w-7 h-7 rounded-full border border-zinc-300 text-zinc-700"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-red-500"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between mb-6 text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span>{formatCents(totalCents)}</span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-3"
          >
            <h2 className="text-sm font-semibold text-zinc-900">
              Dados para entrega
            </h2>
            <input
              required
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Telefone / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <textarea
              required
              placeholder="Endereço de entrega"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              rows={2}
            />
            <p className="text-xs text-zinc-500">
              Pagamento combinado por Pix ou dinheiro na entrega. Nenhuma
              cobrança é feita agora.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-zinc-900 text-white text-sm font-medium py-2 disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Finalizar pedido"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
