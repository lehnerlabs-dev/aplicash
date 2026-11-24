"use client";

import { useCart } from "./cart-provider";

export default function AddToCartButton({
  product,
}: {
  product: { id: string; name: string; priceCents: number };
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="mt-2 text-center text-sm rounded-lg bg-zinc-900 text-white py-1.5"
    >
      Adicionar
    </button>
  );
}
