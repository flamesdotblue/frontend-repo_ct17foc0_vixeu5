import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import VideoZoneManager from './components/VideoZoneManager';
import LiveDashboard from './components/LiveDashboard';
import AdminPanelPreview from './components/AdminPanelPreview';

export default function App() {
  const [activeTab, setActiveTab] = useState('zones');
  const [zones, setZones] = useState(() => {
    const saved = localStorage.getItem('zones');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState({ threshold: 5, alertEmail: '' });

  useEffect(() => {
    localStorage.setItem('zones', JSON.stringify(zones));
  }, [zones]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold mb-2">Milestone Preview</h2>
          <p className="text-slate-600 text-sm">
            This interactive preview demonstrates the end-to-end experience across milestones:
            drawing zones on live video (M1), simulated detection and counting per zone with a live
            dashboard and heatmap (M2–M3), and an admin/settings preview with exports (M4).
          </p>
        </section>

        {activeTab === 'zones' && (
          <VideoZoneManager zones={zones} setZones={setZones} />
        )}

        {activeTab === 'dashboard' && (
          <LiveDashboard zones={zones} settings={settings} />
        )}

        {activeTab === 'admin' && (
          <AdminPanelPreview zones={zones} settings={settings} setSettings={setSettings} />
        )}

        {activeTab === 'settings' && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Project Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Global Threshold</label>
                <input
                  type="number"
                  min={1}
                  value={settings.threshold}
                  onChange={(e) => setSettings({ ...settings, threshold: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Alert Email</label>
                <input
                  type="email"
                  value={settings.alertEmail}
                  onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">
        Built as a functional preview. Model integration (YOLOv8 + DeepSORT/BYTETrack) and persistence would be wired on the backend in later milestones.
      </footer>
    </div>
  );
}
