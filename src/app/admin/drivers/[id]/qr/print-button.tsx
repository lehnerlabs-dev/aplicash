"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-zinc-900 text-white text-sm font-medium px-4 py-2"
    >
      Imprimir cartão
    </button>
  );
}
