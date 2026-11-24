import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createDriver } from "./actions";

export default async function DriversAdminPage() {
  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { visits: true, orders: true } } },
  });

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 mb-1">
        Motoristas parceiros
      </h1>
      <p className="text-sm text-zinc-500 mb-6">
        Cada motorista recebe um código único e um cartão com QR code para
        colar no banco de trás.
      </p>

      <form
        action={createDriver}
        className="bg-white border border-zinc-200 rounded-xl p-4 mb-8 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Nome
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Nome do motorista"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Telefone (opcional)
          </label>
          <input
            name="phone"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="(11) 90000-0000"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 text-white text-sm font-medium px-4 py-2"
        >
          Adicionar
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {drivers.map((d) => (
          <li
            key={d.id}
            className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900">
                {d.name}{" "}
                {!d.active && (
                  <span className="text-xs text-red-500">(inativo)</span>
                )}
              </p>
              <p className="text-xs text-zinc-500">
                código {d.refCode} · {d._count.visits} acessos ·{" "}
                {d._count.orders} pedidos
              </p>
            </div>
            <Link
              href={`/admin/drivers/${d.id}/qr`}
              className="text-sm font-medium text-emerald-700 whitespace-nowrap"
            >
              Ver cartão QR
            </Link>
          </li>
        ))}
        {drivers.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhum motorista cadastrado.</p>
        )}
      </ul>
    </div>
  );
}
