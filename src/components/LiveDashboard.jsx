import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, BarChart2, Activity } from 'lucide-react';

// Simple random walkers to simulate tracked people
function useSimulatedPeople({ width, height, count = 12 }) {
  const [people, setPeople] = useState(() =>
    Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      id: Math.random().toString(36).slice(2),
    }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPeople((prev) =>
        prev.map((p) => {
          let x = p.x + p.vx * 3;
          let y = p.y + p.vy * 3;
          let vx = p.vx;
          let vy = p.vy;
          if (x < 0 || x > width) vx *= -1;
          if (y < 0 || y > height) vy *= -1;
          x = Math.max(0, Math.min(width, x));
          y = Math.max(0, Math.min(height, y));
          return { ...p, x, y, vx, vy };
        })
      );
    }, 50);
    return () => clearInterval(id);
  }, [width, height]);

  return people;
}

function pointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.w &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.h
  );
}

export default function LiveDashboard({ zones, settings }) {
  const canvasRef = useRef(null);
  const width = 640;
  const height = 360;
  const people = useSimulatedPeople({ width, height, count: 14 });

  const counts = useMemo(() => {
    const c = Object.fromEntries(zones.map((z) => [z.id, 0]));
    for (const p of people) {
      for (const z of zones) {
        if (pointInRect(p, z.rect)) {
          c[z.id] = (c[z.id] || 0) + 1;
        }
      }
    }
    return c;
  }, [people, zones]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Heatmap rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Faint background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Zones
    zones.forEach((z) => {
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(z.rect.x, z.rect.y, z.rect.w, z.rect.h);
      ctx.fillStyle = `${z.color}22`;
      ctx.fillRect(z.rect.x, z.rect.y, z.rect.w, z.rect.h);
    });

    // Heat dots for people
    for (const p of people) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 28);
      gradient.addColorStop(0, 'rgba(239,68,68,0.5)');
      gradient.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Person dots
    for (const p of people) {
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [people, zones]);

  // History for line chart
  const [history, setHistory] = useState([]);
  useEffect(() => {
    setHistory((h) => {
      const next = [...h, { t: Date.now(), total }].slice(-60);
      return next;
    });
  }, [total]);

  const alerts = zones
    .map((z) => ({
      id: z.id,
      name: z.name,
      color: z.color,
      count: counts[z.id] || 0,
      threshold: settings.threshold || 5,
      alert: (counts[z.id] || 0) > (settings.threshold || 5),
    }))
    .filter((z) => z.alert);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-xl border border-slate-200 overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Activity className="w-4 h-4" /> Live Heatmap & Tracking (simulated)
          </div>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-800">{total}</span></div>
        </div>
        <div className="relative">
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>
        <div className="px-4 py-3 text-xs text-slate-500 bg-slate-50 border-t">
          This preview simulates detections moving around and counts people inside each zone.
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 font-medium text-slate-700 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" /> Zone Counts
        </div>
        <div className="p-4 space-y-4">
          {zones.length === 0 && (
            <p className="text-sm text-slate-500">Create zones to see live counts.</p>
          )}
          {zones.map((z) => (
            <div key={z.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded" style={{ backgroundColor: z.color }}></span>{z.name}</span>
                <span className="font-semibold">{counts[z.id] || 0}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded">
                <div
                  className="h-2 rounded"
                  style={{ width: `${Math.min(100, ((counts[z.id] || 0) / Math.max(1, settings.threshold)) * 100)}%`, backgroundColor: z.color }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t bg-slate-50">
          <div className="text-sm font-medium text-slate-700 mb-2">Total Over Time</div>
          <LineChart data={history.map((d, i) => ({ x: i, y: d.total }))} height={120} />
        </div>
        <div className="px-4 py-3 border-t bg-slate-50">
          <div className="flex items-center gap-2 text-rose-600 font-medium"><Bell className="w-4 h-4" /> Alerts</div>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-500 mt-1">No active alerts.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between p-2 rounded border border-rose-200 bg-rose-50">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded" style={{ backgroundColor: a.color }}></span>{a.name}</span>
                  <span>Count {a.count} / Threshold {a.threshold}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function LineChart({ data, width = 280, height = 100, color = '#4f46e5' }) {
  if (data.length === 0) return <div className="h-[100px]" />;
  const maxY = Math.max(1, ...data.map((d) => d.y));
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * (width - 10) + 5;
      const y = height - (d.y / maxY) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[100px]">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}
