import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { REF_COOKIE } from "@/lib/ref";

export default async function StorePage() {
  const jar = await cookies();
  const refCode = jar.get(REF_COOKIE)?.value;

  let driverName: string | null = null;
  if (refCode) {
    const driver = await prisma.driver.findUnique({ where: { refCode } });
    if (driver && driver.active) driverName = driver.name;
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col flex-1 bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-5 py-4">
        <h1 className="text-xl font-semibold text-zinc-900">Aplicash</h1>
        {driverName ? (
          <p className="text-sm text-zinc-500">
            Você está comprando através de {driverName}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">Loja dentro do carro</p>
        )}
      </header>

      <main className="flex-1 px-5 py-6">
        {products.length === 0 ? (
          <p className="text-zinc-500">Nenhum produto disponível no momento.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((p) => (
              <li
                key={p.id}
                className="bg-white rounded-xl border border-zinc-200 p-3 flex flex-col"
              >
                <div className="aspect-square w-full rounded-lg bg-zinc-100 mb-2" />
                <span className="text-sm font-medium text-zinc-900 leading-snug">
                  {p.name}
                </span>
                <span className="mt-1 text-sm font-semibold text-emerald-600">
                  {formatCents(p.priceCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
