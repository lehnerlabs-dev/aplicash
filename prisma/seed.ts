import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Carregador veicular turbo (2 USB)", priceCents: 2990 },
  { name: "Cabo USB-C 1m reforçado", priceCents: 1990 },
  { name: "Cabo Lightning 1m reforçado", priceCents: 1990 },
  { name: "Fone de ouvido Bluetooth TWS", priceCents: 7990 },
  { name: "Power bank 10000mAh", priceCents: 8990 },
  { name: "Suporte de celular para carro", priceCents: 2490 },
  { name: "Óculos de sol unissex", priceCents: 3990 },
  { name: "Garrafa de água 500ml", priceCents: 500 },
  { name: "Barra de cereal (unidade)", priceCents: 400 },
  { name: "Balas de menta (pacote)", priceCents: 350 },
];

async function main() {
  const driver = await prisma.driver.upsert({
    where: { refCode: "DEMO01" },
    update: {},
    create: {
      name: "Motorista Demo",
      refCode: "DEMO01",
    },
  });

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log("Seeded driver:", driver.refCode);
  console.log("Seeded", products.length, "products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
