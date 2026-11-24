"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export default function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/carrinho"
      className="relative inline-flex items-center rounded-lg bg-zinc-900 text-white text-sm font-medium px-3 py-1.5"
    >
      Carrinho
      {totalItems > 0 && (
        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-emerald-500 text-white text-xs w-5 h-5">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
