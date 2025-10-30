import React from 'react';
import { Video, ChartBar, Shield, Settings } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { key: 'zones', label: 'Video & Zones', icon: <Video className="w-4 h-4" /> },
    { key: 'dashboard', label: 'Live Dashboard', icon: <ChartBar className="w-4 h-4" /> },
    { key: 'admin', label: 'Admin & Analytics', icon: <Shield className="w-4 h-4" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-600 text-white grid place-items-center font-bold">AI</div>
            <div>
              <h1 className="text-lg font-semibold">People Analytics Suite</h1>
              <p className="text-xs text-slate-500">Milestones M1–M4 preview</p>
            </div>
          </div>
          <nav className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition border ${
                  activeTab === t.key
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
