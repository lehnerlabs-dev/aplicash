import { notFound } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import PrintButton from "./print-button";

export default async function DriverQrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) notFound();

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const refUrl = `${protocol}://${host}/r/${driver.refCode}`;

  const qrDataUrl = await QRCode.toDataURL(refUrl, {
    margin: 1,
    width: 480,
  });

  return (
    <div className="min-h-full bg-zinc-100 flex flex-col items-center py-8 px-4 print:bg-white print:p-0">
      <div className="no-print mb-6 flex items-center gap-3">
        <PrintButton />
        <span className="text-sm text-zinc-500">{refUrl}</span>
      </div>

      <div className="card bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col items-center justify-center p-8 print:shadow-none print:border-0 print:rounded-none">
        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
          Aplicash
        </p>
        <img
          src={qrDataUrl}
          alt={`QR code de ${driver.name}`}
          className="w-56 h-56"
        />
        <p className="mt-4 text-lg font-semibold text-zinc-900">
          Escaneie e compre
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Código: {driver.refCode}
        </p>
      </div>

      <style>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          .card {
            width: 100mm;
            height: 150mm;
          }
        }
      `}</style>
    </div>
  );
}
