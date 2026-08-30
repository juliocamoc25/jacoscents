import React, { useMemo } from "react";
import { DollarSign, TrendingUp, Wallet, Users, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { money, fmtDate } from "../../utils";
import { StatCard, SectionCard, Badge } from "../UI";
import { EmptyState } from "../common";

export default function DashboardTab({ perfumes, clientes, ventas, onGoTo }) {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay); startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const sum = (arr) => arr.reduce((s, v) => s + v.total, 0);

    const ventasHoy = ventas.filter((v) => new Date(v.fecha) >= startOfDay);
    const ventasSemana = ventas.filter((v) => new Date(v.fecha) >= startOfWeek);
    const ventasMes = ventas.filter((v) => new Date(v.fecha) >= startOfMonth);
    const ventasAnio = ventas.filter((v) => new Date(v.fecha) >= startOfYear);
    const gananciaHoy = ventasHoy.reduce((s, v) => s + (v.ganancia || 0), 0);

    const aggPerfume = {}, aggMarca = {}, aggMes = {}, aggDecant = {};
    ventas.forEach((v) => {
      const mesKey = new Date(v.fecha).toISOString().slice(0, 7);
      aggMes[mesKey] = (aggMes[mesKey] || 0) + v.total;
      v.items.forEach((it) => {
        if (!aggPerfume[it.perfumeId]) aggPerfume[it.perfumeId] = { nombre: it.nombrePerfume, ingreso: 0 };
        aggPerfume[it.perfumeId].ingreso += it.subtotal;
        const marcaKey = it.marca || "Sin marca";
        aggMarca[marcaKey] = (aggMarca[marcaKey] || 0) + it.subtotal;
        if (it.tipo === "decant") {
          if (!aggDecant[it.perfumeId]) aggDecant[it.perfumeId] = { nombre: it.nombrePerfume, ml: 0 };
          aggDecant[it.perfumeId].ml += it.cantidad;
        }
      });
    });

    const perfumesMasVendidos = Object.values(aggPerfume).sort((a, b) => b.ingreso - a.ingreso).slice(0, 5);
    const marcasMasVendidas = Object.entries(aggMarca).map(([marca, ingreso]) => ({ marca, ingreso })).sort((a, b) => b.ingreso - a.ingreso).slice(0, 6);
    const decantsMasVendidos = Object.values(aggDecant).sort((a, b) => b.ml - a.ml).slice(0, 6);

    const mesesLabels = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); mesesLabels.push(d.toISOString().slice(0, 7)); }
    const ventasPorMes = mesesLabels.map((m) => ({ mes: m, total: aggMes[m] || 0 }));

    const stockBajo = perfumes.filter((p) => p.activo !== false && p.cantidadDisponible <= (p.cantidadMinima || 0) && p.cantidadDisponible > 0);
    const agotados = perfumes.filter((p) => p.activo !== false && p.cantidadDisponible === 0);
    const ultimasVentas = [...ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);

    return { ventasHoy: sum(ventasHoy), ventasSemana: sum(ventasSemana), ventasMes: sum(ventasMes), ventasAnio: sum(ventasAnio), gananciaHoy, perfumesMasVendidos, marcasMasVendidas, decantsMasVendidos, ventasPorMes, stockBajo, agotados, ultimasVentas };
  }, [perfumes, ventas]);

  if (perfumes.length === 0) {
    return <EmptyState icon={Package} title="Comienza agregando tu primer perfume" subtitle="Tu catálogo está vacío. Agrega perfumes para empezar a ver estadísticas de tu negocio aquí." actionLabel="Ir al catálogo" onAction={() => onGoTo("catalogo")} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={DollarSign} label="Ventas hoy" value={money(stats.ventasHoy)} />
        <StatCard icon={TrendingUp} label="Ventas semana" value={money(stats.ventasSemana)} />
        <StatCard icon={Wallet} label="Ventas mes" value={money(stats.ventasMes)} />
        <StatCard icon={Wallet} label="Ventas año" value={money(stats.ventasAnio)} />
        <StatCard icon={DollarSign} label="Ganancia hoy" value={money(stats.gananciaHoy)} tone="accent" />
        <StatCard icon={Users} label="Clientes" value={clientes.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Perfumes con poco inventario">
          {stats.stockBajo.length === 0 ? <p className="text-sm text-neutral-400 py-4">Todo en orden. Sin alertas de inventario bajo.</p> : (
            <div className="space-y-2">
              {stats.stockBajo.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 gap-2">
                  <span className="text-sm text-neutral-700 truncate">{p.nombre}</span>
                  <Badge tone="warning">{p.cantidadDisponible} restantes</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Productos agotados">
          {stats.agotados.length === 0 ? <p className="text-sm text-neutral-400 py-4">No tienes productos agotados.</p> : (
            <div className="space-y-2">
              {stats.agotados.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 gap-2">
                  <span className="text-sm text-neutral-700 truncate">{p.nombre}</span>
                  <Badge tone="error">Agotado</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Últimas ventas">
          {stats.ultimasVentas.length === 0 ? <p className="text-sm text-neutral-400 py-4">Aún no hay ventas registradas.</p> : (
            <div className="space-y-2">
              {stats.ultimasVentas.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="text-sm text-neutral-700">{v.items.length} producto(s)</p>
                    <p className="text-xs text-neutral-400">{fmtDate(v.fecha)}</p>
                  </div>
                  <span className="text-sm font-semibold">{money(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Perfumes más vendidos">
          {stats.perfumesMasVendidos.length === 0 ? <p className="text-sm text-neutral-400 py-4">Aún no hay ventas suficientes.</p> : (
            <div className="space-y-2">
              {stats.perfumesMasVendidos.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 gap-2">
                  <span className="text-sm text-neutral-700 truncate">{p.nombre}</span>
                  <span className="text-sm font-semibold shrink-0">{money(p.ingreso)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {ventas.length > 0 && (
        <>
          <SectionCard title="Ventas por mes">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ventasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickFormatter={(m) => m.slice(5) + "/" + m.slice(2, 4)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "$" + v} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Bar dataKey="total" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Marcas más vendidas">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.marcasMasVendidas} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} hide />
                    <YAxis type="category" dataKey="marca" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="ingreso" fill="#171717" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="Decants más vendidos (ml)">
              {stats.decantsMasVendidos.length === 0 ? <p className="text-sm text-neutral-400 py-8 text-center">Aún no hay ventas de decants.</p> : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.decantsMasVendidos} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 10 }} hide />
                      <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip formatter={(v) => v + " ml"} />
                      <Bar dataKey="ml" fill="#dc2626" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
