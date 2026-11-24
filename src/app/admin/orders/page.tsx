import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { updateOrderStatus } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export default async function OrdersAdminPage() {
  const [drivers, orders, orderSums] = await Promise.all([
    prisma.driver.findMany({
      include: { _count: { select: { visits: true, orders: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      include: { driver: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["driverId"],
      _sum: { totalCents: true, commissionCents: true },
    }),
  ]);

  const sumsByDriverId = new Map(
    orderSums.map((s) => [s.driverId, s._sum]),
  );

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">
        Pedidos e comissões
      </h1>

      <h2 className="text-sm font-semibold text-zinc-700 mb-2">
        Desempenho por motorista
      </h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Motorista</th>
              <th className="text-right px-3 py-2">Acessos</th>
              <th className="text-right px-3 py-2">Pedidos</th>
              <th className="text-right px-3 py-2">Conversão</th>
              <th className="text-right px-3 py-2">Vendido</th>
              <th className="text-right px-3 py-2">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const sums = sumsByDriverId.get(d.id);
              const conversion =
                d._count.visits > 0
                  ? ((d._count.orders / d._count.visits) * 100).toFixed(1)
                  : "–";
              return (
                <tr key={d.id} className="border-t border-zinc-100">
                  <td className="px-3 py-2 text-zinc-900">{d.name}</td>
                  <td className="px-3 py-2 text-right">{d._count.visits}</td>
                  <td className="px-3 py-2 text-right">{d._count.orders}</td>
                  <td className="px-3 py-2 text-right">
                    {conversion === "–" ? conversion : `${conversion}%`}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCents(sums?.totalCents ?? 0)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-emerald-700">
                    {formatCents(sums?.commissionCents ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-semibold text-zinc-700 mb-2">
        Todos os pedidos
      </h2>
      <ul className="flex flex-col gap-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="bg-white border border-zinc-200 rounded-xl p-3"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-sm font-medium text-zinc-900">
                #{order.id.slice(-6).toUpperCase()} · {order.customerName}
              </span>
              <span className="text-sm font-semibold text-zinc-900">
                {formatCents(order.totalCents)}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-2">
              {order.driver ? `via ${order.driver.name}` : "sem motorista"} ·{" "}
              comissão {formatCents(order.commissionCents)} ·{" "}
              {order.items.length} item(ns)
            </p>
            <form
              action={updateOrderStatus.bind(null, order.id)}
              className="flex items-center gap-2"
            >
              <select
                name="status"
                defaultValue={order.status}
                className="text-xs border border-zinc-300 rounded-lg px-2 py-1"
              >
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="text-xs rounded-lg bg-zinc-900 text-white px-2 py-1"
              >
                Atualizar
              </button>
            </form>
          </li>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhum pedido ainda.</p>
        )}
      </ul>
    </div>
  );
}
