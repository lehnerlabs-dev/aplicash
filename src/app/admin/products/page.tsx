import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { createProduct, updateProduct, deleteProduct } from "./actions";

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { orderItems: true } } },
  });

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 mb-1">Produtos</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Esse é o catálogo que os passageiros veem na loja.
      </p>

      <form
        action={createProduct}
        className="bg-white border border-zinc-200 rounded-xl p-4 mb-8 flex flex-col gap-3"
      >
        <h2 className="text-sm font-semibold text-zinc-900">
          Adicionar produto
        </h2>
        <input
          name="name"
          required
          placeholder="Nome do produto"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="description"
          placeholder="Descrição (opcional)"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-3">
          <input
            name="price"
            required
            placeholder="Preço (ex: 29,90)"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="imageUrl"
            placeholder="URL da imagem (opcional)"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-lg bg-zinc-900 text-white text-sm font-medium px-4 py-2"
        >
          Adicionar
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="bg-white border border-zinc-200 rounded-xl p-4"
          >
            <form
              action={updateProduct.bind(null, p.id)}
              className="flex flex-col gap-2"
            >
              <div className="flex gap-3">
                <input
                  name="name"
                  defaultValue={p.name}
                  required
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
                <input
                  name="price"
                  defaultValue={(p.priceCents / 100).toFixed(2).replace(".", ",")}
                  required
                  className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <input
                name="description"
                defaultValue={p.description ?? ""}
                placeholder="Descrição (opcional)"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                name="imageUrl"
                defaultValue={p.imageUrl ?? ""}
                placeholder="URL da imagem (opcional)"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={p.active}
                  />
                  Ativo na loja
                </label>
                <span className="text-xs text-zinc-400">
                  {p._count.orderItems} venda(s) ·{" "}
                  {formatCents(p.priceCents)} atual
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 text-white text-sm font-medium px-3 py-1.5"
                >
                  Salvar
                </button>
              </div>
            </form>
            <form action={deleteProduct.bind(null, p.id)} className="mt-2">
              <button
                type="submit"
                className="text-xs text-red-500"
              >
                {p._count.orderItems > 0
                  ? "Desativar (já tem vendas)"
                  : "Excluir"}
              </button>
            </form>
          </li>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhum produto cadastrado.</p>
        )}
      </ul>
    </div>
  );
}
