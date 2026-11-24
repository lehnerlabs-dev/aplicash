import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Admin</h1>
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/products"
          className="bg-white border border-zinc-200 rounded-xl p-4 text-sm font-medium text-zinc-900"
        >
          Produtos
        </Link>
        <Link
          href="/admin/drivers"
          className="bg-white border border-zinc-200 rounded-xl p-4 text-sm font-medium text-zinc-900"
        >
          Motoristas parceiros
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white border border-zinc-200 rounded-xl p-4 text-sm font-medium text-zinc-900"
        >
          Pedidos e comissões
        </Link>
      </div>
    </div>
  );
}
