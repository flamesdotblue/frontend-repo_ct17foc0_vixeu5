import React, { useEffect, useRef, useState } from 'react';
import { Camera, Square, Save, Trash2, Pencil, PlayCircle, PauseCircle } from 'lucide-react';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function VideoZoneManager({ zones, setZones }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    drawAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, selectedId, currentRect]);

  const startCam = async ()n=>{};

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (e) {
      console.error('Camera access denied or unavailable', e);
      alert('Unable to access camera. Please allow permission or use a supported device.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawing(true);
    setCurrentRect({ x, y, w: 0, h: 0 });
  };

  const onMouseMove = (e) => {
    if (!drawing || !currentRect) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentRect((r) => ({ ...r, w: x - r.x, h: y - r.y }));
  };

  const onMouseUp = () => {
    if (!drawing || !currentRect) return;
    const norm = normalizeRect(currentRect);
    const newZone = {
      id: uuid(),
      name: `Zone ${zones.length + 1}`,
      color: pickColor(zones.length),
      rect: norm,
    };
    setZones([...zones, newZone]);
    setDrawing(false);
    setCurrentRect(null);
    setSelectedId(newZone.id);
  };

  const normalizeRect = (r) => {
    const x = Math.min(r.x, r.x + r.w);
    const y = Math.min(r.y, r.y + r.h);
    const w = Math.abs(r.w);
    const h = Math.abs(r.h);
    return { x, y, w, h };
  };

  const drawAll = () => {
    const ctx = canvasRef.current?.getContext('2d');
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing zones
    zones.forEach((z) => {
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(z.rect.x, z.rect.y, z.rect.w, z.rect.h);
      ctx.fillStyle = `${z.color}22`;
      ctx.fillRect(z.rect.x, z.rect.y, z.rect.w, z.rect.h);

      // Label
      ctx.fillStyle = z.color;
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillText(z.name, z.rect.x + 6, z.rect.y + 16);

      if (selectedId === z.id) {
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#0ea5e9';
        ctx.strokeRect(z.rect.x - 2, z.rect.y - 2, z.rect.w + 4, z.rect.h + 4);
        ctx.setLineDash([]);
      }
    });

    // Draw current rectangle while drawing
    if (drawing && currentRect) {
      const r = normalizeRect(currentRect);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.setLineDash([]);
    }
  };

  const saveZones = () => {
    localStorage.setItem('zones', JSON.stringify(zones));
  };

  const loadZones = () => {
    const raw = localStorage.getItem('zones');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setZones(Array.isArray(parsed) ? parsed : []);
      } catch (_) {
        // ignore
      }
    }
  };

  useEffect(() => {
    const onResize = () => {
      const c = canvasRef.current;
      const v = videoRef.current;
      if (!c || !v) return;
      const { clientWidth, clientHeight } = v;
      c.width = clientWidth;
      c.height = clientHeight;
      drawAll();
    };
    const id = setInterval(onResize, 300);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeZone = (id) => {
    setZones(zones.filter((z) => z.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const renameZone = (id, name) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, name } : z)));
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-xl border border-slate-200 overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Camera className="w-4 h-4" />
            Live Camera
          </div>
          <div className="flex items-center gap-2">
            {!streaming ? (
              <button onClick={startCamera} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                <PlayCircle className="w-4 h-4" /> Start
              </button>
            ) : (
              <button onClick={stopCamera} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700">
                <PauseCircle className="w-4 h-4" /> Stop
              </button>
            )}
            <button onClick={saveZones} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              <Save className="w-4 h-4" /> Save Zones
            </button>
            <button onClick={loadZones} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-slate-700 text-white hover:bg-slate-800">
              Load
            </button>
          </div>
        </div>
        <div className="relative aspect-video bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            className="absolute inset-0 cursor-crosshair"
          />
        </div>
        <div className="px-4 py-3 text-xs text-slate-500 bg-slate-50 border-t">
          Tip: Click and drag over the video to draw a zone. Save to keep zones between sessions.
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 font-medium text-slate-700 flex items-center gap-2">
          <Square className="w-4 h-4" /> Zones
        </div>
        <div className="divide-y">
          {zones.length === 0 && (
            <div className="p-4 text-sm text-slate-500">No zones yet. Draw on the video to create one.</div>
          )}
          {zones.map((z) => (
            <div key={z.id} className={`p-3 flex items-center gap-2 ${selectedId === z.id ? 'bg-indigo-50' : ''}`}>
              <button
                onClick={() => setSelectedId(z.id)}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: z.color }}
                aria-label="Select zone"
                title="Select zone"
              />
              <input
                className="flex-1 px-2 py-1 text-sm border rounded-md"
                value={z.name}
                onChange={(e) => renameZone(z.id, e.target.value)}
              />
              <button
                onClick={() => setSelectedId(z.id)}
                className="p-2 text-slate-500 hover:text-slate-700"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeZone(z.id)}
                className="p-2 text-rose-600 hover:text-rose-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function pickColor(i) {
  const palette = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
  return palette[i % palette.length];
}
