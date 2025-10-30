import React, { useEffect, useState } from 'react';
import { Lock, Users, Download, FileText } from 'lucide-react';

export default function AdminPanelPreview({ zones, settings, setSettings }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...settings, ...parsed });
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Demo login
    if (email && password) {
      setLoggedIn(true);
      logActivity('User logged in');
    }
  };

  const logActivity = (msg) => {
    setActivity((a) => [{ time: new Date().toLocaleTimeString(), msg }, ...a].slice(0, 10));
  };

  const exportCSV = () => {
    const rows = [
      ['timestamp', 'zone', 'count'],
      ...zones.map((z, i) => [new Date().toISOString(), z.name, Math.floor(Math.random() * 10)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_counts.csv';
    a.click();
    URL.revokeObjectURL(url);
    logActivity('Exported CSV');
  };

  const exportPDF = () => {
    const html = `People Analytics Report - ${new Date().toLocaleString()}`;
    const blob = new Blob([html], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.pdf';
    a.click();
    URL.revokeObjectURL(url);
    logActivity('Exported PDF');
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 font-medium text-slate-700 flex items-center gap-2">
          <Lock className="w-4 h-4" /> {loggedIn ? 'Session' : 'Login'}
        </div>
        <div className="p-4">
          {!loggedIn ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" type="email" required />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" type="password" required />
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">Sign in</button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Logged in as</div>
                  <div className="font-medium">{email}</div>
                </div>
                <button onClick={() => setLoggedIn(false)} className="px-3 py-2 text-sm rounded border">Sign out</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded border">
                  <div className="text-xs text-slate-500">Global Threshold</div>
                  <input
                    type="number"
                    min={1}
                    value={settings.threshold}
                    onChange={(e) => setSettings({ ...settings, threshold: Number(e.target.value) })}
                    className="mt-1 w-full border rounded px-2 py-1"
                  />
                </div>
                <div className="p-3 rounded border">
                  <div className="text-xs text-slate-500">Alert Email</div>
                  <input
                    type="email"
                    value={settings.alertEmail || ''}
                    onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                    className="mt-1 w-full border rounded px-2 py-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-900 text-white"><Download className="w-4 h-4" /> CSV</button>
                <button onClick={exportPDF} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-700 text-white"><FileText className="w-4 h-4" /> PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 font-medium text-slate-700 flex items-center gap-2">
          <Users className="w-4 h-4" /> Recent Activity
        </div>
        <div className="p-4">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet. Actions like login and export will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {activity.map((a, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{a.msg}</span>
                  <span className="text-xs text-slate-500">{a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
